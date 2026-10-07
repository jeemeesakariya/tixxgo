# Tixxgo — Travel Platform

A full-stack travel booking platform built with Angular 17, Node.js/Express, and MySQL.

## Architecture

```
tixxgo/
├── backend/          # Node.js + Express REST API
├── frontend/         # Angular 17 SPA
└── docker-compose.yml
```

```
Browser (Angular SPA :4200)
        │
        ▼
nginx (proxy /api → backend:3000)
        │
        ▼
Express API (:3000)
        │
  ┌─────┴──────┐
  │            │
Supplier    MySQL DB
Gateway     (:3306)
  │
  ├── TBO Adapter (mock)
  └── [Future: TripJack Adapter]
```

## Prerequisites

- Docker Desktop (recommended)
- OR: Node.js 20+, MySQL 8, Angular CLI 17

## Quick Start (Docker — Recommended)

```bash
git clone https://github.com/jeemeesakariya/tixxgo
cd tixxgo

# Copy env file
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- MySQL: localhost:3306

### Testing with Postman
A Postman collection is included for testing the backend API directly:
- **File**: `01/tixxgo_postman_collection.json`
- Import into Postman and execute the requests in order.

### Available Mock Routes
The search API uses strict static filtering to simulate a real inventory. You must search for one of these exact origin/destination pairs to find flights:
- **AMD** to **DEL**
- **DEL** to **BOM**
- **BOM** to **GOI**

*(Searching for any other route will correctly return 0 flights.)*

## Local Development (Without Docker)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_HOST=localhost, DB_USER/DB_PASSWORD to your local MySQL
mysql -u root -p -e "CREATE DATABASE tixxgo; CREATE USER 'tixxgo'@'localhost' IDENTIFIED BY 'tixxgo_pass'; GRANT ALL ON tixxgo.* TO 'tixxgo'@'localhost';"
mysql -u tixxgo -ptixxgo_pass tixxgo < db/schema.sql
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
# Visit http://localhost:4200
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/flights/search` | Search flights |
| POST | `/api/flights/revalidate` | Revalidate fare before booking |
| POST | `/api/bookings/initiate` | Initiate a booking with traveller details |
| POST | `/api/bookings/:id/confirm` | Confirm payment + supplier booking |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings/:id/cancel/preview` | Get cancellation charges preview |
| POST | `/api/bookings/:id/cancel` | Execute cancellation |

## Payment Mode (Mock)

Set `PAYMENT_MODE` in `backend/.env`:

| Value | Behaviour |
|-------|-----------|
| `SUCCESS` | Payment always succeeds (default) |
| `FAIL` | Payment always fails |
| `TIMEOUT` | Supplier booking times out → UNKNOWN state |

## Booking State Flow

```
INITIATED
    │
    ▼
PAYMENT_PENDING ──→ PAYMENT_FAILED
    │
    ▼
PAYMENT_SUCCESS
    │
    ▼
SUPPLIER_BOOKING ──→ UNKNOWN (timeout) ──→ reconciliation job
    │                                           │
    ├──→ BOOKING_CONFIRMED ←───────────────────┘
    │
    └──→ BOOKING_FAILED → REFUND_PENDING → REFUNDED
```

## Cancellation Flow

```
BOOKING_CONFIRMED
    │
    ▼
CANCELLATION_REQUESTED
    │
    ▼
CANCELLED → REFUND_PENDING → REFUNDED
```