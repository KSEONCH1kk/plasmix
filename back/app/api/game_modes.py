from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import GameMode
from app.schemas import GameMode as GameModeSchema, GameModeCreate, GameModeUpdate
from app.api.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[GameModeSchema])
async def get_game_modes(
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    query = db.query(GameMode)
    
    if not include_inactive:
        query = query.filter(GameMode.active == True)
    
    return query.order_by(GameMode.order, GameMode.id).all()

@router.get("/{game_mode_id}", response_model=GameModeSchema)
async def get_game_mode(game_mode_id: int, db: Session = Depends(get_db)):
    game_mode = db.query(GameMode).filter(GameMode.id == game_mode_id).first()
    if not game_mode:
        raise HTTPException(status_code=404, detail="Игровой режим не найден")
    return game_mode

@router.post("/", response_model=GameModeSchema)
async def create_game_mode(
    game_mode: GameModeCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_game_mode = GameMode(**game_mode.dict())
    db.add(db_game_mode)
    db.commit()
    db.refresh(db_game_mode)
    return db_game_mode

@router.put("/{game_mode_id}", response_model=GameModeSchema)
async def update_game_mode(
    game_mode_id: int,
    game_mode: GameModeUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_game_mode = db.query(GameMode).filter(GameMode.id == game_mode_id).first()
    if not db_game_mode:
        raise HTTPException(status_code=404, detail="Игровой режим не найден")
    
    update_data = game_mode.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_game_mode, key, value)
    
    db.commit()
    db.refresh(db_game_mode)
    return db_game_mode

@router.delete("/{game_mode_id}")
async def delete_game_mode(
    game_mode_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    db_game_mode = db.query(GameMode).filter(GameMode.id == game_mode_id).first()
    if not db_game_mode:
        raise HTTPException(status_code=404, detail="Игровой режим не найден")
    
    db.delete(db_game_mode)
    db.commit()
    return {"message": "Игровой режим успешно удален"}

