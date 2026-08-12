<!-- # Enterprise Sales & Revenue Analytics Platform

A full-stack Sales & Revenue Analytics platform with secure JWT authentication, role-based access control, sales analytics, customer management, reports, and user settings.

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
│       └── types/
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
* Role-Based Access Control
* PostgreSQL database
* Sales and revenue analytics
* Sales search and filtering
* Server-side pagination
* Customer management
* Customer search and filtering
* Customer summary analytics
* Reports and business analytics
* User settings management
* Centralized Axios API configuration
* API error handling
* Environment-based configuration

## Roles

| Role    | Access                    |
| ------- | ------------------------- |
| ADMIN   | Full access               |
| ANALYST | Analytics & business data |
| VIEWER  | Read-only access          |

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
pip install pydantic[email]
uvicorn app.main:app --reload
```

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
```

## API Endpoints

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/api/auth/login`        | User login                    |
| GET    | `/api/auth/me`           | Current authenticated user    |
| GET    | `/api/sales`             | Sales data with filters       |
| GET    | `/api/customers`         | Customer data with pagination |
| GET    | `/api/customers/summary` | Customer summary              |
| GET    | `/api/reports/summary`   | Business analytics summary    |
| GET    | `/api/settings`          | User settings                 |
| PUT    | `/api/settings`          | Update user settings          |
| GET    | `/health`                | API health check              |

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

## License

This project is developed for enterprise sales and revenue analytics. -->


# Enterprise Sales & Revenue Analytics Platform

A full-stack Sales & Revenue Analytics platform with secure JWT authentication, role-based access control, sales analytics, customer management, product & category catalog management, reports, and user settings.

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
│       └── types/
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
* Role-Based Access Control
* PostgreSQL database
* Sales and revenue analytics
* Sales search and filtering
* Server-side pagination
* Customer management
* Customer search and filtering
* Customer summary analytics
* Product catalog management
* Product search, category, status, and stock filtering
* Category management with product-count tracking
* Reports and business analytics
* User settings management
* Centralized Axios API configuration
* API error handling
* Environment-based configuration

## Roles

| Role    | Access                    |
| ------- | ------------------------- |
| ADMIN   | Full access               |
| ANALYST | Analytics & business data |
| VIEWER  | Read-only access          |

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
pip install pydantic[email]
uvicorn app.main:app --reload
```

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
```

## API Endpoints

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| POST   | `/api/auth/login`        | User login                                |
| GET    | `/api/auth/me`           | Current authenticated user                |
| GET    | `/api/sales`             | Sales data with filters                   |
| GET    | `/api/customers`         | Customer data with pagination             |
| GET    | `/api/customers/summary` | Customer summary                          |
| GET    | `/api/products`          | Product data with filters and pagination  |
| POST   | `/api/products`          | Create product                            |
| PUT    | `/api/products/{id}`     | Update product                            |
| DELETE | `/api/products/{id}`     | Delete product                            |
| GET    | `/api/categories`        | Category data with filters and pagination |
| POST   | `/api/categories`        | Create category                           |
| PUT    | `/api/categories/{id}`   | Update category                           |
| DELETE | `/api/categories/{id}`   | Delete category                           |
| GET    | `/api/reports/summary`   | Business analytics summary                |
| GET    | `/api/settings`          | User settings                             |
| PUT    | `/api/settings`          | Update user settings                      |
| GET    | `/health`                | API health check                          |

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

## License

This project is developed for enterprise sales and revenue analytics.