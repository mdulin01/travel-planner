# Mike and Adam — Project Guidelines

## Key URLs & Resources

| Resource | URL |
|----------|-----|
| **GitHub Repository** | https://github.com/mdulin01/mikeandadam |

## Technical Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend/Database:** Firebase (Firestore, Authentication, Storage)
- **Deployment:** Vercel
- **Version Control:** GitHub (mdulin01/mikeandadam)

## Infrastructure

- **Firebase Project ID:** trip-planner-5cc84
- **Firebase Storage Bucket:** `gs://trip-planner-5cc84.firebasestorage.app`
- **Database:** Firestore
- **Authentication:** Enabled
- **Storage:** Enabled
- **Firebase config** is hardcoded in `src/firebase-config.js` (public API keys only)

## Architecture Notes

- **Main component:** `src/trip-planner.jsx`
- **Shared utility:** `src/utils.js`
- **Key components:** TripDetail, GuestEventPage, NewTripModal, AddModal, CompanionsModal, PhotoLightbox, RandomExperienceModal, SharedHub
- **Custom hooks:** useFitness, useModal, useSharedHub, useTravel
- **Context:** SharedHubContext

## File Scope Boundary

**CRITICAL: When working on this project, ONLY access files within the `mikeandadam/` directory.** Do not read, write, or reference files from any sibling project folder. If you need something from another project, stop and ask first.
