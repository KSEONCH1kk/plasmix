"""
Migration script to create leaderboards table and remove old leaderboard fields from modes table
"""

import sqlite3
import sys

def migrate():
    try:
        print("Starting migration: creating leaderboards table...")
        
        conn = sqlite3.connect('plasmix.db')
        cursor = conn.cursor()
        
        # Создаем таблицу leaderboards
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leaderboards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mode_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                icon VARCHAR(50),
                gradient VARCHAR(255),
                color VARCHAR(50),
                bg_light VARCHAR(50),
                `order` INTEGER DEFAULT 0,
                db_table VARCHAR(255) NOT NULL,
                db_host VARCHAR(255) NOT NULL,
                db_port INTEGER DEFAULT 3306,
                db_name VARCHAR(255) NOT NULL,
                db_user VARCHAR(255) NOT NULL,
                db_password VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("+ Created 'leaderboards' table")
        
        # Получаем текущие поля таблицы modes
        cursor.execute("PRAGMA table_info(modes)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Удаляем старые поля из modes (если они есть)
        old_leaderboard_fields = [
            'leaderboard_enabled', 'leaderboard_table', 'leaderboard_db_host',
            'leaderboard_db_port', 'leaderboard_db_name', 'leaderboard_db_user',
            'leaderboard_db_password'
        ]
        
        fields_to_remove = [f for f in old_leaderboard_fields if f in columns]
        
        if fields_to_remove:
            print(f"\nRemoving old leaderboard fields from modes table: {', '.join(fields_to_remove)}")
            
            # SQLite не поддерживает DROP COLUMN, поэтому пересоздаем таблицу
            # 1. Создаем временную таблицу
            cursor.execute("""
                CREATE TABLE modes_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    slug VARCHAR(100) NOT NULL UNIQUE,
                    image VARCHAR(500),
                    server_id VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 2. Копируем данные
            cursor.execute("""
                INSERT INTO modes_new (id, name, slug, image, server_id, created_at, updated_at)
                SELECT id, name, slug, image, server_id, created_at, updated_at
                FROM modes
            """)
            
            # 3. Удаляем старую таблицу
            cursor.execute("DROP TABLE modes")
            
            # 4. Переименовываем новую таблицу
            cursor.execute("ALTER TABLE modes_new RENAME TO modes")
            
            print("+ Removed old leaderboard fields from modes table")
        else:
            print("+ No old leaderboard fields to remove from modes table")
        
        conn.commit()
        conn.close()
        
        print("\n[OK] Migration completed successfully!")
        print("\nТеперь топы управляются через отдельную таблицу 'leaderboards'.")
        print("Каждый режим может иметь несколько топов с разными настройками БД.")
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()

