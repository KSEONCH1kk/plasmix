"""
Script to change player_name_column back to 'name'
"""

import sqlite3

def fix():
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    # Меняем обратно на 'name'
    cursor.execute("""
        UPDATE leaderboards
        SET player_name_column = 'name'
        WHERE id = 1
    """)
    
    print(f"[OK] Updated {cursor.rowcount} leaderboard(s) - set player_name_column to 'name'")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix()

