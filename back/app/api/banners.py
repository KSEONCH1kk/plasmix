from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Banner
from app.schemas import Banner as BannerSchema, BannerCreate, BannerUpdate
from app.api.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[BannerSchema])
async def get_banners(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Banner)
    if active_only:
        query = query.filter(Banner.active == True)
    banners = query.order_by(Banner.order.asc(), Banner.id.asc()).all()
    return banners

@router.get("/{banner_id}", response_model=BannerSchema)
async def get_banner(banner_id: int, db: Session = Depends(get_db)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner

@router.post("/", response_model=BannerSchema)
async def create_banner(
    banner: BannerCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_banner = Banner(**banner.dict())
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner

@router.put("/{banner_id}", response_model=BannerSchema)
async def update_banner(
    banner_id: int,
    banner: BannerUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    update_data = banner.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_banner, field, value)
    
    db.commit()
    db.refresh(db_banner)
    return db_banner

@router.delete("/{banner_id}")
async def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    db.delete(db_banner)
    db.commit()
    return {"message": "Banner deleted successfully"}

