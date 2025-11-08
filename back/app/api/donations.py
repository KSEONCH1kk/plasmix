from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Donation
from app.schemas import (
    Donation as DonationSchema, 
    DonationPublic,
    DonationCreate, 
    DonationUpdate
)
from app.api.auth import get_current_admin

router = APIRouter()
@router.get("/", response_model=List[DonationPublic])
async def get_donations(
    mode: str = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin = Depends(lambda: None)
):
    query = db.query(Donation)
    if mode:
        query = query.filter(Donation.mode == mode)
    donations = query.offset(skip).limit(limit).all()
    return donations

@router.get("/admin", response_model=List[DonationSchema])
async def get_donations_admin(
    mode: str = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    query = db.query(Donation)
    if mode:
        query = query.filter(Donation.mode == mode)
    donations = query.offset(skip).limit(limit).all()
    return donations

@router.get("/{donation_id}", response_model=DonationPublic)
async def get_donation(donation_id: int, db: Session = Depends(get_db)):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation

@router.post("/", response_model=DonationSchema)
async def create_donation(
    donation: DonationCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_donation = Donation(**donation.dict())
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation

@router.put("/{donation_id}", response_model=DonationSchema)
async def update_donation(
    donation_id: int,
    donation: DonationUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not db_donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    for key, value in donation.dict().items():
        setattr(db_donation, key, value)
    
    db.commit()
    db.refresh(db_donation)
    return db_donation

@router.delete("/{donation_id}")
async def delete_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not db_donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    db.delete(db_donation)
    db.commit()
    return {"message": "Donation deleted successfully"}

