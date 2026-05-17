from fastapi import APIRouter

from api.v1 import auth, users, jobs, fb_groups

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(fb_groups.router, prefix="/fb-groups", tags=["fb groups"])
