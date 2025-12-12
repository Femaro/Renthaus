# Firebase Authentication Setup - Fix "operation-not-allowed" Error

## Quick Fix: Enable Email/Password Authentication

The error `auth/operation-not-allowed` means Email/Password sign-in is not enabled in your Firebase project.

### Steps to Enable:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **renthausng**

2. **Enable Email/Password Authentication**
   - Click on **Authentication** in the left sidebar
   - Click **Get Started** (if you haven't set it up yet)
   - Go to the **Sign-in method** tab
   - Click on **Email/Password**
   - Toggle **Enable** to ON
   - Click **Save**

3. **Optional: Enable Google Sign-in**
   - In the same **Sign-in method** tab
   - Click on **Google**
   - Toggle **Enable** to ON
   - Enter your project support email
   - Click **Save**

4. **Restart Your Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Verify Setup

After enabling, try registering again at:
- http://localhost:3000/register

The error should be resolved!

## Additional Firebase Setup

### Firestore Database
1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose location (e.g., `us-central1`)

### Storage
1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Start in **test mode** (for development)
4. Use the same location as Firestore

## Security Rules (Development Mode)

### Firestore Rules (Test Mode)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules (Test Mode)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Important:** These are permissive rules for development only. Update them for production!

