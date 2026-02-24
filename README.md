# CloudStack Marketplace

A full-featured marketplace web application for browsing, searching, and one-click deploying pre-configured apps/stacks onto Apache CloudStack infrastructure — similar to [DigitalOcean Marketplace](https://marketplace.digitalocean.com/).

---

## Features

- 🛒 **Browse & Search** — Filter apps by category, search by name/tag
- 🚀 **One-Click Deploy** — Deploy apps directly to your CloudStack environment
- 📦 **App Catalog** — WordPress, LAMP, databases, dev tools, and more
- ⭐ **Reviews & Ratings** — Community-driven feedback on each app
- 🏢 **Vendor Portal** — Submit and manage your own marketplace listings
- 🔐 **JWT Authentication** — Secure login/register for users and vendors
- 🖥️ **Admin Panel** — Manage apps, users, and deployments
- 📊 **User Dashboard** — Track your active deployments and settings

---

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript, Prisma ORM     |
| Database  | PostgreSQL 15                                |
| Cache     | Redis 7                                      |
| Search    | Meilisearch                                  |
| Cloud     | Apache CloudStack API                        |
| Container | Docker + Docker Compose                      |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [Docker](https://www.docker.com/) & Docker Compose
- An Apache CloudStack environment (or use the provided mock)
- PostgreSQL 15 (or use Docker Compose)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kiranchavala/cloudstack-marketplace.git
cd cloudstack-marketplace
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

The backend API will be available at [http://localhost:4000](http://localhost:4000).

---

## Docker Compose Setup

The easiest way to run the full stack locally:

```bash
# Copy and configure environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Start all services
docker-compose up --build

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
```

Services:
| Service     | URL                          |
|-------------|------------------------------|
| Frontend    | http://localhost:3000        |
| Backend API | http://localhost:4000        |
| PostgreSQL  | localhost:5432               |
| Redis       | localhost:6379               |
| Meilisearch | http://localhost:7700        |

---

## CloudStack Configuration

1. Obtain your CloudStack API key and secret from your CloudStack admin panel
2. Set `CLOUDSTACK_API_URL`, `CLOUDSTACK_API_KEY`, and `CLOUDSTACK_SECRET_KEY` in `backend/.env`
3. To create VM templates, see [`cloudstack/README.md`](./cloudstack/README.md)

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable              | Description                    | Default                   |
|-----------------------|--------------------------------|---------------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL           | `http://localhost:4000`   |

### Backend (`backend/.env`)

| Variable                | Description                          | Default         |
|-------------------------|--------------------------------------|-----------------|
| `DATABASE_URL`          | PostgreSQL connection string         | —               |
| `REDIS_URL`             | Redis connection string              | —               |
| `MEILISEARCH_URL`       | Meilisearch URL                      | —               |
| `MEILISEARCH_KEY`       | Meilisearch master key               | —               |
| `JWT_SECRET`            | Secret for signing JWT tokens        | —               |
| `CLOUDSTACK_API_URL`    | CloudStack API endpoint              | —               |
| `CLOUDSTACK_API_KEY`    | CloudStack API key                   | —               |
| `CLOUDSTACK_SECRET_KEY` | CloudStack API secret                | —               |
| `SMTP_HOST`             | SMTP server host                     | —               |
| `SMTP_PORT`             | SMTP server port                     | `587`           |
| `SMTP_USER`             | SMTP username                        | —               |
| `SMTP_PASS`             | SMTP password                        | —               |
| `PORT`                  | Backend server port                  | `4000`          |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and add tests where appropriate.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
