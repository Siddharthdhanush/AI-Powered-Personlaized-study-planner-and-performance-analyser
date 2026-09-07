import sys
from pathlib import Path

# Add project root and backend directory to sys.path
file_path = Path(__file__).resolve()
backend_dir = str(file_path.parent)
root_dir = str(file_path.parent.parent)

for path in (root_dir, backend_dir):
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.core.database import engine, Base
    from backend.user.routes import router as user_router
    from backend.syllabus.routes import router as syllabus_router
    from backend.planning.routes import router as planning_router
    from backend.ai.routes import router as ai_router
    from backend.ml.routes import router as ml_router
    from backend.admin.routes import router as admin_router
    import backend.user.models
    import backend.syllabus.models
    import backend.planning.models
    import backend.ai.models
    import backend.ml.models
except ImportError:
    from core.database import engine, Base
    from user.routes import router as user_router
    from syllabus.routes import router as syllabus_router
    from planning.routes import router as planning_router
    from ai.routes import router as ai_router
    from ml.routes import router as ml_router
    from admin.routes import router as admin_router
    import user.models
    import syllabus.models
    import planning.models
    import ai.models
    import ml.models

Base.metadata.create_all(bind=engine)

try:
    from backend.core.database import SessionLocal
except ImportError:
    from core.database import SessionLocal

from sqlalchemy import text
try:
    db = SessionLocal()
    db.execute(text("ALTER TABLE study_plans ADD COLUMN is_remedial BOOLEAN DEFAULT 0"))
    db.commit()
    db.close()
except Exception:
    pass

try:
    db = SessionLocal()
    db.execute(text("ALTER TABLE topics ADD COLUMN content_text TEXT"))
    db.commit()
    db.close()
except Exception:
    pass

app = FastAPI(title="AIML System API", description="Adaptive AI Exam Prep API")

@app.on_event("startup")
def startup_export():
    try:
        from backend.core.database import SessionLocal
        from backend.core.exporter import export_db_to_csv
    except ImportError:
        from core.database import SessionLocal
        from core.exporter import export_db_to_csv
    db = SessionLocal()
    try:
        export_db_to_csv(db)
    except Exception as e:
        print(f"Error doing startup data export: {e}")
    finally:
        db.close()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(syllabus_router, prefix="/api/syllabus", tags=["Syllabus"])
app.include_router(planning_router, prefix="/api/planning", tags=["Planning"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(ml_router, prefix="/api/ml", tags=["ML"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"message": "Welcome to the AIML System API"}

@app.on_event("shutdown")
def on_shutdown():
    print("FastAPI Backend shutdown complete.")
