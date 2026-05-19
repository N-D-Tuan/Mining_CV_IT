from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.timezone import to_vn_time
from core.redis import redis_client
from core.database import get_db
from core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest
from schemas.common import ApiResponse
 
router = APIRouter()
 
ACCESS_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60       # seconds
REFRESH_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600

def _set_auth_cookies(response: Response, user_id: int) -> tuple[str, str]:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
 
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_MAX_AGE,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_MAX_AGE,
        path="/api/v1/auth/refresh-token",   # chỉ gửi lên endpoint này
    )
    return access_token, refresh_token

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
 
    user = User(
        user_name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
 
    _set_auth_cookies(response, user.id)
 
    return ApiResponse(
        message="Đăng ký thành công",
        data={"id": user.id, "email": user.email, "user_name": user.user_name},
    )

@router.post("/login")
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
 
    _set_auth_cookies(response, user.id)
 
    return ApiResponse(
        message="Đăng nhập thành công",
        data={
            "id": user.id,
            "email": user.email,
            "user_name": user.user_name,
            "created_at": to_vn_time(user.created_at), # UTC + 7 | to_vn_time viết ở core/timezone.py
        },
    )

@router.post("/refresh-token")
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token không hợp lệ hoặc đã hết hạn",
    )
    if not refresh_token:
        raise credentials_exception
    try:
        user_id = decode_token(refresh_token, token_type="refresh")
    except JWTError:
        raise credentials_exception
 
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise credentials_exception
 
    _set_auth_cookies(response, user.id)
 
    return ApiResponse(message="Token đã được làm mới")

@router.post("/logout")
async def logout(
    response: Response,
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None),
):
    # Blacklist access_token vào Redis cho đến khi nó hết hạn tự nhiên
    if access_token:
        try:
            await redis_client.set(
                f"blacklist:{access_token}",
                "1",
                ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )
        except Exception:
            pass  # Redis lỗi thì vẫn cho logout, chỉ xóa cookie
 
    # Blacklist refresh_token
    if refresh_token:
        try:
            await redis_client.set(
                f"blacklist:{refresh_token}",
                "1",
                ex=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
            )
        except Exception:
            pass
 
    # Xóa cookie ở client
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/v1/auth/refresh-token")
 
    return ApiResponse(message="Đăng xuất thành công")