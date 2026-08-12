import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.category import CategoryStatus


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    status: CategoryStatus = CategoryStatus.ACTIVE

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Category name cannot be blank")
        return v


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2000)
    status: CategoryStatus | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Category name cannot be blank")
        return v.strip() if v else v


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    status: CategoryStatus
    product_count: int = 0
    created_at: str
    updated_at: str


class CategoryListResponse(BaseModel):
    data: list[CategoryOut]
    page: int
    limit: int
    total: int
    totalPages: int


SKU_PATTERN = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,30}[A-Za-z0-9])?$")


def validate_sku_format(sku: str) -> str:
    sku = sku.strip().upper()
    if not SKU_PATTERN.match(sku):
        raise ValueError(
            "SKU must be 3-32 alphanumeric characters (hyphens/underscores allowed "
            "in the middle only), e.g. 'ELEC-LAPTOP-001'"
        )
    return sku