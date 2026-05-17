from datetime import datetime, timezone, timedelta

VN_TZ = timezone(timedelta(hours=7))

def to_vn_time(dt: datetime) -> datetime:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(VN_TZ)