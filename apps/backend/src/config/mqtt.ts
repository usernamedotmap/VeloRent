import mqtt      from 'mqtt';
import { ENV }   from './env';
import { IoTDevice } from '../models/IotDevice.model';
import { Reservation, User } from '../models';
import { clearPairing, getPairing } from './rfidCache';
import { emitToSocket } from './socket';

let client: mqtt.MqttClient | null = null;

export const getMqttClient = (): mqtt.MqttClient => {
  if (client?.connected) return client;

  client = mqtt.connect(`mqtts://${ENV.MQTT_HOST}:8883`, {
    username:        ENV.MQTT_USERNAME,
    password:        ENV.MQTT_PASSWORD,
    clientId:        `velorent-backend-${Date.now()}`,
    clean:           true,
    reconnectPeriod: 5000,
    connectTimeout:  30000,
    rejectUnauthorized: false,
  });

  client.on('connect', () => {
    console.log('✅ MQTT connected');
    client!.subscribe('velorent/device/+/heartbeat');
    client!.subscribe('velorent/reservation/+/item/+/status');
    client!.subscribe('velorent/device/+/rfid/register'); // registration scans
    client!.subscribe('velorent/device/+/rfid');          // ride scans
  });

  client.on('message', (topic, payload) => {
    handleInComingMessage(topic, payload.toString());
  });

  client.on('error',      (err) => console.error('[MQTT] Error:', err.message));
  client.on('disconnect', ()    => console.log('[MQTT] Disconnected — reconnecting...'));

  return client;
};

export const publishTimerCommand = (
  reservationId: string,
  itemId:        string,
  command:       'start' | 'stop' | 'complete',
  payload:       Record<string, unknown> = {},
): void => {
  const mqttClient = getMqttClient();
  const topic      = `velorent/reservation/${reservationId}/item/${itemId}/command`;

  const message = JSON.stringify({
    command,
    reservationId,
    itemId,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) console.error('[MQTT] Publish failed:', err);
    else     console.log(`[MQTT] Published ${command} → ${topic}`);
  });
};

// ─── RFID ride scan ───────────────────────────────────────────
const handleRfidScan = async (deviceId: string, uid: string) => {
  const resultTopic = `velorent/device/${deviceId}/rfid/result`;
  const mqttClient  = getMqttClient();
  const publish     = (result: object) =>
    mqttClient.publish(resultTopic, JSON.stringify(result), { qos: 1 });

  const normalizedUid = uid.trim().toUpperCase();
  console.log(`[RFID] Ride scan: "${normalizedUid}"`);

  const user = await User.findOne({ rfid: normalizedUid });
  if (!user) {
    console.log(`[RFID] Unknown card: ${normalizedUid}`);
    publish({ result: 'not_found', message: 'Card not registered' });
    return;
  }

  const reservation = await Reservation.findOne({
    userId: user._id,
    status: { $in: ['confirmed', 'active', 'overdue'] },
  }).sort({ createdAt: -1 });

  if (!reservation) {
    console.log(`[RFID] No active reservation for ${user.firstName}`);
    publish({ result: 'no_reservation', message: 'No active reservation' });
    return;
  }

  if (reservation.status === 'confirmed') {
    const item = reservation.items.find((i) => i.status === 'waiting');
    if (!item) { publish({ result: 'no_reservation', message: 'No waiting bike' }); return; }

    const { startReservationItem } = await import('../services/reservation.service');
    await startReservationItem(String(reservation._id), String(item._id), 'rfid-system');

    console.log(`[RFID] Started ride for ${user.firstName} ✅`);
    publish({
      result:        'started',
      reservationId: String(reservation._id),
      itemId:        String(item._id),
      slotSeconds:   reservation.slotHours * 3600,
      message:       `Ride started for ${user.firstName}`,
    });
    return;
  }

  if (['active', 'overdue'].includes(reservation.status)) {
    const item = reservation.items.find((i) => ['active', 'overdue'].includes(i.status));
    if (!item) { publish({ result: 'no_reservation', message: 'No active bike' }); return; }

    const { completeReservationItem } = await import('../services/reservation.service');
    await completeReservationItem(String(reservation._id), String(item._id), 'rfid-system');

    console.log(`[RFID] Completed ride for ${user.firstName} ✅`);
    publish({
      result:        'completed',
      reservationId: String(reservation._id),
      itemId:        String(item._id),
      message:       `Ride completed for ${user.firstName}`,
    });
  }
};

// ─── RFID registration ────────────────────────────────────────
const handleRegistration = async (deviceId: string, uid: string) => {
  const mqttClient  = getMqttClient();
  const resultTopic = `velorent/device/${deviceId}/rfid/result`;
  const publish     = (payload: object) =>
    mqttClient.publish(resultTopic, JSON.stringify(payload), { qos: 1 });

  const normalizedUid = uid.trim().toUpperCase();
  console.log(`[RFID-REG] uid received: "${normalizedUid}"`);

  const pairing = getPairing(deviceId);
  console.log(`[RFID-REG] pairing:`, pairing ? `userId=${pairing.userId}` : 'null');

  if (!pairing) {
    console.log(`[RFID-REG] No pairing — ignoring duplicate scan`);
    return; // don't publish anything — stale scan
  }

  clearPairing(deviceId); // clear immediately — prevent double registration

  // Duplicate check
  const existing = await User.findOne({ rfid: normalizedUid });
  if (existing && String(existing._id) !== pairing.userId) {
    console.log(`[RFID-REG] Duplicate — belongs to ${existing._id}`);
    emitToSocket(pairing.operatorSocketId, 'rfid:register-failed', {
      reason:  'duplicate',
      message: `Card already assigned to ${existing.firstName} ${existing.lastName}.`,
    });
    publish({ result: 'register_failed', message: 'Card already in use' });
    return;
  }

  try {
    const updated = await User.findByIdAndUpdate(
      pairing.userId,
      { $set: { rfid: normalizedUid } },
      { new: true }
    );

    console.log(`[RFID-REG] Updated: rfid=${updated?.rfid ?? 'user not found'}`);

    if (!updated) {
      publish({ result: 'register_failed', message: 'User not found' });
      return;
    }

    emitToSocket(pairing.operatorSocketId, 'rfid:registered', {
      userId: pairing.userId,
      uid:    normalizedUid,
    });

    publish({ result: 'registered', message: 'Card registered successfully' });
    console.log(`[RFID-REG] ✅ card ${normalizedUid} → user ${pairing.userId}`);

  } catch (err: any) {
    console.error(`[RFID-REG] DB error:`, err.message);
    publish({ result: 'register_failed', message: 'Database error' });
  }
};

// ─── Incoming message router ──────────────────────────────────
const handleInComingMessage = async (topic: string, payload: string) => {
  let data: any;
  try {
    data = JSON.parse(payload);
  } catch {
    console.log(`[MQTT] Invalid JSON on ${topic}:`, payload.substring(0, 100));
    return;
  }

  const deviceId = topic.split('/')[2];
  console.log(`[MQTT] Received from ${topic}:`, data);

  if (topic.includes('/heartbeat')) {
    await IoTDevice.findOneAndUpdate(
      { deviceId },
      { isOnline: true, lastHeartbeat: new Date(), wifiRssi: data.wifi_rssi, uptime: data.uptime, timerRunning: data.timer_running },
      { upsert: true, new: true }
    );
    console.log(`[MQTT] Device ${deviceId} heartbeat — online`);
    return;
  }

  if (topic.includes('/status')) {
    const parts = topic.split('/');
    console.log(`[MQTT] Timer status for ${parts[2]}/${parts[4]}`);
    return;
  }

  // ── RFID registration — must check before /rfid ────────────
  if (topic.endsWith('/rfid/register')) {
    if (!data.uid) { console.log('[MQTT] Skipping — no uid'); return; }
    const uid = String(data.uid).trim().toUpperCase();
    console.log(`[MQTT] RFID registration scan from ${deviceId}: ${uid}`);
    await handleRegistration(deviceId, uid);
    return;
  }

  // ── RFID ride scan ─────────────────────────────────────────
  if (topic.endsWith('/rfid')) {
    if (!data.uid) { console.log('[MQTT] Skipping — no uid'); return; }
    const uid = String(data.uid).trim().toUpperCase();
    console.log(`[MQTT] RFID ride scan from ${deviceId}: ${uid}`);
    await handleRfidScan(deviceId, uid);
    return;
  }
};