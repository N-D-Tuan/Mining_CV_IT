from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class CursorPagination(BaseModel, Generic[T]):
    items: List[T]
    next_cursor: Optional[int] = None
    has_next: bool
    total: int = 0