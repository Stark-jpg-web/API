<div align="center">

# ⚙️ Scout — Backend REST API

### High-Performance Node.js, Express & MongoDB Service for Cinematic Discovery & Community Tracking

[![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose_ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Airbnb Style](https://img.shields.io/badge/Code_Style-Airbnb-FF5A5F?style=for-the-badge&logo=airbnb&logoColor=white)](https://github.com/airbnb/javascript)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

<p align="center">
  <b>Production-grade RESTful API engineered with lean MongoDB queries, OWASP security hardening, JSend JSON standards, and guest-to-cloud sync.</b>
</p>

[Frontend Client](https://github.com/Stark-jpg-web/scout-frontend) • [Architectural Taxonomy](#-architectural-taxonomy) • [API Reference](#-api-endpoints-reference) • [Security & Performance](#-security--performance-standards) • [Getting Started](#-installation--local-setup)

---

</div>

## 📌 Architectural Overview

The **Scout Backend** is designed following strict **separation of concerns** and modern 2026 enterprise Node.js best practices (aligned with Jonas Schmedtmann's Complete Node.js Bootcamp and Airbnb style guidelines).

It powers the Scout ecosystem by acting as:

1. **The Data Persistence Hub**: Secures user identities, personal film collections, 1–10 star ratings, and community reviews in MongoDB Atlas.
2. **The Secure API Proxy**: Protects third-party TMDB tokens from client exposure, implements server-side caching, and enriches media feeds with personal user status flags (`isFavorite`, `userRating`).
3. **The Synchronization Bridge**: Seamlessly imports offline guest data (`POST /api/v1/library/sync`) created in the frontend into permanent cloud accounts.

---

## 🌐 Core RESTful API Principles & Architectural Governance

The Scout API strictly adheres to the architectural constraints of Representational State Transfer (REST) to guarantee predictable behavior, infinite scalability, and clean client-server decoupling:

### 1. 🔄 Statelessness (The Primary Architecture Pillar)

- **Zero Server-Side Session State**: The server never stores client session state in memory between requests (no server-side memory sessions or session affinity requirements).
- **Self-Contained Requests**: Every single incoming HTTP request must include all information, headers, query parameters, and credentials required to understand, authenticate, and fulfill it.
- **Stateless JWT Authentication**: Authentication is handled statelessly via signed JSON Web Tokens (JWT) carried in `httpOnly` secure cookies or `Authorization: Bearer <token>` headers. The server verifies tokens cryptographically without stateful database session lookups.
- **Horizontal Scalability**: Because the backend is 100% stateless, instances can be cloned across multiple containers, serverless clusters, and load balancers with zero session-sync bottlenecks.

### 2. 🎯 Resource-Oriented Uniform Interface

- **Resource Nouns (Never Verbs)**: API endpoints represent entities/resources using plural nouns:
  - ✅ _Compliant_: `GET /api/v1/movies`, `POST /api/v1/reviews`, `DELETE /api/v1/library/favorites/550`
  - ❌ _Non-Compliant_: `GET /api/v1/getMovies`, `POST /api/v1/createReview`, `POST /api/v1/deleteFavorite`
- **Nested Sub-Resources**: Logical hierarchical relationships are represented cleanly:
  - `GET /api/v1/movies/:movieId/reviews` (All reviews belonging to a specific movie)
  - `POST /api/v1/movies/:movieId/reviews` (Create review under that specific movie)

### 3. 🚦 Semantic HTTP Verbs & Idempotency

- **`GET`**: Retrieve resources. Safe and idempotent (never mutates server data).
- **`POST`**: Create new sub-resources. Non-idempotent.
- **`PATCH`**: Partially update specific fields on an existing resource. Idempotent.
- **`DELETE`**: Remove resources. Idempotent.

### 4. 📦 Standardized JSend JSON Responses & HTTP Status Codes

Every response envelope adheres to the **JSend specification** with accurate semantic HTTP status codes:

- **`200 OK` / `201 Created` (Success)**:
  ```json
  {
    "status": "success",
    "data": { "movie": { "id": 550, "title": "Fight Club" } }
  }
  ```
- **`400 Bad Request` / `401 Unauthorized` / `404 Not Found` (Client Operational Failures)**:
  ```json
  {
    "status": "fail",
    "data": { "email": "Please provide a valid email address" }
  }
  ```
- **`500 Internal Server Error` (Server Exceptions)**:
  ```json
  { "status": "error", "message": "An unexpected server error occurred" }
  ```

### 5. ⚡ Cacheability & Layered Systems

- Read-heavy public responses utilize HTTP `Cache-Control` and `ETag` headers to enable intermediary caching (browsers, CDNs, proxies) while reducing database loads.

---

## 🏛 Architectural Taxonomy & Layer Responsibilities

```text
scout-backend/
├── app.js                        # Express app setup, global middleware stack, route mounting
├── dev-data/                     # Development mock data & seeding utilities
├── .eslintrc.json                # Airbnb JavaScript Style Guide config
├── .prettierrc                   # Prettier formatting config
├── .gitignore                    # Protects node_modules, .env, and logs
└── package.json
```

When building features, code strictly adheres to these five distinct layers:

### 1. `routes/` (Routing Layer)

- **Purpose**: The front door of your API. Maps HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) and URL patterns directly to controller handlers.
- **Rule**: Route files contain **zero database queries** and **zero business logic**.

### 2. `controllers/` (Presentation & Coordination Layer)

- **Purpose**: Request/response orchestrators. Unpacks `req.params`, `req.query`, and `req.body`, calls models or services, and serializes responses in standard **JSend JSON** format.
- **Rule**: Keeps HTTP transport concerns isolated from domain models.

### 3. `models/` (Data & Domain Logic Layer)

- **Purpose**: "Fat Models". Mongoose schemas, document validation rules, compound indexes, virtual populates, and document middleware (e.g. pre-save bcrypt password hashing).
- **Rule**: All data integrity guarantees live here.

### 4. `middlewares/` (Request Lifecycle Interceptor Layer)

- **Purpose**: Reusable interceptors for cross-cutting concerns: JWT validation (`protect`), role-based authorization (`restrictTo('admin')`), rate limiting, and NoSQL sanitization.

### 5. `libs/` vs `utils/` (Crucial Distinction)

- **`libs/`**: Wrappers for external third-party SDKs, services, or I/O clients (e.g. `tmdbClient.js`, `nodemailer.js`, `sharp.js`).
- **`utils/`**: Pure, deterministic internal functions (e.g. `catchAsync.js`, `AppError.js`, `apiFeatures.js`).

---

## 📋 Comprehensive Feature Matrix

### 🔐 1. Authentication, Identity & RBAC

- **User Signup & Verification**: Password hashing using `bcryptjs` (salt rounds: 12) and confirmation validation.
- **Token Management**: Stateless JWT issuance stored inside `httpOnly`, `secure`, `sameSite: 'lax'` cookies to prevent XSS-based token theft.
- **Password Reset Flow**: Cryptographically secure tokens (`crypto.randomBytes`) with SHA-256 hashing and 10-minute expiration.
- **Role-Based Access Control**: Granular permissions across `user`, `moderator`, and `admin` roles.

### 📚 2. Personal Library & Media Tracking

- **Favorites & Watchlist**: Instant toggle endpoints with server-side document storage.
- **1–10 Star Rating Journal**: Granular scoring with automated average calculations and user statistics.
- **Guest-to-Cloud Migration**: Bulk sync endpoint (`POST /api/v1/library/sync`) migrating frontend `localStorage` guest data into MongoDB.
- **Server-Side Aggregation**: MongoDB aggregation pipelines (`$match`, `$sort`, `$facet`, `$skip`, `$limit`) for high-performance collection filtering.

### 💬 3. Community Reviews & Film Journal

- **Film Reviews**: Full review CRUD with user attribution, movie references, and star ratings.
- **Nested REST Routes**: Express route nesting `/api/v1/movies/:movieId/reviews`.
- **Moderation Pipeline**: Users can modify their own reviews; moderators and admins can audit flagged comments.

---

## 🔌 API Endpoints Reference

All endpoints return responses complying with the **JSend specification**:

```json
{
  "status": "success",
  "data": { ... }
}
```

### 👤 Authentication & Users

| Method  | Endpoint                             | Description                        | Access        |
| :------ | :----------------------------------- | :--------------------------------- | :------------ |
| `POST`  | `/api/v1/users/signup`               | Register a new user                | Public        |
| `POST`  | `/api/v1/users/login`                | Log in and receive JWT cookie      | Public        |
| `POST`  | `/api/v1/users/logout`               | Clear session cookie               | Public        |
| `POST`  | `/api/v1/users/forgotPassword`       | Request password reset token       | Public        |
| `PATCH` | `/api/v1/users/resetPassword/:token` | Reset password using token         | Public        |
| `PATCH` | `/api/v1/users/updateMyPassword`     | Change password for logged-in user | Authenticated |
| `GET`   | `/api/v1/users/me`                   | Fetch current user profile         | Authenticated |
| `PATCH` | `/api/v1/users/updateMe`             | Update profile information         | Authenticated |

### 📚 Library Collections & Tracking

| Method   | Endpoint                             | Description                                    | Access        |
| :------- | :----------------------------------- | :--------------------------------------------- | :------------ |
| `GET`    | `/api/v1/library`                    | Get user's favorites, watchlist, and ratings   | Authenticated |
| `POST`   | `/api/v1/library/sync`               | Bulk import guest `localStorage` data to cloud | Authenticated |
| `POST`   | `/api/v1/library/favorites/:mediaId` | Add title to favorites                         | Authenticated |
| `DELETE` | `/api/v1/library/favorites/:mediaId` | Remove title from favorites                    | Authenticated |
| `POST`   | `/api/v1/library/watchlist/:mediaId` | Add title to watchlist                         | Authenticated |
| `DELETE` | `/api/v1/library/watchlist/:mediaId` | Remove title from watchlist                    | Authenticated |
| `POST`   | `/api/v1/ratings/:mediaId`           | Submit 1–10 star rating                        | Authenticated |
| `DELETE` | `/api/v1/ratings/:mediaId`           | Remove rating                                  | Authenticated |

### ✍️ Reviews & Film Journal

| Method   | Endpoint                          | Description                   | Access         |
| :------- | :-------------------------------- | :---------------------------- | :------------- |
| `GET`    | `/api/v1/movies/:movieId/reviews` | Get all reviews for a movie   | Public         |
| `POST`   | `/api/v1/movies/:movieId/reviews` | Post a new review for a title | Authenticated  |
| `PATCH`  | `/api/v1/reviews/:id`             | Update an existing review     | Author / Admin |
| `DELETE` | `/api/v1/reviews/:id`             | Delete an existing review     | Author / Admin |

---

## 🛡️ Security & Performance Standards

- **OWASP Hardening**:
  - `helmet`: Automatically sets secure HTTP headers.
  - `express-rate-limit`: Prevents brute-force login and API scraping attacks.
  - `express-mongo-sanitize`: Sanitizes request payloads against NoSQL query injections.
  - `hpp`: Protects against HTTP Parameter Pollution.
- **Lean MongoDB Queries**:
  - Mandatory use of `.lean()` on read-only queries to bypass heavy Mongoose document hydration.
  - Selective field projection (`.select('title posterPath releaseDate')`) to minimize memory footprints.
  - Compound indexing on frequently queried multi-fields (e.g. `{ user: 1, mediaId: 1 }`).
- **Operational Error Isolation**:
  - Centralized error-handling middleware that distinguishes between operational errors (4xx) and unknown programming bugs (500).

---

## 🚀 Installation & Local Setup

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/Stark-jpg-web/scout-backend.git
cd scout-backend

# Install dependencies
npm install

# Create environment configuration file
touch .env
```

### 3. Environment Variables (`.env`)

```env
NODE_ENV=development
PORT=3000

# MongoDB Connection String
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/scout?retryWrites=true&w=majority
DATABASE_PASSWORD=your_database_password

# JWT Authentication
JWT_SECRET=super-secret-jwt-key-with-high-entropy-64-characters-minimum
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# TMDB External Integration
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_v4_bearer_access_token
```

### 4. Running the Server

```bash
# Run server
node app.js

# Output:
# App is running on port 3000
```

---

## 🧪 Testing & Code Quality

```bash
# Run Airbnb JavaScript linter
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Format files with Prettier
npm run format
```

### Quick cURL API Health Check

```bash
# Test GET root endpoint
curl -X GET http://localhost:3000/
# Response:
# {"message":"Hello from the tour API","app":"Stark"}
```

---

## 📄 License & Author

- **Author**: [Stark-jpg-web](https://github.com/Stark-jpg-web)
- **License**: ISC License
