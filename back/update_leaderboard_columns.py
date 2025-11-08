"""
Script to update existing leaderboards with default column names
"""

import sqlite3

def update():
    try:
        print("Updating existing leaderboards with default column names...")
        
        conn = sqlite3.connect('plasmix.db')
        cursor = conn.cursor()
        
        # Обновляем существующие записи, где player_name_column или score_column NULL
        cursor.execute("""
            UPDATE leaderboards
            SET player_name_column = 'player_name',
                score_column = 'value'
            WHERE player_name_column IS NULL OR score_column IS NULL
        """)
        
        rows_updated = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        print(f"[OK] Updated {rows_updated} leaderboard(s)")
        
    except Exception as e:
        print(f"[ERROR] Failed to update: {e}")

if __name__ == "__main__":
    update()

