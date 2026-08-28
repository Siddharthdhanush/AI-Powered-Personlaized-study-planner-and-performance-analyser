import subprocess
import shutil
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.ai.llm_client import check_vllm_health, get_llm_telemetry
from backend.user.models import Student
from backend.syllabus.models import Subject, Topic
from backend.planning.models import StudyPlan
from backend.ai.models import Assessment

router = APIRouter()

def get_gpu_metrics() -> dict:
    """
    Executes nvidia-smi to query GPU Utilization %, Used VRAM, Total VRAM, and GPU Temperature.
    Falls back gracefully if nvidia-smi is not available.
    """
    nvidia_smi_path = shutil.which("nvidia-smi")
    if not nvidia_smi_path:
        return {
            "available": False,
            "gpu_name": "NVIDIA GPU (WSL2 Direct)",
            "utilization_pct": 0,
            "used_vram_mb": 0,
            "total_vram_mb": 0,
            "vram_utilization_pct": 0,
            "temperature_c": None,
            "message": "nvidia-smi CLI tool not found in host PATH"
        }

    try:
        cmd = [
            nvidia_smi_path,
            "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu",
            "--format=csv,noheader,nounits"
        ]
        output = subprocess.check_output(cmd, encoding="utf-8", timeout=3).strip()
        lines = output.splitlines()
        if lines:
            parts = [p.strip() for p in lines[0].split(",")]
            gpu_name = parts[0] if len(parts) > 0 else "NVIDIA GPU"
            gpu_util = float(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0.0
            used_vram = float(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0.0
            total_vram = float(parts[3]) if len(parts) > 3 and parts[3].isdigit() else 1.0
            temp_c = float(parts[4]) if len(parts) > 4 and parts[4].isdigit() else 0.0

            vram_pct = round((used_vram / total_vram) * 100.0, 1) if total_vram > 0 else 0.0

            return {
                "available": True,
                "gpu_name": gpu_name,
                "utilization_pct": gpu_util,
                "used_vram_mb": used_vram,
                "total_vram_mb": total_vram,
                "vram_utilization_pct": vram_pct,
                "temperature_c": temp_c,
                "message": "Active GPU Metrics via nvidia-smi"
            }
    except Exception as e:
        return {
            "available": False,
            "gpu_name": "NVIDIA GPU",
            "utilization_pct": 0,
            "used_vram_mb": 0,
            "total_vram_mb": 0,
            "vram_utilization_pct": 0,
            "temperature_c": None,
            "message": f"Error querying nvidia-smi: {str(e)}"
        }

@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    """
    Server Admin Orchestrator Endpoint.
    Provides real-time telemetry for GPU usage, vLLM inference health, feature call counts,
    active student statistics, and ML pipeline status.
    """
    gpu_stats = get_gpu_metrics()
    vllm_health = check_vllm_health()
    llm_telemetry = get_llm_telemetry()

    student_count = db.query(Student).count()
    subject_count = db.query(Subject).count()
    topic_count = db.query(Topic).count()
    plan_count = db.query(StudyPlan).count()
    assessment_count = db.query(Assessment).count()

    from backend.ml.pipeline import _mastery_model, _readiness_model
    ml_status = {
        "mastery_decision_tree": "trained" if _mastery_model is not None else "uninitialized",
        "readiness_logistic_regression": "trained" if _readiness_model is not None else "uninitialized"
    }

    return {
        "status": "success",
        "gpu_metrics": gpu_stats,
        "vllm_health": vllm_health,
        "llm_telemetry": llm_telemetry,
        "system_stats": {
            "registered_students": student_count,
            "total_subjects": subject_count,
            "total_topics": topic_count,
            "study_plans_generated": plan_count,
            "quiz_assessments_taken": assessment_count
        },
        "ml_pipeline_status": ml_status
    }
