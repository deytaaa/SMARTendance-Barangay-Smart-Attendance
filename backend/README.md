# SMARTendance Backend API

Backend API for Barangay Smart Attendance System with IoT Integration

## Tech Stack

- Node.js + Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Bcrypt for password hashing

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Attendance
- `POST /api/attendance/check-in` - Record check-in (IoT device)
- `POST /api/attendance/check-out` - Record check-out (IoT device)
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/user/:userId` - Get user's attendance history
- `GET /api/attendance/report` - Generate attendance report

### Barangay
- `GET /api/barangays` - Get all barangays
- `POST /api/barangays` - Create barangay (admin only)
- `PUT /api/barangays/:id` - Update barangay
- `DELETE /api/barangays/:id` - Delete barangay

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers (business logic)
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validation schemas
│   └── server.js        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeder
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
└── package.json         # Dependencies
```

## Database Schema

- **Users** - User accounts (admin, staff, residents)
- **Attendance** - Attendance records with check-in/check-out
- **Barangays** - Barangay information
- **Departments** - Department/unit information
- **Devices** - IoT device registration

## Authentication

Uses JWT (JSON Web Tokens) for authentication. Include token in request headers:
```
Authorization: Bearer <token>
```

## User Roles

- `ADMIN` - Full access to all features
- `STAFF` - Can manage attendance and view reports
- `RESIDENT` - Can view own attendance only
