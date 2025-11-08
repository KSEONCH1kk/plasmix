from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os

from app.database import get_db
from app.models import Order, Promocode, PromocodeUsage
from app.schemas import Order as OrderSchema, OrderCreate, OrderUpdate, OrderPublic
from app.api.auth import get_current_admin

router = APIRouter()
API_KEY = os.getenv("PLUGIN_API_KEY", "your-secret-key-here")

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return True

def get_optional_admin(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        return None
    try:
        from app.api.auth import get_current_admin
        return get_current_admin(authorization, db)
    except:
        return None

def get_optional_current_admin(db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    
    try:
        from jose import jwt, JWTError
        from app.models import Admin
        import os
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
        else:
            token = authorization
        SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
        ALGORITHM = "HS256"
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if not username:
            return None
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin or not admin.is_active:
            return None
        
        return admin
    except:
        return None

@router.get("/")
async def get_orders(
    status: str = None,
    mode: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None),
    current_admin = Depends(get_optional_current_admin)
):
    is_plugin = False
    
    if x_api_key:
        if x_api_key != API_KEY:
            raise HTTPException(status_code=403, detail="Invalid API key")
        is_plugin = True
    elif current_admin:
        pass
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = db.query(Order)
    if status and is_plugin:
        if status == "pending":
            query = query.filter(Order.delivered == False).filter(
                (Order.status == "pending") | 
                ((Order.status == "completed") & (Order.payment_method == "card"))
            )
        else:
            query = query.filter(Order.status == status)
    elif status:
        query = query.filter(Order.status == status)
    
    if mode:
        query = query.filter(Order.mode == mode)
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    if is_plugin:
        return {"orders": orders}
    else:
        return orders

@router.get("/{order_id}", response_model=OrderSchema)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderPublic)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    if order.promocode:
        promocode = db.query(Promocode).filter(Promocode.code == order.promocode.upper()).first()
        if promocode:
            promocode.uses_count += 1
            usage = PromocodeUsage(
                promocode_id=promocode.id,
                username=order.username
            )
            db.add(usage)
            db.commit()
    order_data = order.dict()
    if not order_data.get('command'):
        if order.product_type == 'donation':
            from app.models import Donation
            product = db.query(Donation).filter(Donation.id == order.product_id).first()
            if product and product.command:
                order_data['command'] = product.command
        elif order.product_type == 'item':
            from app.models import Item
            product = db.query(Item).filter(Item.id == order.product_id).first()
            if product and product.command:
                order_data['command'] = product.command
    from app.models import Settings as SettingsModel
    settings = {}
    db_settings = db.query(SettingsModel).all()
    for setting in db_settings:
        try:
            import json
            settings[setting.key] = json.loads(setting.value)
        except:
            settings[setting.key] = setting.value
    
    cashback_command = settings.get("cashback_command", "eco give %player% %cashback_amount%")
    order_data['cashback_command'] = cashback_command
    
    db_order = Order(**order_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}", response_model=OrderSchema)
async def update_order(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None),
    current_admin = Depends(get_optional_current_admin)
):
    if x_api_key:
        if x_api_key != API_KEY:
            raise HTTPException(status_code=403, detail="Invalid API key")
    elif current_admin:
        pass
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for key, value in order.dict(exclude_unset=True).items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.patch("/{order_id}", response_model=OrderSchema)
async def patch_order(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None)
):
    if x_api_key:
        verify_api_key(x_api_key)
    else:
        from app.api.auth import get_current_admin
        await get_current_admin()
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for key, value in order.dict(exclude_unset=True).items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}

