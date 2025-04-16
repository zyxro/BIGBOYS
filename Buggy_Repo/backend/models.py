from pydantic import BaseModel

class Item(BaseModel):  # Added BaseModel
    name: str  # Fixed from int to str
    description: str

class User(BaseModel):
    username: str
    bio: str
    
    # You can raise your hands and give the answer to the chocolate question