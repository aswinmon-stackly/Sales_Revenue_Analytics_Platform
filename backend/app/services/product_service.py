import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductListResponse, ProductOut, ProductUpdate

MAX_LIMIT = 100
LOW_STOCK_THRESHOLD = 10


def stock_status_for(quantity: int) -> str:
    if quantity <= 0:
        return "Out of Stock"
    if quantity <= LOW_STOCK_THRESHOLD:
        return "Low Stock"
    return "In Stock"


def _to_out(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id, name=product.name, sku=product.sku, description=product.description,
        category_id=product.category_id, category_name=product.category.name if product.category else "",
        price=float(product.price), cost=float(product.cost), stock_quantity=product.stock_quantity,
        stock_status=stock_status_for(product.stock_quantity), status=product.status,
        created_at=product.created_at.isoformat(), updated_at=product.updated_at.isoformat(),
    )


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)
        self.category_repo = CategoryRepository(db)

    def list_products(self, search, category_id, status, stock_status, page, limit, sort_by, sort_order) -> ProductListResponse:
        page = max(page, 1)
        limit = min(max(limit, 1), MAX_LIMIT)

        items, total = self.repo.list_products(search, category_id, status, stock_status, page, limit, sort_by, sort_order)
        total_pages = max(math.ceil(total / limit), 1) if total else 0

        return ProductListResponse(
            data=[_to_out(p) for p in items], page=page, limit=limit, total=total, totalPages=total_pages,
        )

    def get_product(self, product_id: int) -> ProductOut:
        product = self.repo.get_by_id(product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return _to_out(product)

    def _assert_category_exists(self, category_id: int) -> None:
        if self.category_repo.get_by_id(category_id) is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Category {category_id} does not exist")

    def create_product(self, payload: ProductCreate) -> ProductOut:
        if self.repo.get_by_sku(payload.sku):
            raise HTTPException(status.HTTP_409_CONFLICT, f"SKU '{payload.sku}' is already in use")
        self._assert_category_exists(payload.category_id)

        product = Product(
            name=payload.name, sku=payload.sku, description=payload.description,
            category_id=payload.category_id, price=payload.price, cost=payload.cost,
            stock_quantity=payload.stock_quantity, status=payload.status,
        )
        product = self.repo.create(product)
        return _to_out(self.repo.get_by_id(product.id))

    def update_product(self, product_id: int, payload: ProductUpdate) -> ProductOut:
        product = self.repo.get_by_id(product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")

        if payload.sku and payload.sku.upper() != product.sku.upper():
            existing = self.repo.get_by_sku(payload.sku)
            if existing and existing.id != product_id:
                raise HTTPException(status.HTTP_409_CONFLICT, f"SKU '{payload.sku}' is already in use")
            product.sku = payload.sku

        if payload.category_id is not None and payload.category_id != product.category_id:
            self._assert_category_exists(payload.category_id)
            product.category_id = payload.category_id

        for field in ("name", "description", "price", "cost", "stock_quantity", "status"):
            value = getattr(payload, field)
            if value is not None:
                setattr(product, field, value)

        product = self.repo.save(product)
        return _to_out(self.repo.get_by_id(product.id))

    def delete_product(self, product_id: int) -> None:
        product = self.repo.get_by_id(product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        self.repo.delete(product)