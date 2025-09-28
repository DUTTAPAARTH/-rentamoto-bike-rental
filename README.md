# RENTAMOTO Backend

A bike rental management backend powered by Supabase (PostgreSQL + Auth + APIs) and Node.js/Express.

## Features

- 🔐 **Authentication**: Supabase Auth with email/password signup/login
- 👥 **Role-based Access**: Admin and Customer roles with protected endpoints
- 🚲 **Bike Management**: CRUD operations for bikes with location tracking
- 📅 **Rental System**: Complete bike booking and return workflow
- 💰 **Revenue Tracking**: Admin analytics and reporting
- 🔒 **Security**: JWT authentication, rate limiting, input validation
- 📝 **Logging**: Request logging and error handling
- 🚀 **Production Ready**: Deployment configs for Vercel/Render/Netlify

## Quick Start

### Prerequisites

- Node.js 16+
- Supabase account and project

### Installation

1. Clone and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up database schema:

```bash
npm run migrate
```

5. Start development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Documentation

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Bike Management (Admin only)

- `GET /bikes` - Get all bikes
- `POST /bikes` - Add new bike
- `PUT /bikes/:id` - Update bike
- `DELETE /bikes/:id` - Delete bike

### Rental Workflow (Customer)

- `POST /rent` - Book a bike
- `POST /return` - Return a bike
- `GET /my-bookings` - Get user's bookings

### Admin Reports

- `GET /bookings` - All bookings (Admin)
- `GET /revenue` - Revenue analytics (Admin)

## Database Schema

### Users Profile (extends Supabase auth.users)

```sql
- id: uuid (primary key)
- role: text ("admin" or "customer")
- name: text
- created_at: timestamp
```

### Bikes

```sql
- id: serial (primary key)
- model: varchar
- price_per_hour: numeric
- is_available: boolean
- latitude: float
- longitude: float
- created_at: timestamp
```

### Bookings

```sql
- booking_id: serial (primary key)
- user_id: uuid (foreign key)
- bike_id: int (foreign key)
- start_time: timestamp
- end_time: timestamp
- total_cost: numeric
- created_at: timestamp
```

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic & Supabase interactions
├── utils/           # Utility functions
└── server.js        # Main application entry point

sql/                 # Database migration files
scripts/             # Utility scripts
```

## Deployment

### Vercel

```bash
vercel --prod
```

### Render

Push to GitHub and connect your repository to Render.

### Environment Variables

Make sure to set all required environment variables in your hosting platform.

## Development

```bash
npm run dev          # Start development server
npm test             # Run tests
npm run migrate      # Run database migrations
```

## Security Features

- JWT token verification
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- Environment variable protection

## License

MIT
