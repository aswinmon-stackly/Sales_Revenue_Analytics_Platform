# Backend — Enterprise Sales & Revenue Analytics Platform

FastAPI + PostgreSQL + SQLAlchemy + JWT authentication.

## Structure

```
app/
├── api/routes/     # HTTP endpoints (auth.py, sales.py, dashboard.py)
├── core/           # config, security (hashing/JWT), RBAC deps
├── models/         # SQLAlchemy ORM models (user.py, sale.py)
├── schemas/        # Pydantic request/response models
├── services/       # business logic (auth_service.py, sale_service.py, dashboard_service.py)
├── repositories/   # DB query layer (user_repository.py, sale_repository.py)
├── database/       # engine/session setup
└── main.py         # app entrypoint, CORS, error handlers
seed.py             # creates users table + seeds 3 test users
seed_sales.py        # creates sales table + seeds ~12 months of sales data
requirements.txt
.env.example
```

## Sales & Dashboard APIs

All endpoints below require a valid JWT (`Authorization: Bearer <token>`),
issued by `/api/auth/login`, and are read-only.

- `GET /api/sales` - paginated, filterable sales list. Query params:
  `search`, `status` (`All` or a status value), `category` (`All` or a
  category), `page`, `page_size`. Returns `items` plus `total`,
  `total_pages`, and aggregate `total_revenue` / `completed_orders` for the
  *current filter*, so the Sales page needs a single request per view.
- `GET /api/dashboard/summary` - one aggregate payload for every Dashboard
  widget: revenue/orders/customers/growth cards (each with a month-over-
  month `_change_pct`), a 12-month `monthly_revenue` series, a
  `monthly_target` gauge, and the 5 most recent `recent_orders`.

Both read from the same `sales` table (see `app/models/sale.py`), so there
is one data path to maintain, not one per page.

### Seeding sales data

```bash
python seed_sales.py
```

Creates the `sales` table (if missing) and seeds ~12 months of randomized
transactions. Safe to re-run - it no-ops if the table already has rows.

### Note on the Monthly Target figure

There is no `targets` table yet. `monthly_target.target_amount` currently
comes from the `MONTHLY_REVENUE_TARGET` setting in `.env` (a single
global number for all months). If per-month or per-team targets are
needed, that requires a small `sales_targets` table and a matching update
to `dashboard_service.py` - flagged as a follow-up, not built here since
it wasn't part of the current mock data or requirements.

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
