/\*\*

- API Documentation for RENTAMOTO Backend
-
- Complete API reference for all endpoints with request/response examples.
  \*/

# RENTAMOTO API Documentation

Base URL: `https://your-api-domain.com`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": { ... } // Optional pagination/metadata
}
```

Error responses:

```json
{
  "error": true,
  "message": "Error description",
  "status": 400,
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "customer", // Optional: "customer" or "admin"
  "phone": "+1234567890" // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "profile": {
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "session": {
      "access_token": "jwt_token_here",
      "expires_at": "2024-01-02T00:00:00.000Z",
      "expires_in": 86400
    }
  }
}
```

### GET /auth/me

Get current user profile. **Requires authentication.**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "phone": "+1234567890",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Bike Management Endpoints

### GET /bikes

Get all bikes with optional filters.

**Query Parameters:**

- `available` (boolean): Filter by availability
- `latitude` (float): Search center latitude
- `longitude` (float): Search center longitude
- `radius` (float): Search radius in km
- `brand` (string): Filter by brand
- `limit` (integer): Results per page (1-100)
- `offset` (integer): Results offset

**Example:** `/bikes?available=true&latitude=40.7128&longitude=-74.0060&radius=5&limit=20`

**Response (200):**

```json
{
  "success": true,
  "message": "Bikes retrieved successfully",
  "data": [
    {
      "id": 1,
      "model": "City Cruiser",
      "brand": "RENTAMOTO",
      "price_per_hour": 5.0,
      "is_available": true,
      "latitude": 40.7128,
      "longitude": -74.006,
      "description": "Comfortable city bike",
      "image_url": "https://example.com/bike1.jpg",
      "battery_level": 85,
      "distance": 0.5 // Only if location search
    }
  ],
  "meta": {
    "total": 50,
    "count": 20,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /bikes/:id

Get specific bike by ID.

**Response (200):**

```json
{
  "success": true,
  "message": "Bike retrieved successfully",
  "data": {
    "id": 1,
    "model": "City Cruiser",
    "brand": "RENTAMOTO",
    "price_per_hour": 5.0,
    "is_available": true,
    "latitude": 40.7128,
    "longitude": -74.006,
    "description": "Comfortable city bike",
    "image_url": "https://example.com/bike1.jpg",
    "battery_level": 85,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /bikes

Create new bike. **Requires admin authentication.**

**Request Body:**

```json
{
  "model": "Mountain Explorer",
  "brand": "RENTAMOTO",
  "price_per_hour": 8.0,
  "latitude": 40.7128,
  "longitude": -74.006,
  "description": "Rugged mountain bike",
  "image_url": "https://example.com/bike2.jpg",
  "battery_level": 100
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Bike created successfully",
  "data": {
    "id": 2,
    "model": "Mountain Explorer",
    // ... other bike fields
    "qr_code": "RENT-1704067200-ABC123XYZ"
  }
}
```

### PUT /bikes/:id

Update existing bike. **Requires admin authentication.**

**Request Body (partial update):**

```json
{
  "price_per_hour": 9.0,
  "battery_level": 90,
  "is_available": false
}
```

### DELETE /bikes/:id

Delete bike. **Requires admin authentication.**

**Response (200):**

```json
{
  "success": true,
  "message": "Bike deleted successfully"
}
```

---

## Rental Workflow Endpoints

### POST /rent

Book a bike for rental. **Requires customer/admin authentication.**

**Request Body:**

```json
{
  "bike_id": 1,
  "start_latitude": 40.7128, // Optional
  "start_longitude": -74.006, // Optional
  "notes": "Starting ride from Central Park" // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Bike rented successfully",
  "data": {
    "booking": {
      "booking_id": 123,
      "user_id": "uuid",
      "bike_id": 1,
      "start_time": "2024-01-01T10:00:00.000Z",
      "status": "active",
      "bikes": {
        "model": "City Cruiser",
        "brand": "RENTAMOTO",
        "price_per_hour": 5.0
      }
    },
    "instructions": {
      "message": "Enjoy your ride! Remember to return the bike when done.",
      "booking_id": 123
    }
  }
}
```

### POST /return

Return a rented bike. **Requires customer/admin authentication.**

**Request Body:**

```json
{
  "booking_id": 123,
  "end_latitude": 40.7589, // Optional
  "end_longitude": -73.9851, // Optional
  "notes": "Returned at Times Square" // Optional
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Bike returned successfully",
  "data": {
    "booking": {
      "booking_id": 123,
      "start_time": "2024-01-01T10:00:00.000Z",
      "end_time": "2024-01-01T12:30:00.000Z",
      "total_cost": 12.5,
      "status": "completed"
    },
    "rental_summary": {
      "duration_hours": 2.5,
      "total_cost": 12.5,
      "bike_model": "City Cruiser"
    }
  }
}
```

### GET /my-bookings

Get current user's bookings. **Requires customer/admin authentication.**

**Query Parameters:**

- `status` (string): Filter by status ("active", "completed", "cancelled")
- `limit` (integer): Results per page
- `offset` (integer): Results offset
- `start_date` (ISO date): Filter from date
- `end_date` (ISO date): Filter to date

**Response (200):**

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "booking_id": 123,
      "start_time": "2024-01-01T10:00:00.000Z",
      "end_time": "2024-01-01T12:30:00.000Z",
      "total_cost": 12.5,
      "status": "completed",
      "bikes": {
        "model": "City Cruiser",
        "brand": "RENTAMOTO"
      }
    }
  ],
  "meta": {
    "total": 5,
    "summary": {
      "total_bookings": 5,
      "active_bookings": 1,
      "completed_bookings": 4,
      "total_spent": 47.5
    }
  }
}
```

### GET /active-rental

Get user's current active rental. **Requires customer/admin authentication.**

**Response (200):**

```json
{
  "success": true,
  "message": "Active rental retrieved successfully",
  "data": {
    "booking_id": 124,
    "bike_id": 1,
    "start_time": "2024-01-01T14:00:00.000Z",
    "current_duration_hours": 1.5,
    "estimated_cost": 7.5,
    "status": "active",
    "bikes": {
      "model": "City Cruiser",
      "battery_level": 75,
      "latitude": 40.7589,
      "longitude": -73.9851
    }
  }
}
```

---

## Admin Reporting Endpoints

All admin endpoints require admin authentication.

### GET /bookings

Get all bookings with filters. **Admin only.**

**Query Parameters:**

- `status`, `user_id`, `bike_id`, `start_date`, `end_date`
- `limit`, `offset`, `sort`, `order`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "booking_id": 123,
      "user_id": "uuid",
      "bike_id": 1,
      "start_time": "2024-01-01T10:00:00.000Z",
      "end_time": "2024-01-01T12:30:00.000Z",
      "total_cost": 12.5,
      "status": "completed",
      "bikes": { "model": "City Cruiser" },
      "user_profiles": { "name": "John Doe" }
    }
  ],
  "meta": {
    "total": 150,
    "summary": {
      "active_bookings": 5,
      "completed_bookings": 140,
      "total_revenue": 2750.5
    }
  }
}
```

### GET /revenue

Get revenue analytics. **Admin only.**

**Query Parameters:**

- `period` (string): "today", "week", "month", "year", "custom"
- `start_date`, `end_date` (for custom period)
- `group_by` (string): "day", "week", "month"

**Response (200):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 2750.5,
      "total_bookings": 140,
      "average_booking_value": 19.65,
      "period": "month"
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "revenue": 125.5,
        "bookings": 8
      }
    ],
    "period_comparison": {
      "current": { "revenue": 2750.5, "bookings": 140 },
      "previous": { "revenue": 2100.25, "bookings": 110 },
      "changes": {
        "revenue": 650.25,
        "revenue_percentage": 30.96,
        "bookings": 30,
        "bookings_percentage": 27.27
      }
    }
  }
}
```

### GET /analytics

Get comprehensive system analytics. **Admin only.**

**Response (200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 250,
      "total_bikes": 50,
      "total_bookings": 1500,
      "active_rentals": 8,
      "today": {
        "bookings": 12,
        "revenue": 145.5
      }
    },
    "bikes": {
      "total": 50,
      "available": 42,
      "unavailable": 8
    },
    "users": {
      "total": 250,
      "customers": 248,
      "admins": 2
    },
    "revenue": {
      "total_revenue": 15750.75,
      "completed_bookings": 1450
    }
  }
}
```

---

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid input data        |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource does not exist     |
| 409  | Conflict - Resource already exists      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error    |

---

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

Rate limit headers are included in responses:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1704067200
```

---

## Pagination

List endpoints support pagination with these parameters:

- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

Responses include pagination metadata:

```json
{
  "meta": {
    "total": 150,
    "count": 20,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrevious": false
  }
}
```
