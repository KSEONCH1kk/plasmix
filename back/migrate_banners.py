#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine, text

def migrate():
    # Путь к базе данных
    db_path = os.path.join(os.path.dirname(__file__), "plasmix.db")
    
    # Подключаемся к базе данных
    engine = create_engine(f"sqlite:///{db_path}")
    
    try:
        with engine.connect() as conn:
            # Создаём таблицу banners
            print("Creating banners table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS banners (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    image_url VARCHAR(500) NOT NULL,
                    link VARCHAR(500),
                    "order" INTEGER DEFAULT 0,
                    active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✓ Table banners created successfully!")
            
            # Добавляем пример баннера
            print("Adding example banner...")
            conn.execute(text("""
                INSERT INTO banners (image_url, link, "order", active)
                VALUES ('https://placehold.co/1400x300', NULL, 0, 1)
            """))
            conn.commit()
            print("✓ Example banner added!")
                
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()

