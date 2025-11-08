import re
import html
from typing import Optional
from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)
class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.blocked_ips = {}
    
    def is_allowed(self, identifier: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
        now = datetime.now()
        if identifier in self.blocked_ips:
            if now < self.blocked_ips[identifier]:
                return False
            else:
                del self.blocked_ips[identifier]
        cutoff = now - timedelta(seconds=window_seconds)
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > cutoff
        ]
        if len(self.requests[identifier]) >= max_requests:
            self.blocked_ips[identifier] = now + timedelta(minutes=15)
            logger.warning(f"Rate limit exceeded for {identifier}, blocked for 15 minutes")
            return False
        self.requests[identifier].append(now)
        return True
rate_limiter = RateLimiter()
def sanitize_string(value: str, max_length: int = 255, allow_special: bool = False) -> str:
    if not value:
        return ""
    value = value[:max_length]
    value = html.escape(value)
    
    if not allow_special:
        value = re.sub(r'[^\w\s\-_]', '', value, flags=re.UNICODE)
    
    return value.strip()

def validate_username(username: str) -> str:
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    if not re.match(r'^[a-zA-Z0-9_]{3,16}$', username):
        raise HTTPException(
            status_code=400,
            detail="Invalid username format. Must be 3-16 characters, letters, numbers and underscore only"
        )
    
    return username

def validate_email(email: str) -> str:
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(email) > 255:
        raise HTTPException(status_code=400, detail="Email too long")
    
    return email.lower()

def validate_promocode(code: str) -> str:
    if not code:
        return ""
    code = code.upper().strip()
    if not re.match(r'^[A-Z0-9\-]{1,50}$', code):
        raise HTTPException(status_code=400, detail="Invalid promocode format")
    
    return code

def validate_command(command: str) -> str:
    if not command:
        return ""
    if len(command) > 1000:
        raise HTTPException(status_code=400, detail="Command too long")
    dangerous_commands = [
        'rm ', 'del ', 'format', 'shutdown', 'reboot',
        'sudo', 'chmod', 'chown', 'kill', 'pkill',
        '&&', '||', ';', '|', '>', '<', '`', '$(',
        'eval', 'exec', 'system'
    ]
    
    command_lower = command.lower()
    for dangerous in dangerous_commands:
        if dangerous in command_lower:
            logger.warning(f"Dangerous command detected: {command}")
            raise HTTPException(status_code=400, detail="Command contains forbidden characters or keywords")
    
    return command

def validate_url(url: str) -> str:
    if not url:
        return ""
    if not re.match(r'^https?://', url):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
    if len(url) > 2048:
        raise HTTPException(status_code=400, detail="URL too long")
    if any(char in url for char in ['<', '>', '"', "'"]):
        raise HTTPException(status_code=400, detail="URL contains invalid characters")
    
    return url

def validate_integer(value: any, min_value: int = None, max_value: int = None, field_name: str = "value") -> int:
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be an integer")
    
    if min_value is not None and int_value < min_value:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be at least {min_value}")
    
    if max_value is not None and int_value > max_value:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be at most {max_value}")
    
    return int_value

def validate_float(value: any, min_value: float = None, max_value: float = None, field_name: str = "value") -> float:
    try:
        float_value = float(value)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be a number")
    
    if min_value is not None and float_value < min_value:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be at least {min_value}")
    
    if max_value is not None and float_value > max_value:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: must be at most {max_value}")
    
    return float_value

def check_rate_limit(request: Request, max_requests: int = 5, window_seconds: int = 60):
    client_ip = request.client.host if request.client else "unknown"
    
    if not rate_limiter.is_allowed(client_ip, max_requests, window_seconds):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"

