<div align="center">

  <img src="public/images/hero_food.png" alt="Raju Dhaba Banner" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />

  <br />
  <br />

  <h1>🍛 RAJU DHABA</h1>
  <p><strong>Authentic North Indian Cuisine — Full-Stack Reservation & Management Platform</strong></p>

  <p>
    <a href="#-features"><img src="https://img.shields.io/badge/Status-Live%20Ready-2ea44f?style=for-the-badge&logo=statuspage&logoColor=white" alt="Status" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="#-cloud--vercel-deployment"><img src="https://img.shields.io/badge/Vercel-Serverless%20%26%20Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" /></a>
  </p>

  <p>
    <em>Experience ancestral culinary heritage blended with modern state-of-the-art web technology.</em>
  </p>

</div>

<hr />

## 📖 Overview

**Raju Dhaba** is a complete, modern web application crafted for a premium restaurant reservation experience. Built from the ground up without heavy frontend frameworks, it delivers blazing-fast performance, vibrant design aesthetics, and a robust RESTful API backend capable of running seamlessly both locally and on edge serverless platforms like **Vercel**.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🎨 **Dynamic Premium UI** | Responsive, glassmorphism-inspired design with micro-animations and smooth scroll interactions. |
| 📅 **Real-Time Booking Engine** | Instant table reservations with strict client-side and server-side validation rules (hours, date constraints, guest limits). |
| 🔧 **Admin Control Dashboard** | Dedicated live portal (`/admin`) to review analytics, monitor guest count, and update reservation statuses (`Confirmed`, `Completed`, `Cancelled`, `No-Show`). |
| ⚡ **Zero-Cold-Start CDN** | Optimized static architecture serving HTML/CSS/JS via Vercel Edge Network while dynamically scaling backend requests via Serverless Functions. |
| 🔒 **Atomic JSON Storage** | Crash-proof file storage system with automatic recovery and seamless `/tmp` adaptation when running in read-only cloud environments. |

---

## 🛠️ Technical Architecture & Stack

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                       │
│     (HTML5 / Vanilla CSS3 / Modern JavaScript API)     │
└───────────────────────────┬────────────────────────────┘
                            │  HTTPS / REST JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│              VERCEL EDGE CDN ROUTING                   │
│   ├── /public/*  ──► Served instantly from Edge CDN    │
│   └── /api/*     ──► Routed to Serverless Function     │
└───────────────────────────┬────────────────────────────┘
                            │  Serverless Execution
                            ▼
┌────────────────────────────────────────────────────────┐
│               EXPRESS.JS REST API SERVER               │
│   ├── Payload Validator & Error Handlers               │
│   ├── Controller Routes (/bookings, /stats)            │
│   └── Atomic DB Module (bookings.json / /tmp)          │
└────────────────────────────────────────────────────────┘
```

### Technology Breakdown

- **Frontend**: Pure HTML5 Semantic markup, Custom CSS3 (CSS Variables, Flexbox/Grid, Keyframe Animations), Vanilla JavaScript (ES6+ Async/Await Fetch API).
- **Backend Core**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) lightweight server API.
- **Middleware**: `cors` for cross-origin requests, `express.json()` payload processing.
- **Storage**: Native Node.js `fs` module implementing atomic temp-file swaps to guarantee data integrity.
- **Cloud Infrastructure**: Vercel Serverless Functions (`api/index.js`) + Edge Network Caching (`vercel.json`).

---

## 📡 REST API Documentation

The server provides a clean RESTful API mounted at `/api/bookings`.

### Endpoints Overview

| Method | Endpoint | Description | Request Body / Params |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/bookings` | Retrieve all table reservations | Optional: `?date=YYYY-MM-DD` |
| `POST` | `/api/bookings` | Create a new table reservation | `{ fname, lname, phone, date, time, guests, special }` |
| `GET` | `/api/bookings/stats` | Fetch aggregated dashboard metrics | *None* |
| `GET` | `/api/bookings/:id` | Get details for a specific booking | `id` (URL Parameter) |
| `PATCH`| `/api/bookings/:id/status`| Update reservation status | `{ status: "confirmed" \| "cancelled" \| "completed" \| "no-show" }` |
| `DELETE`| `/api/bookings/:id` | Permanently delete a record | `id` (URL Parameter) |

#### Example Payload: Create Reservation (`POST /api/bookings`)
```json
{
  "fname": "Rahul",
  "lname": "Sharma",
  "phone": "+91 98765 43210",
  "date": "2026-07-01",
  "time": "19:30",
  "guests": "4",
  "special": "Corner table preferred, celebrating anniversary."
}
```

---

## 🚀 Getting Started (Local Development)

Follow these simple steps to run the full-stack application on your local machine.

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **npm** (comes with Node.js)

### Installation & Execution

1. **Clone or Navigate to the repository**:
   ```bash
   cd Raju-dhaba
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - 🌐 **Customer Website**: [http://localhost:3000](http://localhost:3000)
   - 🔧 **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - 📡 **API Endpoint**: [http://localhost:3000/api/bookings](http://localhost:3000/api/bookings)

---

## ☁️ Cloud & Vercel Deployment

This codebase is pre-configured for zero-config deployment on **Vercel**.

1. **Asset Separation**: All frontend assets reside in `public/` for instant Global Edge CDN distribution.
2. **Serverless Entry Point**: All API calls (`/api/*`) seamlessly rewrite to `api/index.js`.
3. **Read-Only Filesystem Adaptability**: The database engine automatically senses ephemeral cloud environments (`process.env.VERCEL`) and shifts database reads/writes to AWS Lambda's writable `/tmp` directory.

To deploy:
```bash
npx vercel --prod
```

---

## 📸 Culinary Gallery Preview

<div align="center">
  <img src="public/images/menu_tandoori.png" alt="Tandoori Specialties" width="30%" style="border-radius: 8px; margin: 4px;" />
  <img src="public/images/menu_biryani.png" alt="Fragrant Biryani" width="30%" style="border-radius: 8px; margin: 4px;" />
  <img src="public/images/menu_dal_makhani.png" alt="Slow Cooked Dal Makhani" width="30%" style="border-radius: 8px; margin: 4px;" />
</div>