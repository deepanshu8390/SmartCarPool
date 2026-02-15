# Smart Airport Ride Pooling Backend

Backend system for grouping passengers into shared cabs with route optimization and dynamic pricing.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT, Helmet, CORS
- Nodemailer (welcome mail, OTP)
- Google OAuth
- Zod (validation)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create env file in the **backend** folder (name: `env`). Add:
   - MONGODB_URI
   - JWT_SECRET
   - SMTP_USER, SMTP_PASS (for email)
   - GOOGLE_CLIENT_ID (for Google login)

3. Start MongoDB (local or Atlas)

4. Run server

   ```
   npm start
   ```
   Or with auto-restart: `npm run dev`

## Base URL

`http://localhost:6313`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| POST | /signup | No | Request OTP for signup |
| POST | /login | No | Request OTP for login |
| POST | /verify-otp | No | Verify OTP (signup/login) |
| POST | /google | No | Google OAuth login |
| GET | /profile | Yes | Get user profile |
| PATCH | /profile | Yes | Update profile |
| GET | /trips | Yes | Past trips (paginated) |
| POST | /rides | Yes | Book ride |
| GET | /rides/:id | Yes | Get ride details |
| POST | /rides/:id/cancel | Yes | Cancel ride |
| GET | /trips/:id | Yes | Get trip details |

## Sample Requests

### Signup OTP
```json
POST /signup
{
  "name": "John",
  "email": "john@example.com",
  "phone": "9876543210"
}
```

### Login OTP
```json
POST /login
{
  "phone": "9876543210"
}
```

### Verify OTP
```json
POST /verify-otp
{
  "phone": "9876543210",
  "otp": "123456",
  "type": "signup"
}
```

### Google Login (login with Google account)
Frontend gets `idToken` from Google Sign-In, then send it here. No OTP needed.
```json
POST /google
{
  "idToken": "<paste idToken from Google Sign-In here>"
}
```
Response: `{ "success": true, "data": { "token": "...", "user": { ... } } }`. Use this `token` in Authorization header for other APIs.

### Book Ride
```json
POST /rides
Authorization: Bearer <token>
{
  "pickup_lat": 28.5562,
  "pickup_lng": 77.1000,
  "drop_lat": 28.5700,
  "drop_lng": 77.3200,
  "pickup_address": "Airport Terminal 1",
  "drop_address": "Sector 18, Noida",
  "passenger_count": 1,
  "luggage_count": 2,
  "max_detour_km": 5,
  "cab_type": "5-seater"
}
```

## Assumptions

- OTP sent via email (Nodemailer). Mobile OTP requires SMS gateway (Twilio).
- No password - OTP-only auth + Google login
- Trip expiry: 30 minutes for WAITING trips
- Cab types: 5-seater (4 passengers, 5 luggage), 7-seater (6 passengers, 7 luggage)

## Database indexing

Indexing is used in MongoDB for faster queries:

| Collection | Indexes | Purpose |
|------------|---------|---------|
| **users** | `email`, `phone` | Signup/login lookup, unique check |
| **otps** | `(phone, type)`, `expiresAt` (TTL) | Find OTP by phone+type, auto-delete expired |
| **rides** | `ride_id`, `trip_id`, `user_id`, `status` | Get ride by id, trips list, user's rides |
| **trips** | `trip_id`, `status`, `(status, createdAt)` | Match waiting trips, expiry check |

Full API list and request/response: see **API_DOCUMENTATION.md**. Sample test data and DB state: see **TEST_DATA.md**.

## Deploy on Render

1. New Web Service → connect your Git repo, root = `backend` (or set build command to run from backend).
2. Build: `npm install`. Start: `npm start`.
3. In Render **Environment** add all variables from `env.example` (use your real MONGODB_URI, JWT_SECRET, etc.). Do not commit your real `env` file.
4. After deploy, test: `GET https://your-app.onrender.com/health`.
