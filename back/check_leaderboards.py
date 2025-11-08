"""
Script to check leaderboards table structure and data
"""

import sqlite3

def check():
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    # Проверяем структуру таблицы
    print("=== Table structure ===")
    cursor.execute("PRAGMA table_info(leaderboards)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"{col[1]}: {col[2]}")
    
    # Проверяем данные
    print("\n=== Leaderboard data ===")
    cursor.execute("SELECT id, mode_id, title, player_name_column, score_column FROM leaderboards")
    rows = cursor.fetchall()
    
    if rows:
        for row in rows:
            print(f"ID: {row[0]}, Mode: {row[1]}, Title: {row[2]}, Player Column: {row[3]}, Score Column: {row[4]}")
    else:
        print("No leaderboards found")
    
    conn.close()

if __name__ == "__main__":
    check()

