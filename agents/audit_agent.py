"""
Audit Agent
Logs every coding session to SQLite for full audit trail.
No LLM required — pure Python + sqlite3.
"""

import os
import json
import uuid
import sqlite3
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./database/audit.db")


def _get_connection() -> sqlite3.Connection:
    """Get a connection to the SQLite database, creating dir if needed."""
    db_dir = os.path.dirname(SQLITE_DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_table(conn: sqlite3.Connection) -> None:
    """Create the coding_sessions table if it doesn't exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS coding_sessions (
            session_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            raw_note_preview TEXT,
            extraction_output TEXT,
            retrieved_codes TEXT,
            assigned_codes TEXT,
            compliance_result TEXT,
            needs_clarification INTEGER DEFAULT 0,
            clarification_question TEXT,
            clarification_response TEXT,
            escalated INTEGER DEFAULT 0,
            final_codes TEXT,
            overall_confidence REAL DEFAULT 0.0
        )
    """)
    conn.commit()


def run_audit(state: dict) -> dict:
    """
    Log a coding session to the SQLite audit database.

    Args:
        state: The full pipeline state dict.

    Returns:
        Dict with session_id and audit confirmation.
    """
    session_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    raw_note = state.get("raw_note", "")
    raw_note_preview = raw_note[:200] if raw_note else ""

    # Get compliance result for final state
    compliance_result = state.get("compliance_result", {})
    approved_codes = compliance_result.get("approved_codes", state.get("assigned_codes", {}))
    overall_confidence = approved_codes.get("overall_confidence", 0.0)

    needs_clarification = state.get("needs_clarification", False)
    escalated = state.get("escalated", False)

    try:
        conn = _get_connection()
        _ensure_table(conn)

        conn.execute(
            """
            INSERT INTO coding_sessions (
                session_id, timestamp, raw_note_preview,
                extraction_output, retrieved_codes, assigned_codes,
                compliance_result, needs_clarification, clarification_question,
                clarification_response, escalated, final_codes, overall_confidence
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                timestamp,
                raw_note_preview,
                json.dumps(state.get("extracted", {})),
                json.dumps(state.get("retrieved_codes", [])),
                json.dumps(state.get("assigned_codes", {})),
                json.dumps(compliance_result),
                1 if needs_clarification else 0,
                state.get("clarification_question", ""),
                state.get("clarification_response", ""),
                1 if escalated else 0,
                json.dumps(approved_codes),
                overall_confidence,
            ),
        )
        conn.commit()
        conn.close()

        print(f"[AuditAgent] Session {session_id} logged successfully")

        return {
            "session_id": session_id,
            "timestamp": timestamp,
            "logged": True,
        }

    except Exception as e:
        print(f"[AuditAgent] Error logging session: {e}")
        # Still return a session_id so the pipeline doesn't crash
        return {
            "session_id": session_id,
            "timestamp": timestamp,
            "logged": False,
            "error": str(e),
        }


def get_session(session_id: str) -> dict | None:
    """
    Retrieve a single session from the audit database.

    Args:
        session_id: UUID of the session.

    Returns:
        Dict with all session fields, or None if not found.
    """
    try:
        conn = _get_connection()
        _ensure_table(conn)

        cursor = conn.execute(
            "SELECT * FROM coding_sessions WHERE session_id = ?",
            (session_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row is None:
            return None

        return _row_to_dict(row)

    except Exception as e:
        print(f"[AuditAgent] Error retrieving session {session_id}: {e}")
        return None


def get_recent_sessions(limit: int = 20) -> list[dict]:
    """
    Retrieve the most recent sessions from the audit database.

    Args:
        limit: Maximum number of sessions to return.

    Returns:
        List of dicts with session summary fields.
    """
    try:
        conn = _get_connection()
        _ensure_table(conn)

        cursor = conn.execute(
            """
            SELECT session_id, timestamp, overall_confidence,
                   needs_clarification, escalated, raw_note_preview
            FROM coding_sessions
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        conn.close()

        sessions = []
        for row in rows:
            sessions.append({
                "session_id": row["session_id"],
                "timestamp": row["timestamp"],
                "overall_confidence": row["overall_confidence"],
                "needs_clarification": bool(row["needs_clarification"]),
                "escalated": bool(row["escalated"]),
                "raw_note_preview": row["raw_note_preview"],
            })

        return sessions

    except Exception as e:
        print(f"[AuditAgent] Error retrieving sessions: {e}")
        return []


def _row_to_dict(row: sqlite3.Row) -> dict:
    """Convert a sqlite3.Row to a regular dict with JSON fields parsed."""
    result = dict(row)

    # Parse JSON fields
    json_fields = [
        "extraction_output", "retrieved_codes", "assigned_codes",
        "compliance_result", "final_codes",
    ]
    for field in json_fields:
        if field in result and result[field]:
            try:
                result[field] = json.loads(result[field])
            except (json.JSONDecodeError, TypeError):
                pass

    # Convert integer booleans
    result["needs_clarification"] = bool(result.get("needs_clarification", 0))
    result["escalated"] = bool(result.get("escalated", 0))

    return result
