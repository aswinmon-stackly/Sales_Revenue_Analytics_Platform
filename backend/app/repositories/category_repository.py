from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product

SORTABLE_FIELDS = {
    "name": Category.name,
    "created_at": Category.created_at,
    "status": Category.status,
}


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, category_id: int) -> Category | None:
        return self.db.get(Category, category_id)

    def get_by_name(self, name: str) -> Category | None:
        return self.db.query(Category).filter(func.lower(Category.name) == name.lower()).first()

    def product_count(self, category_id: int) -> int:
        return (
            self.db.query(func.count(Product.id))
            .filter(Product.category_id == category_id)
            .scalar()
            or 0
        )

    def product_counts_by_category(self) -> dict[int, int]:
        rows = (
            self.db.query(Product.category_id, func.count(Product.id))
            .group_by(Product.category_id)
            .all()
        )
        return {category_id: count for category_id, count in rows}

    def list_categories(self, search, status, page, limit, sort_by, sort_order):
        query = self.db.query(Category)

        if search:
            like = f"%{search.strip()}%"
            query = query.filter(
                or_(Category.name.ilike(like), Category.description.ilike(like))
            )
        if status and status != "All":
            query = query.filter(Category.status == status)

        total = query.count()

        sort_column = SORTABLE_FIELDS.get(sort_by or "name", Category.name)
        query = query.order_by(
            sort_column.desc() if (sort_order or "asc").lower() == "desc" else sort_column.asc()
        )

        items = query.offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_all(self) -> list[Category]:
        return self.db.query(Category).order_by(Category.name.asc()).all()

    def create(self, category: Category) -> Category:
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def save(self, category: Category) -> Category:
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()