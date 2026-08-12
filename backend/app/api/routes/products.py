from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductListResponse, ProductOut, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    category: int | None = Query(default=None),
    status: str | None = Query(default=None),
    stockStatus: str | None = Query(default=None),
    sortBy: str | None = Query(default="created_at"),
    sortOrder: str | None = Query(default="desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ProductService(db).list_products(search, category, status, stockStatus, page, limit, sortBy, sortOrder)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ProductService(db).get_product(product_id)


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    return ProductService(db).create_product(payload)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    return ProductService(db).update_product(product_id, payload)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin())):
    ProductService(db).delete_product(product_id)