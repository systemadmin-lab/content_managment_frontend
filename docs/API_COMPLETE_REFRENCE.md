# AI Content Generator - Complete API Reference

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:5000`  
> **Last Updated:** 2026-01-12

This document provides a **complete specification** of all API endpoints, data models, authentication mechanisms, and real-time features. It is designed for both **AI agents** and **frontend engineers** to understand and implement the client-side integration accurately.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Authentication](#2-authentication)
3. [API Endpoints Overview](#3-api-endpoints-overview)
4. [Authentication Endpoints](#4-authentication-endpoints)
5. [Content Management Endpoints](#5-content-management-endpoints)
6. [AI Content Generation Endpoints](#6-ai-content-generation-endpoints)
7. [Real-Time WebSocket Integration](#7-real-time-websocket-integration)
8. [Data Models & Schemas](#8-data-models--schemas)
9. [Error Handling](#9-error-handling)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Quick Start

### Connection Details

| Property | Value |
|----------|-------|
| **REST API Base URL** | `http://localhost:5000` |
| **WebSocket URL** | `http://localhost:5000` |
| **WebSocket Library** | `socket.io-client` |
| **Content-Type** | `application/json` |
| **CORS Origin Allowed** | `http://localhost:3000` |

### Authentication Method

All protected endpoints require a **JWT Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 2. Authentication

### 2.1 How Authentication Works

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Server returns a **JWT token** (valid for 30 days)
3. Client stores the token (localStorage/cookies)
4. Client includes token in all subsequent requests via `Authorization: Bearer <token>`

### 2.2 Token Structure

```typescript
// JWT Payload (decoded)
{
  "id": "60d0fe4f5311236168a109ca", // MongoDB User ID
  "iat": 1736668800,                 // Issued at timestamp
  "exp": 1739260800                  // Expiration timestamp (30 days)
}
```

### 2.3 Protected vs Public Endpoints

| Type | Endpoints |
|------|-----------|
| **Public** (No auth required) | `POST /auth/register`, `POST /auth/login` |
| **Protected** (Auth required) | All `/content/*`, `/generate-content/*`, `GET /auth/me` |

---

## 3. API Endpoints Overview

### Complete Endpoint Map

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ No | Register new user |
| `POST` | `/auth/login` | ❌ No | Login user |
| `GET` | `/auth/me` | ✅ Yes | Get current user profile |
| `GET` | `/content` | ✅ Yes | Get all user content |
| `POST` | `/content` | ✅ Yes | Create new content |
| `PUT` | `/content/:id` | ✅ Yes | Update content by ID |
| `DELETE` | `/content/:id` | ✅ Yes | Delete content by ID |
| `POST` | `/generate-content` | ✅ Yes | Queue AI content generation |
| `GET` | `/generate-content` | ✅ Yes | Get all user's generation jobs |
| `GET` | `/generate-content/:jobId` | ✅ Yes | Get specific job status |
| `POST` | `/generate-content/:jobId/save` | ✅ Yes | Save generated content to library |

---

## 4. Authentication Endpoints

### 4.1 Register User

Creates a new user account and returns authentication credentials.

```
POST /auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | `string` | ✅ Yes | Min 1 character | User's full name |
| `email` | `string` | ✅ Yes | Valid email format, unique | User's email address |
| `password` | `string` | ✅ Yes | Min 1 character | User's password (will be hashed) |

**Example Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response:** `201 Created`
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDBmZTRmNTMxMTIzNjE2OGExMDljYSIsImlhdCI6MTczNjY2ODgwMCwiZXhwIjoxNzM5MjYwODAwfQ.xxxxx"
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | Missing required fields | `{ "message": "Please provide all fields" }` |
| `400` | Email already registered | `{ "message": "User already exists" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 4.2 Login User

Authenticates user credentials and returns a JWT token.

```
POST /auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ Yes | Registered email address |
| `password` | `string` | ✅ Yes | User's password |

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Invalid email or password | `{ "message": "Invalid credentials" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 4.3 Get Current User

Retrieves the authenticated user's profile information.

```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Success Response:** `200 OK`
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "__v": 0
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing token | `{ "message": "Not authorized, no token" }` |
| `401` | Invalid/expired token | `{ "message": "Not authorized" }` |

---

## 5. Content Management Endpoints

### 5.1 Get All Content

Retrieves all content items for the authenticated user. Supports search filtering.

```
GET /content
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | `string` | ❌ No | Search keyword (searches in title, type, and body) |

**Example Requests:**
```bash
# Get all content
GET /content

# Search content
GET /content?search=marketing
```

**Success Response:** `200 OK`
```json
[
  {
    "_id": "60d0fe4f5311236168a109cb",
    "userId": "60d0fe4f5311236168a109ca",
    "title": "Summer Marketing Campaign",
    "type": "Social Media Caption",
    "body": "☀️ Summer vibes are here! #summer #marketing",
    "createdAt": "2026-01-12T10:00:00.000Z",
    "updatedAt": "2026-01-12T10:00:00.000Z",
    "__v": 0
  },
  {
    "_id": "60d0fe4f5311236168a109cc",
    "userId": "60d0fe4f5311236168a109ca",
    "title": "AI Technology Blog",
    "type": "Blog Post Outline",
    "body": "# Introduction\n## What is AI?\n...",
    "createdAt": "2026-01-11T09:00:00.000Z",
    "updatedAt": "2026-01-11T09:00:00.000Z",
    "__v": 0
  }
]
```

> **Note:** Results are sorted by `createdAt` in descending order (newest first).

---

### 5.2 Create Content

Creates a new content item in the user's library.

```
POST /content
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `title` | `string` | ✅ Yes | Any string | Content title |
| `type` | `string` | ✅ Yes | `"Blog Post Outline"`, `"Product Description"`, `"Social Media Caption"` | Content type |
| `body` | `string` | ✅ Yes | Any string (supports Markdown) | Content body |

**Example Request:**
```json
{
  "title": "Premium Wireless Headphones",
  "type": "Product Description",
  "body": "Experience crystal-clear audio with our premium wireless headphones. Features include:\n\n- 40-hour battery life\n- Active noise cancellation\n- Bluetooth 5.0 connectivity"
}
```

**Success Response:** `201 Created`
```json
{
  "_id": "60d0fe4f5311236168a109cd",
  "userId": "60d0fe4f5311236168a109ca",
  "title": "Premium Wireless Headphones",
  "type": "Product Description",
  "body": "Experience crystal-clear audio with our premium wireless headphones...",
  "createdAt": "2026-01-12T12:00:00.000Z",
  "updatedAt": "2026-01-12T12:00:00.000Z",
  "__v": 0
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | Missing required fields | `{ "message": "Please provide all fields" }` |
| `400` | Invalid content type | `{ "message": "Invalid content type" }` |
| `401` | Not authenticated | `{ "message": "User not found" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 5.3 Update Content

Updates an existing content item by ID.

```
PUT /content/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | MongoDB ObjectId of the content |

**Request Body (all fields optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ❌ No | New title |
| `type` | `string` | ❌ No | New type (must be valid) |
| `body` | `string` | ❌ No | New body content |

**Example Request:**
```json
{
  "title": "Updated: Premium Wireless Headphones Pro",
  "body": "Updated description with new features..."
}
```

**Success Response:** `200 OK`
```json
{
  "_id": "60d0fe4f5311236168a109cd",
  "userId": "60d0fe4f5311236168a109ca",
  "title": "Updated: Premium Wireless Headphones Pro",
  "type": "Product Description",
  "body": "Updated description with new features...",
  "createdAt": "2026-01-12T12:00:00.000Z",
  "updatedAt": "2026-01-12T12:30:00.000Z",
  "__v": 0
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `404` | Content not found | `{ "message": "Content not found" }` |
| `401` | Not content owner | `{ "message": "User not authorized" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 5.4 Delete Content

Permanently deletes a content item by ID.

```
DELETE /content/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | MongoDB ObjectId of the content |

**Example Request:**
```bash
DELETE /content/60d0fe4f5311236168a109cd
```

**Success Response:** `200 OK`
```json
{
  "id": "60d0fe4f5311236168a109cd"
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `404` | Content not found | `{ "message": "Content not found" }` |
| `401` | Not content owner | `{ "message": "User not authorized" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

## 6. AI Content Generation Endpoints

### ⚠️ Important: Generation Flow

The AI content generation uses an **asynchronous queue-based architecture** with a **mandatory 60-second delay**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI CONTENT GENERATION FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Client sends POST /generate-content                                     │
│          ↓                                                                  │
│  2. Server returns 202 Accepted + jobId (immediate response)                │
│          ↓                                                                  │
│  3. Job enters Redis queue with 60-second delay                             │
│          ↓                                                                  │
│  4. [WAIT ~60 SECONDS] ← Client shows countdown timer                       │
│          ↓                                                                  │
│  5. Worker picks up job and calls OpenRouter AI API                         │
│          ↓                                                                  │
│  6. Worker updates MongoDB + publishes to Redis Pub/Sub                     │
│          ↓                                                                  │
│  7. Server receives message and emits 'job_completed' via WebSocket         │
│          ↓                                                                  │
│  8. Client receives real-time notification with generated content           │
│          ↓                                                                  │
│  9. (Optional) Client calls POST /generate-content/:jobId/save              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.1 Queue Content Generation

Submits a new AI content generation request to the queue.

```
POST /generate-content
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `prompt` | `string` | ✅ Yes | Any descriptive text | The topic/subject for AI generation |
| `contentType` | `string` | ✅ Yes | `"Blog Post Outline"`, `"Product Description"`, `"Social Media Caption"` | Type of content to generate |

**Example Request:**
```json
{
  "prompt": "The future of artificial intelligence in healthcare",
  "contentType": "Blog Post Outline"
}
```

**Success Response:** `202 Accepted`
```json
{
  "message": "Content generation job queued successfully",
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "queued",
  "delaySeconds": 60,
  "scheduledFor": "2026-01-12T12:01:00.000Z",
  "estimatedCompletionTime": "2026-01-12T12:01:30.000Z"
}
```

**Response Field Descriptions:**

| Field | Description |
|-------|-------------|
| `jobId` | UUID to track this specific job |
| `status` | Always `"queued"` on creation |
| `delaySeconds` | The mandatory delay before processing (always 60) |
| `scheduledFor` | ISO timestamp when job will start processing |
| `estimatedCompletionTime` | Estimated completion (scheduledFor + ~30s for AI call) |

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | Missing prompt or contentType | `{ "message": "Please provide prompt and contentType" }` |
| `400` | Invalid contentType | `{ "message": "Invalid content type. Must be one of: Blog Post Outline, Product Description, Social Media Caption" }` |
| `401` | Not authenticated | `{ "message": "User not found" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 6.2 Get Job Status

Retrieves the current status and content of a specific generation job.

```
GET /generate-content/:jobId
```

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | `string` | ✅ Yes | UUID of the job (from queue response) |

**Example Request:**
```bash
GET /generate-content/b84e3feb-19c9-4231-8893-0eba6bd61a63
```

**Success Response (Queued):** `200 OK`
```json
{
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "queued",
  "contentType": "Blog Post Outline",
  "prompt": "The future of artificial intelligence in healthcare",
  "scheduledFor": "2026-01-12T12:01:00.000Z",
  "createdAt": "2026-01-12T12:00:00.000Z"
}
```

**Success Response (Processing):** `200 OK`
```json
{
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "processing",
  "contentType": "Blog Post Outline",
  "prompt": "The future of artificial intelligence in healthcare",
  "scheduledFor": "2026-01-12T12:01:00.000Z",
  "createdAt": "2026-01-12T12:00:00.000Z"
}
```

**Success Response (Completed):** `200 OK`
```json
{
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "completed",
  "contentType": "Blog Post Outline",
  "prompt": "The future of artificial intelligence in healthcare",
  "scheduledFor": "2026-01-12T12:01:00.000Z",
  "createdAt": "2026-01-12T12:00:00.000Z",
  "generatedContent": "# The Future of AI in Healthcare\n\n## I. Introduction\n- Brief overview of AI's current role in healthcare\n- Thesis: AI will revolutionize diagnosis, treatment, and patient care\n\n## II. Diagnostic Applications\n- Medical imaging analysis\n- Early disease detection\n- Pathology automation\n\n## III. Treatment Optimization\n- Personalized medicine\n- Drug discovery acceleration\n- Treatment planning\n\n## IV. Patient Care Improvements\n- Virtual health assistants\n- Remote monitoring\n- Predictive analytics\n\n## V. Challenges and Considerations\n- Data privacy concerns\n- Regulatory hurdles\n- Integration with existing systems\n\n## VI. Conclusion\n- Summary of key points\n- Future outlook",
  "completedAt": "2026-01-12T12:01:25.000Z"
}
```

**Success Response (Failed):** `200 OK`
```json
{
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "failed",
  "contentType": "Blog Post Outline",
  "prompt": "The future of artificial intelligence in healthcare",
  "scheduledFor": "2026-01-12T12:01:00.000Z",
  "createdAt": "2026-01-12T12:00:00.000Z",
  "error": "OpenRouter API rate limit exceeded"
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `404` | Job not found | `{ "message": "Job not found" }` |
| `401` | Not authenticated | `{ "message": "User not found" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

### 6.3 Get All User Jobs

Retrieves all generation jobs for the authenticated user.

```
GET /generate-content
```

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
GET /generate-content
```

**Success Response:** `200 OK`
```json
[
  {
    "_id": "678a1b2c3d4e5f6789012345",
    "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
    "userId": "60d0fe4f5311236168a109ca",
    "prompt": "The future of artificial intelligence in healthcare",
    "contentType": "Blog Post Outline",
    "status": "completed",
    "generatedContent": "# The Future of AI in Healthcare...",
    "scheduledFor": "2026-01-12T12:01:00.000Z",
    "completedAt": "2026-01-12T12:01:25.000Z",
    "createdAt": "2026-01-12T12:00:00.000Z",
    "updatedAt": "2026-01-12T12:01:25.000Z",
    "__v": 0
  },
  {
    "_id": "678a1b2c3d4e5f6789012346",
    "jobId": "c95f4ghi-29d0-5342-9904-1fca7ce72b74",
    "userId": "60d0fe4f5311236168a109ca",
    "prompt": "Eco-friendly water bottle for hikers",
    "contentType": "Product Description",
    "status": "queued",
    "scheduledFor": "2026-01-12T12:05:00.000Z",
    "createdAt": "2026-01-12T12:04:00.000Z",
    "updatedAt": "2026-01-12T12:04:00.000Z",
    "__v": 0
  }
]
```

> **Note:** Results are sorted by `createdAt` in descending order (newest first).

---

### 6.4 Save Generated Content

Saves a completed job's generated content to the user's permanent content library.

```
POST /generate-content/:jobId/save
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | `string` | ✅ Yes | UUID of the completed job |

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | `string` | ❌ No | Auto-generated from prompt | Custom title for the saved content |

**Example Request (with custom title):**
```json
{
  "title": "AI in Healthcare - Complete Outline"
}
```

**Example Request (auto-generated title):**
```json
{}
```

**Success Response:** `201 Created`
```json
{
  "message": "Content saved successfully",
  "content": {
    "_id": "60d0fe4f5311236168a109ce",
    "userId": "60d0fe4f5311236168a109ca",
    "title": "AI in Healthcare - Complete Outline",
    "type": "Blog Post Outline",
    "body": "# The Future of AI in Healthcare\n\n## I. Introduction...",
    "createdAt": "2026-01-12T12:05:00.000Z",
    "updatedAt": "2026-01-12T12:05:00.000Z",
    "__v": 0
  }
}
```

**Error Responses:**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `404` | Job not found | `{ "message": "Job not found" }` |
| `400` | Job not completed | `{ "message": "Cannot save content from incomplete job", "currentStatus": "queued" }` |
| `400` | No generated content | `{ "message": "No generated content available" }` |
| `401` | Not authenticated | `{ "message": "User not found" }` |
| `500` | Server error | `{ "message": "Server error" }` |

---

## 7. Real-Time WebSocket Integration

### 7.1 Overview

WebSocket integration via **Socket.io** provides real-time updates when AI generation jobs complete. This eliminates the need for polling.

### 7.2 Connection Setup

**Install dependency:**
```bash
npm install socket.io-client
```

**Client connection code:**
```typescript
import { io, Socket } from "socket.io-client";

// Initialize socket with auth token
const socket: Socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("access_token") // Your JWT token
  }
});

// Handle successful connection
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
  console.log("Socket ID:", socket.id);
});

// Handle connection errors (usually auth failures)
socket.on("connect_error", (error: Error) => {
  console.error("❌ Connection failed:", error.message);
  // Common causes: invalid token, expired token, server down
});

// Handle disconnection
socket.on("disconnect", (reason: string) => {
  console.log("🔌 Disconnected:", reason);
});
```

### 7.3 Server Events

#### Event: `job_completed`

Emitted when an AI generation job finishes (success or failure).

**Listening for the event:**
```typescript
interface JobCompletedPayload {
  userId: string;
  jobId: string;
  status: "completed" | "failed";
  generatedContent?: string;  // Present if status === "completed"
  error?: string;             // Present if status === "failed"
  completedAt: string;        // ISO timestamp
}

socket.on("job_completed", (data: JobCompletedPayload) => {
  console.log("Job completed!", data);
  
  if (data.status === "completed") {
    // Display the generated content
    displayContent(data.generatedContent);
    // Show success notification
    showToast("Content generated successfully!");
  } else {
    // Handle failure
    showErrorToast(`Generation failed: ${data.error}`);
  }
});
```

**Example payload (success):**
```json
{
  "userId": "60d0fe4f5311236168a109ca",
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "completed",
  "generatedContent": "# The Future of AI in Healthcare\n\n## I. Introduction...",
  "completedAt": "2026-01-12T12:01:25.000Z"
}
```

**Example payload (failure):**
```json
{
  "userId": "60d0fe4f5311236168a109ca",
  "jobId": "b84e3feb-19c9-4231-8893-0eba6bd61a63",
  "status": "failed",
  "error": "AI service temporarily unavailable",
  "completedAt": "2026-01-12T12:01:25.000Z"
}
```

### 7.4 Complete WebSocket Example

```typescript
// websocket.service.ts
import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private jobCallbacks: Map<string, (data: any) => void> = new Map();

  connect(token: string): void {
    this.socket = io("http://localhost:5000", {
      auth: { token }
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket auth error:", error.message);
    });

    this.socket.on("job_completed", (data) => {
      // Check if there's a callback registered for this job
      const callback = this.jobCallbacks.get(data.jobId);
      if (callback) {
        callback(data);
        this.jobCallbacks.delete(data.jobId);
      }
    });
  }

  // Register a callback for when a specific job completes
  onJobComplete(jobId: string, callback: (data: any) => void): void {
    this.jobCallbacks.set(jobId, callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
```

---

## 8. Data Models & Schemas

### 8.1 User Model

```typescript
interface User {
  _id: string;           // MongoDB ObjectId (auto-generated)
  name: string;          // User's full name
  email: string;         // Unique email address
  password: string;      // Hashed password (never returned by API)
  status: "active" | "inactive";  // Account status
  createdAt?: string;    // ISO timestamp (if timestamps enabled)
  updatedAt?: string;    // ISO timestamp (if timestamps enabled)
}
```

### 8.2 Content Model

```typescript
interface Content {
  _id: string;           // MongoDB ObjectId (auto-generated)
  userId: string;        // Reference to User._id
  title: string;         // Content title
  type: ContentType;     // One of the allowed types
  body: string;          // Content body (supports Markdown)
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}

type ContentType = 
  | "Blog Post Outline" 
  | "Product Description" 
  | "Social Media Caption";
```

### 8.3 Job Model

```typescript
interface Job {
  _id: string;            // MongoDB ObjectId (auto-generated)
  jobId: string;          // UUID (used for tracking)
  userId: string;         // Reference to User._id
  prompt: string;         // Original user prompt
  contentType: ContentType;
  status: JobStatus;
  generatedContent?: string;  // AI output (only when completed)
  error?: string;            // Error message (only when failed)
  scheduledFor: string;      // ISO timestamp
  completedAt?: string;      // ISO timestamp (only when completed/failed)
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}

type JobStatus = 
  | "queued"      // Waiting in queue
  | "processing"  // Currently being processed
  | "completed"   // Successfully generated
  | "failed"      // Failed to generate
  | "error";      // System error occurred
```

### 8.4 Enums Reference

#### ContentType (Valid Values)
| Value | Description |
|-------|-------------|
| `"Blog Post Outline"` | Generates a structured blog post outline |
| `"Product Description"` | Generates a marketing-focused product description |
| `"Social Media Caption"` | Generates an engaging social media post |

#### JobStatus (Lifecycle)
```
queued → processing → completed
                   ↘ failed/error
```

---

## 9. Error Handling

### 9.1 Standard Error Response Format

All error responses follow this structure:

```json
{
  "message": "Human-readable error description"
}
```

### 9.2 HTTP Status Code Reference

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `202` | Accepted | Request accepted for processing (async) |
| `400` | Bad Request | Missing/invalid fields, validation failure |
| `401` | Unauthorized | Missing token, invalid token, expired token, not resource owner |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Internal server error |

### 9.3 Authentication Errors

| Scenario | Status | Message |
|----------|--------|---------|
| No token provided | `401` | `"Not authorized, no token"` |
| Invalid/expired token | `401` | `"Not authorized"` |
| User not in request context | `401` | `"User not found"` |
| Accessing another user's resource | `401` | `"User not authorized"` |

### 9.4 Validation Errors

| Scenario | Status | Message |
|----------|--------|---------|
| Missing required fields | `400` | `"Please provide all fields"` |
| Invalid content type | `400` | `"Invalid content type"` |
| Email already exists | `400` | `"User already exists"` |
| Invalid credentials | `401` | `"Invalid credentials"` |

---

## 10. Implementation Checklist

### For Frontend Engineers

#### Authentication Flow
- [ ] Create login page with email/password form
- [ ] Create registration page with name/email/password form
- [ ] Store JWT token securely (localStorage or httpOnly cookie)
- [ ] Create axios/fetch interceptor to add `Authorization` header
- [ ] Handle 401 responses (redirect to login)
- [ ] Create logout function (clear token)

#### Content Management
- [ ] Create content list page with search functionality
- [ ] Implement content creation form with type selector
- [ ] Implement content editing (inline or modal)
- [ ] Implement content deletion with confirmation
- [ ] Display content in cards/list with proper formatting

#### AI Generation
- [ ] Create generation form (prompt + type selector)
- [ ] Display 60-second countdown after submission
- [ ] Connect to WebSocket for real-time updates
- [ ] Show loading state during processing
- [ ] Display generated content with Markdown rendering
- [ ] Implement "Save to Library" button
- [ ] Handle failed generations gracefully
- [ ] Implement polling fallback if WebSocket fails

#### State Management
- [ ] Store auth state (user, token, isAuthenticated)
- [ ] Store content library state
- [ ] Store active generation jobs
- [ ] Implement proper loading/error states

### For AI Agents

#### API Integration Order
1. Implement authentication service first (register, login, token storage)
2. Set up HTTP client with auth interceptor
3. Implement content CRUD operations
4. Set up WebSocket connection service
5. Implement AI generation flow with WebSocket listening

#### Key Considerations
- Always check `status` field in job responses
- Handle all possible `JobStatus` values
- The `generatedContent` field uses Markdown formatting
- Jobs are user-scoped (can only access own jobs)
- 60-second delay is mandatory and cannot be bypassed

---

## Appendix: cURL Examples

### Quick Test Commands

```bash
# 1. Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login (save the token!)
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Get Profile (replace TOKEN)
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer TOKEN"

# 4. Create Content
curl -X POST http://localhost:5000/content \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","type":"Blog Post Outline","body":"# Test\n\nThis is a test."}'

# 5. Get All Content
curl -X GET http://localhost:5000/content \
  -H "Authorization: Bearer TOKEN"

# 6. Queue AI Generation
curl -X POST http://localhost:5000/generate-content \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Benefits of remote work","contentType":"Blog Post Outline"}'

# 7. Check Job Status (replace JOBID)
curl -X GET http://localhost:5000/generate-content/JOBID \
  -H "Authorization: Bearer TOKEN"

# 8. Save Generated Content
curl -X POST http://localhost:5000/generate-content/JOBID/save \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Remote Work Benefits"}'
```

---

**End of Documentation**
