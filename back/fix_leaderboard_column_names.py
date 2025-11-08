"""
Script to fix column names for existing leaderboard
"""

import sqlite3

def fix():
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    # Обновляем колонку с name на player_name
    cursor.execute("""
        UPDATE leaderboards
        SET player_name_column = 'player_name'
        WHERE player_name_column = 'name'
    """)
    
    print(f"[OK] Updated {cursor.rowcount} leaderboard(s)")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix()

