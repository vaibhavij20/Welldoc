# Inclusive AR/VR Coach

An inclusive and accessible AR/VR coaching platform designed to empower people with disabilities through immersive, adaptive digital environments.

## 🎯 Mission

Our mission is to empower people with disabilities through immersive, inclusive, and adaptive digital environments that boost independence, confidence, and foster equity and empowerment.

## 🚀 Features

- **Accessible Design**: Built with accessibility-first principles
- **User Authentication**: Secure signup and login system
- **Personalized Experience**: Customizable based on user needs and preferences
- **AR/VR Integration**: Ready for immersive experiences
- **Event Tracking**: Analytics for user interactions and progress
- **Consent Management**: Privacy-focused data handling

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with custom properties for theming

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing

### Infrastructure
- **Docker** for database
- **Docker Compose** for local development

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd inclusive-arvr-coach
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Set up the backend**
   ```bash
   cd backend
   npm install
   npm run dev
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

## 📁 Project Structure

```
inclusive-arvr-coach/
├── backend/
│   ├── index.js          # Express server
│   ├── db.js            # Database connection
│   ├── migrations.sql   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utilities and API
│   │   └── main.jsx    # Entry point
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Data
- `POST /api/events` - Track user events
- `POST /api/consent` - Store user consent
- `GET /health` - Health check

## 🎨 Accessibility Features

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Customizable color schemes
- **Focus Management**: Clear focus indicators
- **Responsive Design**: Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with accessibility and inclusion in mind
- Inspired by the need for more inclusive digital experiences
- Thanks to the open-source community for the amazing tools

## 📞 Support

If you have any questions or need help, please open an issue or contact us.

---

**Making technology accessible for everyone** 🌟
# inclusive-arvr-coach
