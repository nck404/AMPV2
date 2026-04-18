# AMP V2 Implementation Guide - New Features

## Overview
This guide documents the implementation of four major features added to the AMP sign language learning platform:

1. ✅ V and U letter gesture recognition in sign language learning
2. ✅ Admin user management with ban/lock functionality
3. ✅ Enhanced database for learning progress and scores
4. ✅ Global leaderboard system with score ranking

---

## 1. Letters V and U Gesture Recognition

### Current Status
The V and U letters are **already properly implemented** in the gesture recognition system.

### Location
- **Gesture Definitions**: `Src/Frontend/amp/src/lib/gestures.js` (Lines 109-126)
- **Frontend Display**: `Src/Frontend/amp/src/routes/sign-language/+page.svelte`

### Gesture Details

#### Letter U
```javascript
U: make('U', [
    [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
    [F.Index,  C.NoCurl,   1.0, D.VerticalUp,       1.0],
    [F.Middle, C.NoCurl,   1.0, D.VerticalUp,       1.0],
    [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
    [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
])
```
**Description**: Index and middle fingers point straight up together, other fingers curled.

#### Letter V
```javascript
V: make('V', [
    [F.Thumb,  C.HalfCurl, 1.0, D.DiagonalUpLeft,   0.5],
    [F.Index,  C.NoCurl,   1.0, D.DiagonalUpLeft,   1.0],
    [F.Middle, C.NoCurl,   1.0, D.DiagonalUpRight,  1.0],
    [F.Ring,   C.FullCurl, 1.0, D.VerticalUp,       0.75],
    [F.Pinky,  C.FullCurl, 1.0, D.VerticalUp,       0.75],
])
```
**Description**: Index and middle fingers spread apart (peace sign), other fingers curled.

### Testing V and U
1. Navigate to `/sign-language`
2. Select "Bảng chữ cái" (Alphabet) category
3. Find "Chữ U" and "Chữ V" lessons
4. Perform the hand gesture in front of your camera
5. The system should recognize and lock in your gesture after ~10 stable frames

---

## 2. Admin User Management with Ban/Lock

### New Endpoints

#### Get All Users (Admin Only)
```
GET /api/sign-language/admin/users?limit=50&offset=0
Authorization: Bearer {token}
```
**Response**: List of users with statistics

#### Ban/Unban User (Admin Only)
```
POST /api/sign-language/admin/users/{user_id}/ban
Authorization: Bearer {token}
Content-Type: application/json

{
    "ban": true  // or false to unban
}
```

#### Change User Role (Admin Only)
```
PUT /api/sign-language/admin/users/{user_id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
    "role": "admin"  // "user", "business", or "admin"
}
```

### Admin User Management Page
**Path**: `/admin/users`

#### Features
- 🔍 Search users by username, email, or public ID
- 🎯 Filter by role (User, Business, Admin)
- 🔒 Filter by status (Active, Banned)
- 👤 View user avatars and join dates
- 📊 See learning progress count for each user
- ⚡ Quick role selection via dropdown
- 🚫 Ban/unban users with one click
- 📄 Pagination support (50 users per page)

#### UI Components
```svelte
// Search bar with filters
<input placeholder="Tìm username, email, ID..." />
<select>Tất cả vai trò</select>
<select>Tất cả trạng thái</select>

// User card with actions
- Avatar display
- Username and email
- Join date
- Learning progress count
- Role selector (dropdown)
- Ban/unban button
```

### Accessing User Management
1. Must be logged in as admin user
2. Click shield icon (🛡️) in top navigation
3. Select "Người dùng" from admin menu
4. Use search and filters to find users
5. Change roles or ban users as needed

---

## 3. Enhanced Database for Progress & Scores

### New Database Model: Leaderboard

```python
class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=True, nullable=False)
    total_score = db.Column(db.Integer, default=0)
    total_lessons_completed = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    highest_streak = db.Column(db.Integer, default=0)
    total_practice_score = db.Column(db.Integer, default=0)
    average_accuracy = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, onupdate=db.func.current_timestamp())
    rank = db.Column(db.Integer, default=0)
```

### Existing Enhanced Model: LearningProgress

```python
class LearningProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, foreign_key, nullable=False)
    lesson_title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    score = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, default=db.func.current_timestamp())
```

### Progress Tracking Endpoints

#### Get User Progress
```
GET /api/sign-language/progress
Authorization: Bearer {token}

Response: [
    {
        "id": 1,
        "lesson_title": "Chữ A",
        "category": "Bảng chữ cái",
        "score": 150,
        "completed_at": "2024-01-15T10:30:00"
    }
]
```

#### Save Progress
```
POST /api/sign-language/progress
Authorization: Bearer {token}
Content-Type: application/json

{
    "lesson_title": "Chữ A",
    "category": "Bảng chữ cái",
    "score": 150
}
```

#### Reset Lesson Progress
```
DELETE /api/sign-language/progress/{lesson_id}
Authorization: Bearer {token}
```

### Auto-Update Mechanism
The leaderboard is automatically updated when:
- User completes a lesson
- User's score is updated
- User resets progress

**Function**: `update_leaderboard(user_id)` in `sign_language.py`

---

## 4. Global Leaderboard System

### New Page: `/leaderboard`

#### Features
- 🏆 Global leaderboard ranked by total score
- 👤 Personal statistics card
- 🥇🥈🥉 Medal display for top 3 users
- 📊 Individual stats:
  - Total score
  - Lessons completed
  - Current streak
  - Highest streak
  - Average accuracy
  - Practice score
- 🔍 Real-time search and filtering
- 📄 Pagination (50 users per page)

#### Leaderboard Endpoints

##### Get Global Leaderboard
```
GET /api/sign-language/leaderboard?limit=50&offset=0

Response: [
    {
        "rank": 1,
        "user_id": 123,
        "username": "john_doe",
        "avatar_url": "https://...",
        "total_score": 5000,
        "total_lessons_completed": 26,
        "current_streak": 5,
        "highest_streak": 10,
        "average_accuracy": 95.5,
        "last_updated": "2024-01-20T15:30:00"
    }
]
```

##### Get My Leaderboard Position
```
GET /api/sign-language/leaderboard/me
Authorization: Bearer {token}

Response: {
    "rank": 5,
    "user_id": 456,
    "username": "jane_smith",
    "avatar_url": "https://...",
    "total_score": 3500,
    "total_lessons_completed": 20,
    "current_streak": 3,
    "highest_streak": 8,
    "average_accuracy": 92.3,
    "total_practice_score": 800,
    "last_updated": "2024-01-20T14:45:00"
}
```

##### Get Specific User Position
```
GET /api/sign-language/leaderboard/user/{user_id}
```

### Leaderboard UI Components

#### Global Tab
- List of top 50 users
- Rank badges (🥇 for rank 1, 🥈 for rank 2, 🥉 for rank 3)
- User avatar, name, and join date
- Score, lessons, streak, accuracy stats
- Mobile-responsive design
- Pagination controls

#### My Stats Tab (Logged In Users)
- Large rank display with medal
- Key metrics in cards:
  - Rank number
  - Total score
  - Highest streak
- Detailed stats grid:
  - Lessons completed
  - Average accuracy
  - Current streak
  - Practice score

### Accessing Leaderboard
1. Click 🏆 icon in navigation (labeled "Bảng xếp hạng")
2. View global rankings
3. Switch to "Thống kê của tôi" tab to see personal stats
4. Pagination buttons to view more users

---

## 5. Vite Configuration Update

### Added Host Authorization
**File**: `Src/Frontend/amp/vite.config.js`

```javascript
preview: {
    allowedHosts: ["amp.tfai.lol", "amp.prj.ydns.eu"],
    proxy: {
        "/api": {
            target: "http://127.0.0.1:6333",
            changeOrigin: true,
        },
        ...
    }
}
```

**Change**: Added `"amp.prj.ydns.eu"` to both `server.allowedHosts` and `preview.allowedHosts`

---

## 6. Navigation Updates

### Updated Navigation Menu
**File**: `Src/Frontend/amp/src/lib/components/Navbar.svelte`

New menu item added:
```javascript
{ name: "Bảng xếp hạng", path: "/leaderboard", icon: "bx-trophy" }
```

Available in:
- 🖥️ Desktop top navigation
- 📱 Mobile tools dropdown menu

---

## 7. Database Setup Instructions

### Run Migrations
```bash
cd Src/Backend
flask db migrate -m "Add leaderboard and enhance learning progress"
flask db upgrade
```

### Initialize Leaderboard for Existing Users
```bash
python
>>> from app import db, app
>>> from models import User, Leaderboard
>>> with app.app_context():
>>>     for user in User.query.all():
>>>         if not Leaderboard.query.filter_by(user_id=user.id).first():
>>>             entry = Leaderboard(user_id=user.id)
>>>             db.session.add(entry)
>>>     db.session.commit()
```

---

## 8. Testing Checklist

### Sign Language Features
- [ ] Navigate to `/sign-language`
- [ ] Perform gesture U (index + middle up)
- [ ] Perform gesture V (index + middle spread)
- [ ] Verify gestures are recognized correctly
- [ ] Check "Chữ U" and "Chữ V" lessons exist

### Admin User Management
- [ ] Log in as admin
- [ ] Navigate to `/admin/users`
- [ ] Search users by username
- [ ] Filter by role
- [ ] Filter by ban status
- [ ] Change user role via dropdown
- [ ] Ban a user
- [ ] Unban the user
- [ ] Verify changes persist

### Learning Progress
- [ ] Complete a sign language lesson
- [ ] Check progress saves in database
- [ ] View progress via API: `GET /api/sign-language/progress`
- [ ] Complete multiple lessons
- [ ] Verify total score increases

### Leaderboard
- [ ] Navigate to `/leaderboard`
- [ ] View global rankings
- [ ] Log in and view personal stats
- [ ] Verify rank calculation
- [ ] Check pagination works
- [ ] Verify stats match database

### Vite Config
- [ ] Access app via `amp.prj.ydns.eu`
- [ ] Confirm no "Blocked request" error
- [ ] Verify all API calls work correctly

---

## 9. Troubleshooting

### Issue: V and U gestures not recognized
**Solution**: 
- Ensure lighting is adequate
- Keep hand steady for 10 frames (~1 second)
- Hold gestures clearly without overlapping fingers

### Issue: Admin user page shows "Unauthorized"
**Solution**:
- Verify user has `role = "admin"` in database
- Check token is valid
- Restart server if role was just changed

### Issue: Leaderboard shows no users
**Solution**:
- Run initialization script above
- Verify users have completed lessons
- Check `LearningProgress` table is populated

### Issue: "Blocked request" error with amp.prj.ydns.eu
**Solution**:
- Already fixed! Check `vite.config.js` has host in `allowedHosts`
- Restart Vite dev server or production build

### Issue: Scores not saving
**Solution**:
- Verify token in localStorage is valid
- Check network tab for API errors
- Ensure `update_leaderboard()` is being called

---

## 10. API Summary

### Sign Language Routes
```
Base URL: http://localhost:6333/api/sign-language

Auth required endpoints:
GET    /progress                     - Get user progress
POST   /progress                     - Save lesson progress
DELETE /progress/<id>                - Reset lesson
GET    /leaderboard/me               - Get personal rank
POST   /admin/users/<id>/ban         - Ban/unban user
PUT    /admin/users/<id>/role        - Change user role

Public endpoints:
GET    /leaderboard                  - Get global rankings
GET    /leaderboard/user/<id>        - Get user's position
GET    /locks                        - Get locked lessons
```

---

## 11. File Structure

```
AMPV2/
├── Src/
│   ├── Backend/
│   │   ├── models.py              (✨ Updated with Leaderboard)
│   │   └── routes/sign_language.py (✨ Enhanced with new endpoints)
│   └── Frontend/
│       └── amp/
│           ├── vite.config.js     (✨ Updated allowedHosts)
│           └── src/
│               ├── lib/
│               │   ├── gestures.js (V and U already defined)
│               │   └── components/
│               │       └── Navbar.svelte (✨ Added leaderboard link)
│               └── routes/
│                   ├── leaderboard/
│                   │   └── +page.svelte (✨ NEW - Leaderboard page)
│                   ├── admin/
│                   │   └── users/
│                   │       └── +page.svelte (✨ Enhanced user management)
│                   └── sign-language/
│                       └── +page.svelte (Uses V and U gestures)
```

---

## 12. Performance Considerations

### Leaderboard Optimization
- Queries are ordered by `total_score DESC`
- Pagination limits: 50 users per page (configurable)
- Rank calculated on-the-fly for efficiency
- Consider adding database index on `total_score`:
  ```sql
  CREATE INDEX idx_leaderboard_score ON leaderboard(total_score DESC);
  ```

### Progress Tracking
- Scores only update if new score > old score
- Leaderboard updated atomically with progress save
- Auto-cleanup: Banned users excluded from leaderboard

---

## 13. Future Enhancements

Potential improvements for future versions:
- [ ] Weekly/monthly leaderboards
- [ ] Achievement badges system
- [ ] Daily streak tracking with notifications
- [ ] Social features (follow, compare stats)
- [ ] Personalized learning recommendations based on accuracy
- [ ] Export progress data as PDF
- [ ] Team/group competitions
- [ ] Advanced analytics dashboard

---

## 14. Support & Contact

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation in routes files
3. Check browser console for client-side errors
4. Check server logs for backend errors
5. Contact development team for support

---

**Document Version**: 1.0
**Last Updated**: 2024
**Status**: Complete ✅