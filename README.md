# 🩸 RakhtSaathi - Blood Emergency Coordination System

A complete blood donation management system built with React.js frontend and Firebase backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Firebase Account

### Installation & Running

1. **Clone and Setup:**
   ```bash
   git clone https://github.com/Keldekuldeep/CodeSphere.git
   cd CodeSphere
   ```

2. **Start the System:**
   ```bash
   # Run the startup script
   START_RAKHT_SAATHI.bat
   ```
   
   OR manually:
   ```bash
   npm install
   npm start
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000

## 👥 Demo Accounts

- **Admin**: admin@demo.com / demo123
- **Donor**: donor@demo.com / demo123
- **Needy**: needy@demo.com / demo123

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
- Create blood requests with voice messages
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
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- i18next (Multi-language)

## 📁 Project Structure

```
RakhtSaathi/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── context/           # React contexts
│   ├── firebase/          # Firebase config
│   ├── i18n/              # Multi-language
│   └── services/          # API services
├── public/                # Static assets
└── package.json          # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables (.env)
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=bloodsaathi-69e5d.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bloodsaathi-69e5d
REACT_APP_FIREBASE_STORAGE_BUCKET=bloodsaathi-69e5d.firebasestorage.app
```

### Firebase Setup
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy build folder
```

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in configuration
2. **Firebase errors**: Check Firebase configuration
3. **Authentication issues**: Verify Firebase Auth setup

### Support
- Check logs in browser console
- Verify all dependencies are installed
- Ensure Firebase project is properly configured

---

**Built with ❤️ for saving lives through blood donation**
