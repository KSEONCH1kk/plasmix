from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
from typing import List, Optional
import pymysql

from app.database import get_db
from app import models, schemas
from app.api.auth import get_current_admin

router = APIRouter(prefix="/api/leaderboards", tags=["leaderboards"])
@router.get("/admin/", response_model=List[schemas.Leaderboard])
def get_all_leaderboards(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    return db.query(models.Leaderboard).order_by(models.Leaderboard.mode_id, models.Leaderboard.order).all()

@router.get("/admin/mode/{mode_id}", response_model=List[schemas.Leaderboard])
def get_leaderboards_by_mode(
    mode_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    return db.query(models.Leaderboard).filter(
        models.Leaderboard.mode_id == mode_id
    ).order_by(models.Leaderboard.order).all()

@router.post("/admin/", response_model=schemas.Leaderboard)
def create_leaderboard(
    leaderboard_data: schemas.LeaderboardCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    if current_admin.role != "super_admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    mode = db.query(models.Mode).filter(models.Mode.id == leaderboard_data.mode_id).first()
    if not mode:
        raise HTTPException(status_code=404, detail="Режим не найден")
    
    leaderboard = models.Leaderboard(**leaderboard_data.dict())
    db.add(leaderboard)
    db.commit()
    db.refresh(leaderboard)
    return leaderboard

@router.put("/admin/{leaderboard_id}", response_model=schemas.Leaderboard)
def update_leaderboard(
    leaderboard_id: int,
    leaderboard_data: schemas.LeaderboardUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    if current_admin.role != "super_admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    leaderboard = db.query(models.Leaderboard).filter(models.Leaderboard.id == leaderboard_id).first()
    if not leaderboard:
        raise HTTPException(status_code=404, detail="Топ не найден")
    
    for key, value in leaderboard_data.dict(exclude_unset=True).items():
        setattr(leaderboard, key, value)
    
    db.commit()
    db.refresh(leaderboard)
    return leaderboard

@router.delete("/admin/{leaderboard_id}")
def delete_leaderboard(
    leaderboard_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    if current_admin.role != "super_admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    leaderboard = db.query(models.Leaderboard).filter(models.Leaderboard.id == leaderboard_id).first()
    if not leaderboard:
        raise HTTPException(status_code=404, detail="Топ не найден")
    
    db.delete(leaderboard)
    db.commit()
    return {"message": "Топ удален"}
@router.get("/mode/{mode_slug}", response_model=List[schemas.LeaderboardPublic])
def get_leaderboards_for_mode(
    mode_slug: str,
    db: Session = Depends(get_db)
):
    mode = db.query(models.Mode).filter(models.Mode.slug == mode_slug).first()
    if not mode:
        raise HTTPException(status_code=404, detail="Режим не найден")
    
    leaderboards = db.query(models.Leaderboard).filter(
        models.Leaderboard.mode_id == mode.id,
        models.Leaderboard.active == True
    ).order_by(models.Leaderboard.order).all()
    
    return leaderboards

@router.get("/{leaderboard_id}/data", response_model=schemas.LeaderboardResponse)
def get_leaderboard_data(
    leaderboard_id: int,
    period: str = "daily",
    date: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    leaderboard = db.query(models.Leaderboard).filter(
        models.Leaderboard.id == leaderboard_id,
        models.Leaderboard.active == True
    ).first()
    
    if not leaderboard:
        raise HTTPException(status_code=404, detail="Топ не найден или неактивен")
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты. Используйте YYYY-MM-DD")
    else:
        target_date = datetime.now()
    try:
        connection = pymysql.connect(
            host=leaderboard.db_host,
            port=leaderboard.db_port,
            user=leaderboard.db_user,
            password=leaderboard.db_password,
            database=leaderboard.db_name,
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка подключения к БД топов: {str(e)}")
    
    try:
        with connection.cursor() as cursor:
            score_field = f"`{leaderboard.score_column}`"
            
            if period == "alltime":
                query = f"""
                    SELECT 
                        `{leaderboard.player_name_column}` as username,
                        {score_field} as score
                    FROM `{leaderboard.db_table}`
                    WHERE {score_field} > 0
                    ORDER BY {score_field} DESC
                    LIMIT {limit}
                    SELECT 
                        `{leaderboard.player_name_column}` as username,
                        {score_field} as score
                    FROM `{leaderboard.db_table}`
                    WHERE {score_field} > 0
                        AND `{timestamp_field}` >= {period_start_ms}
                        AND `{timestamp_field}` < {period_end_ms}
                    ORDER BY {score_field} DESC
                    LIMIT {limit}
                """
            
            cursor.execute(query)
            
            results = cursor.fetchall()
            leaderboard_data = []
            for idx, row in enumerate(results, start=1):
                leaderboard_data.append({
                    "position": idx,
                    "username": row["username"],
                    "score": int(row["score"]) if row["score"] else 0
                })
            
            return {
                "leaderboard": leaderboard_data,
                "total": len(leaderboard_data),
                "period": period,
                "date": target_date.strftime("%Y-%m-%d")
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных топа: {str(e)}")
    
    finally:
        connection.close()
