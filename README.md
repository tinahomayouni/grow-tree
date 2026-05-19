# Grow

A calm backend-only plant growth simulator built with NestJS. No combat, no failure state — just sunlight, water, fertilizer, and time.

## Stack

- NestJS + TypeScript
- PostgreSQL + TypeORM
- `@nestjs/schedule` (growth cycle every minute)
- `class-validator` + `ConfigModule`

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (no Docker required)

### Start PostgreSQL (macOS + Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

Add `psql` to your PATH (optional):

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Create the database (if not exists):

```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "CREATE DATABASE grow;"
```

Copy environment variables:

```bash
cp .env.example .env
```

Edit `.env` if your Postgres credentials differ.

## Run

```bash
npm install
npm run start:dev
```

API base: `http://localhost:3000`

## Demo UI (EJS)

Open **[http://localhost:3000/](http://localhost:3000/)** for a simple live dashboard:

- Plant stats, sun dial, water & fertilizer
- Buttons to water, align sun, collect fertilizer
- Growth checklist (what’s needed for the next tick)
- Auto-refresh every 20 seconds

## API docs (Swagger)

| URL | Description |
|-----|-------------|
| [http://localhost:3000/api](http://localhost:3000/api) | Swagger UI |
| [http://localhost:3000/docs](http://localhost:3000/docs) | Swagger in EJS |
| [http://localhost:3000/api-json](http://localhost:3000/api-json) | OpenAPI JSON |

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/plant/create` | Plant your seed (`{ "name": "Oak" }` optional) |
| `GET` | `/plant/status` | Plant + growth resources |
| `POST` | `/plant/water` | Water the plant (`{ "amount": 25 }` optional) |
| `POST` | `/plant/align-sun` | Align sunlight (`{ "angle": 90 }`) |
| `POST` | `/plant/collect-fertilizer` | Collect sheep fertilizer |
| `GET` | `/world/status` | Day/night, sun, season, resources |

## Game loop

Every **minute**, the scheduler:

1. Advances the sun and day/night cycle
2. Refills the water tank (hourly)
3. Spawns/decays fertilizer (sheep visits)
4. Applies growth when sunlight, water, and fertilizer are available

**Growth formula:** `base × sunlight × water × fertilizer × season`

- **Sun:** perfect alignment → ×2, partial → ×1, wrong → no growth
- **Water:** tank refills hourly; overwatering reduces efficiency
- **Fertilizer:** sheep drop fertilizer; collecting activates a temporary boost

## Project structure

```
src/
  plant/        # Plant entity, API, growth logic
  world/        # World simulation + /world/status
  sunlight/     # Sun angle & alignment
  water/        # Tank refill & hydration
  fertilizer/   # Sheep events & decay
  scheduler/    # Cron growth engine
  common/       # Constants & utilities
```

## Quick start session

```bash
curl -X POST http://localhost:3000/plant/create -H "Content-Type: application/json" -d '{"name":"Willow"}'
curl http://localhost:3000/plant/status
curl -X POST http://localhost:3000/plant/align-sun -H "Content-Type: application/json" -d '{"angle":90}'
curl -X POST http://localhost:3000/plant/water -H "Content-Type: application/json" -d '{}'
curl http://localhost:3000/world/status
```
# grow-tree
