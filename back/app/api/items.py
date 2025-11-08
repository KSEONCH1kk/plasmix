from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Item
from app.schemas import (
    Item as ItemSchema,
    ItemPublic,
    ItemCreate,
    ItemUpdate
)
from app.api.auth import get_current_admin

router = APIRouter()
@router.get("/", response_model=List[ItemPublic])
async def get_items(mode: str = None, category: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Item)
    if mode:
        query = query.filter(Item.mode == mode)
    if category:
        query = query.filter(Item.category == category)
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/admin", response_model=List[ItemSchema])
async def get_items_admin(
    mode: str = None, 
    category: str = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    query = db.query(Item)
    if mode:
        query = query.filter(Item.mode == mode)
    if category:
        query = query.filter(Item.category == category)
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=ItemPublic)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ItemSchema)
async def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=ItemSchema)
async def update_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}

