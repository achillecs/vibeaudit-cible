// VULN-12
import crypto from 'crypto';

export function hashPassword(pwd) {
    return crypto.createHash('md5').update(pwd).digest('hex');
}

export function generateToken() {
    return Math.random().toString(36).substring(2);
}
