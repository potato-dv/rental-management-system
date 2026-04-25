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

Backend API docs are available at:

```
http://localhost:8000/api-docs
```

---

## Branch Guide

| Branch                           | For                                                               |
| -------------------------------- | ----------------------------------------------------------------- |
| `main`                           | Final working code only — no direct push                          |
| `own-branch` ex. `yssa-frontend` | Each team member should create their own branch for feature work. |

**Guides:**

- Always pull from `main` before starting work
- Push only to your own branch
- Never push directly to `main`
- Create a Pull Request when your feature is done

**Daily workflow:**

```bash
# Step 1: Pull latest main before starting work
git switch main
git pull origin main

# Step 2: Switch to your own branch (create if it doesn't exist)
git checkout -b your-own-branch   # create if doesn't

# Step 3: Merge the main in your own branch
git merge main

# Step 4: Work on your code

# Step 5: After finishing work, stage and commit changes
git add .
git commit -m "ano meron"

# Step 6: Push your changes to your own branch
git push origin your-own-branch

```
