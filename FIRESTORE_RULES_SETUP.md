# Firestore Security Rules Setup - Fix "Missing or insufficient permissions"

## Quick Fix: Update Firestore Security Rules

The error "Missing or insufficient permissions" means your Firestore security rules are blocking read/write operations.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **renthausng**

2. **Open Firestore Rules**
   - Click on **Firestore Database** in the left sidebar
   - Go to the **Rules** tab

3. **Update Rules for Development**

   **Option A: Test Mode (Development Only - Very Permissive)**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   ⚠️ **Warning:** This allows anyone to read/write. Only use for development!

   **Option B: Authenticated Users Only (Recommended for Development)**
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
   ✅ This requires users to be logged in to read/write.

   **Option C: Production-Ready Rules (For Later)**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Products - anyone can read, vendors can write their own
       match /products/{productId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && 
           request.resource.data.vendorId == request.auth.uid;
         allow update, delete: if request.auth != null && 
           resource.data.vendorId == request.auth.uid;
       }
       
       // Orders - users can read their own, vendors can read their orders
       match /orders/{orderId} {
         allow read: if request.auth != null && (
           resource.data.customerId == request.auth.uid ||
           resource.data.vendorId == request.auth.uid ||
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
         );
         allow create: if request.auth != null;
         allow update: if request.auth != null && (
           resource.data.vendorId == request.auth.uid ||
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
         );
       }
       
       // Messages - participants can read/write
       match /messages/{messageId} {
         allow read, write: if request.auth != null && (
           resource.data.fromId == request.auth.uid ||
           resource.data.toId == request.auth.uid
         );
       }
       
       // Admin-only collections
       match /transactions/{transactionId} {
         allow read, write: if request.auth != null &&
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

4. **Publish the Rules**
   - Click **Publish** button
   - Wait for confirmation

5. **Test Again**
   - Try registering/logging in again
   - The permissions error should be resolved

## Storage Rules Setup

Also update Storage rules for image uploads:

1. Go to **Storage** → **Rules** tab

2. **Development Rules (Authenticated Users)**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Publish** the rules

## Verify Setup

After updating rules:
1. Try registering a new account
2. Try creating a product listing (as vendor)
3. Try uploading a profile picture

All should work without permission errors!

## Common Issues

### "Permission denied" even after updating rules
- Make sure you clicked **Publish** after editing
- Wait a few seconds for rules to propagate
- Clear browser cache and try again
- Make sure you're logged in (check Firebase Auth)

### Rules not saving
- Check that you have proper permissions in Firebase Console
- Make sure you're using the correct project
- Try refreshing the page

## Next Steps

Once everything works in development:
1. Test all features thoroughly
2. Update to production-ready rules (Option C above)
3. Test again with production rules
4. Deploy to production

