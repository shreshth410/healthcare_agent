"""
Compliance Agent
Uses Gemini 2.0 Flash for:
1. Ambiguity handling — generating targeted clarification questions
2. Guardrail enforcement — escalating low-confidence cases
3. Compliance checking — verifying codes match documented findings
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))

COMPLIANCE_PROMPT = """You are a medical coding compliance officer. Your job is to review assigned medical codes 
and ensure they are clinically supported, compliant with coding guidelines, and properly documented.

EXTRACTED CLINICAL DATA:
{extracted}

ASSIGNED CODES:
{assigned_codes}

AMBIGUOUS FIELDS IDENTIFIED:
{ambiguous_fields}

NEEDS CLARIFICATION: {needs_clarification}

INSTRUCTIONS:
Perform three checks:

1. COMPLIANCE CHECK
   - Verify each ICD-10 code has a corresponding symptom/condition in the clinical note.
   - Verify each CPT code has a corresponding procedure/service in the clinical note.
   - If a code has no supporting documentation, mark it for removal.

2. AMBIGUITY ASSESSMENT
   - If there are ambiguous fields, generate a SPECIFIC, TARGETED clarification question.
   - The question should explain WHY the clarification matters for coding (e.g., which codes depend on the answer).
   - Do NOT ask vague questions like "can you clarify?" — be specific about what information is needed.

3. ESCALATION ASSESSMENT
   - If overall_confidence < {confidence_threshold}, recommend escalation.
   - If there are contradictions in the documentation, recommend escalation.
   - Provide a clear, specific escalation reason.

Return ONLY valid JSON (no markdown, no backticks) with this schema:
{{
  "approved_codes": {{
    "icd10_codes": [same format as input, but with non-compliant codes removed],
    "cpt_codes": [same format as input, but with non-compliant codes removed],
    "overall_confidence": float,
    "coding_notes": "string"
  }},
  "removed_codes": [
    {{
      "code": "string",
      "reason": "string explaining why it was removed"
    }}
  ],
  "needs_clarification": boolean,
  "clarification_question": "string — specific, actionable question, or empty string",
  "escalated": boolean,
  "escalation_reason": "string — specific reason for escalation, or empty string",
  "compliance_notes": "string — summary of compliance review findings"
}}"""


def run_compliance(
    extracted: dict,
    assigned_codes: dict,
    needs_clarification: bool,
) -> dict:
    """
    Run compliance checks on assigned codes.

    Args:
        extracted: Dict from extraction agent.
        assigned_codes: Dict from coding agent.
        needs_clarification: Whether extraction flagged ambiguous fields.

    Returns:
        Dict with approved codes, clarification questions, and escalation status.
    """
    ambiguous_fields = extracted.get("ambiguous_fields", [])

    prompt = COMPLIANCE_PROMPT.format(
        extracted=json.dumps(extracted, indent=2),
        assigned_codes=json.dumps(assigned_codes, indent=2),
        ambiguous_fields=json.dumps(ambiguous_fields, indent=2),
        needs_clarification=needs_clarification,
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )

    model = genai.GenerativeModel("gemini-2.0-flash")

    # Try up to 2 times
    for attempt in range(2):
        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=4096,
                ),
            )

            response_text = response.text.strip()

            # Clean potential markdown wrapping
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                response_text = "\n".join(lines)

            result = json.loads(response_text)
            result = _validate_compliance_result(result, assigned_codes, needs_clarification)

            return result

        except json.JSONDecodeError as e:
            if attempt == 0:
                print(f"[ComplianceAgent] JSON parse failed (attempt 1), retrying: {e}")
                continue
            print(f"[ComplianceAgent] JSON parse failed (attempt 2), using fallback: {e}")
            return _fallback_compliance(assigned_codes, needs_clarification, ambiguous_fields)

        except Exception as e:
            if attempt == 0:
                print(f"[ComplianceAgent] API error (attempt 1), retrying: {e}")
                continue
            print(f"[ComplianceAgent] API error (attempt 2), using fallback: {e}")
            return _fallback_compliance(assigned_codes, needs_clarification, ambiguous_fields)

    return _fallback_compliance(assigned_codes, needs_clarification, ambiguous_fields)


def _validate_compliance_result(result: dict, assigned_codes: dict, needs_clarification: bool) -> dict:
    """Validate compliance result and enforce hard guardrails."""

    # Ensure required keys
    result.setdefault("approved_codes", assigned_codes)
    result.setdefault("removed_codes", [])
    result.setdefault("needs_clarification", needs_clarification)
    result.setdefault("clarification_question", "")
    result.setdefault("escalated", False)
    result.setdefault("escalation_reason", "")
    result.setdefault("compliance_notes", "")

    # ── HARD GUARDRAIL: Remove any code with confidence < threshold ──────
    approved = result.get("approved_codes", {})
    for code_list_key in ["icd10_codes", "cpt_codes"]:
        filtered = []
        for code in approved.get(code_list_key, []):
            conf = float(code.get("confidence", 0.0))
            if conf < CONFIDENCE_THRESHOLD:
                result["removed_codes"].append({
                    "code": code.get("code", "Unknown"),
                    "reason": f"Confidence {conf:.2f} below threshold {CONFIDENCE_THRESHOLD}",
                })
            else:
                filtered.append(code)
        approved[code_list_key] = filtered

    # Recalculate overall confidence
    all_confs = []
    for code_list_key in ["icd10_codes", "cpt_codes"]:
        for code in approved.get(code_list_key, []):
            all_confs.append(float(code.get("confidence", 0.0)))

    if all_confs:
        approved["overall_confidence"] = round(sum(all_confs) / len(all_confs), 3)
    else:
        approved["overall_confidence"] = 0.0
        result["escalated"] = True
        result["escalation_reason"] = (
            result.get("escalation_reason", "") +
            " All codes removed due to insufficient confidence."
        ).strip()

    result["approved_codes"] = approved

    # Enforce escalation if overall confidence is below threshold
    if approved.get("overall_confidence", 0.0) < CONFIDENCE_THRESHOLD:
        result["escalated"] = True
        if not result["escalation_reason"]:
            result["escalation_reason"] = (
                f"Overall confidence {approved['overall_confidence']:.2f} "
                f"is below the acceptable threshold of {CONFIDENCE_THRESHOLD}."
            )

    # If escalated, override clarification
    if result["escalated"]:
        result["needs_clarification"] = False
        result["clarification_question"] = ""

    return result


def _fallback_compliance(
    assigned_codes: dict,
    needs_clarification: bool,
    ambiguous_fields: list,
) -> dict:
    """
    Fallback compliance result when Gemini API fails.
    Applies hard guardrails without LLM reasoning.
    """
    approved = {
        "icd10_codes": [],
        "cpt_codes": [],
        "overall_confidence": 0.0,
        "coding_notes": "FALLBACK: Compliance API unavailable. Hard guardrails applied.",
    }
    removed = []

    for code_list_key in ["icd10_codes", "cpt_codes"]:
        for code in assigned_codes.get(code_list_key, []):
            conf = float(code.get("confidence", 0.0))
            if conf >= CONFIDENCE_THRESHOLD:
                approved[code_list_key].append(code)
            else:
                removed.append({
                    "code": code.get("code", "Unknown"),
                    "reason": f"Confidence {conf:.2f} below threshold {CONFIDENCE_THRESHOLD} (fallback mode)",
                })

    all_confs = []
    for key in ["icd10_codes", "cpt_codes"]:
        for code in approved[key]:
            all_confs.append(float(code.get("confidence", 0.0)))

    if all_confs:
        approved["overall_confidence"] = round(sum(all_confs) / len(all_confs), 3)

    clarification_question = ""
    if needs_clarification and ambiguous_fields:
        fields_str = ", ".join(ambiguous_fields[:3])
        clarification_question = (
            f"The following fields require clarification for accurate coding: {fields_str}. "
            f"Please provide additional details for these items."
        )

    escalated = approved["overall_confidence"] < CONFIDENCE_THRESHOLD
    escalation_reason = ""
    if escalated:
        escalation_reason = (
            f"Insufficient clinical documentation confidence ({approved['overall_confidence']:.2f}). "
            f"Compliance API unavailable for detailed review. Recommend physician review."
        )
        # If escalated, don't also ask for clarification
        needs_clarification = False
        clarification_question = ""

    return {
        "approved_codes": approved,
        "removed_codes": removed,
        "needs_clarification": needs_clarification,
        "clarification_question": clarification_question,
        "escalated": escalated,
        "escalation_reason": escalation_reason,
        "compliance_notes": "Fallback compliance check — hard guardrails applied, no LLM review performed.",
    }
