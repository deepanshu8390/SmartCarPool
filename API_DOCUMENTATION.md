# API Documentation – Smart Airport Ride Pooling

Base URL: `http://localhost:6313`  
**Total APIs used: 12**

---

## 1. Health check

| Item | Value |
|------|--------|
| **Method** | GET |
| **Endpoint** | `/health` |
| **Auth** | No |

**Response (200):**
```json
{
  "success": true,
  "status": "OK",
  "db": "connected",
  "uptime": 123.45
}
```

**Pseudo flow:** Client calls GET /health → Server returns OK + DB status.

---

## 2. Signup (send OTP)

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/signup` |
| **Auth** | No |

**Request body:**
```json
{
  "name": "deepanshu",
  "email": "deepanshu3640@gmail.com",
  "phone": "9773533407"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your email"
  }
}
```

**Pseudo flow:**  
User sends name, email, phone → Backend checks email/phone not already used → Generates 6-digit OTP → Saves hashed OTP in `otps` with type "signup" → Sends OTP to email → Returns success message.

---

## 3. Login (send OTP)

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/login` |
| **Auth** | No |

**Request body:**
```json
{
  "phone": "9773533407"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your email"
  }
}
```

**Pseudo flow:**  
User sends phone → Backend finds user by phone → Generates OTP → Saves in `otps` with type "login" → Sends OTP to user's email → Returns success.

---

## 4. Verify OTP (get token)

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/verify-otp` |
| **Auth** | No |

**Request body:**
```json
{
  "phone": "9773533407",
  "otp": "123456",
  "type": "signup"
}
```
`type` = `"signup"` or `"login"`

**Response – signup (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6991b1c520e0e6a0fa97a207",
      "name": "deepanshu",
      "email": "deepanshu3640@gmail.com",
      "phone": "9773533407"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "message": "You are now part of our journey"
  }
}
```

**Response – login (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "phone": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Pseudo flow:**  
User sends phone, otp, type → Backend finds latest OTP for that phone+type → Checks not expired and hash matches → If signup: creates user in `users`, sends welcome email; if login: updates lastLoginAt → Deletes OTP → Returns JWT token + user. Use `token` in `Authorization: Bearer <token>` for protected APIs.

---

## 5. Google login

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/google` |
| **Auth** | No |

**Request body:**
```json
{
  "idToken": "<idToken from Google Sign-In>"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "phone": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "message": "You are now part of our journey"
  }
}
```
(Message only for new user.)

**Pseudo flow:**  
Frontend sends Google idToken → Backend verifies with Google → Gets email, name, googleId → Finds or creates user in `users` → Returns JWT token + user.

---

## 6. Get profile

| Item | Value |
|------|--------|
| **Method** | GET |
| **Endpoint** | `/profile` |
| **Auth** | Yes (Bearer token) |

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "deepanshu",
    "email": "deepanshu3640@gmail.com",
    "phone": "9773533407",
    "role": "passenger",
    "lastLoginAt": "2026-02-15T11:48:34.911Z",
    "createdAt": "2026-02-15T11:45:09.855Z"
  }
}
```

**Pseudo flow:**  
Client sends token → Backend verifies JWT, loads user from `users` → Returns profile (no password).

---

## 7. Update profile

| Item | Value |
|------|--------|
| **Method** | PATCH |
| **Endpoint** | `/profile` |
| **Auth** | Yes |

**Request body (all optional):**
```json
{
  "name": "deepanshu",
  "email": "new@example.com",
  "phone": "9773533408"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "deepanshu",
    "email": "new@example.com",
    "phone": "9773533408",
    "role": "passenger"
  }
}
```

**Pseudo flow:**  
Client sends token + fields to update → Backend updates `users` document → Returns updated profile.

---

## 8. Past trips (paginated)

| Item | Value |
|------|--------|
| **Method** | GET |
| **Endpoint** | `/trips?page=1&limit=10` |
| **Auth** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "ride_id": "b48ed57c-1d94-4729-985f-ff3c83c8c096",
        "trip_id": "32b798e6-0f32-4334-a3e5-d32ef0266b33",
        "user_id": "...",
        "pickup": { "lat": 28.5562, "lng": 77.1, "address": "..." },
        "drop": { "lat": 28.57, "lng": 77.32, "address": "..." },
        "passenger_count": 2,
        "luggage_count": 2,
        "status": "MATCHED",
        "fare": 250,
        "createdAt": "..."
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

**Pseudo flow:**  
Client sends token → Backend finds all `rides` for that user_id, sorted by createdAt desc → Paginates (skip/limit) → Returns list + page, limit, total.

---

## 9. Book ride

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/rides` |
| **Auth** | Yes |

**Request body:**
```json
{
  "pickup_lat": 28.5562,
  "pickup_lng": 77.1,
  "drop_lat": 28.57,
  "drop_lng": 77.32,
  "pickup_address": "Airport Terminal 1",
  "drop_address": "Sector 18, Noida",
  "passenger_count": 1,
  "luggage_count": 2,
  "max_detour_km": 5,
  "cab_type": "5-seater"
}
```

**Response – WAITING (201):** (no matching trip yet)
```json
{
  "success": true,
  "data": {
    "ride_id": "9ac4c4d7-260b-4662-a06f-e0a4ce072596",
    "trip_id": "32b798e6-0f32-4334-a3e5-d32ef0266b33",
    "status": "WAITING",
    "message": "Waiting for more passengers"
  }
}
```

**Response – MATCHED (201):** (matched with existing trip)
```json
{
  "success": true,
  "data": {
    "ride_id": "b48ed57c-1d94-4729-985f-ff3c83c8c096",
    "trip_id": "32b798e6-0f32-4334-a3e5-d32ef0266b33",
    "status": "MATCHED",
    "fare": 250,
    "message": "Matched with other passengers"
  }
}
```

**Pseudo flow:**  
Client sends token + ride body → Backend expires old WAITING trips → Checks user has no other pending ride → Tries to find matching WAITING trip (same cab_type, capacity) → If none: creates new trip + ride with status WAITING; if found: adds ride to trip, sets trip status MATCHED, calculates fare, sets ride status MATCHED and fare → Saves in `rides` and `trips` → Returns ride_id, trip_id, status, and message (and fare if MATCHED).

---

## 10. Get ride details

| Item | Value |
|------|--------|
| **Method** | GET |
| **Endpoint** | `/rides/:id` |
| **Auth** | Yes |

**Example:** GET `/rides/b48ed57c-1d94-4729-985f-ff3c83c8c096`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "ride_id": "b48ed57c-1d94-4729-985f-ff3c83c8c096",
    "trip_id": "32b798e6-0f32-4334-a3e5-d32ef0266b33",
    "user_id": "...",
    "pickup": { "lat": 28.5562, "lng": 77.1, "address": "..." },
    "drop": { "lat": 28.57, "lng": 77.32, "address": "..." },
    "passenger_count": 2,
    "luggage_count": 2,
    "max_detour_km": 5,
    "cab_type": "5-seater",
    "status": "MATCHED",
    "fare": 250,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Pseudo flow:**  
Client sends token + ride_id → Backend finds ride where ride_id = :id and user_id = logged-in user → Returns ride document.

---

## 11. Cancel ride

| Item | Value |
|------|--------|
| **Method** | POST |
| **Endpoint** | `/rides/:id/cancel` |
| **Auth** | Yes |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Ride cancelled successfully"
  }
}
```

**Pseudo flow:**  
Client sends token + ride_id → Backend finds ride, sets status CANCELLED → If ride had trip_id, updates trip (remove ride from ride_ids, update totals; if no rides left, set trip status CANCELLED) → Returns success.

---

## 12. Get trip details

| Item | Value |
|------|--------|
| **Method** | GET |
| **Endpoint** | `/trips/:id` |
| **Auth** | Yes |

**Example:** GET `/trips/32b798e6-0f32-4334-a3e5-d32ef0266b33`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "trip_id": "32b798e6-0f32-4334-a3e5-d32ef0266b33",
    "ride_ids": ["9ac4c4d7-260b-4662-a06f-e0a4ce072596", "b48ed57c-1d94-4729-985f-ff3c83c8c096"],
    "cab_type": "5-seater",
    "total_passengers": 3,
    "total_luggage": 4,
    "status": "MATCHED",
    "total_distance_km": 25,
    "createdAt": "...",
    "updatedAt": "...",
    "rides": [
      {
        "user_id": "...",
        "ride_id": "9ac4c4d7-...",
        "pickup": { ... },
        "drop": { ... },
        "status": "WAITING",
        "fare": null,
        "passenger_count": 1,
        "luggage_count": 2
      },
      {
        "user_id": "...",
        "ride_id": "b48ed57c-...",
        "pickup": { ... },
        "drop": { ... },
        "status": "MATCHED",
        "fare": 250,
        "passenger_count": 2,
        "luggage_count": 2
      }
    ]
  }
}
```

**Pseudo flow:**  
Client sends token + trip_id → Backend finds trip in `trips` → Fetches all rides in trip.ride_ids from `rides` → Returns trip + rides array.

---

## Summary

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | /health | No | Health check |
| 2 | POST | /signup | No | Signup OTP |
| 3 | POST | /login | No | Login OTP |
| 4 | POST | /verify-otp | No | Verify OTP, get token |
| 5 | POST | /google | No | Google login |
| 6 | GET | /profile | Yes | Get profile |
| 7 | PATCH | /profile | Yes | Update profile |
| 8 | GET | /trips | Yes | Past trips (paginated) |
| 9 | POST | /rides | Yes | Book ride |
| 10 | GET | /rides/:id | Yes | Get ride |
| 11 | POST | /rides/:id/cancel | Yes | Cancel ride |
| 12 | GET | /trips/:id | Yes | Get trip with rides |

**Total: 12 APIs.**
