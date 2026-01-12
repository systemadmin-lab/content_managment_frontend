# Frontend Interview Preparation Guide - AntigravityAI

This document outlines the key technical concepts, architectural decisions, and potential interview questions relevant to the **AntigravityAI** frontend application.

---

## 1. Project Overview

**AntigravityAI** is a modern, high-performance web application for AI content generation. It allows users to queue generation jobs (like blog outlines, product descriptions) and manages them via a real-time responsive dashboard.

### Tech Stack
*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (v4)
*   **State Management**: Zustand (Global Auth State) + React Context/Hooks (Local State)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **API Client**: Axios with Interceptors
*   **Notifications**: React Hot Toast

---

## 2. Core Architectural Concepts

### A. Next.js App Router
We utilize the **App Router (`src/app`)** for routing. Key features used:
*   **Layouts (`layout.tsx`)**: Defines the global shell (fonts, metadata, providers).
*   **Pages (`page.tsx`)**: Individual route UIs (Landing, Login, Register, Dashboard).
*   **Client vs Server Components**:
    *   `"use client"` directive is used for interactive components (forms, animations, hooks).
    *   Default server components are used for static content caching (though this app is heavy on client interaction due to auth).

### B. Authentication Flow (JWT)
1.  **Login/Register**: User submits credentials to `/auth/login`.
2.  **Token Storage**: JWT token is stored in `localStorage` via Zustand's `persist` middleware.
3.  **Route Protection**:
    *   **Implicit**: Protected pages (Dashboard) check `isAuthenticated` in `useEffect` and redirect to `/login` if false.
    *   **Explicit**: Middleware (optional but recommended for production) could enforce this at the edge.
4.  **Axios Interceptors**:
    *   **Request**: Automatically attaches `Authorization: Bearer <token>` to every API call.
    *   **Response**: Automatically handles `401 Unauthorized` by logging the user out.

### C. State Management (Zustand)
We chose **Zustand** over Redux/Context for its simplicity and performance.
*   **Store**: `useAuthStore` manages `user`, `token`, and `isAuthenticated`.
*   **Persistence**: The store automatically syncs with `localStorage` so login state survives refreshes.

### D. Real-time updates (Polling vs WebSockets)
*   **Current Implementation**: Polling (`setInterval` every 5s) in `DashboardPage`.
*   **Why Polling?**: Simple to implement for MVP.
*   **Interview Question**: *How would you optimize this?*
    *   **Answer**: Switch to **WebSockets (Socket.io)** or **Server-Sent Events (SSE)**. This allows the server to *push* updates when a job completes, reducing unnecessary network traffic.

---

## 3. Key Components & Implementation Details

### `DashboardHeader`
*   **Design**: Glassmorphism (`backdrop-blur-xl`, `bg-black/50`).
*   **Responsive**: Uses standard Tailwind breakpoints.

### `ContentList`
*   **Adaptive UI**: Renders a **Table** on Desktop and **Cards** on Mobile (`hidden md:block`).
*   **Empty State**: Provides a call-to-action when no data exists.

### `GenerationModal`
*   **Portal**: Renders on top of the UI.
*   **Form**: Simple controlled inputs for Prompt and Type.
*   **Animation**: Uses `AnimatePresence` for smooth entrance/exit.

---

## 4. Potential Interview Questions

### Q1: Why did you use Next.js App Router?
**A:** It offers better performance (React Server Components), intuitive file-system routing, and built-in SEO optimization. It simplifies layouts and data fetching patterns compared to the old Pages router.

### Q2: How do you handle "Prop Drilling"?
**A:** We mostly avoid it by using **Zustand** for global state (Auth) and keeping data fetching close to where it's used (DashboardPage). For simpler component trees (like passing `jobs` to `ContentList`), prop passing is acceptable and explicit.

### Q3: How would you improve the Dashboard performance?
**A:**
1.  **Paginate the API**: Currently, `getJobs` fetches everything. We should implement server-side pagination (limit/offset).
2.  **SWR / React Query**: Replace `useEffect` fetching with a library like TanStack Query for caching, optimistic updates, and automatic revalidation.
3.  **Virtualization**: If the list gets huge, use `react-window` to render only visible rows.

### Q4: Explain the Auth Security.
**A:** We store tokens in `localStorage`. While convenient, it is vulnerable to XSS. A more secure approach for production would be **HttpOnly Cookies**, which prevents JavaScript access to the token.

### Q5: How did you implement the "Antigravity" floating animation?
**A:** Using **Framer Motion**. We created a reusable `FloatingElement` component that animates `y` (vertical position) and `rotate` in an infinite loop with slightly randomized durations to create a natural, "floating" feel.

---

## 5. Directory Structure
```
src/
├── app/                 # Next.js Routes
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing Page
│   ├── login/           # Login Page
│   ├── register/        # Register Page
│   └── dashboard/       # Dashboard (Protected)
├── components/          # Reusable UI Components
│   ├── ContentList.tsx
│   ├── DashboardHeader.tsx
│   ├── GenerationModal.tsx
│   └── StatusBadge.tsx
├── services/            # API & Auth Logic
│   ├── api.ts           # Axios Instance
│   ├── authService.ts   # Login/Register API
│   └── contentService.ts# Content Generation API
└── store/               # Zustand Global Store
    └── useAuthStore.ts
```
