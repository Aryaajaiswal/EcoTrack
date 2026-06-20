from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_current_user
from app.config.database import get_collection
from bson import ObjectId
import csv, io, json

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/carbon-data")
async def export_carbon_csv(user: dict = Depends(get_current_user)):
    activities = get_collection("activities")
    cursor = activities.find({"user_id": ObjectId(user["_id"])}).sort("date", -1).limit(1000)
    items = await cursor.to_list(length=1000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Category", "Amount (kg CO2)", "Description"])
    for a in items:
        writer.writerow([
            a.get("date", "").isoformat() if hasattr(a.get("date"), "isoformat") else str(a.get("date", "")),
            a.get("category", ""), a.get("amount", 0), a.get("description", ""),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ecotrack_carbon_data.csv"},
    )

@router.get("/profile")
async def export_profile_json(user: dict = Depends(get_current_user)):
    users = get_collection("users")
    u = await users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u["id"] = str(u["_id"])
    del u["_id"]
    u["created_at"] = u.get("created_at").isoformat() if u.get("created_at") else None
    u["last_active"] = u.get("last_active").isoformat() if u.get("last_active") else None
    return StreamingResponse(
        iter([json.dumps(u, indent=2)]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=ecotrack_profile.json"},
    )
