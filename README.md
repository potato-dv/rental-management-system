# Rental Property Management System

A web-based system for landlords to manage rental properties and for tenants to apply and track their rentals.

---

## Installation

**1. Clone the repo**
```bash
git clone https://github.com/YOURUSERNAME/rental-management-system.git
cd rental-management-system
```

**2. Install Backend packages**
```bash
cd server
npm install
```

**3. Install Frontend packages**
```bash
cd ../client
npm install
```

**4. Create .env file inside server/ folder**
```
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1d
```
> Ask the backend team for the MONGO_URI and JWT_SECRET values.

---

## Running the Project

Open 2 terminals at the same time:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd client
npm start
```

Then open your browser at:
```
http://localhost:3000  

It can change depending on the computer, configuration, or if the port is already in use.
```

---

## Branch Guide

| Branch | For |
|--------|-----|
| `main` | Final working code only — no direct push |
| `backend` | All backend code inside server/ folder |
| `frontend` | All frontend code inside client/ folder |

**Guides:**
- Always pull from `main` before starting work
- Push only to your assigned branch
- Never push directly to `main`
- Create a Pull Request when your feature is done

**Daily workflow:**
```bash
# Before starting
git pull origin main

# After finishing
git add .
git commit -m "ano meron"
git push origin your-branch-name (ex. git push origin frontend)
```

