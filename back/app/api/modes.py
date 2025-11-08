from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Mode
from app.schemas import Mode as ModeSchema, ModeCreate, ModeUpdate
from app.api.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[ModeSchema])
async def get_modes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    modes = db.query(Mode).offset(skip).limit(limit).all()
    return modes

@router.get("/{mode_id}", response_model=ModeSchema)
async def get_mode(mode_id: int, db: Session = Depends(get_db)):
    mode = db.query(Mode).filter(Mode.id == mode_id).first()
    if not mode:
        raise HTTPException(status_code=404, detail="Mode not found")
    return mode

@router.post("/", response_model=ModeSchema)
async def create_mode(
    mode: ModeCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_mode = Mode(**mode.dict())
    db.add(db_mode)
    db.commit()
    db.refresh(db_mode)
    return db_mode

@router.put("/{mode_id}", response_model=ModeSchema)
async def update_mode(
    mode_id: int,
    mode: ModeUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_mode = db.query(Mode).filter(Mode.id == mode_id).first()
    if not db_mode:
        raise HTTPException(status_code=404, detail="Mode not found")
    
    for key, value in mode.dict().items():
        setattr(db_mode, key, value)
    
    db.commit()
    db.refresh(db_mode)
    return db_mode

@router.delete("/{mode_id}")
async def delete_mode(
    mode_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_mode = db.query(Mode).filter(Mode.id == mode_id).first()
    if not db_mode:
        raise HTTPException(status_code=404, detail="Mode not found")
    
    db.delete(db_mode)
    db.commit()
    return {"message": "Mode deleted successfully"}

