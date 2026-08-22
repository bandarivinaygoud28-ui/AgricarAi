# 🚜 AgriCare Resource Owner Portal

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Build-Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An intelligent, cloud-ready **Agricultural Equipment & Resource Rental Management System** built for modern rural entrepreneurs, tractor owners, custom hiring centers (CHCs), drone operators, and agricultural equipment providers. 

The **AgriCare Resource Owner Portal** empowers equipment owners to digitize their rental business, publish machinery listings with real-time GPS location tracking, manage farmer booking requests, track job executions, inspect transparent payouts (with automated 5% platform commission deductions), and build rural reputation through verified farmer ratings.

---

## 📌 Table of Contents

- [🌾 Project Overview](#-project-overview)
- [🛑 Problem Statement](#-problem-statement)
- [💡 Proposed Solution & Value Proposition](#-proposed-solution--value-proposition)
- [✨ Key Features](#-key-features)
  - [1. Owner Registration & Authentication](#1-owner-registration--authentication)
  - [2. Interactive Owner Dashboard](#2-interactive-owner-dashboard)
  - [3. Resource Management & Multi-Category Catalog](#3-resource-management--multi-category-catalog)
  - [4. High-Resolution Image Upload](#4-high-resolution-image-upload)
  - [5. GPS Location & Road Distance Engine](#5-gps-location--road-distance-engine)
  - [6. Farmer Booking Requests Stream](#6-farmer-booking-requests-stream)
  - [7. Accept / Reject Booking Lifecycle](#7-accept--reject-booking-lifecycle)
  - [8. Upcoming & Completed Job Tracker](#8-upcoming--completed-job-tracker)
  - [9. Transparent Earnings & 5% Platform Fee](#9-transparent-earnings--5-platform-fee)
  - [10. Verified Ratings & Farmer Reviews](#10-verified-ratings--farmer-reviews)
- [🏗️ System Architecture & Workflow](#️-system-architecture--workflow)
- [🗄️ Database Design (SQLite)](#️-database-design-sqlite)
- [📂 Project Folder Structure](#-project-folder-structure)
- [🚀 Local Setup & Installation Guide](#-local-setup--installation-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (Owner Portal)](#2-frontend-setup-owner-portal)
  - [3. Running Both Services Concurrently](#3-running-both-services-concurrently)
- [🔑 Default Demo Credentials & Seed Data](#-default-demo-credentials--seed-data)
- [🌐 REST API Documentation](#-rest-api-documentation)
- [🚢 Deployment Guide](#-deployment-guide)
  - [Backend Deployment (Render / Railway / VPS)](#backend-deployment-render--railway--vps)
  - [Frontend Deployment (Vercel / Netlify)](#frontend-deployment-vercel--netlify)
- [🎬 End-to-End Demo Walkthrough](#-end-to-end-demo-walkthrough)
- [🛡️ Security, Error Handling & Best Practices](#️-security-error-handling--best-practices)
- [👥 Contributing & Support](#-contributing--support)

---

## 🌾 Project Overview

Mechanization and access to modern agricultural resources (tractors, combine harvesters, drone sprayers, laser land levelers, cold storage, and specialized labor) are critical determinants of farm productivity. However, millions of smallholder farmers cannot afford heavy machinery, while local equipment owners suffer from idle machinery downtime, informal booking chaos, non-transparent middleman cuts, and delayed payments.

**AgriCare Resource Owner Portal** solves this two-sided marketplace problem by delivering a dedicated, modern management web application designed exclusively for **Resource Owners**. Owners gain full control over their equipment inventory, pricing tiers (per hour, per acre, per day), operational zones, incoming bookings, job milestones, and financial analytics.

---

## 🛑 Problem Statement

Agricultural custom hiring and equipment rental face severe structural hurdles:

1. **Machinery Under-utilization**: Expensive assets (tractors, harvesters, seed drills) sit idle outside peak harvest/sowing weeks due to lack of discovery.
2. **Manual & Unreliable Booking Channels**: Booking happens through fragmented phone calls, leading to double-bookings, scheduling clashes, and lost revenue.
3. **Absence of Location Intelligence**: Farmers book machinery far away without knowing travel distance, causing prohibitive transit fuel costs and unexpected delays.
4. **Middlemen Exploitation & Hidden Deductions**: Traditional brokers take hefty cuts (15%–30%) with zero pricing transparency.
5. **No Reputation System**: Quality equipment owners with punctual operators receive the same trust level as unreliable providers because there are no verified digital reviews.

---

## 💡 Proposed Solution & Value Proposition

AgriCare introduces a transparent, real-time digital infrastructure:

- **Direct Digital Connection**: Bridges resource owners directly with registered farmers through the unified AgriCare backend.
- **Fair & Predictable Pricing**: Standardized transparent pricing models (Hourly, Acre-based, Daily) with a flat **5% platform commission**—saving owners up to 20% compared to traditional brokers.
- **Location-Aware Smart Matching**: Uses GPS coordinates and real-world road distance algorithms (Haversine & OSRM) to connect owners with nearby farm plots.
- **End-to-End Booking Lifecycle**: Instant mobile notifications, Accept/Reject controls, live job tracking, and auto-generated financial invoices.

---

## ✨ Key Features

### 1. Owner Registration & Authentication
- **Secure Phone & Password Login**: Authentication tailored for rural owners using a 10-digit mobile number and hashed passwords (`bcrypt`).
- **Role-Based Access Control (RBAC)**: Enforces dedicated `resource_owner` credentials to protect owner endpoints from unauthorized access.
- **Owner Profile Onboarding**: Collects Business/Owner Name, Village/Mandal, District, State, Pincode, Primary Machinery Type, and GPS coordinates.
- **JWT Session Persistence**: Token-based authentication with automatic renewal and session storage.

### 2. Interactive Owner Dashboard
- **Live Metric Cards**:
  - Total Listed Resources
  - Currently Available Assets
  - Pending Farmer Requests
  - Confirmed Active Bookings
  - Completed Jobs
  - Today's, Weekly, and Monthly Gross & Net Revenue
- **Quick Action Bar**: One-click toggles for resource availability, instant new equipment listing, and shortcut to pending booking requests.
- **Recent Activity Feed**: Real-time event log of incoming farmer requests, job completions, and rating updates.

### 3. Resource Management & Multi-Category Catalog
- **Comprehensive Agricultural Categories**:
  - 🚜 **Tractors & Heavy Machinery** (Mahindra, John Deere, Swaraj, Sonalika)
  - 🌾 **Harvesters & Threshers** (Paddy, Maize, Multi-crop Combines)
  - 🛸 **Agricultural Drones** (10L/16L Spraying Drones with certified DGCA pilots)
  - 🛠️ **Implements & Tools** (Rotavators, Disc Ploughs, Seed Drills, Laser Levelers, Cultivators)
  - 💧 **Irrigation & Pumping Systems** (Solar Submersible Pumps, Drip Sets, Diesel Engines)
  - ❄️ **Storage & Logistics** (Cold Storage space, Mini-truck transport, Trolleys)
  - 👨‍🌾 **Skilled Farm Labor** (Transplanting teams, Pruning experts, Harvest crews)
- **Flexible Pricing Units**: Set customized rates `per hour`, `per acre`, and `per day` with minimum booking thresholds.
- **Real-time Status Toggle**: Toggle status between `Available`, `Booked`, and `Under Maintenance` in one click.

### 4. High-Resolution Image Upload
- **Multipart Form Upload**: Directly upload real photos of machinery, implements, or farm equipment.
- **Automatic File Validation**: Restricts uploads to valid images (PNG, JPEG, WEBP) with a 5 MB file size limit.
- **Static & CDN Support**: Local static file storage (`/uploads/`) with seamless fallback to high-quality unsplash/CDN presets for offline demo readiness.

### 5. GPS Location & Road Distance Engine
- **Live GPS Auto-Detection**: One-tap browser geolocation to capture latitude and longitude.
- **Integrated Address Geocoding**: Automatically resolves village, district, state, and pincode.
- **Intelligent Distance Engine**: Computes exact road distances (via OSRM) and Haversine straight-line approximations to calculate travel time and transit feasibility for farmers.
- **Google Maps Integration**: Instant navigation link to farmer's field location.

### 6. Farmer Booking Requests Stream
- **Rich Request Details**: View farmer name, contact phone, requested resource, service date, duration/acreage, and full field address.
- **Dynamic Cost Estimator**: Displays calculated total booking cost, 5% platform fee deduction, and net owner payout prior to acceptance.
- **Urgent Request Badges**: Highlights same-day or time-sensitive sowing/harvesting requests.

### 7. Accept / Reject Booking Lifecycle
- **One-Click Acceptance**: Confirms booking, shifts machinery status to `Booked`, and adds the job to the owner's active dispatch schedule.
- **Polite Rejection with Reason**: Owners can decline requests with predefined reasons (*"Schedule Conflict"*, *"Equipment in Maintenance"*, *"Distance Too Far"*, or custom reason).
- **Conflict Guard**: Automatically warns or prevents overlapping time slots for the same machinery.

### 8. Upcoming & Completed Job Tracker
- **Scheduled Jobs Queue**: Chronologically sorted list of all accepted bookings with countdown to scheduled start time.
- **Job Status Workflow**: `Pending` ➔ `Confirmed` ➔ `In-Progress` ➔ `Completed` / `Cancelled`.
- **Mark Job as Completed**: One-click action upon finishing field operations that triggers invoice generation and releases earnings.

### 9. Transparent Earnings & 5% Platform Fee
- **Automated Fee Calculation**:
  $$\text{Net Owner Earnings} = \text{Gross Booking Amount} - (5\% \times \text{Gross Booking Amount})$$
- **Clear Financial Summaries**:
  - Gross Revenue
  - 5% AgriCare Platform Support & Insurance Fee
  - Net Take-Home Payout
- **Comprehensive Ledger**: Full transaction history with Date, Booking ID, Farmer Name, Resource Title, Gross Amount, Commission, and Net Paid.

### 10. Verified Ratings & Farmer Reviews
- **5-Star Rating Breakdown**: Visual distribution of 5-star, 4-star, 3-star, 2-star, and 1-star reviews.
- **Average Performance Score**: Dynamic weighted average score reflecting machine reliability and operator punctuality.
- **Farmer Feedback Timeline**: Authentic feedback comments, reviewer details, and dates.

---

## 🏗️ System Architecture & Workflow

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESOURCE OWNER CLIENT                           │
│              React 18 + TypeScript + Vite + Tailwind CSS               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP / REST API (JSON)
                         + JWT Authorization
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FASTAPI BACKEND SERVER                         │
│                    (Python 3.10+ / Uvicorn Engine)                     │
│                                                                        │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────┐ │
│  │ Owner Auth & Profile  │ │ Resource & Inventory │ │ Booking Engine │ │
│  │ (JWT + bcrypt Hash)   │ │ (CRUD & Availability)│ │ (Accept/Reject)│ │
│  └───────────────────────┘ └──────────────────────┘ └────────────────┘ │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────┐ │
│  │ Earnings & Commission │ │ Ratings & Reviews    │ │ GPS & Distance │ │
│  │ (5% Flat Fee Split)   │ │ (Aggregator Service) │ │ (OSRM/Haversine)│ │
│  └───────────────────────┘ └──────────────────────┘ └────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                              SQLAlchemy ORM
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       PERSISTENCE LAYER (SQLite)                       │
│                             `agricare.db`                              │
│                                                                        │
│   • users (role = resource_owner / farmer)                             │
│   • resources (machinery, pricing, GPS coords, status)                 │
│   • bookings (farmer, resource, dates, status, payout)                 │
│   • resource_ratings (star rating, comments, timestamp)                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design (SQLite)

The local demo database `agricare.db` uses SQLite managed through SQLAlchemy ORM.

### Key Entities & Relations

1. **`users` Table**:
   - `id` (INTEGER, Primary Key)
   - `phone` (VARCHAR(15), Unique, Indexed)
   - `full_name` (VARCHAR(100))
   - `password_hash` (VARCHAR(255))
   - `role` (`resource_owner` or `farmer`)
   - `village`, `district`, `state`, `pincode`
   - `latitude`, `longitude`
   - `created_at` (DATETIME)

2. **`resources` Table**:
   - `id` (INTEGER, Primary Key)
   - `owner_id` (INTEGER, Foreign Key ➔ `users.id`)
   - `title` (VARCHAR(150))
   - `category` (Tractors, Harvesters, Drones, Implements, Irrigation, Storage, Labor)
   - `resource_type` (VARCHAR(50))
   - `provider_name` (VARCHAR(100))
   - `contact_phone` (VARCHAR(15))
   - `location` (VARCHAR(255))
   - `latitude`, `longitude` (FLOAT)
   - `price` (FLOAT, default base price)
   - `price_unit` (`hour`, `acre`, `day`)
   - `price_per_hour`, `price_per_acre`, `price_per_day` (FLOAT)
   - `availability` (`Available`, `Booked`, `Under Maintenance`)
   - `rating` (FLOAT)
   - `description` (TEXT)
   - `image_url` (VARCHAR(500))
   - `specs`, `terms` (TEXT)

3. **`bookings` Table**:
   - `id` (INTEGER, Primary Key)
   - `resource_id` (INTEGER, Foreign Key ➔ `resources.id`)
   - `farmer_id` (INTEGER, Foreign Key ➔ `users.id`)
   - `farmer_name` (VARCHAR(100))
   - `farmer_phone` (VARCHAR(15))
   - `farm_location` (VARCHAR(255))
   - `booking_date` (VARCHAR(50))
   - `duration` (VARCHAR(50))
   - `total_price` (FLOAT)
   - `platform_fee` (FLOAT, 5% of total price)
   - `owner_payout` (FLOAT, 95% of total price)
   - `status` (`pending`, `confirmed`, `completed`, `rejected`, `cancelled`)
   - `reject_reason` (TEXT, optional)
   - `created_at` (DATETIME)

4. **`resource_ratings` Table**:
   - `id` (INTEGER, Primary Key)
   - `resource_id` (INTEGER, Foreign Key ➔ `resources.id`)
   - `farmer_id` (INTEGER, Foreign Key ➔ `users.id`)
   - `rating` (INTEGER, 1 to 5)
   - `review` (TEXT)
   - `created_at` (DATETIME)

---

## 📂 Project Folder Structure

```text
hacaton/
├── README.md                      # Complete Project Documentation (This File)
├── agricare.db                    # Root SQLite Database (Local Seed & Development)
├── backend/                       # FastAPI Backend Application
│   ├── main.py                    # Server Entrypoint, CORS & Route Registrations
│   ├── requirements.txt           # Python Dependencies
│   ├── .env.example               # Backend Environment Configuration Template
│   ├── agricare.db                # Backend SQLite Database Instance
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py          # SQLAlchemy Session & Engine Configuration
│   │   └── models.py              # User, Resource, Booking, Rating Data Models
│   ├── resources/
│   │   ├── __init__.py
│   │   └── resource_service.py    # Owner APIs, Seed Data, Bookings, Earnings & Reviews
│   ├── location/
│   │   ├── __init__.py
│   │   └── location_service.py    # Geocoding, GPS Coordinates, Mandi Distance
│   ├── market/
│   │   ├── mandi_db.py            # Mandi Database & Haversine Distance
│   │   └── routing_service.py     # OSRM Road Distance Calculation Engine
│   └── uploads/                   # Local Static Storage for Uploaded Resource Photos
│
├── owner-portal/                  # Resource Owner Frontend (Dedicated App)
│   ├── index.html                 # HTML Entrypoint
│   ├── package.json               # Frontend Dependencies & Scripts
│   ├── tsconfig.json              # TypeScript Configuration
│   ├── vite.config.ts             # Vite 5 Build Configuration
│   ├── tailwind.config.js         # Tailwind CSS Styling Rules
│   ├── .env.example               # Environment Variables Template
│   └── src/
│       ├── main.tsx               # React DOM Entrypoint
│       ├── App.tsx                # Routing, Layout Shell & Navigation
│       ├── index.css              # Global Design Tokens & Utilities
│       ├── types/
│       │   └── index.ts           # Owner, Resource, Booking, Earnings TS Interfaces
│       ├── services/
│       │   └── api.ts             # Typed API Client for Owner Endpoints
│       ├── components/
│       │   ├── Navbar.tsx         # Header Navigation & User Profile Status
│       │   ├── Sidebar.tsx        # Collapsible Navigation Drawer
│       │   └── StatCard.tsx       # Reusable KPI Analytics Cards
│       └── pages/
│           ├── LoginPage.tsx      # Owner Secure Login
│           ├── RegisterPage.tsx   # New Owner Registration & Equipment Onboarding
│           ├── DashboardPage.tsx  # KPI Metrics, Earnings Overview & Live Stream
│           ├── MyResourcesPage.tsx# Equipment Inventory with Quick Status Toggles
│           ├── AddResourcePage.tsx# Add & Edit Equipment Form with Image/GPS
│           ├── BookingsPage.tsx   # Farmer Request Approval/Rejection Stream
│           ├── JobsPage.tsx       # Upcoming Scheduled & Completed Jobs Tracker
│           ├── EarningsPage.tsx   # Payout Breakdown & 5% Platform Fee Ledger
│           ├── RatingsPage.tsx    # 5-Star Reviews & Farmer Feedback
│           ├── ProfilePage.tsx    # Owner Profile, Contact & Workshop Location
│           └── SettingsPage.tsx   # Notification & Regional Preferences
│
└── frontend/                      # Farmer-Facing Portal (Complementary App)
    ├── package.json
    ├── src/
    └── vite.config.ts
```

---

## 🚀 Local Setup & Installation Guide

### Prerequisites
Make sure you have installed on your workstation:
- **Python**: Version `3.10` or higher ([python.org](https://www.python.org/))
- **Node.js**: Version `18.x` or `20.x` LTS ([nodejs.org](https://nodejs.org/))
- **Git**: For source control

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install all required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local environment file:
   ```bash
   copy .env.example .env      # Windows
   # or
   cp .env.example .env        # Linux/macOS
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   > **Backend Running**: [http://127.0.0.1:8000](http://127.0.0.1:8000)  
   > **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup (Owner Portal)

1. Open a new terminal window and navigate to `owner-portal`:
   ```bash
   cd owner-portal
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Create the frontend environment configuration:
   Create a `.env` file inside `owner-portal/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

   > **Resource Owner Portal Live**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174`)

---

### 3. Running Both Services Concurrently

| Component | Technology | Default Local URL | Purpose |
|---|---|---|---|
| **Backend API** | FastAPI + SQLite | `http://127.0.0.1:8000` | Core API, Auth, Database & Routing |
| **API Documentation** | Swagger UI | `http://127.0.0.1:8000/docs` | Live API Explorer & Testing |
| **Owner Portal** | React + TypeScript + Vite | `http://localhost:5173` | Resource Owner Web Application |

---

## 🔑 Default Demo Credentials & Seed Data

The platform comes pre-seeded with verified agricultural resources and realistic demo accounts ready for evaluation:

### Pre-configured Owner Demo Account
- **Mobile Number**: `9876543210`
- **Password**: `admin123` (or any 6+ char password in demo mode)
- **Role**: `resource_owner`
- **Owner Name**: Ramesh Kumar (Kummarguda Custom Hiring Center)

### Pre-loaded Agricultural Resources
1. **Mahindra 575 DI (45 HP) Tractor** — ₹800/hr | ₹950/acre | ₹6,500/day
2. **John Deere 5050 D (50 HP) Tractor** — ₹900/hr | ₹1,100/acre | ₹7,200/day
3. **Preet 987 Self-Propelled Combine Harvester** — ₹2,200/hr | ₹2,400/acre
4. **Garuda Kisan 16L Drone Sprayer (DGCA Pilot)** — ₹450/acre | ₹3,500/day
5. **Shaktiman 42-Blade Rotary Tiller** — ₹500/hr | ₹600/acre
6. **Solar Agri Cold Storage Unit (5 MT)** — ₹1,200/day | ₹7,000/week

---

## 🌐 REST API Documentation

All owner-related endpoints are prefixed under `/api/owner/`:

### Authentication & Profile
- `POST /api/owner/register` — Register a new equipment owner profile.
- `POST /api/owner/login` — Authenticate owner via mobile & password, returns JWT token.
- `GET /api/owner/profile` — Fetch authenticated owner details and workshop address.
- `PUT /api/owner/profile` — Update owner profile, contact info, or GPS coordinates.

### Dashboard & Analytics
- `GET /api/owner/stats` — Retrieve aggregated dashboard stats (resources, bookings, earnings, 5% fee totals).

### Resource Management
- `GET /api/owner/resources` — List all resources owned by the current user.
- `POST /api/owner/resources` — Create and publish a new agricultural resource listing.
- `PUT /api/owner/resources/{id}` — Edit details, specs, or rates for an existing resource.
- `PATCH /api/owner/resources/{id}/availability` — Fast toggle (`Available` / `Booked` / `Under Maintenance`).
- `DELETE /api/owner/resources/{id}` — Remove a resource from the catalog.
- `POST /api/owner/upload-image` — Upload machinery photo (Multipart file).

### Booking Requests & Job Lifecycle
- `GET /api/owner/bookings?status={all|pending|confirmed|completed}` — Retrieve booking stream.
- `POST /api/owner/bookings/{id}/accept` — Accept farmer request and confirm job slot.
- `POST /api/owner/bookings/{id}/reject?reason={reason}` — Decline request with optional explanation.
- `POST /api/owner/bookings/{id}/complete` — Mark in-progress job as completed and credit earnings.

### Earnings & Reviews
- `GET /api/owner/earnings` — Summary of gross earnings, 5% platform deductions, net take-home, and transaction history.
- `GET /api/owner/ratings` — Aggregated 5-star rating metrics, average score, and reviews from farmers.

---

## 🚢 Deployment Guide

### Backend Deployment (Render / Railway / VPS)

#### Option 1: Deploy on Render
1. Create a new **Web Service** on [Render.com](https://render.com/).
2. Connect your Git repository.
3. Configure the build parameters:
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `PYTHON_VERSION`: `3.10.12`
   - `JWT_SECRET_KEY`: `<your-random-secure-secret>`
   - `CORS_ORIGINS`: `*` (or your production frontend URL)

#### Option 2: Deploy using Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Frontend Deployment (Vercel / Netlify)

#### Deploy on Vercel
1. Install Vercel CLI or import repository on [Vercel Dashboard](https://vercel.com).
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `owner-portal`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com`
4. Deploy!

---

## 🎬 End-to-End Demo Flow

Follow this 5-minute walkthrough script to demonstrate the full capabilities of the AgriCare Resource Owner Portal:

```text
[Step 1: Login]
  ➔ Open the portal at http://localhost:5173
  ➔ Enter Phone: 9876543210 and Password: admin123
  ➔ Land on the Owner Command Dashboard.

[Step 2: Review Live Dashboard Analytics]
  ➔ Inspect KPIs: Total Resources, Available Units, Pending Bookings, Gross Revenue.
  ➔ Observe the 5% Platform Fee counter and Net Take-Home metric.

[Step 3: Add a New Agricultural Resource]
  ➔ Click "+ Add Resource" in the navigation bar.
  ➔ Select Category: "Agricultural Drones" | Title: "Garuda Kisan 16L Spraying Drone".
  ➔ Set Price: ₹450 / acre | ₹3,500 / day.
  ➔ Tap "Detect My Location" to automatically capture GPS coordinates.
  ➔ Upload or select an equipment photo.
  ➔ Click "Publish Resource" — Instant appearance in "My Resources".

[Step 4: Manage Incoming Booking Requests]
  ➔ Navigate to "Booking Requests" page.
  ➔ See pending request from farmer "Venkat Reddy" for 10 acres of pesticide spraying.
  ➔ Observe estimated gross amount: ₹4,500 | 5% Platform Fee: ₹225 | Net Payout: ₹4,275.
  ➔ Click "Accept Booking" — Resource automatically updates to "Booked".

[Step 5: Track Scheduled & In-Progress Jobs]
  ➔ Go to "Jobs & Schedule" page.
  ➔ View the newly confirmed job under "Upcoming Jobs".
  ➔ Click "Complete Job" once field operation is marked done.

[Step 6: Verify Earnings & Invoicing]
  ➔ Open "Earnings & Payouts" page.
  ➔ Review updated gross earnings, the exact 5% platform commission breakdown, and transaction ledger.

[Step 7: Check Farmer Ratings & Reviews]
  ➔ Open "Ratings & Reviews" page.
  ➔ View the 5-star rating breakdown and comments left by satisfied farmers.
```

---

## 🛡️ Security, Error Handling & Best Practices

- **Password Hashing**: Uses industry-standard `bcrypt` password hashing algorithms.
- **JWT Authorization**: Stateless JSON Web Tokens validated on every protected API endpoint.
- **Fail-Safe Offline Mode**: Gracefully handles backend disconnections with informative UI prompts and cached session recovery.
- **File Upload Safeguards**: MIME-type verification and maximum payload caps to prevent denial-of-service or malicious file injections.
- **SQL Injection Defense**: All database queries are parameterized and abstracted through SQLAlchemy ORM.

---

## 👥 Contributing & Support

We welcome contributions to expand AgriCare's agricultural mechanization ecosystem!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/SmartIoTTracking`)
3. Commit your changes (`git commit -m 'Add IoT telemetry for tractor run hours'`)
4. Push to the branch (`git push origin feature/SmartIoTTracking`)
5. Open a Pull Request

---

<p align="center">
  <b>AgriCare Resource Owner Portal</b> • Empowering Rural Mechanization & Equipment Owners 🌱🚜
</p>
