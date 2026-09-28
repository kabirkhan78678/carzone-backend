import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount;
try {
    const serviceAccountPath = new URL('./serviceAccountKey.json', import.meta.url);
    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
} catch (e) {
    // serviceAccountKey.json not found or invalid
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    }
}

export default admin;