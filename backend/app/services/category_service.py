import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryListResponse, CategoryOut, CategoryUpdate

MAX_LIMIT = 100


def _to_out(category: Category, product_count: int) -> CategoryOut:
    return CategoryOut(
        id=category.id,
        name=category.name,
        description=category.description,
        status=category.status,
        product_count=product_count,
        created_at=category.created_at.isoformat(),
        updated_at=category.updated_at.isoformat(),
    )


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def list_categories(self, search, status, page, limit, sort_by, sort_order) -> CategoryListResponse:
        page = max(page, 1)
        limit = min(max(limit, 1), MAX_LIMIT)

        items, total = self.repo.list_categories(search, status, page, limit, sort_by, sort_order)
        counts = self.repo.product_counts_by_category()
        total_pages = max(math.ceil(total / limit), 1) if total else 0

        return CategoryListResponse(
            data=[_to_out(c, counts.get(c.id, 0)) for c in items],
            page=page, limit=limit, total=total, totalPages=total_pages,
        )

    def get_category(self, category_id: int) -> CategoryOut:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
        return _to_out(category, self.repo.product_count(category_id))

    def create_category(self, payload: CategoryCreate) -> CategoryOut:
        if self.repo.get_by_name(payload.name):
            raise HTTPException(status.HTTP_409_CONFLICT, f"A category named '{payload.name}' already exists")

        category = Category(name=payload.name, description=payload.description, status=payload.status)
        category = self.repo.create(category)
        return _to_out(category, 0)

    def update_category(self, category_id: int, payload: CategoryUpdate) -> CategoryOut:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")

        if payload.name and payload.name.lower() != category.name.lower():
            existing = self.repo.get_by_name(payload.name)
            if existing and existing.id != category_id:
                raise HTTPException(status.HTTP_409_CONFLICT, f"A category named '{payload.name}' already exists")
            category.name = payload.name

        if payload.description is not None:
            category.description = payload.description
        if payload.status is not None:
            category.status = payload.status

        category = self.repo.save(category)
        return _to_out(category, self.repo.product_count(category_id))

    def delete_category(self, category_id: int) -> None:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")

        count = self.repo.product_count(category_id)
        if count > 0:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Cannot delete '{category.name}' - {count} product(s) are still assigned to "
                "it. Reassign or delete those products first.",
            )
        self.repo.delete(category)