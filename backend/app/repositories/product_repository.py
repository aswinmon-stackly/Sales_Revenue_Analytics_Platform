from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product

SORTABLE_FIELDS = {
    "name": Product.name,
    "price": Product.price,
    "stock_quantity": Product.stock_quantity,
    "created_at": Product.created_at,
}


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self):
        return self.db.query(Product).options(joinedload(Product.category))

    def get_by_id(self, product_id: int) -> Product | None:
        return self._base_query().filter(Product.id == product_id).first()

    def get_by_sku(self, sku: str) -> Product | None:
        return self.db.query(Product).filter(func.upper(Product.sku) == sku.upper()).first()

    def list_products(self, search, category_id, status, stock_status, page, limit, sort_by, sort_order):
        query = self._base_query()

        if search:
            like = f"%{search.strip()}%"
            query = query.filter(or_(Product.name.ilike(like), Product.sku.ilike(like)))
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
        if status and status != "All":
            query = query.filter(Product.status == status)

        if stock_status and stock_status != "All":
            if stock_status == "Out of Stock":
                query = query.filter(Product.stock_quantity <= 0)
            elif stock_status == "Low Stock":
                query = query.filter(Product.stock_quantity > 0, Product.stock_quantity <= 10)
            elif stock_status == "In Stock":
                query = query.filter(Product.stock_quantity > 10)

        total = query.count()

        sort_column = SORTABLE_FIELDS.get(sort_by or "created_at", Product.created_at)
        query = query.order_by(
            sort_column.desc() if (sort_order or "desc").lower() == "desc" else sort_column.asc()
        )

        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, product: Product) -> Product:
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def save(self, product: Product) -> Product:
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()