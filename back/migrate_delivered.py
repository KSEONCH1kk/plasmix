"""
Миграция для добавления поля delivered в таблицу orders
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env file")
    exit(1)

# Создаем подключение к базе данных
engine = create_engine(DATABASE_URL)

print("Starting migration: adding 'delivered' column to orders table...")

try:
    with engine.connect() as connection:
        # Проверяем, существует ли колонка
        result = connection.execute(text("PRAGMA table_info(orders)"))
        columns = [row[1] for row in result]
        
        if 'delivered' not in columns:
            # Добавляем колонку delivered
            connection.execute(text("""
                ALTER TABLE orders 
                ADD COLUMN delivered BOOLEAN DEFAULT 0
            """))
            connection.commit()
            
            print("✓ Added 'delivered' column")
            
            # Устанавливаем delivered=true для всех старых completed заказов
            connection.execute(text("""
                UPDATE orders 
                SET delivered = 1 
                WHERE status = 'completed'
            """))
            connection.commit()
            
            print("✓ Marked all existing completed orders as delivered")
        else:
            print("✓ Column 'delivered' already exists, skipping...")
        
    print("\n✅ Migration completed successfully!")
    print("\nНастройка завершена! Теперь плагин будет корректно обрабатывать заказы без дублирования.")
    
except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    exit(1)

