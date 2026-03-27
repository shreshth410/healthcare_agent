"""
Orchestrator
Defines the LangGraph StateGraph for the multi-agent medical coding pipeline.

Flow: extraction → enrichment → coding → compliance → (conditional) → audit → END
"""

import sys
import os
from typing import TypedDict

from langgraph.graph import StateGraph, END

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agents.extraction_agent import run_extraction
from agents.enrichment_agent import run_enrichment
from agents.coding_agent import run_coding
from agents.compliance_agent import run_compliance
from agents.audit_agent import run_audit


# ── State Schema ─────────────────────────────────────────────────────────

class PipelineState(TypedDict, total=False):
    """Full state schema for the medical coding pipeline."""
    raw_note: str
    extracted: dict
    retrieved_codes: list
    assigned_codes: dict
    compliance_result: dict
    audit_log: dict
    needs_clarification: bool
    clarification_question: str
    clarification_response: str
    escalated: bool
    final_output: dict
    reflection_count: int
    reflection_feedback: str


# ── Node Functions ───────────────────────────────────────────────────────

def extraction_node(state: PipelineState) -> dict:
    """Run the extraction agent on the raw clinical note."""
    print("\n" + "=" * 50)
    print("🔍 EXTRACTION AGENT — Analyzing clinical note...")
    print("=" * 50)

    raw_note = state.get("raw_note", "")
    extracted = run_extraction(raw_note)

    # Check for ambiguous fields
    ambiguous = extracted.get("ambiguous_fields", [])
    needs_clarification = len(ambiguous) > 0

    print(f"  ✓ Extracted {len(extracted.get('symptoms', []))} symptoms")
    print(f"  ✓ Extracted {len(extracted.get('medications', []))} medications")
    if needs_clarification:
        print(f"  ⚠ Found {len(ambiguous)} ambiguous fields: {ambiguous}")

    return {
        "extracted": extracted,
        "needs_clarification": needs_clarification,
    }


def enrichment_node(state: PipelineState) -> dict:
    """Run the enrichment agent to retrieve candidate codes."""
    print("\n" + "=" * 50)
    print("📚 ENRICHMENT AGENT — Retrieving candidate codes...")
    print("=" * 50)

    extracted = state.get("extracted", {})
    retrieved_codes = run_enrichment(extracted)

    icd_count = sum(1 for c in retrieved_codes if c.get("type") == "ICD10")
    cpt_count = sum(1 for c in retrieved_codes if c.get("type") == "CPT")
    print(f"  ✓ Retrieved {icd_count} ICD-10 and {cpt_count} CPT candidates")

    return {
        "retrieved_codes": retrieved_codes,
    }


def coding_node(state: PipelineState) -> dict:
    """Run the coding agent to assign codes with confidence."""
    print("\n" + "=" * 50)
    print("🏷️  CODING AGENT — Assigning codes with confidence...")
    print("=" * 50)

    extracted = state.get("extracted", {})
    retrieved_codes = state.get("retrieved_codes", [])
    clarification = state.get("clarification_response", "")
    reflection_fb = state.get("reflection_feedback", "")

    # Increment reflection count if feedback exists (means we loop back)
    count = state.get("reflection_count", 0)
    if reflection_fb:
        print(f"  ↺ Reflection pass {count + 1}: Applying feedback...")
        count += 1

    assigned = run_coding(extracted, retrieved_codes, clarification, reflection_fb)

    icd_count = len(assigned.get("icd10_codes", []))
    cpt_count = len(assigned.get("cpt_codes", []))
    confidence = assigned.get("overall_confidence", 0.0)
    print(f"  ✓ Assigned {icd_count} ICD-10, {cpt_count} CPT codes")
    print(f"  ✓ Overall confidence: {confidence:.2%}")
    if assigned.get("recommend_escalation"):
        print("  ⚠ Escalation recommended")

    return {
        "assigned_codes": assigned,
        "reflection_count": count,
        "reflection_feedback": "", # Clear it for the next pass
    }


def compliance_node(state: PipelineState) -> dict:
    """Run the compliance agent to verify and enforce guardrails."""
    print("\n" + "=" * 50)
    print("🛡️  COMPLIANCE AGENT — Verifying codes & guardrails...")
    print("=" * 50)

    extracted = state.get("extracted", {})
    assigned = state.get("assigned_codes", {})
    needs_clarification = state.get("needs_clarification", False)

    result = run_compliance(extracted, assigned, needs_clarification)

    # Update state from compliance result
    updates = {
        "compliance_result": result,
        "needs_clarification": result.get("needs_clarification", False),
        "clarification_question": result.get("clarification_question", ""),
        "escalated": result.get("escalated", False),
        "needs_reflection": result.get("needs_reflection", False),
        "reflection_feedback": result.get("reflection_feedback", ""),
    }

    if result.get("needs_clarification"):
        print(f"  ⚠ Clarification needed: {result.get('clarification_question', '')[:80]}...")
    if result.get("escalated"):
        print(f"  🚨 ESCALATED: {result.get('escalation_reason', '')[:80]}...")
    if result.get("needs_reflection"):
        print(f"  🤔 REFLECTION NEEDED: {result.get('reflection_feedback', '')[:80]}...")
    if result.get("removed_codes"):
        print(f"  ✗ Removed {len(result['removed_codes'])} non-compliant codes")

    approved = result.get("approved_codes", {})
    icd_count = len(approved.get("icd10_codes", []))
    cpt_count = len(approved.get("cpt_codes", []))
    print(f"  ✓ Approved {icd_count} ICD-10, {cpt_count} CPT codes")

    return updates


def audit_node(state: PipelineState) -> dict:
    """Run the audit agent to log the session."""
    print("\n" + "=" * 50)
    print("📝 AUDIT AGENT — Logging session...")
    print("=" * 50)

    audit_log = run_audit(state)

    # Build final output
    compliance_result = state.get("compliance_result", {})
    approved_codes = compliance_result.get("approved_codes", state.get("assigned_codes", {}))

    final_output = {
        "session_id": audit_log.get("session_id", ""),
        "timestamp": audit_log.get("timestamp", ""),
        "approved_codes": approved_codes,
        "needs_clarification": state.get("needs_clarification", False),
        "clarification_question": state.get("clarification_question", ""),
        "escalated": state.get("escalated", False),
        "escalation_reason": compliance_result.get("escalation_reason", ""),
        "compliance_notes": compliance_result.get("compliance_notes", ""),
        "removed_codes": compliance_result.get("removed_codes", []),
    }

    print(f"  ✓ Session logged: {audit_log.get('session_id', 'N/A')}")

    return {
        "audit_log": audit_log,
        "final_output": final_output,
    }


# ── Conditional Edge ─────────────────────────────────────────────────────

def after_compliance(state: PipelineState) -> str:
    """
    Determine next step after compliance check.

    Returns:
        - "coding" if needs_reflection and count < 2
        - "audit" otherwise.
    """
    needs_reflection = state.get("compliance_result", {}).get("needs_reflection", False)
    count = state.get("reflection_count", 0)

    if needs_reflection and count < 2:
        return "coding"
    
    # All other paths go to audit. If count >= 2, we just audit the (possibly escalated) state.
    if needs_reflection and count >= 2:
        print("  ⚠ Maximum reflection loops reached. Proceeding to audit.")

    return "audit"


# ── Build Graph ──────────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    """Build and compile the LangGraph StateGraph."""
    graph = StateGraph(PipelineState)

    # Add nodes
    graph.add_node("extraction", extraction_node)
    graph.add_node("enrichment", enrichment_node)
    graph.add_node("coding", coding_node)
    graph.add_node("compliance", compliance_node)
    graph.add_node("audit", audit_node)

    # Set entry point
    graph.set_entry_point("extraction")

    # Add edges
    graph.add_edge("extraction", "enrichment")
    graph.add_edge("enrichment", "coding")
    graph.add_edge("coding", "compliance")

    # Conditional edge after compliance
    graph.add_conditional_edges(
        "compliance",
        after_compliance,
        {"audit": "audit", "coding": "coding"},
    )

    # Audit → END
    graph.add_edge("audit", END)

    return graph.compile()


def build_clarification_graph() -> StateGraph:
    """
    Build a sub-graph for re-running after clarification.
    Starts from coding (with clarification_response in state).
    """
    graph = StateGraph(PipelineState)

    graph.add_node("coding", coding_node)
    graph.add_node("compliance", compliance_node)
    graph.add_node("audit", audit_node)

    graph.set_entry_point("coding")
    graph.add_edge("coding", "compliance")
    graph.add_conditional_edges(
        "compliance",
        after_compliance,
        {"audit": "audit", "coding": "coding"},
    )
    graph.add_edge("audit", END)

    return graph.compile()


# ── Public API ───────────────────────────────────────────────────────────

# Pre-compiled graphs
pipeline = build_graph()
clarification_pipeline = build_clarification_graph()


def run_pipeline(raw_note: str) -> dict:
    """
    Run the full medical coding pipeline on a clinical note.

    Args:
        raw_note: The raw clinical note text.

    Returns:
        Complete pipeline state dict.
    """
    initial_state: PipelineState = {
        "raw_note": raw_note,
        "extracted": {},
        "retrieved_codes": [],
        "assigned_codes": {},
        "compliance_result": {},
        "audit_log": {},
        "needs_clarification": False,
        "clarification_question": "",
        "clarification_response": "",
        "escalated": False,
        "final_output": {},
        "reflection_count": 0,
        "reflection_feedback": "",
    }

    print("\n" + "🏥" * 25)
    print("  HEALTHCARE AI AGENT — Starting Analysis")
    print("🏥" * 25)

    result = pipeline.invoke(initial_state)
    return dict(result)


def run_clarification(previous_state: dict, clarification_response: str) -> dict:
    """
    Re-run the pipeline from coding with clarification.

    Args:
        previous_state: The state from the previous run.
        clarification_response: User's clarification text.

    Returns:
        Updated pipeline state dict.
    """
    # Update state with clarification
    state = dict(previous_state)
    state["clarification_response"] = clarification_response
    state["needs_clarification"] = False
    state["clarification_question"] = ""

    print("\n" + "🏥" * 25)
    print("  HEALTHCARE AI AGENT — Re-running with Clarification")
    print("🏥" * 25)

    result = clarification_pipeline.invoke(state)
    return dict(result)
