interface PairingEntry {
  userId: string;
  operatorSocketId: string;
  expiresAt: number; // ms timestamp
  timeout: ReturnType<typeof setTimeout>;
}

const cache = new Map<string, PairingEntry>();

export const setPairing = (
  deviceId: string,
  userId: string,
  operatorSocketId: string,
  onExpire: (deviceId: string) => void,
  ttlMs = 30_000,
) => {
  // clear any pairing for this device man
  clearPairing(deviceId);

  const timeout = setTimeout(() => {
    cache.delete(deviceId);
    onExpire(deviceId);
  }, ttlMs);

  cache.set(deviceId, {
    userId,
    operatorSocketId,
    expiresAt: Date.now() + ttlMs,
    timeout,
  });
};

export const getPairing = (deviceId: string): PairingEntry | undefined => cache.get(deviceId);

export const clearPairing = (deviceId: string): void => {
    const entry = cache.get(deviceId);
    if (entry) {
        clearTimeout(entry.timeout);
        cache.delete(deviceId);
    }
};
