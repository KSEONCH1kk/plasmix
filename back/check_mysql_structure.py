"""
Script to check MySQL table structure
"""

import pymysql
import sqlite3

def check():
    # Получаем настройки подключения из leaderboard
    conn = sqlite3.connect('plasmix.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT db_host, db_port, db_name, db_user, db_password, db_table FROM leaderboards WHERE id = 1")
    row = cursor.fetchone()
    
    if not row:
        print("Leaderboard not found")
        return
    
    db_host, db_port, db_name, db_user, db_password, db_table = row
    conn.close()
    
    print(f"Connecting to MySQL: {db_host}:{db_port}/{db_name}")
    print(f"Table: {db_table}\n")
    
    try:
        # Подключаемся к MySQL
        mysql_conn = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
        
        with mysql_conn.cursor() as cursor:
            # Получаем структуру таблицы
            cursor.execute(f"DESCRIBE `{db_table}`")
            columns = cursor.fetchall()
            
            print("=== Table columns ===")
            for col in columns:
                print(f"Column: {col[0]}, Type: {col[1]}")
        
        mysql_conn.close()
        print("\n[OK] Successfully connected and retrieved table structure")
        
    except Exception as e:
        print(f"[ERROR] Failed to connect to MySQL: {e}")

if __name__ == "__main__":
    check()

