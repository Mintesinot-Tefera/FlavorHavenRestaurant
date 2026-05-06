# FlavorHaven Restaurant

A full-stack restaurant ordering web application built with React, Node.js/Express, PostgreSQL, and Prisma.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken + bcrypt) |

---

## Running with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Start the full stack

```bash
docker compose up --build
```

This will:
- Start a PostgreSQL database
- Build and start the backend (runs `prisma migrate deploy` automatically on boot)
- Build and start the frontend (nginx serving the built React app, proxying `/api` to the backend)

### 2. Seed the database (first run)

In a second terminal, while the containers are running:

```bash
docker compose exec backend npx prisma db seed
```

### 3. Open the app

```
http://localhost
```

### Stopping

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```

---

## Local Development (with hot reload)

### Prerequisites
- Node.js 22+
- PostgreSQL running locally **or** Docker Desktop (for the DB-only setup below)

### Option A — DB in Docker, apps run locally

Start only the database container:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Then follow the steps below using `localhost:5432` as your database host.

### Option B — Local PostgreSQL

Create a database manually:

```sql
CREATE DATABASE restaurant_db;
```

---

### Backend setup

```bash
cd backend
```

Create the `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env` and set your values (defaults work with the Docker DB):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

Install dependencies, run migrations, and seed:

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
```

Start the dev server (hot reload via nodemon + tsx):

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`  
API calls are proxied to `http://localhost:5000` via the Vite dev server.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | `default-secret` | Secret used to sign JWTs — **change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `PORT` | `5000` | HTTP port the backend listens on |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:migrate` | Create and apply a new migration |
| `npm run prisma:seed` | Seed the database with sample data |
| `npm run prisma:generate` | Regenerate the Prisma client |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
FlavorHavenRestaurant/
├── docker-compose.yml        # Production: all services
├── docker-compose.dev.yml    # Development: DB only
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma     # DB models
│   │   └── seed.ts           # Sample data
│   └── src/
│       ├── controllers/      # Request handlers
│       ├── services/         # Business logic
│       ├── routes/           # Express routers
│       ├── middleware/       # Auth, error handling
│       └── config/           # Environment config
└── frontend/
    ├── Dockerfile
    ├── nginx.conf            # Nginx config for Docker
    └── src/
        ├── pages/            # Route-level components
        ├── components/       # Reusable UI components
        ├── context/          # React context (Auth, Cart)
        ├── services/         # Axios API client
        └── types/            # TypeScript interfaces
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/profile` | ✓ | Get current user profile |
| GET | `/api/foods` | — | List foods (supports `?categoryId=` and `?search=`) |
| GET | `/api/foods/:id` | — | Get a single food item |
| GET | `/api/categories` | — | List all categories |
| POST | `/api/orders` | ✓ | Place an order |
| GET | `/api/orders` | ✓ | Get current user's orders |
| GET | `/api/reviews/:foodId` | — | Get reviews for a food item |
| POST | `/api/reviews/:foodId` | ✓ | Create or update a review |
