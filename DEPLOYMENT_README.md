# 🚴 RENTAMOTO - Bike Rental Management System

A full-stack bike rental platform built with **React**, **Node.js**, **Express**, and **Supabase**.

## 🌟 Features

- **🎨 Modern React Frontend** - Material-UI with Electric Blue theme
- **🔧 Robust Node.js Backend** - Express.js with comprehensive API
- **🔐 Authentication System** - JWT-based with role management
- **🚲 Complete Bike Management** - Rent, return, track, and manage bikes
- **💳 Cost Calculation** - Automatic pricing based on rental duration
- **📊 Admin Dashboard** - User management and analytics
- **⚡ Real-time Updates** - Live bike availability and booking status

## 🚀 Live Demo

- **Frontend**: [Coming Soon - Vercel Deployment]
- **API**: [Coming Soon - Vercel Deployment]

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **Material-UI v5** - Professional UI components
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Date-fns** - Date manipulation utilities

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database and authentication
- **JWT** - Secure token-based authentication
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

## 🏗️ Project Structure

```
rentamoto/
├── src/                      # Backend source code
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic
│   └── server.js            # Main server file
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React context
│   │   └── theme.js         # Material-UI theme
│   └── public/              # Static files
├── sql/                     # Database schema
├── scripts/                 # Utility scripts
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+
- **npm** or **yarn**
- **Supabase Account** (free tier available)

### 1. Clone Repository

```bash
git clone <repository-url>
cd rentamoto
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

```bash
# Run database migrations
npm run migrate
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend (Port 3001)
npm run dev

# Terminal 2: Frontend (Port 3000)
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🔐 Demo Credentials

```
Email: demo@test.com
Password: test123
```

## 📱 API Endpoints

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Bikes

- `GET /bikes` - List all bikes
- `POST /bikes` - Add new bike (Admin)
- `PUT /bikes/:id` - Update bike (Admin)
- `DELETE /bikes/:id` - Delete bike (Admin)

### Rentals

- `POST /rent` - Rent a bike
- `POST /return` - Return a bike
- `GET /my-bookings` - User's rental history
- `GET /active-rental` - Current active rental

### Admin

- `GET /bookings` - All bookings (Admin)
- `GET /revenue` - Revenue analytics (Admin)

## 🌐 Deployment

### Vercel (Recommended)

1. **Backend Deployment**:

   ```bash
   # Deploy backend to Vercel
   vercel --prod
   ```

2. **Frontend Deployment**:

   ```bash
   cd frontend
   # Update API_URL in environment
   npm run build
   vercel --prod
   ```

3. **Environment Variables**:
   Set in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`

## 🧪 Testing

```bash
# Run backend tests
npm test

# Test API endpoints
npm run test:api

# Frontend tests
cd frontend
npm test
```

## 📊 Database Schema

### Tables

- `user_profiles` - User information and roles
- `bikes` - Bike inventory and details
- `bookings` - Rental transactions
- `analytics` - Usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Email**: [your-email@domain.com]

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] GPS tracking integration
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications

---

**Built with ❤️ for the bike rental community**
