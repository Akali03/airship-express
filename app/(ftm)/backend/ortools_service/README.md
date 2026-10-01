OR-Tools microservice

Quick start (Windows / macOS / Linux):

1. Create a virtualenv and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# or `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
```

2. Run the FastAPI service that the Express backend calls. From this directory:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

The service exposes `GET /health` and `POST /optimize`. The Express backend
defaults to `http://localhost:8000/optimize` (`ORTOOLS_SERVICE_URL` can override
it). This FastAPI app uses OR-Tools and requests road distances from OSRM; if
OSRM is unavailable, it falls back to straight-line distances.

`optimize_service.py` is a legacy Flask implementation and does not use OSRM.
