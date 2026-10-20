# LabVerse solver API (FastAPI). Build from the repository root:
#   docker build -f backend/Dockerfile -t labverse-backend .
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

COPY backend/requirements.txt backend/requirements.txt
RUN pip install -r backend/requirements.txt

COPY backend backend

RUN useradd --system --uid 10001 labverse
USER labverse

EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request as u; u.urlopen('http://127.0.0.1:8000/health', timeout=2)" || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
