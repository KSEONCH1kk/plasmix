from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    old_price = Column(Float, nullable=True)
    discount = Column(String(100), nullable=True)
    image = Column(String(500), nullable=True)
    mode = Column(String(50), nullable=False, default="lite")  
    features = Column(JSON, nullable=True)
    chat_prefix = Column(String(50), nullable=True)
    command = Column(Text, nullable=True)  
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)
    mode = Column(String(50), nullable=False, default="lite")
    command = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Mode(Base):
    __tablename__ = "modes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    image = Column(String(500), nullable=True)
    server_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Leaderboard(Base):
    __tablename__ = "leaderboards"
    
    id = Column(Integer, primary_key=True, index=True)
    mode_id = Column(Integer, nullable=False) 
    title = Column(String(255), nullable=False)  
    icon = Column(String(50), nullable=True)
    gradient = Column(String(255), nullable=True)  
    color = Column(String(50), nullable=True) 
    bg_light = Column(String(50), nullable=True)  
    order = Column(Integer, default=0)
    db_table = Column(String(255), nullable=False) 
    db_host = Column(String(255), nullable=False)
    db_port = Column(Integer, default=3306)
    db_name = Column(String(255), nullable=False)
    db_user = Column(String(255), nullable=False)
    db_password = Column(String(255), nullable=False)
    player_name_column = Column(String(100), default="name")  
    score_column = Column(String(100), default="value") 
    
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    icon = Column(String(100), nullable=True)
    mode = Column(String(50), nullable=False, default="lite", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Promocode(Base):
    __tablename__ = "promocodes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    discount = Column(Integer, nullable=False) 
    active = Column(Boolean, default=True)
    uses_count = Column(Integer, default=0)
    max_uses = Column(Integer, nullable=True) 
    one_per_account = Column(Boolean, default=False) 
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PromocodeUsage(Base):
    __tablename__ = "promocode_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    promocode_id = Column(Integer, ForeignKey('promocodes.id'), nullable=False)
    username = Column(String(255), nullable=False, index=True)
    used_at = Column(DateTime, default=datetime.utcnow)

class GameMode(Base):
    __tablename__ = "game_modes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    features = Column(JSON, nullable=True) 
    image = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="Работает") 
    video_url = Column(String(500), nullable=True)
    order = Column(Integer, default=0) 
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    product_type = Column(String(50), nullable=False) 
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    duration = Column(String(50), nullable=True) 
    price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)
    promocode = Column(String(50), nullable=True)
    discount_amount = Column(Float, default=0)
    cashback_amount = Column(Integer, default=0)
    cashback_percent = Column(Integer, default=0) 
    cashback_command = Column(Text, nullable=True)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    mode = Column(String(50), nullable=False, default="lite")
    test_mode = Column(Boolean, default=False)
    delivered = Column(Boolean, default=False)
    command = Column(Text, nullable=True)  
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), nullable=False, unique=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), nullable=False, default="moderator") 
    permissions = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Banner(Base):
    __tablename__ = "banners"
    
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    link = Column(String(500), nullable=True) 
    order = Column(Integer, default=0) 
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

