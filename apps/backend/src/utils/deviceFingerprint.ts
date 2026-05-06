import crypto from 'crypto';
import {Request} from 'express';


// Generate a stable device ID from request headers
// Same browser/device always produces the same ID
// Different devices produce different IDs
export const generateDeviceId = (req: Request): string => {
    const userAgent = req.get('user-agent') ?? 'unknown';
    const acceptLang = req.get('accept-language') ?? 'unknown';
    const acceptEnc = req.get('accept-encoding') ?? 'unknown';

    const fingerprint = `${userAgent}|${acceptLang}|${acceptEnc}`;

    return crypto
    .createHash('sha256')
    .update(fingerprint)
    .digest('hex')
    .slice(0, 32);
};