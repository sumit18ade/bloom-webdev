# Firebase Setup Guide for Bloom

This guide will help you set up Firebase for the Bloom application.

## Prerequisites

- A Google account
- Firebase project in the Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "bloom-learning-platform")
4. Follow the setup wizard
5. Enable Google Analytics (optional but recommended)

## Step 2: Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable **Email/Password** authentication
3. Enable **Google** sign-in
4. Configure authorized domains for your app

## Step 3: Set up Firestore Database

1. Go to Firestore Database → Create database
2. Choose a location (select closest to your users)
3. Start in **Test mode** (we'll update security rules later)
4. Deploy the security rules from `firestore.rules` file

## Step 4: Set up Storage

1. Go to Storage → Get started
2. Choose the same location as Firestore
3. Start in Test mode
4. Configure security rules for user profile photos and project assets

## Step 5: Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Register your app
5. Copy the firebaseConfig object

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 7: Deploy Firestore Security Rules

Using Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Or manually:
1. Go to Firestore Database → Rules
2. Copy contents from `firestore.rules`
3. Paste and publish

## Step 8: Create Firestore Indexes

1. Go to Firestore Database → Indexes
2. Click "Add composite index"
3. Use the indexes defined in `firestore.indexes.json`

Or deploy using Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

## Step 9: Cloud Functions (Optional)

For secure API endpoints (YouTube, Gemini):

1. Go to Functions → Get started
2. Enable Blaze plan (pay-as-you-go)
3. Deploy functions for:
   - YouTube video search
   - Gemini AI integration
   - XP calculation
   - Streak updates

## Step 10: Verify Setup

1. Run the development server: `npm run dev`
2. Try creating a test account
3. Check Firestore Console for user document creation
4. Verify authentication state persistence

## Security Notes

- Never commit `.env.local` to version control
- Use Firebase Security Rules to protect data
- Implement proper validation on client and server
- Enable App Check for production apps
- Monitor usage in Firebase Console

## Troubleshooting

**Authentication not working:**
- Check API keys in environment variables
- Verify sign-in methods are enabled
- Check browser console for errors

**Firestore permissions:**
- Ensure security rules are deployed
- Check collection names match TypeScript types
- Verify user authentication state

**Storage issues:**
- Check storage bucket name
- Verify storage security rules
- Ensure proper file size limits