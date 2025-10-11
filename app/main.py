from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database.connection import engine, Base
from .events import emitter
from .api.endpoints import auth, users, incomes, expenses, assets, liabilities, financial_events
# Import handlers to register them
from .events.handlers import user_handlers

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="AI-powered financial planning with Monte Carlo simulations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(incomes.router, prefix="/api", tags=["incomes"])
app.include_router(expenses.router, prefix="/api", tags=["expenses"])
app.include_router(assets.router, prefix="/api", tags=["assets"])
app.include_router(liabilities.router, prefix="/api", tags=["liabilities"])
app.include_router(financial_events.router, prefix="/api", tags=["financial-events"])

@app.get("/")
async def root():
    return {"message": "MonteCarlo Financial Planner API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
