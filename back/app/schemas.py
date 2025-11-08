from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
import re
class DonationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    price: float = Field(..., ge=0)
    old_price: Optional[float] = Field(None, ge=0)
    discount: Optional[str] = Field(None, max_length=50)
    image: Optional[str] = Field(None, max_length=2048)
    mode: str = Field("lite", pattern="^(lite|classic)$")
    features: Optional[List[dict]] = None
    chat_prefix: Optional[str] = Field(None, max_length=50)
    command: Optional[str] = Field(None, max_length=1000)
    
    @validator('image')
    def validate_image_url(cls, v):
        if v and not re.match(r'^https?://', v):
            raise ValueError('Image URL must start with http:// or https://')
        return v
    
    @validator('command')
    def validate_command(cls, v):
        if not v:
            return v
        dangerous = ['&&', '||', ';', '|', '>', '<', '`', '$(']
        if any(d in v for d in dangerous):
            raise ValueError('Command contains forbidden characters')
        return v

class DonationCreate(DonationBase):
    pass

class DonationUpdate(DonationBase):
    pass

class Donation(DonationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class DonationPublic(BaseModel):
    id: int
    name: str = Field(..., min_length=1, max_length=255)
    price: float = Field(..., ge=0)
    old_price: Optional[float] = Field(None, ge=0)
    discount: Optional[str] = Field(None, max_length=50)
    image: Optional[str] = Field(None, max_length=2048)
    mode: str = Field("lite", pattern="^(lite|classic)$")
    features: Optional[List[dict]] = None
    chat_prefix: Optional[str] = Field(None, max_length=50)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class ItemBase(BaseModel):
    name: str
    price: float
    category: str
    image: Optional[str] = None
    mode: str = "lite"
    command: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class ItemPublic(BaseModel):
    id: int
    name: str
    price: float
    category: str
    image: Optional[str] = None
    mode: str = "lite"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class ModeBase(BaseModel):
    name: str
    slug: str
    image: Optional[str] = None
    server_id: Optional[str] = None

class ModeCreate(ModeBase):
    pass

class ModeUpdate(ModeBase):
    pass

class Mode(ModeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class CategoryBase(BaseModel):
    category_id: str
    name: str
    icon: Optional[str] = None
    mode: str = "lite"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class PromocodeBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    discount: int = Field(..., ge=1, le=100)
    active: bool = True
    max_uses: Optional[int] = Field(None, ge=1)
    one_per_account: bool = False
    valid_until: Optional[datetime] = None
    
    @validator('code')
    def validate_code(cls, v):
        v = v.upper().strip()
        if not re.match(r'^[A-Z0-9\-]{1,50}$', v):
            raise ValueError('Promocode must contain only letters, numbers and hyphens')
        return v

class PromocodeCreate(PromocodeBase):
    pass

class PromocodeUpdate(PromocodeBase):
    pass

class Promocode(PromocodeBase):
    id: int
    uses_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class OrderBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=16)
    email: Optional[EmailStr] = None
    product_type: str = Field(..., pattern="^(donation|item)$")
    product_id: int = Field(..., gt=0)
    product_name: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(1, ge=1, le=1000)
    duration: Optional[str] = Field(None, pattern="^(1month|3months|forever)$")
    price: float = Field(..., ge=0)
    final_price: float = Field(..., ge=0)
    promocode: Optional[str] = Field(None, max_length=50)
    discount_amount: float = Field(0, ge=0)
    cashback_amount: int = Field(0, ge=0)
    cashback_percent: int = Field(0, ge=0, le=100)
    cashback_command: Optional[str] = Field(None, max_length=1000)
    payment_method: str = Field(..., pattern="^(card|coins)$")
    mode: str = Field("lite", pattern="^(lite|classic)$")
    test_mode: bool = False
    command: Optional[str] = Field(None, max_length=1000)
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]{3,16}$', v):
            raise ValueError('Username must be 3-16 characters, alphanumeric and underscore only')
        return v
    
    @validator('promocode')
    def validate_promocode(cls, v):
        if v and not re.match(r'^[A-Z0-9\-]{1,50}$', v.upper()):
            raise ValueError('Invalid promocode format')
        return v.upper() if v else None
    
    @validator('command')
    def validate_command(cls, v):
        if not v:
            return v
        dangerous = ['&&', '||', ';', '|', '>', '<', '`', '$(']
        if any(d in v for d in dangerous):
            raise ValueError('Command contains forbidden characters')
        return v

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    test_mode: Optional[bool] = None
    delivered: Optional[bool] = None

class Order(OrderBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
class OrderPublic(BaseModel):
    id: int
    username: str
    product_type: str
    product_id: int
    product_name: str
    quantity: int
    duration: Optional[str] = None
    price: float
    final_price: float
    promocode: Optional[str] = None
    discount_amount: float
    cashback_amount: int
    cashback_percent: int
    payment_method: str
    mode: str
    status: str
    test_mode: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
class SettingsBase(BaseModel):
    cashback: int = 5
    online_max: int = 5000
    test_mode: bool = False
    cashback_command: Optional[str] = Field(None, max_length=1000)

class SettingsUpdate(SettingsBase):
    pass

class Settings(SettingsBase):
    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    role: str = "moderator" 
    permissions: Optional[dict] = None 

class AdminUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    permissions: Optional[dict] = None

class AdminResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    role: str
    permissions: Optional[dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
class DailyStats(BaseModel):
    date: str
    orders: int
    revenue: float

class PromoStats(BaseModel):
    code: str
    uses: int
    discount: int

class TopProduct(BaseModel):
    name: str
    sales: int
    revenue: float

class Statistics(BaseModel):
    total_orders: int
    total_revenue: float
    total_promo_uses: int
    daily_orders: List[DailyStats]
    daily_revenue: List[DailyStats]
    promo_stats: List[PromoStats]
    top_products: List[TopProduct]
class GameModeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    features: Optional[List[str]] = None
    image: Optional[str] = Field(None, max_length=500)
    status: str = Field("Работает", pattern="^(Работает|В разработке)$")
    video_url: Optional[str] = Field(None, max_length=500)
    order: int = Field(0, ge=0)
    active: bool = True

class GameModeCreate(GameModeBase):
    pass

class GameModeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    features: Optional[List[str]] = None
    image: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, pattern="^(Работает|В разработке)$")
    video_url: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = Field(None, ge=0)
    active: Optional[bool] = None

class GameMode(GameModeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class BannerBase(BaseModel):
    image_url: str = Field(..., min_length=1, max_length=500)
    link: Optional[str] = Field(None, max_length=500)
    order: int = Field(0, ge=0)
    active: bool = True

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    image_url: Optional[str] = Field(None, min_length=1, max_length=500)
    link: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = Field(None, ge=0)
    active: Optional[bool] = None

class Banner(BannerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class LeaderboardBase(BaseModel):
    mode_id: int
    title: str = Field(..., min_length=1, max_length=255)
    icon: Optional[str] = Field(None, max_length=50)
    gradient: Optional[str] = Field(None, max_length=255)
    color: Optional[str] = Field(None, max_length=50)
    bg_light: Optional[str] = Field(None, max_length=50)
    order: int = Field(default=0, ge=0)
    db_table: str = Field(..., min_length=1, max_length=255)
    db_host: str = Field(..., min_length=1, max_length=255)
    db_port: int = Field(default=3306, ge=1, le=65535)
    db_name: str = Field(..., min_length=1, max_length=255)
    db_user: str = Field(..., min_length=1, max_length=255)
    db_password: str = Field(..., min_length=1, max_length=255)
    player_name_column: str = Field(default="name", min_length=1, max_length=100)
    score_column: str = Field(default="value", min_length=1, max_length=100)
    active: bool = True

class LeaderboardCreate(LeaderboardBase):
    pass

class LeaderboardUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    icon: Optional[str] = Field(None, max_length=50)
    gradient: Optional[str] = Field(None, max_length=255)
    color: Optional[str] = Field(None, max_length=50)
    bg_light: Optional[str] = Field(None, max_length=50)
    order: Optional[int] = Field(None, ge=0)
    db_table: Optional[str] = Field(None, min_length=1, max_length=255)
    db_host: Optional[str] = Field(None, min_length=1, max_length=255)
    db_port: Optional[int] = Field(None, ge=1, le=65535)
    db_name: Optional[str] = Field(None, min_length=1, max_length=255)
    db_user: Optional[str] = Field(None, min_length=1, max_length=255)
    db_password: Optional[str] = Field(None, min_length=1, max_length=255)
    player_name_column: Optional[str] = Field(None, min_length=1, max_length=100)
    score_column: Optional[str] = Field(None, min_length=1, max_length=100)
    active: Optional[bool] = None

class Leaderboard(LeaderboardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
class LeaderboardPublic(BaseModel):
    id: int
    mode_id: int
    title: str
    icon: Optional[str]
    gradient: Optional[str]
    color: Optional[str]
    bg_light: Optional[str]
    order: int
    active: bool

    class Config:
        from_attributes = True
class LeaderboardEntry(BaseModel):
    position: int
    username: str
    score: int

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    total: int
    period: str
    date: str

