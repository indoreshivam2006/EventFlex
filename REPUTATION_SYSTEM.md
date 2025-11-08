# EventFlex Reputation System

## Overview
The reputation system allows organizers to rate staff members after event completion, building a verifiable digital portfolio for gig workers.

## Badge Levels

### ⭐ Rising Star (Default)
- **Criteria**: New users or average rating < 3.0
- **Color**: Orange (#f59e0b)
- **Description**: "Keep building your reputation!"

### 🏆 Pro
- **Criteria**: Average rating 3.0 - 3.9
- **Color**: Blue (#3b82f6)
- **Description**: "You're a trusted professional!"

### 👑 Elite
- **Criteria**: Average rating 4.0 - 5.0
- **Color**: Gold (#DAA520)
- **Description**: "You're in the top tier of Event Pros!"

## How It Works

### For Organizers:
1. **Complete Event**: Finish an event from your dashboard
2. **Rate Staff**: Click "Rate" button next to each hired staff member
3. **Submit Rating**: Provide overall rating (1-5 stars) plus detailed ratings:
   - Professionalism (1-5)
   - Punctuality (1-5)
   - Quality of Work (1-5)
   - Communication (1-5)
4. **Badge Update**: Staff badge automatically updates based on new average rating

### For Staff:
1. **View Reputation**: See your badge, rating, and reviews in "Your Reputation" section
2. **Application Form**: Your badge displays prominently in job applications
3. **Build Portfolio**: Collect reviews and improve your rating to unlock higher badges

## Database Models

### UserProfile (Extended)
- `badge`: Choice field (rising_star, pro, elite) - Default: 'rising_star'
- `average_rating`: Decimal (0.00-5.00)
- `total_reviews`: Integer counter
- `total_events_completed`: Integer counter

### Review
- `job`: Foreign key to Job
- `staff`: Foreign key to staff UserProfile
- `organizer`: Foreign key to organizer UserProfile
- `rating`: Overall rating (1-5)
- `review_text`: Optional text feedback
- `professionalism`: Integer (1-5)
- `punctuality`: Integer (1-5)
- `quality_of_work`: Integer (1-5)
- `communication`: Integer (1-5)

## API Endpoints

### Submit Review
```
POST /api/reviews/submit/<job_id>/
Body: {
  "staff_id": 42,
  "rating": 4.5,
  "review_text": "Excellent work!",
  "professionalism": 5,
  "punctuality": 5,
  "quality_of_work": 4,
  "communication": 5
}
```

### Get Staff Reviews
```
GET /api/reviews/staff/<staff_id>/
```

### Get Staff to Review
```
GET /api/reviews/job/<job_id>/staff/
```

## Management Commands

### Initialize Badges for Existing Users
```bash
python manage.py initialize_badges
```
Sets all existing users to "Rising Star" badge if they don't have one.

### Sync Reputation Data
```bash
python manage.py sync_reputation_data
```
Counts completed events for all staff based on accepted applications for completed jobs.

### View Reputation Summary
```bash
python manage.py reputation_summary
```
Displays comprehensive summary of:
- All staff members with their badges, ratings, and stats
- Total reviews in system
- Completed jobs needing reviews
- Badge distribution across all staff

## Migration for Existing Data

When implementing this system in an existing application:

1. **Run Migration**: 
   ```bash
   python manage.py migrate
   ```

2. **Initialize User Badges**:
   ```bash
   python manage.py initialize_badges
   ```

3. **Sync Historical Data**:
   ```bash
   python manage.py sync_reputation_data
   ```

4. **Review Status**:
   ```bash
   python manage.py reputation_summary
   ```

## Frontend Integration

### Staff Portal
- Dynamic "Your Reputation" card shows current badge, rating, and recent reviews
- Badge displays in application form under Personal Information
- Real-time updates when new reviews are received

### Organizer Dashboard
- "Rate" button appears for each staff member in completed events
- Professional rating modal with star selection and sliders
- Success message shows new rating and badge after submission

### Application Form
- Badge displayed with icon and color coding
- Shows current rating and total reviews
- Automatically updates based on latest reputation data

## Automatic Badge Updates

Badges update automatically when:
1. New review is submitted
2. Staff's average rating changes
3. `update_badge()` method is called

The system recalculates the average rating from all reviews and assigns the appropriate badge level.

## Notes

- All existing users start as "Rising Star" (default badge)
- Badge promotions are automatic based on rating thresholds
- Reviews are tied to completed jobs only
- One review per organizer-staff-job combination (unique constraint)
- Staff's `total_events_completed` increments when first review is submitted for a job

## Future Enhancements

- [ ] Allow staff to respond to reviews
- [ ] Add "featured reviews" to staff profiles
- [ ] Implement organizer ratings (staff can rate organizers too)
- [ ] Add achievement badges for milestones (10 events, 25 events, etc.)
- [ ] Create leaderboard for top-rated staff
- [ ] Export reputation report as PDF for staff portfolios
