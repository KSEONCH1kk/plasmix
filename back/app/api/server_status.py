from fastapi import APIRouter, HTTPException
import aiohttp
import asyncio
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
online_cache = {
    "players": 0,
    "max_players": 5000,
    "last_update": 0
}

CACHE_DURATION = 30  

async def fetch_server_status() -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            api_url = "https://api.mcstatus.io/v2/status/java/mc.reallyworld.ru?query=false&timeout=3"
            
            try:
                async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=5)) as response:

                    if response.status == 200:
                        data = await response.json()
                        online_status = data.get("online")
                        
                        if online_status == True:
                            players = data.get("players", {})
                          
                            
                            online_count = players.get("online", 0)
                            max_count = players.get("max", 5000)
                            
                            
                            
                            return {
                                "online": online_count,
                                "max": max_count
                            }
                        else:
                            return {
                                "online": 0,
                                "max": online_cache.get("max_players", 5000)
                            }
                    else:
                        response_text = await response.text()
                        logger.error(f"Response body: {response_text}")
            except asyncio.TimeoutError:
                logger.warning("API request timed out")
            except Exception as e:
                logger.error(f"Failed to fetch from API: {e}")
            logger.warning("Using cached/default data")
            return {
                "online": online_cache.get("players", 0),
                "max": online_cache.get("max_players", 5000)
            }
            
    except Exception as e:
        logger.error(f"Error fetching server status: {e}")
        return {
            "online": online_cache.get("players", 0),
            "max": online_cache.get("max_players", 5000)
        }

@router.get("/")
async def get_server_status():
    import time
    
    current_time = time.time()
    if current_time - online_cache.get("last_update", 0) < CACHE_DURATION:
        return {
            "online": online_cache.get("players", 0),
            "max": online_cache.get("max_players", 5000),
            "cached": True
        }
    try:
        status = await fetch_server_status()
        online_cache["players"] = status["online"]
        online_cache["max_players"] = status["max"]
        online_cache["last_update"] = current_time
        
        return {
            "online": status["online"],
            "max": status["max"],
            "cached": False
        }
    except Exception as e:
        logger.error(f"Error in get_server_status: {e}")
        return {
            "online": online_cache.get("players", 0),
            "max": online_cache.get("max_players", 5000),
            "cached": True,
            "error": "Failed to fetch fresh data"
        }

@router.post("/update")
async def update_server_status(online: int, max_players: int):
    import time
    
    online_cache["players"] = online
    online_cache["max_players"] = max_players
    online_cache["last_update"] = time.time()
    
    return {
        "success": True,
        "online": online,
        "max": max_players
    }

