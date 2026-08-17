
# Enterprise Sales & Revenue Analytics Platform

A full-stack Sales & Revenue Analytics platform with secure JWT authentication, role-based access control, sales analytics, a dashboard, customer management, product & category catalog management, reports, and user settings.

## Tech Stack

### Frontend

* React
* Vite
* TypeScript
* React Router
* Axios
* Material UI

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Password Hashing

### Database

* PostgreSQL
* Database: sales_analytics

## Project Structure

```text
project/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── context/
│       ├── hooks/
│       ├── routes/
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── database/
│   │   └── main.py
│   ├── seed.py
│   ├── seed_sales.py
│   ├── seed_customers.py
│   ├── seed_products.py
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

## Features

* JWT-based authentication
* Secure password hashing
* Centralized authentication state
* Protected frontend routes
* Role-Based Access Control, enforced at the API level
* PostgreSQL database
* Dashboard with revenue/orders/customer/growth summary, monthly revenue chart, monthly target, and recent orders
* Sales transactions with search, filtering, sorting, and server-side pagination
* Customer management: full CRUD, segmentation (Enterprise/Premium/Standard/New/At Risk), and activate/deactivate (soft status change, never a hard delete)
* Customer details page (contact, company, location, account status; sales history reserved for a later task)
* Product catalog management: full CRUD, category assignment, stock-status tracking (In Stock/Low Stock/Out of Stock)
* Category management with product-count tracking and delete protection when products are still assigned
* Reports and business analytics (revenue growth, order status breakdown, revenue by category, top customers)
* User settings (preferences, notifications) and self-service profile updates
* Centralized Axios API configuration - no direct Axios calls inside components
* Consistent loading/empty/error/unauthorized/forbidden states across pages
* Environment-based configuration

## Roles

RBAC is enforced on the backend (never trust the frontend alone) via a `require_roles()` dependency; the frontend also hides actions a role can't perform.

| Role    | Access                                                                 |
| ------- | ----------------------------------------------------------------------- |
| ADMIN   | Full access - all reads plus all creates/edits/deletes/status changes    |
| ANALYST | Full read access to analytics & business data (Sales, Dashboard, Customers, Products, Categories, Reports); no write access |
| VIEWER  | Read-only access to Dashboard, Sales, Customers, Products, Categories, and their own Settings; no access to Reports, no write access anywhere |

See the per-endpoint table below for exactly which roles can call which routes.

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python seed_sales.py
python seed_customers.py
python seed_products.py
uvicorn app.main:app --reload
```

`email-validator` (required for customer email validation) is already listed
in `requirements.txt` - no separate `pip install pydantic[email]` step is
needed if you're installing from the current `requirements.txt`.

Tables are also auto-created on API startup, so `uvicorn` alone will stand
up a fresh schema even before you run any seed script - the seed scripts
add data, not schema.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend

```env
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/sales_analytics
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION=30

# Placeholder monthly revenue target for the Dashboard's target gauge,
# until a real per-month targets table exists
MONTHLY_REVENUE_TARGET=650000
```

## API Endpoints

All endpoints below except `/api/auth/login` and `/health` require a valid JWT (`Authorization: Bearer <token>`).

### Auth

| Method | Endpoint           | Description                 | Role required   |
| ------ | ------------------- | ---------------------------- | ---------------- |
| POST   | `/api/auth/login`  | User login, returns a JWT   | none (public)    |
| GET    | `/api/auth/me`     | Current authenticated user  | any authenticated |
| PUT    | `/api/users/me`    | Update own name/email       | any authenticated |

### Dashboard

| Method | Endpoint                | Description                                   | Role required      |
| ------ | ------------------------ | ----------------------------------------------- | -------------------- |
| GET    | `/api/dashboard/summary` | Revenue/orders/customers/growth cards, 12-month revenue chart, monthly target, recent orders | any authenticated |

### Sales

| Method | Endpoint      | Description                                                        | Role required      |
| ------ | -------------- | --------------------------------------------------------------------- | -------------------- |
| GET    | `/api/sales`  | Paginated/filterable sales list (`search`, `status`, `category`, `page`, `page_size`) | any authenticated |

### Customers

| Method | Endpoint                       | Description                                   | Role required      |
| ------ | -------------------------------- | ----------------------------------------------- | -------------------- |
| GET    | `/api/customers`                | Paginated/filterable/sortable customer list (`search`, `segment`, `region`, `status`, `country`, `page`, `limit`, `sortBy`, `sortOrder`) | any authenticated |
| GET    | `/api/customers/{id}`           | Single customer detail                        | any authenticated |
| POST   | `/api/customers`                | Create customer                               | ADMIN only |
| PUT    | `/api/customers/{id}`           | Update customer                               | ADMIN only |
| PATCH  | `/api/customers/{id}/status`    | Activate/deactivate (soft status change only) | ADMIN only |

### Products

| Method | Endpoint                | Description                                   | Role required      |
| ------ | ------------------------- | ----------------------------------------------- | -------------------- |
| GET    | `/api/products`          | Paginated/filterable/sortable product list (`search`, `category`, `status`, `stockStatus`, `page`, `limit`, `sortBy`, `sortOrder`) | any authenticated |
| GET    | `/api/products/{id}`     | Single product detail                          | any authenticated |
| POST   | `/api/products`          | Create product                                 | ADMIN only |
| PUT    | `/api/products/{id}`     | Update product                                 | ADMIN only |
| DELETE | `/api/products/{id}`     | Delete product                                 | ADMIN only |

### Categories

| Method | Endpoint                  | Description                                        | Role required      |
| ------ | --------------------------- | ----------------------------------------------------- | -------------------- |
| GET    | `/api/categories`          | Paginated/filterable/sortable category list, with product counts | any authenticated |
| GET    | `/api/categories/{id}`     | Single category detail                             | any authenticated |
| POST   | `/api/categories`          | Create category                                    | ADMIN only |
| PUT    | `/api/categories/{id}`     | Update category                                    | ADMIN only |
| DELETE | `/api/categories/{id}`     | Delete category (blocked if products are still assigned) | ADMIN only |

### Reports

| Method | Endpoint               | Description                                                                   | Role required        |
| ------ | ------------------------ | --------------------------------------------------------------------------------- | ---------------------- |
| GET    | `/api/reports/summary` | Revenue growth, order status breakdown, revenue by category, top 5 customers | ADMIN, ANALYST only |

### Settings

| Method | Endpoint         | Description                          | Role required      |
| ------ | ------------------ | --------------------------------------- | -------------------- |
| GET    | `/api/settings`   | Own display/notification preferences | any authenticated |
| PUT    | `/api/settings`   | Update own preferences               | any authenticated |

### Health

| Method | Endpoint  | Description        |
| ------ | ----------- | --------------------- |
| GET    | `/health`  | API health check     |

## Test Users

For local development only:

```text
ADMIN    admin@example.com
ANALYST  analyst@example.com
VIEWER   viewer@example.com
```

## Authentication Flow

```text
Login
  ↓
Validate Credentials
  ↓
Generate JWT
  ↓
Store Auth State
  ↓
Protected Routes
  ↓
Role-Based Authorization
  ↓
Dashboard
```

## Data Model Notes

* `Sale.customer_name` (Sales/Dashboard/Reports) and the `customers` table
  (Customer Management) are intentionally independent right now - Sales has
  no `customer_id` foreign key yet. Linking them, and adding real Orders /
  Order Items tables under `Customer`, is tracked as a follow-up rather than
  built speculatively ahead of need.
* `Product.category_id` is a real foreign key to `categories`
  (`ON DELETE RESTRICT`) - a category can't be deleted while products still
  reference it.
* Customers are never hard-deleted - `PATCH /api/customers/{id}/status` is
  the only way to deactivate one, so the row stays a valid reference point
  for future sales/order history.

## License

This project is developed for enterprise sales and revenue analytics.