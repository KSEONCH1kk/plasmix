"""
Migration script to add player_name_column and score_column to leaderboards table
"""

import sqlite3
import sys

def migrate():
    try:
        print("Starting migration: adding column name fields to leaderboards table...")
        
        conn = sqlite3.connect('plasmix.db')
        cursor = conn.cursor()
        
        # Получаем текущие поля таблицы leaderboards
        cursor.execute("PRAGMA table_info(leaderboards)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Добавляем player_name_column если его нет
        if 'player_name_column' not in columns:
            cursor.execute("""
                ALTER TABLE leaderboards
                ADD COLUMN player_name_column VARCHAR(100) DEFAULT 'name'
            """)
            print("+ Added 'player_name_column' column")
        else:
            print("+ Column 'player_name_column' already exists")
        
        # Добавляем score_column если его нет
        if 'score_column' not in columns:
            cursor.execute("""
                ALTER TABLE leaderboards
                ADD COLUMN score_column VARCHAR(100) DEFAULT 'value'
            """)
            print("+ Added 'score_column' column")
        else:
            print("+ Column 'score_column' already exists")
        
        conn.commit()
        conn.close()
        
        print("\n[OK] Migration completed successfully!")
        print("\nТеперь вы можете указывать названия колонок для имени игрока и очков в БД.")
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()

