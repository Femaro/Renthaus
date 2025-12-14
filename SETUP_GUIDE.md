# Setup Guide - Running Renthaus on a New Windows Computer

This guide will walk you through setting up the Renthaus application on a fresh Windows computer after pulling it from Git.

## Prerequisites

### Step 1: Install Git (if not already installed)

1. Download Git for Windows from: https://git-scm.com/download/win
2. Run the installer and follow the installation wizard
3. Use default settings (recommended)
4. Open **Command Prompt** or **PowerShell** to verify installation:
   ```bash
   git --version
   ```
   You should see something like `git version 2.x.x`

### Step 2: Install Node.js and npm

1. Download Node.js from: https://nodejs.org/
   - **Recommended**: Download the LTS (Long Term Support) version
   - Choose the Windows Installer (.msi) for your system (64-bit recommended)
2. Run the installer:
   - Check "Automatically install the necessary tools" (optional but helpful)
   - Click "Next" through the installation wizard
   - Click "Install" and wait for completion
3. Verify installation:
   Open **Command Prompt** or **PowerShell** and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both (e.g., `v20.x.x` and `10.x.x`)

### Step 3: Install a Code Editor (Optional but Recommended)

- **Visual Studio Code**: https://code.visualstudio.com/
- Or use any code editor you prefer (Notepad++, Sublime Text, etc.)

---

## Setting Up the Project

### Step 4: Clone/Pull the Repository

1. Open **Command Prompt** or **PowerShell**
2. Navigate to where you want to store the project (e.g., Documents folder):
   ```bash
   cd Documents
   ```
   Or create a new folder:
   ```bash
   mkdir Projects
   cd Projects
   ```

3. **If you haven't cloned the repository yet:**
   ```bash
   git clone <your-repository-url>
   cd Renthaus
   ```

   **If you already have the repository:**
   ```bash
   cd Renthaus
   git pull origin main
   ```

### Step 5: Install Project Dependencies

1. Make sure you're in the project directory:
   ```bash
   cd Renthaus
   ```
   (You should see files like `package.json`, `next.config.js`, etc.)

2. Install all required packages:
   ```bash
   npm install
   ```
   
   This will:
   - Read the `package.json` file
   - Download and install all dependencies (Next.js, React, Firebase, etc.)
   - Create a `node_modules` folder
   - This may take 2-5 minutes depending on your internet speed

3. Wait for installation to complete. You should see:
   ```
   added XXX packages, and audited XXX packages in XXs
   ```

---

## Environment Variables Setup

### Step 6: Create Environment Variables File

1. In the project root directory (`Renthaus`), create a new file named `.env.local`
   - **Using VS Code**: Right-click in the file explorer → New File → Name it `.env.local`
   - **Using Command Prompt**: 
     ```bash
     type nul > .env.local
     ```
   - **Using Notepad**: Create a new file and save it as `.env.local` (make sure to select "All Files" in the save dialog)

2. Open `.env.local` in a text editor and add the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 7: Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ next to "Project Overview" → **Project settings**
4. Scroll down to **"Your apps"** section
5. If you don't have a web app, click **"Add app"** → Select the **Web** icon (`</>`)
6. Register your app and copy the configuration values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

7. For Firebase Admin credentials:
   - In Firebase Console, go to **Project settings** → **Service accounts** tab
   - Click **"Generate new private key"**
   - Download the JSON file
   - Extract:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

### Step 8: Get Your Paystack Credentials (Optional for Development)

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy:
   - **Public Key** → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - **Secret Key** → `PAYSTACK_SECRET_KEY`
   - Use test keys for development

---

## Running the Application

### Step 9: Start the Development Server

1. Make sure you're in the project directory:
   ```bash
   cd Renthaus
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. You should see output like:
   ```
   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000
   ```

4. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

5. You should see the Renthaus homepage!

---

## Troubleshooting

### Issue: "npm is not recognized"
**Solution**: 
- Restart your Command Prompt/PowerShell after installing Node.js
- Or add Node.js to your system PATH manually

### Issue: "Error: Cannot find module..."
**Solution**: 
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Issue: "Firebase: Error (auth/api-key-not-valid)"
**Solution**: 
- Check that all Firebase environment variables in `.env.local` are correct
- Make sure there are no extra spaces or quotes (except for `FIREBASE_PRIVATE_KEY`)
- Restart the development server after changing `.env.local`

### Issue: "Port 3000 is already in use"
**Solution**: 
- Close other applications using port 3000
- Or run on a different port:
  ```bash
  npm run dev -- -p 3001
  ```

### Issue: "Missing or insufficient permissions" error
**Solution**: 
- Check Firestore security rules (see `FIRESTORE_RULES_SETUP.md`)
- Make sure Firebase Authentication is enabled in Firebase Console
- Verify your Firebase credentials are correct

### Issue: Git pull fails
**Solution**: 
- Make sure you have the correct repository URL
- Check your Git credentials:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

---

## Quick Commands Reference

```bash
# Navigate to project
cd Renthaus

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for linting errors
npm run lint

# Pull latest changes from Git
git pull origin main

# Check Git status
git status
```

---

## Next Steps

1. **Set up Firebase Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" and "Google" sign-in
   - See `FIREBASE_AUTH_SETUP.md` for details

2. **Set up Firestore Security Rules**:
   - Go to Firebase Console → Firestore Database → Rules
   - Update rules (see `FIRESTORE_RULES_SETUP.md`)

3. **Test the Application**:
   - Register a new account at `/register`
   - Try logging in at `/login`
   - Explore the dashboard

4. **Read Documentation**:
   - `DASHBOARD_ACCESS.md` - Login information and test accounts
   - `FIREBASE_AUTH_SETUP.md` - Firebase authentication setup
   - `FIRESTORE_RULES_SETUP.md` - Firestore security rules
   - `PRODUCTION_READY.md` - Production deployment checklist

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Check the console/terminal output for detailed error messages
4. Verify all environment variables are set correctly
5. Make sure all prerequisites are installed

---

**Happy Coding! 🚀**

