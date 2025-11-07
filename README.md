# EventFlex - Event Management Platform

A comprehensive event management platform connecting event organizers with professional staff (photographers, videographers, security, etc.).

## Features

- **Staff Portal**: Browse jobs, manage applications, track earnings, generate QR codes for event check-in
- **Organizer Dashboard**: Post jobs, find talent, manage events, track attendance, process payments
- **Real-time Wallet**: Transaction tracking, earnings charts, withdraw funds
- **Manual Location Matching**: Flexible location-based job search
- **Profile Management**: Upload photos, videos, and manage professional profiles

## Tech Stack

- **Backend**: Django 5.2.7
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Additional**: Python-dotenv for environment management

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/indoreshivam2006/EventFlex.git
   cd EventFlex
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv env
   
   # Windows
   .\env\Scripts\activate
   
   # macOS/Linux
   source env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example EventFlex/.env
   
   # Edit EventFlex/.env and update the values:
   # - Generate a new SECRET_KEY for production
   # - Configure email settings if needed
   # - Update database settings for production
   ```

5. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Populate sample data (optional)**
   ```bash
   python manage.py populate_data
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

9. **Access the application**
   - Homepage: http://localhost:8000/
   - Staff Portal: http://localhost:8000/staff-portal/
   - Organizer Dashboard: http://localhost:8000/organizer-dashboard/
   - Admin Panel: http://localhost:8000/admin/

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Auto-generated |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed host domains | `localhost,127.0.0.1` |
| `DATABASE_ENGINE` | Database backend | `django.db.backends.sqlite3` |
| `EMAIL_BACKEND` | Email backend | `console` |

## Project Structure

```
EventFlex/
├── EventFlex/              # Project settings
│   ├── settings.py         # Django settings (loads from .env)
│   ├── urls.py            # Main URL routing
│   └── .env               # Environment variables (not in git)
├── EventFlex_app/         # Main application
│   ├── models.py          # Database models
│   ├── views.py           # View functions & API endpoints
│   ├── urls.py            # App URL routing
│   ├── templates/         # HTML templates
│   ├── static/            # CSS, JS, images
│   └── management/        # Custom commands
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore rules
└── manage.py             # Django management script
```

## API Endpoints

- `/api/withdraw/` - Withdraw funds from wallet
- `/api/add-funds/` - Add funds to wallet
- `/api/upload-photo/` - Upload profile photo
- `/api/upload-video/` - Upload video introduction
- `/api/send-message/` - Send messages
- `/api/track-attendance/` - Track event attendance
- `/api/download-report/` - Download event reports
- `/api/release-payment/` - Release payment to staff
- `/api/save-profile/` - Save profile updates

## Security Notes

⚠️ **Important for Production:**

1. Generate a new `SECRET_KEY` (never use the default)
2. Set `DEBUG=False`
3. Configure proper `ALLOWED_HOSTS`
4. Use PostgreSQL or MySQL instead of SQLite
5. Enable HTTPS and security headers
6. Set up proper email backend (SMTP)
7. Configure static file serving with WhiteNoise or CDN
8. Never commit `.env` file to version control

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ by the EventFlex Team
