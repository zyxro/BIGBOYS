from fastapi import FastAPI
from routes.items import router as items_router
from routes.analytics import router as analytics_router
from routes.quiz import router as quiz_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
#from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#2024101074-added cors middlewear to handle CRUD operations in website


app.include_router(items_router, prefix="/items")
app.include_router(analytics_router)
app.include_router(quiz_router)

# why the hell did I write this function?
@app.get("/home")
async def get_home():
    return {"message": "Welcome to the Multi-Page FastAPI App!"}