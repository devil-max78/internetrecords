# Music Distribution Dashboard

A full-stack application for music artists and labels to upload, manage, and distribute their music releases.

## Features

- User authentication (Artist, Label, Admin roles)
- Release management (create, edit, submit for review)
- Track management (add, edit, delete)
- File uploads (audio files and artwork)
- Admin dashboard for release approval and distribution
- Metadata export (JSON, CSV)
- File download functionality

## Tech Stack

- **Frontend**: React, TypeScript, TanStack Router, TanStack Query, Tailwind CSS
- **Backend**: Node.js, Express, tRPC, Prisma
- **Storage**: PostgreSQL, Minio (S3-compatible object storage)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 16+
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (for local development)
- Minio (for local development)

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and adjust as needed)
4. Generate Prisma client:
   ```
   npx prisma generate
   ```
5. Run database migrations:
   ```
   npx prisma migrate dev
   ```
6. Start the development server:
   ```
   npm run dev
   ```

### Docker Setup

To run the entire application with Docker:

```
docker-compose up -d
```

This will start:
- The application on port 3000
- PostgreSQL on port 5432
- Minio on port 9000 (API) and 9001 (Console)

## Project Structure

```
├── prisma/                # Database schema and migrations
├── src/
│   ├── client/            # Frontend React application
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── routes/        # Application routes
│   │   └── trpc.ts        # tRPC client setup
│   └── server/            # Backend Node.js application
│       ├── routers/       # tRPC routers
│       ├── auth.ts        # Authentication logic
│       ├── minio.ts       # Minio client setup
│       └── index.ts       # Server entry point
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Project dependencies and scripts
```

## Default Admin Credentials

- Email: admin@example.com
- Password: admin123

*Note: Change these credentials in production!*