from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.services.notification_service import (
    get_notifications, get_unread_count, mark_read, mark_all_read,
)
import logging

router = APIRouter(prefix="/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)

@router.get("/")
async def list_notifications(user: dict = Depends(get_current_user)):
    notifs = await get_notifications(str(user["_id"]))
    for n in notifs:
        n["id"] = str(n["_id"])
        n["user_id"] = str(n["user_id"])
        del n["_id"]
    return {"notifications": notifs, "unread_count": await get_unread_count(str(user["_id"]))}

@router.get("/unread-count")
async def unread_count(user: dict = Depends(get_current_user)):
    return {"unread_count": await get_unread_count(str(user["_id"]))}

@router.post("/{notif_id}/read")
async def read_notification(notif_id: str, user: dict = Depends(get_current_user)):
    if not await mark_read(str(user["_id"]), notif_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Marked as read"}

@router.post("/read-all")
async def read_all(user: dict = Depends(get_current_user)):
    count = await mark_all_read(str(user["_id"]))
    return {"message": f"{count} notifications marked as read"}
