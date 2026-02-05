# Mike & Adam's Adventures - Development Roadmap

*Last Updated: February 2, 2026*

---

## Current State Summary

### ✅ Fully Built Sections
| Section | Status | Features |
|---------|--------|----------|
| **Home** | Complete | Hero carousel, navigation, stats/achievements |
| **Travel** | Complete | Trips, wishlist, flights, reservations, packing, budget, links, guests |
| **Fitness** | Complete | Events (Indy Half, Triathlon), training plans, workout tracking, stats |
| **Memories** | Complete | Timeline, category views, media gallery, photo uploads |
| **Events** | Fixed | Party events, guest RSVPs, task lists, photo uploads - null safety fixes applied |

### 🚧 Placeholder Sections (Not Built)
- **Nutrition** - "Coming Soon" placeholder only
- **Life Planning** - "Coming Soon" placeholder only
- **Business** - "Coming Soon" placeholder only

### 📱 PWA Status
- ✅ manifest.json configured
- ✅ iOS meta tags configured
- ✅ PWA icons generated (192x192, 512x512, apple-touch-icon)
- ✅ URL routing with deep links (/travel, /fitness, /events, etc.)
- ❌ No service worker (no offline support yet)
- ❌ No push notifications yet

---

## Completed Items (This Session)

- [x] Fixed Events section null safety bugs
- [x] Generated PWA icons (icon-192.png, icon-512.png, apple-touch-icon.png)
- [x] Added URL routing for deep links
- [x] Created vercel.json for SPA routing
- [x] Created Firebase Cloud Functions for email invitations (needs deployment)
- [x] Built guest login flow - guests now see only trips/events they're invited to
- [x] Added permission-aware edit controls (guests with edit permission can modify content)
- [x] Wired up email invitations - adding guests now sends beautiful HTML email invites
- [x] Fixed React Error #310 (Invalid hook call) - moved useState before early returns
- [x] Fixed TypeError guest.name undefined in charAt calls
- [x] Removed flying emojis, bouncing emoji overlay, and floating decorations from home page
- [x] Modified navigation - moved Life Planning & Business to 🚧 dropdown button
- [x] Added Calendar button to main navigation
- [x] Built Calendar section with Google Calendar integration
- [x] Added import dialog to convert Google Calendar events to trips, events, or memories

---

## Priority List (Remaining)

### 🔴 High Priority (To Complete)

| # | Task | Description | Status |
|---|------|-------------|--------|
| 1 | **Deploy Email Functions** | Deploy Firebase Cloud Functions to send invitation emails | ✅ Complete |
| 2 | **Guest Login Flow** | Match logged-in users to their trip/event permissions | ✅ Complete |

### 🟡 Medium Priority (Daily Use Features)

| # | Task | Description | Status |
|---|------|-------------|--------|
| 3 | **Nutrition Section** | Build out meal planning, recipes, grocery lists | Not Started |
| 4 | **Service Worker** | Add offline access to trip details, training plans | Not Started |
| 5 | **Push Notifications** | Workout reminders, trip countdown alerts | Not Started |
| 6 | **Calendar Integration** | Sync events to Google/Apple Calendar | Not Started |

### 🟢 Nice to Have (Future)

| # | Task | Description | Status |
|---|------|-------------|--------|
| 7 | **Life Planning Section** | Goals, where to live, retirement planning | Not Started |
| 8 | **Business Section** | Projects, finances, partnerships | Not Started |
| 9 | **Widgets** | iOS/Android widget showing next workout or trip countdown | Not Started |
| 10 | **Data Export** | Backup trips/memories to JSON/PDF | Not Started |

---

## Firebase Cloud Functions Setup Guide

The email invitation system has been created but needs to be deployed. Follow these steps:

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Your Firebase project must be on the Blaze (pay-as-you-go) plan for Cloud Functions

### Setup Steps

1. **Initialize Firebase in your project** (if not already done):
   ```bash
   cd travel-planner/outputs
   firebase init functions
   # Select your existing Firebase project
   # Choose JavaScript
   # Say "No" to ESLint
   # Say "Yes" to install dependencies
   ```

2. **Configure email credentials**:

   For Gmail, you need to create an "App Password" (not your regular password):
   - Go to your Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"

   Then set the Firebase config:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
   ```

3. **Update the app URL** in `functions/index.js`:
   - Find `const appUrl = 'https://your-app-url.vercel.app'`
   - Replace with your actual Vercel deployment URL

4. **Deploy the functions**:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

5. **Update the app** to call the Cloud Functions when inviting guests (code is prepared but needs to be connected)

### Alternative: Use SendGrid (Recommended for Production)

For better deliverability, you can use SendGrid instead of Gmail:

1. Sign up at sendgrid.com (free tier: 100 emails/day)
2. Get your API key
3. Update `functions/index.js` to use SendGrid instead of nodemailer

---

## Deep Link URLs

The app now supports direct URLs to each section:

| Section | URL |
|---------|-----|
| Home | `/` or `/home` |
| Travel | `/travel` |
| Fitness | `/fitness` |
| Events | `/events` |
| Memories | `/memories` |
| Nutrition | `/nutrition` |
| Life Planning | `/lifePlanning` |
| Business | `/business` |

These can be used to create home screen shortcuts on phones!

### Creating iPhone Shortcuts
1. Open Safari and navigate to the section you want (e.g., `your-app.vercel.app/fitness`)
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name it (e.g., "🏃 Training")

---

## Known Issues

1. ~~Events section null reference errors~~ - **FIXED**
2. ~~Guest modal input losing focus~~ - **FIXED** (moved to external component)

---

*This document should be updated as tasks are completed or priorities change.*
