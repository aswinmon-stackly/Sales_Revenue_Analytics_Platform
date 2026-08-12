from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.routes import auth, customers, dashboard, reports, sales, settings, users , categories,products
from app.core.config import settings as app_settings
from app.database.base import Base
from app.database.session import engine

# Import every model module so Base.metadata is aware of all tables before
# create_all runs below - each seed script only imports the models it
# directly needs, so this is what guarantees every table exists even if
# only one seed script has been run (or none at all).
from app.models import sale, user, customer, user_settings, category, product  # noqa: F401

app = FastAPI(title="Enterprise Sales & Revenue Analytics Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    """
    Dev-friendly convenience: creates any tables that don't exist yet.
    This project doesn't have Alembic migrations wired up (it's in
    requirements.txt but unused), so this is what keeps a fresh DB from
    404/500ing on first request. Existing tables/data are left untouched.
    For production, replace this with real Alembic migrations.
    """
    Base.metadata.create_all(bind=engine)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Normalize 422 payloads to a consistent, frontend-friendly shape
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Invalid request data", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces / internals to the client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(customers.router)
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(categories.router)
app.include_router(products.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
