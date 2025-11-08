from fastapi import APIRouter, Depends, Query
from typing import List, Optional
import os
import pymysql
from pymysql.cursors import DictCursor

router = APIRouter()
LITEBANS_HOST = os.getenv("LITEBANS_HOST", "localhost")
LITEBANS_PORT = int(os.getenv("LITEBANS_PORT", "3306"))
LITEBANS_USER = os.getenv("LITEBANS_USER", "test")
LITEBANS_PASSWORD = os.getenv("LITEBANS_PASSWORD", "test")
LITEBANS_DATABASE = os.getenv("LITEBANS_DATABASE", "test")

def get_litebans_connection():
    return pymysql.connect(
        host=LITEBANS_HOST,
        port=LITEBANS_PORT,
        user=LITEBANS_USER,
        password=LITEBANS_PASSWORD,
        database=LITEBANS_DATABASE,
        cursorclass=DictCursor
    )

@router.get("/")
async def get_banlist(
    type: str = Query("bans", regex="^(all|bans|mutes|kicks)$"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    try:
        connection = get_litebans_connection()
        
        with connection.cursor() as cursor:
            records = []
            tables = []
            if type == "all":
                tables = [
                    ("litebans_bans", "ban"),
                    ("litebans_mutes", "mute"),
                    ("litebans_kicks", "kick")
                ]
            elif type == "bans":
                tables = [("litebans_bans", "ban")]
            elif type == "mutes":
                tables = [("litebans_mutes", "mute")]
            elif type == "kicks":
                tables = [("litebans_kicks", "kick")]
            
            for table_name, record_type in tables:
                cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
                if not cursor.fetchone():
                    continue
                query = f"""
                    SELECT 
                        id,
                        uuid,
                        banned_by_uuid,
                        banned_by_name,
                        reason,
                        time,
                        until,
                        server_origin,
                        server_scope,
                        active,
                        ipban
                    FROM {table_name}
                    WHERE uuid IS NOT NULL 
                      AND uuid != '#offline#'
                      AND active = 1
                    ORDER BY time DESC
                    LIMIT {limit} OFFSET {offset}
                """
                cursor.execute(query)
                results = cursor.fetchall()
                
                for record in results:
                    records.append({
                        "id": record["id"],
                        "uuid": record["uuid"],
                        "banned_by_uuid": record["banned_by_uuid"],
                        "banned_by_name": record["banned_by_name"],
                        "reason": record["reason"],
                        "time": record["time"],
                        "until": record["until"],
                        "server_origin": record["server_origin"],
                        "server_scope": record["server_scope"],
                        "active": record["active"],
                        "ipban": record["ipban"],
                        "type": record_type
                    })
        
        connection.close()
        return records
    except Exception as e:
        if 'connection' in locals():
            connection.close()
        raise e

