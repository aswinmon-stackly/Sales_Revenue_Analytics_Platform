# Backend — Enterprise Sales & Revenue Analytics Platform

FastAPI + PostgreSQL + SQLAlchemy + JWT authentication.

## Structure

```
app/
├── api/routes/     # HTTP endpoints (auth.py, users.py, sales.py, dashboard.py, customers.py, reports.py, settings.py)
├── core/           # config, security (hashing/JWT), RBAC deps
├── models/         # SQLAlchemy ORM models (user.py, sale.py, customer.py, user_settings.py)
├── schemas/        # Pydantic request/response models
├── services/       # business logic (auth_service.py, sale_service.py, dashboard_service.py, customer_service.py, report_service.py, settings_service.py)
├── repositories/   # DB query layer (user_repository.py, sale_repository.py, customer_repository.py, settings_repository.py)
├── database/       # engine/session setup
└── main.py         # app entrypoint, CORS, error handlers, table auto-create on startup
seed.py             # creates users table + seeds 3 test users
seed_sales.py       # creates sales table + seeds ~12 months of sales data
seed_customers.py   # creates customers table + seeds one contact per company (run after seed_sales.py)
requirements.txt
.env.example
```

All tables (users, sales, customers, user_settings) are also auto-created
on API startup (see `create_tables()` in `main.py`), since this project
doesn't have Alembic migrations wired up. The seed scripts are for seed
*data*, not schema - the schema exists either way once the API has started
once.

## API overview

All endpoints below require a valid JWT (`Authorization: Bearer <token>`),
issued by `/api/auth/login`. All are read-only except `PUT /api/settings`
and `PUT /api/users/me`, which only ever modify the calling user's own row.

| Endpoint | Role required | Notes |
|---|---|---|
| `GET /api/sales` | any authenticated user | paginated/filterable sales list |
| `GET /api/dashboard/summary` | any authenticated user | all Dashboard widgets in one payload |
| `GET /api/customers`, `GET /api/customers/summary` | ADMIN, ANALYST | business/customer data - see RBAC note below |
| `GET /api/reports/summary` | ADMIN, ANALYST | business/analytics data - see RBAC note below |
| `GET /api/settings`, `PUT /api/settings` | any authenticated user | own display/notification preferences |
| `PUT /api/users/me` | any authenticated user | own name/email only - not password or role |

- `GET /api/sales` - query params: `search`, `status` (`All` or a status
  value), `category` (`All` or a category), `page`, `page_size`. Returns
  `items` plus `total`, `total_pages`, and aggregate `total_revenue` /
  `completed_orders` for the *current filter*.
- `GET /api/dashboard/summary` - revenue/orders/customers/growth cards
  (each with a month-over-month `_change_pct`), a 12-month
  `monthly_revenue` series, a `monthly_target` gauge, and the 5 most
  recent `recent_orders`.
- `GET /api/customers` / `/summary` - customer list (paginated/filterable
  by `search`, `status`) plus card totals over the whole customer base.
- `GET /api/reports/summary` - current vs previous month revenue/growth,
  order status breakdown, revenue-by-category breakdown, and top 5
  customers by spend.
- `GET/PUT /api/settings` - the signed-in user's own preferences
  (page size, sort defaults, currency, notification toggles). Created
  with defaults on first `GET`.

### RBAC policy

Uses the existing `role` claim / `require_roles()` dependency
(`app/core/deps.py`) - no changes to login or token issuance.

- **ADMIN** — full access to every endpoint above.
- **ANALYST** — same read access as ADMIN (Sales, Dashboard, Customers,
  Reports, own Settings). No admin-only write endpoints exist yet, so
  ADMIN and ANALYST are currently equivalent in practice.
- **VIEWER** — read-only access to Dashboard and Sales, plus their own
  Settings/profile. Customers and Reports are treated as deeper business
  data and return `403 Forbidden` for VIEWER (handled gracefully in the
  UI - see frontend notes).

This is a judgment call, not a fixed spec - adjust which routes use
`require_analyst()` vs `get_current_user` in `app/api/routes/*.py` if you
want different boundaries (e.g. if VIEWER should see Customers too).

### Data model notes

- Customers are a **separate table** (`app/models/customer.py`) with a
  real contact `email`, joined to `Sale.customer_name` **by company name**
  (there's no `customer_id` foreign key on `Sale` yet). If a company name
  ever differs by a single character between the two tables, that
  customer's order count/spend will read as zero - the fix is a real FK,
  tracked as a follow-up, not built here.
- There is no `targets` table. `monthly_target.target_amount` on the
  Dashboard comes from the `MONTHLY_REVENUE_TARGET` setting in `.env` (one
  global number for all months). Per-month/per-team targets would need a
  small `sales_targets` table - flagged, not built.

### Seeding data

```bash
python seed.py             # users (3 test accounts, one per role)
python seed_sales.py       # ~12 months of randomized sales transactions
python seed_customers.py   # one contact per company - run after seed_sales.py
```

All are safe to re-run - each no-ops if its table already has rows.

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
