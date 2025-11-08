from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Order, Promocode
from app.schemas import Statistics, DailyStats, PromoStats, TopProduct
from app.api.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=Statistics)
async def get_statistics(
    days: int = 7,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    total_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= start_date,
        Order.status == "completed"
    ).scalar() or 0
    
    total_revenue = db.query(func.sum(Order.final_price)).filter(
        Order.created_at >= start_date,
        Order.status == "completed"
    ).scalar() or 0.0
    daily_stats = []
    for i in range(days):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_orders = db.query(func.count(Order.id)).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end,
            Order.status == "completed"
        ).scalar() or 0
        
        day_revenue = db.query(func.sum(Order.final_price)).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end,
            Order.status == "completed"
        ).scalar() or 0.0
        
        daily_stats.append(DailyStats(
            date=day_start.strftime("%d.%m"),
            orders=day_orders,
            revenue=float(day_revenue)
        ))
    promocodes = db.query(Promocode).filter(Promocode.uses_count > 0).all()
    promo_stats = [
        PromoStats(code=p.code, uses=p.uses_count, discount=p.discount)
        for p in promocodes
    ]
    total_promo_uses = sum(p.uses for p in promo_stats)
    top_products_query = db.query(
        Order.product_name,
        func.count(Order.id).label('sales'),
        func.sum(Order.final_price).label('revenue')
    ).filter(
        Order.created_at >= start_date,
        Order.status == "completed"
    ).group_by(Order.product_name).order_by(desc('revenue')).limit(5).all()
    
    top_products = [
        TopProduct(name=p[0], sales=p[1], revenue=float(p[2]))
        for p in top_products_query
    ]
    
    return Statistics(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_promo_uses=total_promo_uses,
        daily_orders=daily_stats,
        daily_revenue=daily_stats,
        promo_stats=promo_stats,
        top_products=top_products
    )

