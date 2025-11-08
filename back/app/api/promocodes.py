from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Promocode, PromocodeUsage
from app.schemas import Promocode as PromocodeSchema, PromocodeCreate, PromocodeUpdate
from app.api.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[PromocodeSchema])
async def get_promocodes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    promocodes = db.query(Promocode).offset(skip).limit(limit).all()
    return promocodes

@router.get("/{promocode_id}", response_model=PromocodeSchema)
async def get_promocode(promocode_id: int, db: Session = Depends(get_db)):
    promocode = db.query(Promocode).filter(Promocode.id == promocode_id).first()
    if not promocode:
        raise HTTPException(status_code=404, detail="Promocode not found")
    return promocode

@router.get("/validate/{code}")
async def validate_promocode(code: str, username: str = None, db: Session = Depends(get_db)):
    promocode = db.query(Promocode).filter(Promocode.code == code.upper()).first()
    if not promocode:
        raise HTTPException(status_code=404, detail="Промокод не найден")
    
    if not promocode.active:
        raise HTTPException(status_code=400, detail="Промокод неактивен")
    
    if promocode.valid_until and promocode.valid_until < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Срок действия промокода истёк")
    
    if promocode.max_uses and promocode.uses_count >= promocode.max_uses:
        raise HTTPException(status_code=400, detail="Достигнут лимит использований промокода")
    if promocode.one_per_account and username:
        existing_usage = db.query(PromocodeUsage).filter(
            PromocodeUsage.promocode_id == promocode.id,
            PromocodeUsage.username == username
        ).first()
        if existing_usage:
            raise HTTPException(status_code=400, detail="Вы уже использовали этот промокод")
    
    return {
        "valid": True,
        "discount": promocode.discount,
        "code": promocode.code
    }

@router.post("/", response_model=PromocodeSchema)
async def create_promocode(
    promocode: PromocodeCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    existing = db.query(Promocode).filter(Promocode.code == promocode.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Promocode already exists")
    
    promocode_data = promocode.dict()
    promocode_data['code'] = promocode_data['code'].upper()
    db_promocode = Promocode(**promocode_data)
    db.add(db_promocode)
    db.commit()
    db.refresh(db_promocode)
    return db_promocode

@router.put("/{promocode_id}", response_model=PromocodeSchema)
async def update_promocode(
    promocode_id: int,
    promocode: PromocodeUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_promocode = db.query(Promocode).filter(Promocode.id == promocode_id).first()
    if not db_promocode:
        raise HTTPException(status_code=404, detail="Promocode not found")
    
    for key, value in promocode.dict().items():
        if key == 'code':
            value = value.upper()
        setattr(db_promocode, key, value)
    
    db.commit()
    db.refresh(db_promocode)
    return db_promocode

@router.delete("/{promocode_id}")
async def delete_promocode(
    promocode_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_promocode = db.query(Promocode).filter(Promocode.id == promocode_id).first()
    if not db_promocode:
        raise HTTPException(status_code=404, detail="Promocode not found")
    
    db.delete(db_promocode)
    db.commit()
    return {"message": "Promocode deleted successfully"}

