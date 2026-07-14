# Aether Diary - Digital Diary & Journaling Application

## Status: All 5 Sprints Complete ✅

## Original Problem Statement
Build a Secure Personal Diary & Digital Journaling Application - a completely private, encrypted digital workspace where users can log thoughts with rich text, attach media, tag entries, and query past archives instantly.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + Recharts
- **Backend**: FastAPI (Python) with Motor async MongoDB driver
- **Database**: MongoDB (users, entries collections)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Design**: Dark luxurious theme (Black + Cyan #00E5FF), Playfair Display serif + Outfit sans-serif

## Completed Sprints

### ✅ Sprint 1: Authentication (2026-07-14)
- User registration, login, JWT auth, bcrypt hashing, admin seeding

### ✅ Sprint 2: Diary CRUD (2026-07-14)
- Full CRUD endpoints, ownership verification, chronological feed

### ✅ UI/UX Redesign (2026-07-14)
- Luxurious dark theme with cyan, animations, glass morphism

### ✅ Sprint 3: Rich Metadata (2026-07-14)
- 5 mood options (Happy/Calm/Neutral/Anxious/Sad)
- Image uploads (base64, 2MB limit)
- Tags system with pill display
- Enhanced entry cards with mood strips

### ✅ Sprint 4: Search & Admin (2026-07-14)
- Search endpoint with regex full-text search
- Mood filter chips
- Admin dashboard (/admin) with:
  - Stats cards, mood chart, recent users, all users table
  - Purple theme differentiation
- Admin-only route protection

### ✅ Sprint 5: Analytics & Streaks (2026-07-14) [User's Custom Sprint]
- **Personal Analytics Page** (/insights):
  - **Streak system**: current_streak, longest_streak with animated flame icon (color changes based on length)
  - **Days written** counter
  - **Total entries, This month, Best streak** stat cards
  - **Mood Journey**: 30-day area chart with emoji Y-axis
  - **Mood Palette**: Donut chart showing mood distribution with percentages
  - **Popular Themes**: Word-cloud style tag display (size based on usage)
- Backend endpoint: GET /api/analytics/me
- Streak calculation: Consecutive days ending today or yesterday
- Mood score mapping: happy=5, calm=4, neutral=3, anxious=2, sad=1

## API Endpoints
- POST /api/auth/register, login, GET /api/auth/me
- POST/GET/PUT/DELETE /api/entries (with mood, image, tags)
- GET /api/entries?search=X&mood=Y&tag=Z (search & filter)
- GET /api/admin/stats, /api/admin/users (admin only)
- GET /api/analytics/me (user's personal insights)

## Test Credentials (see /app/memory/test_credentials.md)
- test@example.com / password123 (regular user with seeded historical data)
- admin@diary.com / admin123 (admin)

## Frontend Routes
- /auth - Login/Register
- /dashboard - Diary entries with search & filters
- /insights - Personal analytics dashboard (NEW - Sprint 5)
- /admin - Admin console (admin only)
