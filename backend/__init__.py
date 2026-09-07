import sys
from pathlib import Path

# Add root directory and backend directory to sys.path
_file_path = Path(__file__).resolve()
_backend_dir = str(_file_path.parent)
_root_dir = str(_file_path.parent.parent)

for _p in (_root_dir, _backend_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)
