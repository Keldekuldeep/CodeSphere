# 🩸 BloodSaathi - Blood Donation System

A complete blood donation management system built with React.js frontend and Spring Boot backend.

## 🚀 Quick Start

### Prerequisites
- Java 17
- Maven 3.6+
- Node.js 14+
- Firebase Account

### Installation & Running

1. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd BloodSaathi
   ```

2. **Start the System:**
   ```bash
   # Run the startup script
   START_BLOODSAATHI.bat
   ```
   
   OR manually:
   ```bash
   # Terminal 1: Start Backend
   cd backend
   mvn spring-boot:run
   
   # Terminal 2: Start Frontend
   npm install
   npm start
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080

## 👥 Demo Accounts

- **Admin**: admin@bloodsaathi.com / admin123
- **Donor**: donor@test.com / donor123
- **Needy**: needy@test.com / needy123

## 🎯 Features

### 🏠 Landing Page
- Hero section with call-to-action
- Features showcase
- Statistics display
- Multi-language support (Hindi/English)

### 🩸 Donor Portal
- Registration with medical details
- Dashboard with statistics
- Blood request listings
- Health checklist
- Certificate system
- Donation history
- Profile management

### 🆘 Needy Portal
- Create blood requests
- Track request status
- Submit feedback
- Profile management

### 👨‍💼 Admin Portal
- System dashboard with analytics
- User management
- Certificate approvals
- Feedback monitoring

### 🌐 Multi-Language
- Hindi and English support
- Dynamic language switching
- Persistent preferences

### 📜 Certificate System
- Automatic certificate generation
- PDF download functionality
- Admin approval workflow
- Certificate verification

## 🛠️ Technology Stack

### Frontend
- React.js 18
- React Router
- Bootstrap 5
- Firebase Authentication
- i18next (Multi-language)

### Backend
- Spring Boot 2.7
- Spring Security
- Spring Data JPA
- H2 Database (Development)
- Firebase Admin SDK

## 📁 Project Structure

```
BloodSaathi/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── context/           # React contexts
│   ├── firebase/          # Firebase config
│   ├── i18n/              # Multi-language
│   └── services/          # API services
├── backend/               # Spring Boot backend
│   └── src/main/java/com/bloodsaathi/
│       ├── controller/    # REST controllers
│       ├── service/       # Business logic
│       ├── entity/        # Database entities
│       ├── repository/    # Data repositories
│       └── config/        # Configuration
├── public/                # Static assets
└── package.json          # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables (.env)
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=bloodsaathi-69e5d.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bloodsaathi-69e5d
REACT_APP_BACKEND_URL=http://localhost:8080
```

### Firebase Setup
1. Create Firebase project
2. Enable Authentication (Phone)
3. Add service account key to `backend/src/main/resources/`

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy build folder
```

### Backend (Heroku/AWS)
```bash
cd backend
mvn clean package
# Deploy JAR file
```

## 📱 Demo Mode

The system runs in demo mode when Firebase billing is disabled:
- Uses localStorage for session management
- Bypasses phone authentication
- All features remain functional

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in configuration
2. **Firebase errors**: Check service account key
3. **Maven issues**: Ensure Java 17 is configured

### Support
- Check logs in browser console and backend terminal
- Verify all dependencies are installed
- Ensure Firebase project is properly configured

---

**Built with ❤️ for saving lives through blood donation**