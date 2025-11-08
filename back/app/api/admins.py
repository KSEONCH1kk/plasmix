from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Admin
from app.schemas import AdminCreate, AdminUpdate, AdminResponse
from app.api.auth import get_current_admin, get_password_hash
from datetime import datetime

router = APIRouter()

def check_permission(current_admin: Admin, required_permission: str = None):
    if current_admin.role == "super_admin":
        return True
    if required_permission and current_admin.permissions:
        return current_admin.permissions.get(required_permission, False)
    
    return False

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(current_admin: Admin = Depends(get_current_admin)):
    return current_admin

@router.get("/", response_model=List[AdminResponse])
async def get_all_admins(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if not check_permission(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для просмотра списка админов"
        )
    
    admins = db.query(Admin).all()
    return admins

@router.post("/", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if not check_permission(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для создания админов"
        )
    existing_admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Админ с таким именем уже существует"
        )
    if admin_data.role not in ["super_admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Роль должна быть 'super_admin' или 'moderator'"
        )
    new_admin = Admin(
        username=admin_data.username,
        hashed_password=get_password_hash(admin_data.password),
        role=admin_data.role,
        permissions=admin_data.permissions
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin

@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if not check_permission(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для изменения админов"
        )
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Админ не найден"
        )
    if admin.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменять свой собственный профиль"
        )
    if admin_data.is_active is not None:
        admin.is_active = admin_data.is_active
    if admin_data.role is not None:
        if admin_data.role not in ["super_admin", "moderator"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Роль должна быть 'super_admin' или 'moderator'"
            )
        admin.role = admin_data.role
    if admin_data.permissions is not None:
        admin.permissions = admin_data.permissions
    
    admin.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(admin)
    
    return admin

@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    if not check_permission(current_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для удаления админов"
        )
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Админ не найден"
        )
    if admin.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить свой собственный аккаунт"
        )
    
    db.delete(admin)
    db.commit()
    
    return None

@router.get("/permissions/check")
async def check_user_permissions(
    current_admin: Admin = Depends(get_current_admin)
):
    if current_admin.role == "super_admin":
        return {
            "role": "super_admin",
            "permissions": {
                "view_stats": True,
                "manage_promo": True,
                "manage_donations": True,
                "manage_items": True,
                "manage_orders": True,
                "manage_categories": True,
                "manage_modes": True,
                "manage_settings": True,
                "manage_admins": True,
            }
        }
    
    return {
        "role": "moderator",
        "permissions": current_admin.permissions or {}
    }

