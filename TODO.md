# Grafix Business OS — Mock Data Removal Progress

## ✅ Phase A: Worker Endpoints (COMPLETE)

- [X] Added `GET /api/public/availability?clientId=&staffId=&date=` endpoint
- [X] Added gallery items to `/api/public/site` response
- [X] Added generic dashboard CRUD route handler (`/api/dashboard/*`)
- [X] Added dashboard metrics endpoint

## ✅ Phase B: Luxury Barbershop Frontend (VERIFIED — no changes needed)

- [X] `api.ts` already routes through Worker correctly
- [X] `AppContext.tsx` already loads data from Worker
- [X] Booking flow uses `api.getBookingAvailability()` — endpoint now exists

## 🔄 Phase C: Dashboard Rewrite (IN PROGRESS)

### C1: Worker API Client (DONE)
- [X] Created `src/lib/worker-api.ts` with all CRUD methods

### C2: supabase.ts Rewrite (DONE)
- [X] Removed all `DEFAULT_*` mock data arrays
- [X] Replaced `db` object methods with Worker API calls
- [X] Supabase client kept only for Auth (Google OAuth)
- [X] `db.createBusinessProfile()` removed (was mock-only)

### C3: Fix Dashboard Views for Async (DONE)

Files verified:
- [x] `src/components/DashboardView.tsx` — ✅ Fixed: migrated to `workerApi` with metrics loading, removed stale variable shadowing
- [x] `src/components/BookingsView.tsx` — ✅ Already async: `useEffect` loads from `db.getXxx()` state is typed and matches types
- [x] `src/components/OrdersView.tsx` — ✅ Already async: `useEffect` loads from `db.getXxx()` with proper state
- [x] `src/components/ProductsView.tsx` — ✅ Already async: `useEffect` loads from `db.getXxx()`, file uploads use Worker
- [x] `src/components/SaaSViews.tsx` — ✅ Already async: all views use `useEffect` + `db.getXxx()` async calls
- [x] `src/components/OnboardingPage.tsx` — ✅ No mock data: calls Worker `/api/claim-account` directly, never uses `db.createBusinessProfile()`

### C4: Missing db methods (DONE — all handled)
- [x] `db.assignStaffToSubmission()` — ✅ Added to `supabase.ts` as a no-op (local assignment only; managed server-side)
- [x] `db.createBusinessProfile()` — ✅ Removed from `supabase.ts`; `OnboardingPage.tsx` calls Worker directly

## ✅ Phase D: Claim Code Workflow (VERIFIED — already implemented)

- [X] Claim code UI exists in `DashboardView.tsx` and `LoginPage.tsx`
- [X] Worker has `/api/claim-account/relink` endpoint
- [X] Flow: user enters code → Worker verifies → links `clients.auth_user_id` → dashboard reloads

## ✅ Phase E: Verification (COMPLETE)

- [x] Run `npx tsc --noEmit` — **0 errors** (1 pre-existing `cubicBezier` → `ease` fix applied)
- [x] Verify no mock data remains — confirmed: all `DEFAULT_*` arrays removed from `supabase.ts`
- [x] Verify all endpoints being used — Worker `worker.js` contains all routes needed by frontend

