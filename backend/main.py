"""
LabVerse Backend FastAPI Service
Provides authoritative numerical circuit solving endpoint for Milestone D.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.solver.dc_solver import (
    CircuitSolveRequest,
    CircuitSolveResponse,
    solve_circuit,
)

app = FastAPI(
    title="LabVerse Simulation Engine API",
    version="1.0.0",
    description="Authoritative numerical and topological DC circuit solver for interactive STEM laboratories.",
)

# Enable CORS for local Vite dev server and browser clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "labverse-solver"}


@app.post("/api/solve", response_model=CircuitSolveResponse)
def solve_circuit_endpoint(req: CircuitSolveRequest) -> CircuitSolveResponse:
    return solve_circuit(req)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
