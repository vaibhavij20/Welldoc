# Welldoc

## Inclusive AR/VR Coach

An inclusive and accessible AR/VR coaching platform designed to empower people with disabilities through immersive, adaptive digital environments.

### 🚀 Features

- **🔐 Strong Password Requirements**: 8+ characters with special chars, numbers, uppercase, and lowercase
- **🔒 Two-Factor Authentication (2FA)**: TOTP-based security with QR code setup and backup codes
- **♿ Accessible Design**: Built with accessibility-first principles
- **👤 User Authentication**: Secure signup and login system
- **🎯 Personalized Experience**: Customizable based on user needs and preferences
- **📊 Event Tracking**: Analytics for user interactions and progress
- **🛡️ Consent Management**: Privacy-focused data handling

### 🛠 Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Axios for API calls
- Real-time password strength validation

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing
- speakeasy for 2FA TOTP
- QR code generation

**Infrastructure:**
- Docker for database
- Docker Compose for local development

### 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/vaibhavij20/Welldoc.git
   cd Welldoc/inclusive-arvr-coach
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Set up the backend**
   ```bash
   cd backend
   npm install
   DATABASE_URL=postgresql://devuser:devpass@localhost:5433/inclusive_dev npm run dev
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

### 🔐 Security Features

- **Password Validation**: Real-time strength checking with visual feedback
- **2FA Setup**: QR code generation for authenticator apps
- **Backup Codes**: Account recovery options
- **Secure Storage**: Encrypted password hashing and JWT tokens

### 📱 User Experience

- **Signup**: Real-time password strength feedback
- **Login**: Seamless 2FA integration when enabled
- **Profile**: Easy 2FA management with clear instructions
- **Security**: Backup codes for account recovery

### 🌟 Mission

Our mission is to empower people with disabilities through immersive, inclusive, and adaptive digital environments that boost independence, confidence, and foster equity and empowerment.

**Making technology accessible for everyone** 🌟
