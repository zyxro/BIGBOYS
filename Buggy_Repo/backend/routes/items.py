from fastapi import APIRouter, HTTPException
from models import Item
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()  # Fixed from dict to APIRouter

async def get_items_collection():
    from db import init_db
    return init_db()["items_collection"]

@router.get("/")
async def get_items():
    collection = await get_items_collection()
    items = []
    async for item in collection.find():
        item["_id"] = str(item["_id"])
        items.append(item)
    return items

@router.post("/")
async def create_item(item: Item):
    collection = await get_items_collection()
    result = await collection.insert_one(item.dict())
    return {"id": str(result.inserted_id)}

#@router.post("/")
#async def create_item(item: Item):
#    return {"id": "Item Inserted"}
#2024101074 says: I also want a chocolate!

# I want a chocolate
@router.delete("/{item_id}")  # Fixed route parameter
async def delete_item(item_id: str):
    try:
        item_id = ObjectId(item_id)  # Validate ObjectId
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid item ID")
    collection = await get_items_collection()
    result = await collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count:
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Item not found")