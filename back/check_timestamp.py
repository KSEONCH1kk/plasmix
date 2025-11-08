"""
Script to check timestamp values in AJ LeaderBoards
"""

import pymysql
import sqlite3
from datetime import datetime

def check():
    # Получаем настройки подключения
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT db_host, db_port, db_name, db_user, db_password, db_table FROM leaderboards WHERE id = 2")
    row = cursor.fetchone()
    
    if not row:
        print("Leaderboard not found")
        return
    
    db_host, db_port, db_name, db_user, db_password, db_table = row
    conn.close()
    
    # Подключаемся к MySQL
    mysql_conn = pymysql.connect(
        host=db_host,
        port=db_port,
        user=db_user,
        password=db_password,
        database=db_name
    )
    
    with mysql_conn.cursor() as cursor:
        cursor.execute(f"SELECT namecache, value, daily_timestamp FROM `{db_table}` WHERE value > 0 LIMIT 5")
        rows = cursor.fetchall()
        
        print("=== Sample data ===")
        for row in rows:
            name, value, timestamp = row
            # Конвертируем timestamp из миллисекунд в дату
            if timestamp:
                dt = datetime.fromtimestamp(float(timestamp) / 1000)
                print(f"Player: {name}, Value: {value}, Timestamp: {timestamp}, Date: {dt}")
            else:
                print(f"Player: {name}, Value: {value}, Timestamp: {timestamp}")
        
        # Текущее время в миллисекундах
        import time
        now_ms = int(time.time() * 1000)
        print(f"\nCurrent timestamp (ms): {now_ms}")
        print(f"Current date: {datetime.fromtimestamp(now_ms / 1000)}")
    
    mysql_conn.close()

if __name__ == "__main__":
    check()

