# Scout / FrameFinder — Backend Features & Architecture Specification

This document provides the exhaustive backend specification for **Scout** (formerly/also known as **FrameFinder**), extracted directly from `FRAMEFINDER_AI_ROADMAP_AND_DEV_GUIDE.md`. It serves as the official reference for building the production MERN backend in tandem with Jonas Schmedtmann's Node.js Bootcamp.

---

## 1. Application Overview & Scope

- **Application Name**: Scout (FrameFinder)
- **Nature**: Cinematic discovery hub, personal film journal, and community tracking platform for Movies and TV Shows.
- **Frontend Architecture**: React 19 + Vite + TailwindCSS v4 + TanStack Query v5 + Zustand v5 + react-i18next (Arabic RTL & English LTR).
- **Backend Architecture**: Node.js + Express REST API (with WebSockets for real-time alerts) + MongoDB Atlas with Mongoose ODM.
- **External Integration**: TMDB (The Movie Database) API v3/v4 & YouTube trailer embeds.

---

## 2. Core RESTful Architecture & Stateless Principles

The Scout backend is strictly architected upon Roy Fielding's REST constraints and modern production HTTP semantics:

1. **Statelessness (Core Contract)**:
   - **Zero Session Memory**: The server maintains no client session state in memory. Each incoming request must contain all data, credentials, and contextual parameters needed for execution.
   - **Stateless Authentication**: Verified via signed JSON Web Tokens (JWT) transmitted in `httpOnly` secure cookies or `Authorization: Bearer <token>` headers. Token verification is cryptographic; no server session table lookups are performed.
   - **Horizontal Clustering**: Zero state dependence allows effortless deployment across container clusters, PM2 worker processes, and serverless environments with zero session-sync bottlenecks.
2. **Resource-Oriented Endpoint Hierarchy**:
   - Resources are represented with plural nouns, never action verbs:
     - Collection URLs: `/api/v1/movies`, `/api/v1/reviews`, `/api/v1/users`
     - Document URLs: `/api/v1/movies/:id`, `/api/v1/reviews/:id`
     - Sub-Resource URLs: `/api/v1/movies/:movieId/reviews`
3. **HTTP Verb Semantics & Idempotency**:
   - `GET`: Safe & idempotent resource retrieval.
   - `POST`: Non-idempotent resource creation.
   - `PATCH`: Idempotent partial resource modification.
   - `DELETE`: Idempotent resource removal.
4. **Standard JSend Response Format**:
   - Success (`200 OK`, `201 Created`): `{ "status": "success", "data": { ... } }`
   - Client Failures (`400`, `401`, `403`, `404`): `{ "status": "fail", "data": { ... } }`
   - Server Errors (`500`): `{ "status": "error", "message": "..." }`
5. **Layered System & Cache Control**:
   - Read-heavy endpoints provide `Cache-Control` headers for reverse proxies, CDNs, and client caching layers.

---

## 3. Comprehensive Feature Matrix

### A. Authentication, Identity & User Profiles (Milestone 2.2 / Phase 2)

1. **User Registration & Email Verification**:
   - Secure signup with `name`, `email`, `password`, `passwordConfirm`.
   - Passwords hashed with `bcryptjs` (salt rounds: 12).
   - Welcome email trigger.
2. **Session & Token Management**:
   - JWT tokens generated with expiration.
   - Sent and stored in `httpOnly`, `secure`, `sameSite: 'lax'` cookies to prevent XSS-based token theft.
3. **Password Management**:
   - Forgot password flow with cryptographically random tokens (`crypto.randomBytes`).
   - Token hashing (SHA-256) and expiration timestamp (10 minutes).
   - Password reset endpoint and email notification via Nodemailer.
   - Password update for authenticated users with current password validation.
4. **User Profile & Customization**:
   - Profile management: Name, bio, email, avatar image.
   - Multer middleware for avatar upload with Sharp image processing (square crop, resized to 500x500, converted to `.webp`).
   - Preferences storage: Preferred language (`en` or `ar`), default media type (`movie` or `tv`), theme mode (`dark` or `light`).
5. **Role-Based Access Control (RBAC)**:
   - User roles: `user`, `moderator`, `admin`.
   - Middleware protection: `protect` (authentication check) and `restrictTo('moderator', 'admin')`.

---

### B. Personal Collections & Media Tracking (Favorites, Watchlist, Ratings)

1. **Favorites Collection**:
   - Toggle movies and TV shows into user favorites.
   - Immediate toggle with client-side optimistic UI and server persistence.
2. **Watchlist ("Want to Watch" Radar)**:
   - Save upcoming or unstreamed titles to personal watchlist.
   - Integrates with the Notification engine to alert users when a watchlisted title premieres, receives a new official trailer, or hits streaming services.
3. **1–10 Star Rating Journal**:
   - Granular scoring from 1 to 10 stars (with half-star precision optional).
   - Rating metadata: recorded score, timestamp, media snapshot.
   - Automatic calculation of user rating averages and statistics.
4. **Local-to-Cloud Migration**:
   - Phase 1 client stores favorites, watchlist, and ratings in browser `localStorage` via Zustand (`framefinder-library`).
   - Upon first login/signup, the client calls a bulk migration endpoint (`POST /api/v1/library/sync`) to import local offline data into the user's MongoDB profile.
5. **Multi-Filter & Sorting Capabilities**:
   - Filter by media type (`all`, `movie`, `tv`).
   - Filter by genre (`Action`, `Drama`, `Sci-Fi`, etc.).
   - Multi-criteria sorting:
     - Date Added (Newest / Oldest)
     - Rating Score (Highest / Lowest)
     - Release Year (Newest / Oldest)
     - Alphabetical Title (A–Z / Z–A)
   - In-collection full-text search.

---

### C. Community Social Feed, Reviews & Film Journal

1. **Personal Film Journal**:
   - Dedicated notes, impressions, and long-form reviews per movie/show.
   - Full CRUD operations: create, edit, delete reviews.
2. **Public Community Reviews**:
   - Reviews published by users appear publicly on the media details page (`/movie/:id` and `/tv/:id`).
   - Rich review data: user info (name, avatar), rating score, review text, timestamps, spoiler flag.
3. **Threaded Comment Replies**:
   - Nested replies on reviews/comments allowing community discussions.
   - Hierarchical data structure (`parentCommentId`, `userId`, `text`, `createdAt`).
4. **Reactions & Voting System**:
   - Reaction emoji picker: 👍 Like, 👎 Dislike, ❤️ Love, 😂 Funny, 😮 Surprised.
   - Upvote / downvote score tracking for review helpfulness ranking.
   - Prevent duplicate votes per user with compound uniqueness (`reviewId + userId`).
5. **Content Moderation & Safety**:
   - Users can report offensive or spoiler-tagged comments (`POST /api/v1/reviews/:id/report`).
   - Moderator/Admin dashboard to review reported comments, dismiss flags, or soft-delete content.

---

### D. Real-Time Notification Engine & Alert Radar (Milestone 2.1)

1. **Real-Time WebSockets (Socket.IO)**:
   - Authenticated WebSocket handshake using JWT cookie.
   - Personal user rooms: `user:${userId}`.
   - Instant server push of events (`notification:new`) without client polling.
2. **Navbar Notification Bell 🔔**:
   - Pulsing badge showing unread notification count.
   - Popover flyout panel with 3 tabbed categories:
     - **All**: Chronological stream of all alerts.
     - **Social**: Direct replies to user comments, comment reactions, mentions.
     - **Watchlist Radar**: Premiere date alerts, new official YouTube trailers added, streaming availability updates.
3. **Notification Lifecycle**:
   - Mark individual notification as read.
   - "Mark all as read" batch update (`PATCH /api/v1/notifications/mark-all-read`).
   - Swipe/click to dismiss.
4. **Web Push Integration (Opt-in)**:
   - Web Push Protocol via Service Worker for system-level notifications when watchlisted titles are released.

---

### E. Discovery, Search & TMDB Media Caching Layer

1. **TMDB Proxy & Cache Engine**:
   - Caches TMDB responses in MongoDB / Redis to drastically reduce external API latency, avoid TMDB rate limits (429), and guarantee offline resilience.
2. **Discovery Feeds**:
   - **Trending Now**: `/api/v1/media/trending` (daily/weekly, movies & TV).
   - **Popular**: `/api/v1/media/popular`.
   - **Top Rated**: `/api/v1/media/top-rated`.
   - **New Releases**: `/api/v1/media/new-releases` (`/movie/now_playing` or `/tv/on_the_air`).
   - **Curated Genres**: `/api/v1/media/genre/:genreId`.
3. **Deep-Dive Metadata Aggregation**:
   - Consolidates TMDB requests using `append_to_response=videos,credits,recommendations`.
   - Formats budget, revenue, runtime, production companies, cast/crew listings.
4. **Bilingual Media Localization**:
   - Dynamic parameter `language=en-US` or `language=ar-SA`.
   - Intelligent fallback: If Arabic overview or title is missing from TMDB, gracefully fallback to English without breaking layout.

---

## 3. MongoDB Data Schemas & Models

### User Schema (`models/userModel.js`)

```javascript
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: { type: String, default: 'default.jpg' },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match!',
      },
    },
    preferences: {
      language: { type: String, enum: ['en', 'ar'], default: 'en' },
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultMediaType: {
        type: String,
        enum: ['movie', 'tv'],
        default: 'movie',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true },
);
```

---

### Media Item Schema (`models/mediaModel.js`)

```javascript
const mediaSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true, index: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true }, // 'name' for TV, 'title' for movies
    originalTitle: String,
    overview: { type: String, default: '' },
    overviewAr: { type: String, default: '' },
    posterPath: String,
    backdropPath: String,
    releaseDate: String, // 'first_air_date' for TV
    voteAverage: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    genres: [{ id: Number, name: String }],
    runtime: Number,
    budget: Number,
    revenue: Number,
    status: String,
    lastCachedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);
```

---

### Review & Comment Schema (`models/reviewModel.js`)

```javascript
const reviewSchema = new mongoose.Schema(
  {
    mediaId: {
      type: Number,
      required: [true, 'Review must belong to a TMDB media item'],
      index: true,
    },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: { type: Number, min: 1, max: 10 },
    content: {
      type: String,
      required: [true, 'Review content cannot be empty'],
      trim: true,
    },
    containsSpoilers: { type: Boolean, default: false },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
      index: true,
    },
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      funny: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      surprised: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    isReported: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Prevent duplicate top-level reviews for the same media by the same user
reviewSchema.index(
  { mediaId: 1, user: 1, parentCommentId: 1 },
  { unique: true },
);
```

---

### Library / Personal Collection Schema (`models/libraryModel.js`)

```javascript
const librarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: String,
    releaseDate: String,
    genreIds: [Number],
    voteAverage: Number,
    isFavorite: { type: Boolean, default: false, index: true },
    isWatchlisted: { type: Boolean, default: false, index: true },
    userRating: { type: Number, min: 1, max: 10, default: null },
    personalNotes: String,
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

librarySchema.index({ user: 1, mediaId: 1 }, { unique: true });
```

---

### Notification Schema (`models/notificationModel.js`)

```javascript
const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['reply', 'reaction', 'watchlist_release', 'new_trailer', 'system'],
      required: true,
    },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: {
      posterPath: String,
      releaseDate: String,
      rating: Number,
      reactionType: String,
    },
  },
  { timestamps: true },
);
```

---

## 4. RESTful API Endpoint Inventory

| Resource          | HTTP Method | Endpoint                              | Description                                         | Auth Required |
| :---------------- | :---------: | :------------------------------------ | :-------------------------------------------------- | :-----------: |
| **Auth**          |   `POST`    | `/api/v1/auth/signup`                 | Register new user account                           |      No       |
|                   |   `POST`    | `/api/v1/auth/login`                  | Login with email & password (sets JWT cookie)       |      No       |
|                   |    `GET`    | `/api/v1/auth/logout`                 | Clear JWT auth cookie                               |      Yes      |
|                   |   `POST`    | `/api/v1/auth/forgotPassword`         | Request password reset token via email              |      No       |
|                   |   `PATCH`   | `/api/v1/auth/resetPassword/:token`   | Reset password using email token                    |      No       |
|                   |   `PATCH`   | `/api/v1/auth/updateMyPassword`       | Update password for logged-in user                  |      Yes      |
| **Users**         |    `GET`    | `/api/v1/users/me`                    | Fetch current user profile & preferences            |      Yes      |
|                   |   `PATCH`   | `/api/v1/users/updateMe`              | Update user profile data & avatar upload            |      Yes      |
|                   |  `DELETE`   | `/api/v1/users/deleteMe`              | Soft-delete user account (`active: false`)          |      Yes      |
| **Library**       |    `GET`    | `/api/v1/library`                     | Get user collection (Favorites, Watchlist, Ratings) |      Yes      |
|                   |   `POST`    | `/api/v1/library/toggle-favorite`     | Add/remove title from Favorites                     |      Yes      |
|                   |   `POST`    | `/api/v1/library/toggle-watchlist`    | Add/remove title from Watchlist                     |      Yes      |
|                   |   `POST`    | `/api/v1/library/rate`                | Add or update 1–10 star score                       |      Yes      |
|                   |   `POST`    | `/api/v1/library/sync`                | Bulk sync offline localStorage to cloud             |      Yes      |
| **Reviews**       |    `GET`    | `/api/v1/media/:mediaId/reviews`      | Get all public reviews & comments for a title       |      No       |
|                   |   `POST`    | `/api/v1/media/:mediaId/reviews`      | Add new review or personal film journal note        |      Yes      |
|                   |   `PATCH`   | `/api/v1/reviews/:id`                 | Edit own review / comment                           |      Yes      |
|                   |  `DELETE`   | `/api/v1/reviews/:id`                 | Delete own review / comment                         |      Yes      |
|                   |   `POST`    | `/api/v1/reviews/:id/reactions`       | Add/toggle reaction emoji (Like, Love, etc.)        |      Yes      |
|                   |   `POST`    | `/api/v1/reviews/:id/replies`         | Add nested reply to a comment                       |      Yes      |
|                   |   `POST`    | `/api/v1/reviews/:id/report`          | Report inappropriate content                        |      Yes      |
| **Notifications** |    `GET`    | `/api/v1/notifications`               | Fetch paginated user notifications                  |      Yes      |
|                   |    `GET`    | `/api/v1/notifications/unread-count`  | Quick count of unread notifications                 |      Yes      |
|                   |   `PATCH`   | `/api/v1/notifications/:id/read`      | Mark single notification as read                    |      Yes      |
|                   |   `PATCH`   | `/api/v1/notifications/mark-all-read` | Mark all user notifications as read                 |      Yes      |
| **Media Cache**   |    `GET`    | `/api/v1/media/trending`              | Proxy/cache for trending movies & TV                |      No       |
|                   |    `GET`    | `/api/v1/media/popular`               | Proxy/cache for popular titles                      |      No       |
|                   |    `GET`    | `/api/v1/media/top-rated`             | Proxy/cache for highest rated titles                |      No       |
|                   |    `GET`    | `/api/v1/media/new-releases`          | Proxy/cache for now playing / on the air            |      No       |
|                   |    `GET`    | `/api/v1/media/:type/:id`             | Detailed metadata with append_to_response           |      No       |
