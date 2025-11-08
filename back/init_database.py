"""
Скрипт для ручной инициализации базы данных
Запуск: python init_database.py
"""

if __name__ == "__main__":
    from app.init_db import init_database
    
    print("\n🚀 Starting database initialization...\n")
    
    try:
        init_database()
    except Exception as e:
        print(f"\n❌ Failed to initialize database: {e}\n")
        exit(1)

