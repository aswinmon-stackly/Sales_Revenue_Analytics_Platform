# from pydantic import BaseModel, ConfigDict

# from app.models.customer import CustomerStatus


# class CustomerOut(BaseModel):
#     model_config = ConfigDict(from_attributes=True)

#     id: str  # e.g. "CUS-1001"
#     name: str
#     email: str
#     company: str
#     orders: int
#     total_spent: float
#     status: CustomerStatus
#     joined_date: str  # pre-formatted, e.g. "02 Jan 2026"


# class CustomerListResponse(BaseModel):
#     items: list[CustomerOut]
#     total: int
#     page: int
#     page_size: int
#     total_pages: int


# class CustomerSummary(BaseModel):
#     total_customers: int
#     active_customers: int
#     total_revenue: float






import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.customer import CustomerSegment, CustomerStatus

PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def validate_phone(phone: str) -> str:
    phone = phone.strip()
    if not PHONE_PATTERN.match(phone):
        raise ValueError("Phone must be 7-20 digits, optionally with +, spaces, hyphens, or parentheses")
    return phone


class CustomerBase(BaseModel):
    customer_code: str = Field(..., min_length=2, max_length=32)
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str
    company: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=50)
    segment: CustomerSegment = CustomerSegment.NEW
    status: CustomerStatus = CustomerStatus.ACTIVE

    @field_validator("customer_code")
    @classmethod
    def code_not_blank(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("Customer code cannot be blank")
        return v

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Customer name cannot be blank")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str) -> str:
        return validate_phone(v)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_code: str | None = Field(default=None, min_length=2, max_length=32)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=50)
    segment: CustomerSegment | None = None

    @field_validator("customer_code")
    @classmethod
    def code_not_blank(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().upper()
        if not v:
            raise ValueError("Customer code cannot be blank")
        return v

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Customer name cannot be blank")
        return v.strip() if v else v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        return validate_phone(v) if v is not None else v


class CustomerStatusUpdate(BaseModel):
    status: CustomerStatus


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_code: str
    name: str
    email: str
    phone: str
    company: str
    address: str | None
    city: str | None
    state: str | None
    country: str | None
    region: str | None
    segment: CustomerSegment
    status: CustomerStatus
    created_at: str
    updated_at: str


class CustomerListResponse(BaseModel):
    data: list[CustomerOut]
    page: int
    limit: int
    total: int
    totalPages: int