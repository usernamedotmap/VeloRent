import mqtt from "mqtt";
import { ENV } from "./env";
import { IoTDevice } from "../models/IotDevice.model";

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
  } catch {
    console.log(`[MQTT] Failed to parse message`, payload);
  }
};
