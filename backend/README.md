# Backend — Enterprise Sales & Revenue Analytics Platform

FastAPI + PostgreSQL + SQLAlchemy + JWT authentication.

## Structure

```
app/
├── api/routes/     # HTTP endpoints (auth.py)
├── core/           # config, security (hashing/JWT), RBAC deps
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic request/response models
├── services/       # business logic (auth_service.py)
├── repositories/   # DB query layer (user_repository.py)
├── database/       # engine/session setup
└── main.py         # app entrypoint, CORS, error handlers
seed.py             # creates tables + seeds 3 test users
requirements.txt
.env.example
```

## Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE sales_analytics;
   ```

2. Create a virtualenv and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Copy the env template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   Set `DATABASE_URL` to your Postgres connection string and `JWT_SECRET_KEY`
   to a long random string (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`).
   **Never commit `.env`.**

4. Create the table and seed test users:
   ```bash
   python seed.py
   ```

5. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```
   Docs available at `http://localhost:8000/docs`.

## Test users (local dev only)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| ADMIN   | admin@example.com   | Admin@123   |
| ANALYST | analyst@example.com | Analyst@123 |
| VIEWER  | viewer@example.com  | Viewer@123  |

## Endpoints

- `POST /api/auth/login` — `{email, password}` → `{access_token, token_type, user}`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`, returns the current user
- `GET /health` — liveness check

## Auth flow

1. `/login` verifies the password against the bcrypt hash in `password_hash`,
   then signs a JWT (`sub` = user id, `role` claim, `exp`).
2. Protected routes depend on `get_current_user` (`app/core/deps.py`), which
   decodes the token, reloads the user from the DB, and 401s on any missing/
   invalid/expired token or inactive/unknown user.
3. Role checks use `require_roles(...)` (with `require_admin()` /
   `require_analyst()` convenience wrappers) — add
   `dependencies=[Depends(require_admin())]` to any route that needs it.
   Authenticated-but-wrong-role requests get 403, not 401.

## Notes on design decisions

- Password/DB errors on login are intentionally indistinguishable ("Invalid
  email or password") to avoid leaking which emails are registered.
- A global exception handler returns a generic 500 body so internals/stack
  traces never reach the client.
- Repository layer isolates all raw DB queries from business logic, so
  `AuthService` never touches SQLAlchemy directly.
