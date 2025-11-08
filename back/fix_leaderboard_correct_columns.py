"""
Script to set correct column names based on actual MySQL table structure
"""

import sqlite3

def fix():
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    # Устанавливаем правильные названия колонок
    cursor.execute("""
        UPDATE leaderboards
        SET player_name_column = 'namecache',
            score_column = 'value'
        WHERE id = 1
    """)
    
    print(f"[OK] Updated leaderboard - set player_name_column='namecache', score_column='value'")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix()

