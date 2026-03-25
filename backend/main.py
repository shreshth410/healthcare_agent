"""
FastAPI Backend
Provides REST endpoints for the Healthcare AI Agent system.
"""

import sys
import os
import json

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from agents.orchestrator import run_pipeline, run_clarification
from agents.audit_agent import get_session, get_recent_sessions

# ── App Setup ────────────────────────────────────────────────────────────

app = FastAPI(
    title="Healthcare AI Agent",
    description="Multi-agent system for ICD-10/CPT medical coding",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session state cache for clarification flow
# Maps session_id → pipeline state
_session_cache: dict[str, dict] = {}


# ── Request/Response Models ──────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    note: str


class ClarifyRequest(BaseModel):
    clarification: str


# ── Endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_note(request: AnalyzeRequest):
    """
    Analyze a clinical note and return coding results.

    Runs the full agent pipeline: extraction → enrichment → coding → compliance → audit.
    """
    if not request.note or not request.note.strip():
        raise HTTPException(status_code=400, detail="Clinical note cannot be empty")

    try:
        result = run_pipeline(request.note.strip())

        # Cache the state for potential clarification
        final_output = result.get("final_output", {})
        session_id = final_output.get("session_id", "")
        if session_id:
            _session_cache[session_id] = result

        return {
            "session_id": session_id,
            "timestamp": final_output.get("timestamp", ""),
            "approved_codes": final_output.get("approved_codes", {}),
            "needs_clarification": final_output.get("needs_clarification", False),
            "clarification_question": final_output.get("clarification_question", ""),
            "escalated": final_output.get("escalated", False),
            "escalation_reason": final_output.get("escalation_reason", ""),
            "compliance_notes": final_output.get("compliance_notes", ""),
            "removed_codes": final_output.get("removed_codes", []),
            "extracted": result.get("extracted", {}),
            "retrieved_codes": result.get("retrieved_codes", []),
            "assigned_codes": result.get("assigned_codes", {}),
        }

    except Exception as e:
        print(f"[API] Error in /analyze: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {str(e)}"
        )


@app.post("/clarify/{session_id}")
async def clarify_session(session_id: str, request: ClarifyRequest):
    """
    Re-run the pipeline from coding with clarification response.
    """
    if not request.clarification or not request.clarification.strip():
        raise HTTPException(status_code=400, detail="Clarification cannot be empty")

    # Get cached state
    previous_state = _session_cache.get(session_id)
    if not previous_state:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found in cache. It may have expired."
        )

    try:
        result = run_clarification(previous_state, request.clarification.strip())

        # Update cache with new state
        final_output = result.get("final_output", {})
        new_session_id = final_output.get("session_id", session_id)
        _session_cache[new_session_id] = result

        # Clean up old session from cache
        if new_session_id != session_id:
            _session_cache.pop(session_id, None)

        return {
            "session_id": new_session_id,
            "timestamp": final_output.get("timestamp", ""),
            "approved_codes": final_output.get("approved_codes", {}),
            "needs_clarification": final_output.get("needs_clarification", False),
            "clarification_question": final_output.get("clarification_question", ""),
            "escalated": final_output.get("escalated", False),
            "escalation_reason": final_output.get("escalation_reason", ""),
            "compliance_notes": final_output.get("compliance_notes", ""),
            "removed_codes": final_output.get("removed_codes", []),
            "extracted": result.get("extracted", {}),
            "retrieved_codes": result.get("retrieved_codes", []),
            "assigned_codes": result.get("assigned_codes", {}),
        }

    except Exception as e:
        print(f"[API] Error in /clarify: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Clarification pipeline error: {str(e)}"
        )


@app.get("/audit/{session_id}")
async def get_audit(session_id: str):
    """Retrieve the full audit log for a session."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found"
        )
    return session


@app.get("/sessions")
async def list_sessions():
    """Return the last 20 session summaries."""
    sessions = get_recent_sessions(limit=20)
    return {"sessions": sessions}
