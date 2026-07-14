# Aether Diary - Digital Diary & Journaling Application

## Original Problem Statement
Build a Secure Personal Diary & Digital Journaling Application - a completely private, encrypted digital workspace where users can log thoughts with rich text, attach media, tag entries, and query past archives instantly. All 4 sprints must be deployed.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + Recharts
- **Backend**: FastAPI (Python) with Motor async MongoDB driver
- **Database**: MongoDB (users, entries collections)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Design**: Dark luxurious theme (Black + Cyan #00E5FF), Playfair Display serif + Outfit sans-serif

## User Personas
- **Journalers**: Users writing personal diary entries with privacy
- **Administrators**: System admins with analytics dashboard access

## Core Requirements (Static)
1. Secure user authentication (register/login/logout)
2. Complete CRUD operations for diary entries
3. Private data isolation (users only see their own entries)
4. Multimedia attachments (images)
5. Mood tracking (5 mood options)
6. Tags system
7. Search and filter functionality
8. Admin panel with analytics

## What's Been Implemented

### ✅ Sprint 1: Authentication Foundation (2026-07-14)
- User registration with email/password
- JWT-based authentication  
- Bcrypt password hashing
- Protected routes middleware
- Admin user seeding

### ✅ Sprint 2: Diary CRUD Engine (2026-07-14)
- Entry model with user_id linking
- POST/GET/PUT/DELETE /api/entries endpoints
- Ownership verification on all operations
- Chronological entry feed
- Create/Edit/Delete UI with confirmations

### ✅ UI/UX Redesign (2026-07-14)
- Luxurious dark theme (Black #030508 + Cyan #00E5FF)
- Playfair Display serif + Outfit sans-serif fonts
- Framer Motion animations everywhere
- Floating diary card animations
- Glass morphism dialogs
- Ambient cyan glows and gradients

### ✅ Sprint 3: Rich Metadata (2026-07-14)
- **Mood tracking**: 5 mood options (Happy/Calm/Neutral/Anxious/Sad) with colored badges
- **Image uploads**: Base64 storage, 2MB limit, elegant upload UI with preview
- **Tags system**: Add tags with Enter key, cyan pill display
- **Enhanced entry cards**: Mood colored top strips, images at top, tag badges below content
- **MoodPicker** component with animated selection
- **ImageUpload** component with preview and remove
- **TagInput** component with tag management

### ✅ Sprint 4: Search, Filters & Admin Panel (2026-07-14)
- **Search endpoint**: Full-text search in title, content, tags (regex-based)
- **Query params**: search, mood filter, tag filter
- **SearchBar UI**: Toggle-able search with mood filter chips
- **Debounced search**: 300ms debounce for smooth UX
- **Admin API endpoints**:
  - GET /api/admin/stats - Full statistics
  - GET /api/admin/users - All users list
- **Admin Dashboard Page** (/admin):
  - 4 stat cards (Total Users, Total Entries, Admins, Last 7 Days)
  - Emotional Landscape bar chart (recharts) showing entries by mood
  - Recent Sign-ups list with avatars
  - All Users table with role badges
  - Purple theme differentiation from user (cyan)
- **Admin protection**: Non-admins redirected to /dashboard

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/entries (with mood, image_url, tags)
- GET /api/entries?search=X&mood=Y&tag=Z
- GET /api/entries/{id}
- PUT /api/entries/{id}
- DELETE /api/entries/{id}
- GET /api/admin/stats (admin only)
- GET /api/admin/users (admin only)

## Test Credentials (see /app/memory/test_credentials.md)
- test@example.com / password123 (regular user with entries)
- admin@diary.com / admin123 (admin user)

## Prioritized Backlog
### User's Custom Sprint 5 (Pending user's requirements)
- User will decide the 5th sprint feature

## Next Tasks
- Wait for user to specify Sprint 5 requirements
