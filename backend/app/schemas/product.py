from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.product import ProductStatus
from app.schemas.category import validate_sku_format


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=3, max_length=32)
    description: str | None = Field(default=None, max_length=4000)
    category_id: int
    price: float = Field(..., gt=0, description="Selling price, must be greater than 0")
    cost: float = Field(..., ge=0, description="Unit cost, must be 0 or greater")
    stock_quantity: int = Field(..., ge=0)
    status: ProductStatus = ProductStatus.ACTIVE

    @field_validator("sku")
    @classmethod
    def sku_format(cls, v: str) -> str:
        return validate_sku_format(v)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Product name cannot be blank")
        return v

    @field_validator("cost")
    @classmethod
    def cost_not_above_price(cls, v: float, info) -> float:
        price = info.data.get("price")
        if price is not None and v > price:
            raise ValueError("Cost should not exceed the selling price")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=3, max_length=32)
    description: str | None = Field(default=None, max_length=4000)
    category_id: int | None = None
    price: float | None = Field(default=None, gt=0)
    cost: float | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    status: ProductStatus | None = None

    @field_validator("sku")
    @classmethod
    def sku_format(cls, v: str | None) -> str | None:
        return validate_sku_format(v) if v is not None else v

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Product name cannot be blank")
        return v.strip() if v else v


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    description: str | None
    category_id: int
    category_name: str
    price: float
    cost: float
    stock_quantity: int
    stock_status: str
    status: ProductStatus
    created_at: str
    updated_at: str


class ProductListResponse(BaseModel):
    data: list[ProductOut]
    page: int
    limit: int
    total: int
    totalPages: int