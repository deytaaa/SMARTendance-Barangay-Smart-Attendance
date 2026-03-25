# SMARTendance System – Setup Instructions

## 1. Requirements
- Node.js (v16 or higher)
- npm (comes with Node.js)
- PostgreSQL database (cloud or local, e.g., Supabase)
- (Optional) Git, if cloning from a repository

---

## 2. Download or Clone the Project
- **If sent as a ZIP:** Extract the folder.
- **If using Git:**
  ```
  git clone <repo-url>
  cd SMARTendance-Barangay-Smart-Attendance
  ```

---

## 3. Backend Setup

### a. Go to the backend folder:
```
cd backend
```

### b. Install dependencies:
```
npm install
```

### c. Configure environment variables:
- Copy `.env.example` to `.env` (if not already present).
- Edit `.env` and set your PostgreSQL `DATABASE_URL` and `DIRECT_URL`.
  - Example:
    ```
    DATABASE_URL="postgresql://username:password@host:port/database"
    DIRECT_URL="postgresql://username:password@host:port/database"
    ```
- Set `JWT_SECRET` to a secure random string.

### d. Set up the database:
- **Apply migrations:**
  ```
  npx prisma migrate deploy
  ```
  (Or, for development: `npx prisma migrate dev`)

- **(Optional) Seed the database:**
  ```
  node prisma/seed.js
  ```
  (Or, if using Prisma's built-in seeding: `npx prisma db seed`)

### e. Start the backend server:
```
npm start
```
or
```
node src/server.js
```
- The backend should run on the port specified in `.env` (default: 5000).

---

## 4. Frontend Setup

### a. Go to the frontend folder:
```
cd ../frontend
```

### b. Install dependencies:
```
npm install
```

### c. Configure environment variables (if needed):
- If there’s a `.env.example`, copy it to `.env` and set the backend API URL if different from default.

### d. Start the frontend server:
```
npm run dev
```
- The frontend should run on port 5173 by default.

---

## 5. Access the System
- Open your browser and go to:  
  `http://localhost:5173`
- Log in with the admin credentials (set in the seed script or database).

---

## 6. (Optional) Production Deployment
- For production, use `npm run build` in the frontend and deploy the backend with a process manager (e.g., PM2) or a cloud service.

---

## 7. Troubleshooting
- If you see errors, check:
  - Database connection details in `.env`
  - That all dependencies are installed
  - That migrations ran successfully

---

## 8. Camera Scanner (Python) Setup

### a. Install Python
- Download and install Python 3.8 or higher from [https://www.python.org/downloads/](https://www.python.org/downloads/).
- Make sure to check “Add Python to PATH” during installation.

### b. Install Required Python Packages
- Open a terminal or command prompt in the project root (where `attendance_qr.py` or `generate_qr_cards.py` is located).
- Install dependencies:
  ```
  pip install opencv-python pyzbar requests
  ```
- If you have a `requirements.txt` file, you can install all dependencies at once:
  ```
  pip install -r requirements.txt
  ```

### c. Configure the Scanner Script
- Edit `attendance_qr.py` (or your scanner script) to set the correct backend API URL if needed.

### d. Run the Camera Scanner
- To start the scanner, run:
  ```
  python attendance_qr.py
  ```
- The camera will open and scan QR codes for attendance.

### e. Troubleshooting
- Make sure your webcam is connected and accessible.
- If you get errors about missing packages, install them with `pip install <package-name>`.

---

**For questions or support, contact the developer.**
