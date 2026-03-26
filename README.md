# SMARTendance - Barangay Smart Attendance System

A modern QR code-based attendance monitoring system designed for barangay offices.

## 🚀 Features

- **QR Code Attendance**: Lightweight QR scanner for employee check-in/check-out
- **Professional QR Card Manager**: Generate and manage QR cards for employees
- **User Management**: Admin, Staff, Official, and Volunteer roles
- **Real-time Monitoring**: Live attendance tracking and reporting  
- **Historical Tracking**: Date-based attendance filtering with MM-DD-YYYY format
- **Modern UI**: Responsive design with Tailwind CSS
- **Secure Authentication**: JWT-based authentication system

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart library
- **Lucide React** - Icon library

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (Supabase)
- **Prisma** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **QRCode** - QR code generation
- **Canvas** - Image processing

### QR Scanner Device
- **Second Laptop (Windows/Linux)** - Hardware platform
- **USB Webcam** - Camera module
- **Python 3.9+** - Programming language
- **OpenCV** - Computer vision
- **pyzbar** - QR code detection library

## 🎯 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (or Supabase account)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_database_url"
JWT_SECRET="your_jwt_secret"
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Seed the database:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Hardware Setup (QR Scanner)

1. Install Python 3.9+ on your laptop
2. Install dependencies: `pip install opencv-python pyzbar requests numpy`
3. Connect USB webcam
4. Run: `python attendance_qr.py`

## 👤 Default User Accounts

After seeding the database, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartendance.com | admin123 |
| Staff | staff@smartendance.com | admin123 |
| Official | official@smartendance.com | admin123 |
| Volunteer | volunteer@smartendance.com | admin123 |

## 📱 Application Pages

### 1. Login Page (`/login`)
- Email and password authentication
- Modern gradient design with Barangay Maharlika branding
- Remember me functionality
- Forgot password link

### 2. Register Page (`/register`)
- New employee registration form
- Fields: First Name, Middle Name, Last Name, Email, Contact Number, Password
- Password confirmation validation
- Two-column responsive layout

### 3. Dashboard (`/dashboard`)
- **Statistics Cards**:
  - Total Employees
  - Present Today
  - Absent Today
- **Charts**:
  - Absences by Day (Donut Chart)
  - Absences by Month (Donut Chart)
- **Sidebar Navigation**:
  - New Register Employee
  - Real-Time Face Capture
  - Dashboard
  - Take Attendance
  - User Management
  - Settings
  - Log Out

## 🎨 Design Features

- **Modern Gradient Backgrounds**: Blue-themed gradients throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Icon Integration**: Lucide React icons for consistent UI
- **Card-based Layout**: Clean, organized content sections
- **Collapsible Sidebar**: Space-saving navigation menu

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/face-encoding` - Update face encoding

### Attendance
- `POST /api/attendance/check-in` - Check in attendance
- `POST /api/attendance/check-out` - Check out attendance
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/user/:userId` - Get user attendance history
- `GET /api/attendance/report` - Get attendance report with filters

### Barangays
- `GET /api/barangays` - Get all barangays
- `GET /api/barangays/:id` - Get barangay by ID
- `POST /api/barangays` - Create barangay (Admin only)
- `PUT /api/barangays/:id` - Update barangay (Admin only)
- `DELETE /api/barangays/:id` - Delete barangay (Admin only)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department (Admin only)
- `PUT /api/departments/:id` - Update department (Admin only)
- `DELETE /api/departments/:id` - Delete department (Admin only)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Token expiration: 7 days
- Token storage: localStorage
- Protected routes: Automatic redirect to login if unauthorized
- Role-based access control

## 🌐 User Roles

1. **ADMIN** - Full system access
   - Manage all users
   - View all attendance records
   - Configure system settings

2. **STAFF** - Regular barangay staff
   - Mark own attendance
   - View own records

3. **OFFICIAL** - Barangay officials
   - Mark own attendance
   - View department attendance
   - Generate reports

4. **VOLUNTEER** - Barangay volunteers
   - Mark own attendance
   - View own records

## 📈 Future Enhancements

- [ ] Real-time face capture integration
- [ ] Advanced attendance analytics
- [ ] Email notifications for absences
- [ ] Mobile app version
- [ ] Biometric device integration
- [ ] Export reports to PDF/Excel
- [ ] Multi-barangay support
- [ ] Leave management system

## 🛠️ Development

### Project Structure

```
SMARTendance/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

## 📝 License

This is a capstone project for academic purposes.

## 👥 Contributors

- Your Name - Developer

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

**SMARTendance** - Making barangay attendance monitoring smarter, one face at a time! 🎯
