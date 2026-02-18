# Admin Account Setup Guide

## Why No Public Signup Page?

For security reasons, SMARTendance does **not** have a public signup page. This is intentional for a government barangay system where:
- Only authorized barangay officials should have admin access
- Prevents unauthorized users from creating admin accounts
- Follows security best practices for government systems

## How Admins Are Created

### First Admin (Initial Setup)

The first admin account must be created directly in the database during system deployment. This is a one-time setup process.

#### Option 1: Using Database Client (Recommended)

If you have access to your database client (like Supabase dashboard or pgAdmin):

```sql
INSERT INTO "User" (
  "employeeId",
  "firstName",
  "lastName",
  "email",
  "password",
  "role",
  "department",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'ADMIN001',
  'Admin',
  'User',
  'admin@smartendance.com',
  '$2b$10$YourHashedPasswordHere',
  'ADMIN',
  'Administration',
  true,
  NOW(),
  NOW()
);
```

**Note:** The password above is hashed. Use the seeding script below for easier setup.

#### Option 2: Using Seed Script (Easier)

We've provided a seeding script that automatically creates the first admin with a secure hashed password.

**Run this command in the backend folder:**

```bash
node seed-admin.js
```

This creates:
- **Email:** admin@smartendance.com
- **Password:** admin123
- **Employee ID:** ADMIN001

⚠️ **IMPORTANT:** Change this password immediately after first login!

### Subsequent Admins (After First Admin)

Once the first admin is created, they can log in to the web dashboard and create additional admin accounts through the **Register** page:

1. Log in with the first admin account
2. Go to **Register** page in the sidebar
3. Fill in the employee details
4. Select **Role: Admin**
5. Click "Register Employee"

The system will auto-generate a temporary password: `Welcome123`

The new admin should change this password on their first login.

## Security Features

✅ **No public registration** - Prevents unauthorized access
✅ **Admin-only registration page** - Only existing admins can create new accounts
✅ **Protected routes** - All pages require authentication
✅ **Password hashing** - Passwords stored securely with bcrypt
✅ **JWT tokens** - Secure session management

## Initial Deployment Checklist

- [ ] Deploy backend server
- [ ] Configure database connection
- [ ] Run database migrations (`npx prisma migrate deploy`)
- [ ] Run admin seed script (`node seed-admin.js`)
- [ ] Test login with default admin credentials
- [ ] Change default admin password
- [ ] Document admin credentials securely
- [ ] Create additional admin accounts as needed
- [ ] Remove or secure the seed script file

## Responding to "Where's the Signup Page?"

If someone asks why there's no signup page, explain:

> "This is a barangay government system, not a public website. For security, we don't allow anyone to create admin accounts freely. The first admin is created during system setup by technical staff, and then that admin can create other authorized accounts through the web dashboard. This prevents unauthorized access to sensitive attendance data."

## Questions?

- **Q: What if we forget all admin passwords?**
  - A: You'll need database access to reset a password or create a new admin account.

- **Q: Can we add more admins later?**
  - A: Yes! Any existing admin can create new admin accounts through the Register page.

- **Q: What about regular employees?**
  - A: Employees don't have login credentials. They use face recognition on the Raspberry Pi device at the entrance.

- **Q: Can admins create staff accounts?**
  - A: Yes, admins can create STAFF role accounts through the Register page if you need users with limited permissions.
