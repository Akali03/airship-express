OR-Tools microservice

Quick start (Windows / macOS / Linux):

1. Create a virtualenv and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# or `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
```

2. Run the optional FastAPI optimizer service that the Next.js FTM app calls. From this directory:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

The service exposes `GET /health` and `POST /optimize`. Set the server-only
`ORTOOLS_SERVICE_URL` variable in the FTM Next.js environment to
`https://airship-ftm-ortoolss.onrender.com/optimize` in production. Do not
prefix it with `NEXT_PUBLIC_`. Route-planning requests fail visibly if the
service is unavailable; they do not use the browser or local Python heuristic.
This FastAPI app uses OR-Tools and requests road distances from OSRM; if OSRM
is unavailable, it runs OR-Tools over straight-line distances instead.

Route-planning requests may include a terminal `destination` in addition to
the starting `depot`; the optimizer visits all stops and ends at that destination.

`optimize_service.py` is a legacy Flask implementation and does not use OSRM.
