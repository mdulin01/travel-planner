// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get these from: https://console.firebase.google.com > Project Settings > General > Your apps

export const firebaseConfig = {
  apiKey: "AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0",
  authDomain: "trip-planner-5cc84.firebaseapp.com",
  projectId: "trip-planner-5cc84",
  storageBucket: "trip-planner-5cc84.firebasestorage.app",
  messagingSenderId: "803115812045",
  appId: "1:803115812045:web:d49aa3df4ee4038c5fd584",
  measurementId: "G-2P92RPZ3KG"
};

// SETUP INSTRUCTIONS:
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" (or select existing)
// 3. Name it something like "trip-planner"
// 4. Go to Project Settings (gear icon) > General
// 5. Scroll down to "Your apps" and click the web icon (</>)
// 6. Register app and copy the config values above
//
// 7. Enable Authentication:
//    - Go to Authentication > Sign-in method
//    - Enable "Google" provider
//    - Add your domain to Authorized domains
//
// 8. Enable Firestore:
//    - Go to Firestore Database
//    - Click "Create database"
//    - Start in "test mode" for development
//    - Choose a region close to you
//
// 9. Firestore Security Rules (for production):
//    Go to Firestore > Rules and use:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Trips are shared between authorized users
    match /trips/{tripId} {
      allow read, write: if request.auth != null &&
        request.auth.token.email in resource.data.sharedWith;
      allow create: if request.auth != null;
    }

    match /tripDetails/{tripId} {
      allow read, write: if request.auth != null;
    }
  }
}
*/
