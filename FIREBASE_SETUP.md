# Firebase Setup Guide

## Getting Your Firebase Credentials

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Get Web App Configuration

1. In Firebase Console, click the gear icon ⚙️ → **Project Settings**
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (you can name it "Renthaus Web")
5. Copy the configuration values

### Step 3: Enable Required Services

#### Authentication
1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password** sign-in method
3. (Optional) Enable **Google** sign-in method

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **test mode** (for development)
3. Choose your preferred location

#### Storage
1. Go to **Storage** → **Get Started**
2. Start in **test mode** (for development)
3. Use the same location as Firestore

### Step 4: Create Environment File

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-actual-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

### Step 5: Get Firebase Admin SDK Credentials (Optional - for server-side operations)

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract the values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

### Step 6: Firestore Security Rules (Development)

For development, you can use these permissive rules. **Update for production!**

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

### Step 7: Storage Security Rules (Development)

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

## Restart Development Server

After creating `.env.local`, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Verify Setup

1. Go to `http://localhost:3000/login`
2. Try to register a new account
3. If successful, Firebase is configured correctly!

## Troubleshooting

### Error: "api-key-not-valid"
- Make sure `.env.local` exists in the project root
- Verify all `NEXT_PUBLIC_` variables are set
- Restart the development server after creating/updating `.env.local`
- Check that there are no extra spaces or quotes in the values

### Error: "Firebase Auth is not initialized"
- Check browser console for detailed error messages
- Verify all environment variables start with `NEXT_PUBLIC_`
- Make sure you're using `.env.local` (not `.env`)

### Environment Variables Not Loading
- Next.js only loads `.env.local` automatically
- Variables must start with `NEXT_PUBLIC_` to be available in the browser
- Restart the dev server after changing environment variables

