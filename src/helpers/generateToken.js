const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

// Secret key for JWT signing
const jwtSecret = process.env.JWT_SECRET; // This should be kept secret

// Encryption key for encrypting payload
const encryptionKey = process.env.JWT_ENCRYPTION_KEY; // This should be kept secret

const generateToken = async ({ userId, uuid, designation }) => {
    // Payload to encrypt
    const payload = { userId, uuid, designation };

    // Encrypt the payload
    const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), encryptionKey).toString();

    // Sign the encrypted payload with JWT
    const token = jwt.sign({ data: encryptedPayload }, jwtSecret, { expiresIn: '1h' });

    return token;
};

module.exports = generateToken;
