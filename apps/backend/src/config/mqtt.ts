import mqtt from "mqtt";
import { ENV } from "./env";
import { IoTDevice } from "../models/IotDevice.model";
import { Reservation, User } from "../models";

let client: mqtt.MqttClient | null = null;

export const getMqttClient = (): mqtt.MqttClient => {
  if (client?.connected) return client;

  client = mqtt.connect(`mqtts://${ENV.MQTT_HOST}:8883`, {
    username: ENV.MQTT_USERNAME,
    password: ENV.MQTT_PASSWORD,
    clientId: `velorent-backend-${Date.now()}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    rejectUnauthorized: false, // for self-signed certs, set to true in production with valid certs
  });

  client.on("connect", () => {
    console.log("MQTT connected to HiveMQ or EMQX broker");

    // subscribe to device status
    client!.subscribe("velorent/device/+/heartbeat");
    client!.subscribe("velorent/reservation/+/item/+/status");
    client!.subscribe("velorent/device/+/rfid");
  });

  client.on("message", (topic, payload) => {
    handleInComingMessage(topic, payload.toString());
  });

  client.on("error", (err) => {
    console.log("[MQTT] Error:", err.message);
  });

  client.on("disconnect", () => {
    console.log("[MQTT] Disconnected - reconnecting...");
  });

  return client;
};

export const publishTimerCommand = (
  reservationId: string,
  itemId: string,
  command: "start" | "stop" | "complete",
  payload: Record<string, unknown> = {},
): void => {
  const mqttClient = getMqttClient();
  const topic = `velorent/reservation/${reservationId}/item/${itemId}/command`;

  const message = JSON.stringify({
    command,
    reservationId,
    itemId,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.log("[MQTT] Publish failed:", err);
    } else {
      console.log(`[MQTT] Published ${command} -> ${topic}`);
    }
  });
};

// rfid scan logic
const handleRfidScan = async (deviceId: string, uid: string) => {
  const resultTopic = `velorent/device/${deviceId}/rfid/result`;
  const mqttClient = getMqttClient();

  const publish = (result: object) => {
    mqttClient.publish(resultTopic, JSON.stringify(result), {
      qos: 1,
    });
  };

  // find customers by rfid uid
  const user = await User.findOne({ rfidUid: uid });
  if (!user) {
    console.log(`[RFID] Unknown card:  ${uid}`);
    publish({ result: "not_found", message: "Card not registered" });
    return;
  }

  // find for active reservation for
  const reservation = await Reservation.findOne({
    userId: user._id,
    status: { $in: ["confirmed", "active", "overdue"] },
  }).sort({ createdAt: -1 });

  if (!reservation) {
    console.log(`[RFID] No active reservation for ${user.firstName}`);
    publish({ result: "no_reservation", message: "No active reservation" });
    return;
  }

  if (reservation.status === "confirmed") {
    const item = reservation.items.find((i) => i.status === "waiting");
    if (!item) {
      publish({ result: "no_reservation", message: "No waiting bike" });
      return;
    }

    const { startReservationItem } =
      await import("../services/reservation.service");
    await startReservationItem(
      String(reservation._id),
      String(item._id),
      "rfid-system",
    );

    console.log(`[RFID] Started ride for ${user.firstName} ✅`);
    publish({
      result: "started",
      reservationId: String(reservation._id),
      itemId: String(item._id),
      slotSeconds: reservation.slotHours * 3600,
      message: `Ride started for ${user.firstName}`,
    });
    return;
  }

  if (["active", "overdue"].includes(reservation.status)) {
    const item = reservation.items.find((i) =>
      ["active", "overdue"].includes(i.status),
    );
    if (!item) {
      publish({ result: "no_reservation", message: "No active bike" });
      return;
    }

    const { completeReservationItem } =
      await import("../services/reservation.service");
    await completeReservationItem(
      String(reservation._id),
      String(item._id),
      "rfid-system",
    );

    console.log(`[RFID] Completed ride for ${user.firstName} ✅`);
    publish({
      result: "completed",
      reservationId: String(reservation._id),
      itemId: String(item._id),
      message: `Ride completed for ${user.firstName}`,
    });
    return;
  }
};

// message from arduino
const handleInComingMessage = async (topic: string, payload: string) => {
  try {
    const data = JSON.parse(payload);
    console.log(`[MQTT] Received from ${topic}:`, data);

    // device heartbeat - update the device status
    if (topic.includes("/heartbeat")) {
      const deviceId = topic.split("/")[2];

      await IoTDevice.findOneAndUpdate(
        { deviceId },
        {
          isOnline: true,
          lastHeartbeat: new Date(),
          wifiRssi: data.wifi_rssi,
          uptime: data.uptime,
          timerRunning: data.timer_running,
        },
        { upsert: true, new: true },
      );

      console.log(`[MQTT] Device ${deviceId} heartbeat - online`);
    }

    // timer status from arduino
    if (topic.includes("/status")) {
      const parts = topic.split("/");
      const reservationId = parts[2];
      const itemId = parts[4];
      console.log(`[MQTT] Timer status for ${reservationId}/${itemId}`);
    }

    // rfid scan
    if (topic.endsWith("/rfid")) {
      const deviceId = topic.split("/")[2];
      const uid = data.uid as string;
      await handleRfidScan(deviceId, uid);
      return;
    }
  } catch {
    console.log(`[MQTT] Failed to parse message`, payload);
  }
};
