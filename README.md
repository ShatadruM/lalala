# 🪐 Infinitus Token Economy

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

Infinitus is a highly concurrent, serverless digital token economy application designed for a large-scale college festival at SRM AP. It facilitates cashless transactions across the campus, featuring real-time vendor POS systems, administrative wallet top-ups, and student digital passbooks.

## 🚀 Features

### 👤 Role-Based Access Control
- **Student Dashboard:** Digital ID card, dynamic QR code generation, real-time token balance, and transaction history.
- **Admin Gateway:** Secure QR scanning terminal to credit tokens to students, complete with UTR validation and screenshot proof uploads.
- **Vendor POS:** Point-of-Sale QR scanner to instantly deduct tokens for stall purchases.
- **Vendor Analytics:** Real-time data visualization of hourly footfall and total revenue.

### 💳 Financial Integrity
- **Strict UTR Validation:** Ensures 12-digit UPI Transaction Reference codes are verified to prevent duplicate recharge claims.
- **Atomic Transactions:** Uses PostgreSQL Stored Procedures (RPCs) to handle balance updates, preventing race conditions under heavy load.
- **Instant Activation:** Automatically flags dormant accounts as `is_active = true` upon their first valid top-up.

---

## 🏗️ Architecture & Design Decisions

Building an application for a massive flash-crowd event (a college fest) required specific architectural choices to ensure it wouldn't crash under sudden traffic spikes.

### 1. Serverless Compute (Vercel over Traditional VPS)
Instead of deploying the Node.js/Express backend on a traditional 24/7 server (like an EC2 instance or DigitalOcean Droplet), the backend is deployed as **Serverless Functions on Vercel**.
* **Why?** During peak fest hours (e.g., lunchtime), thousands of requests can hit the server simultaneously. Vercel automatically scales horizontally to create hundreds of isolated instances on demand, preventing the server from freezing or crashing. It also provides built-in Enterprise DDoS mitigation at the Edge.

### 2. Database Connection Pooling (Supabase REST)
Serverless architectures often kill traditional SQL databases via connection exhaustion (the "Serverless Trap").
* **Why?** By using the `@supabase/supabase-js` client, the backend communicates with PostgreSQL via Supabase's PostgREST API and Supavisor pooler. This safely throttles thousands of concurrent serverless wake-ups into a manageable number of database connections.

### 3. PL/pgSQL Atomic Transactions
Token economies are highly vulnerable to race conditions (e.g., a student scanning their QR code twice at the exact same millisecond to spend the same token twice).
* **Why?** Core financial logic — such as crediting tokens and activating accounts — is handled entirely at the database layer using custom PostgreSQL `SECURITY DEFINER` functions (e.g., `add_tokens_atomic`). This ensures strict ACID compliance.

### 4. Zero-Dependency Timezone Localization
Fest vendors rely on accurate hourly sales charts, but devices often drift to UTC or incorrect system times.
* **Why?** Instead of using heavy libraries like `Moment.js`, we leveraged the browser's native `Intl.DateTimeFormat` API. This forces all Recharts analytics components to strictly render timestamps in `Asia/Kolkata` (IST), ensuring consistent reporting across all vendor devices with zero added bundle size.

### 5. UI/UX: Deep Space Glassmorphism
The visual identity aligns with the "Infinitus" space theme using modern CSS techniques.
* **Why?** We implemented heavy `backdrop-blur-2xl` paired with `bg-black/40` to create a deep, frosted-glass aesthetic over animated nebula backgrounds. The UI relies heavily on Tailwind CSS, avoiding heavy component libraries in favor of high-performance, custom HTML structure.

---

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (Styling & Glassmorphism)
* Recharts (Vendor Analytics)
* Lucide React (Icons)
* React Router v6

**Backend & Database:**
* Node.js / Express (Configured for Vercel Serverless via `vercel.json`)
* Supabase (PostgreSQL Database, Auth, Storage)

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js v18+
- Supabase Account / Local CLI

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/infinitus-token-app.git
cd infinitus-token-app
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Start the backend:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend:

```bash
npm run dev
```

---

## 🔒 Security Highlights

1. **Preflight CORS Management:** Configured robust CORS headers in `vercel.json` to secure the backend against unauthorized domains.
2. **Stateless JWT Auth:** Sessions are managed securely via Supabase Auth. The frontend listens for token refreshes dynamically (`onAuthStateChange`).
3. **Double-Layered Route Protection:** Private routes enforce strict role checks (`admin`, `vendor`, `student`) both on the React router level and the PostgreSQL Row-Level Security (RLS) level.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

*Built with 💻 and ☕ by the Next Tech Lab Team.*
