# Portal de Projetos de Estudantes Universitarios

Express API backed by PostgreSQL with JWT-based authentication. Every user has
their GitHub repository links stored in the database; auth is enforced via
middleware on write endpoints.

## Run with Docker

```bash
docker compose up --build
```

This boots:

- `db`: PostgreSQL 16 on port `5432`
- `app`: the API on port `3000`

On first boot the app applies the schema (`db/schema.sql`) and seeds two real
users with all of their public repositories:

| username   | name              | github profile                  |
| ---------- | ----------------- | ------------------------------- |
| `marcos`   | Marcos Gomes      | https://github.com/Maky189      |
| `leonardo` | Leonardo Dionisio | https://github.com/Leoxznn      |

Both seeded users share the password defined by `SEED_PASSWORD`
(default: `password123`). Change it in production.

## Environment

See `.env.example`. The compose file already wires the variables for local use.

## API

Public:

- `GET  /`                  — endpoint summary
- `GET  /projects`          — list all projects with author info
- `GET  /projects/:id`      — get one project
- `GET  /users`             — list users
- `GET  /users/:id/projects` — list a user's projects
- `POST /auth/register`     — `{ username, name, email, password, githubProfile? }`
- `POST /auth/login`        — `{ username, password }` → `{ token }`

Auth required (`Authorization: Bearer <token>`):

- `GET    /auth/me`
- `POST   /projects`        — `{ title, description?, githubUrl }`
- `PUT    /projects/:id`    — only the owner can update
- `DELETE /projects/:id`    — only the owner can delete

Authentication is handled by [middleware/auth.js](middleware/auth.js), which
validates the JWT (Bearer header or `token` cookie) and attaches `req.user`.

## Quick try

```bash
# login
curl -s -X POST http://localhost:3000/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"marcos","password":"password123"}'

# list all projects (public)
curl -s http://localhost:3000/projects | jq '.[0]'
```

## Layout

```
.
├── Dockerfile
├── docker-compose.yml
├── app.js
├── bin/www              # boot + DB wait + seed + listen
├── db.js                # pg pool
├── db/
│   ├── schema.sql
│   └── seed.js
├── middleware/
│   └── auth.js          # JWT middleware
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── projects.js
│   └── index.js
└── public/
```
