const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let db;

const initializeFirebase = () => {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length === 0) {
            // Initialize with environment variable containing service account JSON
            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
                ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
                : null;

            if (serviceAccount) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: process.env.FIREBASE_DATABASE_URL
                });
                console.log('Firebase initialized with service account from environment');
            } else {
                // For local development, you can use a service account file
                const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
                    ? path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
                    : path.resolve(__dirname, '..', 'serviceAccountKey.json');
                
                try {
                    const serviceAccountFile = require(serviceAccountPath);
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccountFile),
                        databaseURL: process.env.FIREBASE_DATABASE_URL
                    });
                    console.log('Firebase initialized with service account file:', serviceAccountPath);
                } catch (err) {
                    console.error('Failed to load service account file from:', serviceAccountPath);
                    console.error('Error:', err.message);
                    throw new Error('Firebase service account not configured');
                }
            }
        }

        db = admin.firestore();
        console.log('Connected to Firebase Firestore');
        return db;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
};

const getFirestore = () => {
    if (!db) {
        return initializeFirebase();
    }
    return db;
};

module.exports = { initializeFirebase, getFirestore, admin };
