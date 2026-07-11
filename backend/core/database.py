from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False, "timeout": 15}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import threading
from sqlalchemy import event

def run_export_async():
    def _export():
        try:
            from backend.core.exporter import export_db_to_csv
            db = SessionLocal()
            try:
                export_db_to_csv(db)
            finally:
                db.close()
        except Exception as e:
            print(f"Background CSV export failed: {e}")
    threading.Thread(target=_export, daemon=True).start()

@event.listens_for(SessionLocal, 'after_commit')
def receive_after_commit(session):
    run_export_async()
