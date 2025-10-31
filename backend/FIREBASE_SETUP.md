# Firebase Setup Guide

This application now uses Firebase Firestore as the database instead of MySQL.

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore Database

1. In your Firebase project, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (or test mode for development)
4. Select a location for your database

### 3. Get Service Account Credentials

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `serviceAccountKey.json` in the `backend/` folder

**⚠️ Important: Never commit `serviceAccountKey.json` to Git!** (It's already in `.gitignore`)

### 4. Configure Environment Variables

#### For Local Development:

Add to `backend/.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

#### For Production (Netlify):

1. Copy the entire contents of `serviceAccountKey.json`
2. Minify it to a single line (remove newlines and extra spaces)
3. Add to Netlify environment variables:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
   ```

### 5. Firestore Collections Structure

The application uses these Firestore collections:

#### `users` Collection
```javascript
{
  name: string,
  email: string,
  password: string (hashed),
  role: string ('user' | 'admin'),
  createdAt: timestamp
}
```

#### `products` Collection
```javascript
{
  name: string,
  description: string,
  price: number,
  category: string,
  images: array,
  stock: number,
  featured: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `orders` Collection
```javascript
{
  userId: string,
  items: array,
  totalAmount: number,
  shippingAddress: object,
  status: string,
  paymentStatus: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. Initialize Database

Run these commands to create admin user and sample products:

```bash
cd backend
node createAdmin.js
node createSampleProducts.js
```

### 7. Firestore Security Rules

Set up security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow write: if request.auth != null; // Authenticated write
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

## Migration from MySQL

If you were using MySQL before, you'll need to:

1. Export your data from MySQL
2. Convert it to Firestore format
3. Import using Firebase Admin SDK or Firebase Console

## Testing

Test the connection by starting the server:

```bash
cd backend
npm start
```

You should see: `Connected to Firebase Firestore`

## Troubleshooting

### Error: "Firebase service account not configured"
- Make sure `serviceAccountKey.json` exists in `backend/` folder
- Or set `FIREBASE_SERVICE_ACCOUNT` environment variable

### Error: "Permission denied"
- Check Firestore security rules
- Make sure you're authenticated for operations that require auth

### Error: "Project not found"
- Verify your service account JSON has the correct `project_id`
- Make sure you've enabled Firestore in your Firebase project
