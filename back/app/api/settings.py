from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models import Settings as SettingsModel
from app.schemas import Settings, SettingsUpdate
from app.api.auth import get_current_admin

router = APIRouter()

def get_settings_from_db(db: Session) -> dict:
    settings = {}
    db_settings = db.query(SettingsModel).all()
    
    for setting in db_settings:
        try:
            settings[setting.key] = json.loads(setting.value)
        except:
            settings[setting.key] = setting.value
    return {
        "cashback": settings.get("cashback", 5),
        "online_max": settings.get("online_max", 5000),
        "test_mode": settings.get("test_mode", False),
        "cashback_command": settings.get("cashback_command", "eco give %player% %cashback_amount%"),
    }

def set_setting(db: Session, key: str, value):
    setting = db.query(SettingsModel).filter(SettingsModel.key == key).first()
    value_str = json.dumps(value)
    
    if setting:
        setting.value = value_str
    else:
        setting = SettingsModel(key=key, value=value_str)
        db.add(setting)
    
    db.commit()

@router.get("/", response_model=Settings)
async def get_settings(db: Session = Depends(get_db)):
    return get_settings_from_db(db)

@router.put("/", response_model=Settings)
async def update_settings(
    settings: SettingsUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    set_setting(db, "cashback", settings.cashback)
    set_setting(db, "online_max", settings.online_max)
    set_setting(db, "test_mode", settings.test_mode)
    if settings.cashback_command is not None:
        set_setting(db, "cashback_command", settings.cashback_command)
    
    return get_settings_from_db(db)

