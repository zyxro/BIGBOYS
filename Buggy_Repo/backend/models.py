from pydantic import BaseModel

class Item():
    name: str #CHANGED FROM int to str
    description: str

class User(BaseModel):
    username: str
    bio: str
    
    # You can raise your hands and give the answer to the chocolate question
