from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import decode_token
from models.user import User


async def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Chưa đăng nhập hoặc token không hợp lệ",
    )
    if not access_token:
        raise credentials_exception
    try:
        user_id = decode_token(access_token, token_type="access")
    except JWTError:
        raise credentials_exception

    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise credentials_exception
    return user