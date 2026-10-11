// VULN-12 fix: use bcrypt instead of MD5 for password hashing
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export async function hashPassword(pwd) {
    return bcrypt.hash(pwd, SALT_ROUNDS);
}

export async function verifyPassword(pwd, hash) {
    return bcrypt.compare(pwd, hash);
}

export function generateToken() {
    // Use a cryptographically secure random generator instead of Math.random()
    return crypto.randomBytes(32).toString('hex');
}
