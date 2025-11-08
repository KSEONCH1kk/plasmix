from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Admin, Donation, Item, Mode, Category, Promocode
from app.api.auth import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        existing_admin = db.query(Admin).first()
        if existing_admin:
            print("Database already initialized. Skipping...")
            return
        
        print("Initializing database with default data...")
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        admin = Admin(
            username=admin_username,
            hashed_password=get_password_hash(admin_password),
            is_active=True
        )
        db.add(admin)
        print(f"✓ Created admin user: {admin_username}")
        modes = [
            Mode(name="Лайт Анархия", slug="lite", image="https://placehold.co/64x48", server_id="lite_anarchy"),
            Mode(name="Классик Анархия", slug="classic", image="https://placehold.co/64x48", server_id="classic_anarchy"),
        ]
        db.add_all(modes)
        print("✓ Created server modes")
        categories = [
            Category(category_id="privileges", name="Привилегии", icon="fa-trophy", mode="lite"),
            Category(category_id="currency", name="Сапфиры и Коины", icon="fa-gem", mode="lite"),
            Category(category_id="cases", name="Кейс с донатом", icon="fa-gift", mode="lite"),
            Category(category_id="titles", name="Кейс с титулами", icon="fa-crown", mode="lite"),
            Category(category_id="containers", name="Контейнеры", icon="fa-box", mode="lite"),
            Category(category_id="other", name="Разное", icon="fa-star", mode="lite"),
            Category(category_id="privileges", name="Привилегии", icon="fa-trophy", mode="classic"),
            Category(category_id="currency", name="Сапфиры и Коины", icon="fa-gem", mode="classic"),
        ]
        db.add_all(categories)
        print("✓ Created categories")
        lite_donations = [
            Donation(
                name="VIP Ранг",
                price=599,
                old_price=699,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="lite",
                chat_prefix="[VIP]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "1.5x"},
                    {"name": "Слоты для домов", "value": "2"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+3 (5 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
            Donation(
                name="VIP+ Ранг",
                price=1199,
                old_price=1399,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="lite",
                chat_prefix="[VIP+]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "2x"},
                    {"name": "Слоты для домов", "value": "2"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+7 (9 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
            Donation(
                name="MVP Ранг",
                price=2399,
                old_price=2999,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="lite",
                chat_prefix="[MVP]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "2.5x"},
                    {"name": "Слоты для домов", "value": "3"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+11 (13 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
            Donation(
                name="MVP+ Ранг",
                price=3599,
                old_price=4799,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="lite",
                chat_prefix="[MVP+]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "3x"},
                    {"name": "Слоты для домов", "value": "3"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+16 (18 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
        ]
        db.add_all(lite_donations)
        print("✓ Created Lite donations")
        classic_donations = [
            Donation(
                name="CLASSIC VIP",
                price=699,
                old_price=899,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="classic",
                chat_prefix="[CLASSIC VIP]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "2x"},
                    {"name": "Слоты для домов", "value": "3"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+5 (7 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
            Donation(
                name="CLASSIC MVP",
                price=1499,
                old_price=1799,
                discount="СКИДКА 20%!",
                image="https://placehold.co/400",
                mode="classic",
                chat_prefix="[CLASSIC MVP]",
                features=[
                    {"name": "Повторы игр (/games)", "enabled": True},
                    {"name": "Без задержки в чате", "enabled": True},
                    {"name": "Уникальные косметические предметы", "enabled": True},
                    {"name": "Множитель серебра на ивентах", "value": "3x"},
                    {"name": "Слоты для домов", "value": "4"},
                    {"name": "Приоритетная очередь", "enabled": True},
                    {"name": "Дополнительные слоты гардероба", "value": "+10 (12 всего)"},
                    {"name": "Быстрый крафт", "enabled": True},
                    {"name": "Доступ к сезонному торговцу", "enabled": True},
                    {"name": "Расширенный доступ к повторам", "enabled": True},
                ]
            ),
        ]
        db.add_all(classic_donations)
        print("✓ Created Classic donations")
        items = [
            Item(name="100 Коинов", price=99, category="currency", image="https://placehold.co/400", mode="lite"),
            Item(name="500 Коинов", price=449, category="currency", image="https://placehold.co/400", mode="lite"),
            Item(name="1000 Коинов", price=799, category="currency", image="https://placehold.co/400", mode="lite"),
            Item(name="Донат кейс", price=299, category="cases", image="https://placehold.co/400", mode="lite"),
            Item(name="Сапфировый кейс", price=199, category="cases", image="https://placehold.co/400", mode="lite"),
            Item(name="Кейс с титулами", price=149, category="titles", image="https://placehold.co/400", mode="lite"),
            Item(name="Контейнер", price=99, category="containers", image="https://placehold.co/400", mode="lite"),
            Item(name="Разное", price=59, category="other", image="https://placehold.co/400", mode="lite"),
            Item(name="200 Коинов", price=149, category="currency", image="https://placehold.co/400", mode="classic"),
            Item(name="750 Коинов", price=549, category="currency", image="https://placehold.co/400", mode="classic"),
            Item(name="Классик кейс", price=399, category="cases", image="https://placehold.co/400", mode="classic"),
        ]
        db.add_all(items)
        print("✓ Created items")
        promocodes = [
            Promocode(code="PLASMIX10", discount=10, active=True, uses_count=0),
            Promocode(code="SALE20", discount=20, active=True, uses_count=0),
            Promocode(code="VIP15", discount=15, active=True, uses_count=0),
            Promocode(code="NEWUSER", discount=5, active=True, uses_count=0),
        ]
        db.add_all(promocodes)
        print("✓ Created promocodes")
        db.commit()
        
        print("\n" + "="*50)
        print("✅ Database initialized successfully!")
        print("="*50)
        print(f"\n📝 Admin credentials:")
        print(f"   Username: {admin_username}")
        print(f"   Password: {admin_password}")
        print(f"\n🎟️  Promocodes:")
        print(f"   PLASMIX10 - 10% discount")
        print(f"   SALE20 - 20% discount")
        print(f"   VIP15 - 15% discount")
        print(f"   NEWUSER - 5% discount")
        print("\n" + "="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

