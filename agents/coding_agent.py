"""
Coding Agent
Uses Groq (llama-3.3-70b-versatile) to assign ICD-10 and CPT codes with confidence scores
based on extracted clinical data and retrieved candidate codes.
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

# Ensure .env is loaded from the project root regardless of cwd
_PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
_MODEL = "llama-3.3-70b-versatile"

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))

CODING_PROMPT = """You are an expert medical coder with deep knowledge of ICD-10-CM and CPT coding guidelines. 
Your task is to assign the most appropriate medical codes based on clinical documentation.

CLINICAL EXTRACTION:
{extracted}

CANDIDATE CODES FROM DATABASE:
{retrieved_codes}

{clarification_section}

INSTRUCTIONS:
1. Review the extracted clinical information carefully.
2. From the candidate codes provided, select the most appropriate ICD-10 and CPT codes.
3. You may also suggest codes not in the candidate list if clinically warranted, but prefer candidates.
4. Assign a confidence score (0.0 to 1.0) for each code based on how well the documentation supports it.
5. Provide clear reasoning for each code assignment.
6. If the clinical documentation is insufficient, contradictory, or ambiguous, reflect this in lower confidence scores.
7. NEVER assign a code with confidence above 0.80 if supporting documentation is weak or ambiguous.

Return ONLY valid JSON (no markdown, no backticks) with this exact schema:
{{
  "icd10_codes": [
    {{
      "code": "string",
      "description": "string",
      "confidence": 0.0,
      "reasoning": "string explaining why this code was assigned"
    }}
  ],
  "cpt_codes": [
    {{
      "code": "string",
      "description": "string",
      "confidence": 0.0,
      "reasoning": "string explaining why this code was assigned"
    }}
  ],
  "overall_confidence": 0.0,
  "coding_notes": "string with any additional observations about coding this case",
  "recommend_escalation": false
}}

Rules:
- Set recommend_escalation to true if overall_confidence < 0.60
- Set recommend_escalation to true if there are significant contradictions in the documentation
- overall_confidence should reflect the average confidence weighted by clinical significance
- Include at least one ICD-10 code (even if confidence is low)
- Only include CPT codes for procedures/services actually documented"""


def run_coding(extracted: dict, retrieved_codes: list[dict], clarification_response: str = "") -> dict:
    """
    Assign ICD-10 and CPT codes with confidence scores using Groq.

    Args:
        extracted: Dict from extraction agent.
        retrieved_codes: List of candidate codes from enrichment agent.
        clarification_response: Optional clarification from the user.

    Returns:
        Dict with assigned codes, confidence scores, and escalation recommendation.
    """
    # Build clarification section
    clarification_section = ""
    if clarification_response:
        clarification_section = f"""
CLARIFICATION PROVIDED:
The following additional information was provided to resolve ambiguities:
{clarification_response}

Take this clarification into account when assigning codes. It should help resolve
ambiguous fields and improve confidence in code assignment.
"""

    prompt = CODING_PROMPT.format(
        extracted=json.dumps(extracted, indent=2),
        retrieved_codes=json.dumps(retrieved_codes, indent=2),
        clarification_section=clarification_section,
    )

    # Try up to 2 times
    for attempt in range(2):
        try:
            response = _client.chat.completions.create(
                model=_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=4096,
            )

            response_text = response.choices[0].message.content.strip()

            # Clean potential markdown wrapping
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                response_text = "\n".join(lines)

            result = json.loads(response_text)

            # Validate and enforce guardrails
            result = _validate_coding_result(result)

            return result

        except json.JSONDecodeError as e:
            if attempt == 0:
                print(f"[CodingAgent] JSON parse failed (attempt 1), retrying: {e}")
                continue
            print(f"[CodingAgent] JSON parse failed (attempt 2), using fallback: {e}")
            return _fallback_coding(extracted, retrieved_codes)

        except Exception as e:
            if attempt == 0:
                print(f"[CodingAgent] ⚠ API error (attempt 1) [{type(e).__name__}]: {e}")
                continue
            print(f"[CodingAgent] ❌ API error (attempt 2) [{type(e).__name__}]: {e}")
            print(f"[CodingAgent] ❌ Falling back to RAG-only coding. Check your GROQ_API_KEY.")
            return _fallback_coding(extracted, retrieved_codes)

    return _fallback_coding(extracted, retrieved_codes)


def _validate_coding_result(result: dict) -> dict:
    """Validate and enforce coding guardrails on the result."""
    # Ensure required keys exist
    result.setdefault("icd10_codes", [])
    result.setdefault("cpt_codes", [])
    result.setdefault("overall_confidence", 0.0)
    result.setdefault("coding_notes", "")
    result.setdefault("recommend_escalation", False)

    # Ensure confidence values are valid floats
    for code_list_key in ["icd10_codes", "cpt_codes"]:
        for code in result.get(code_list_key, []):
            try:
                code["confidence"] = float(code.get("confidence", 0.0))
                code["confidence"] = max(0.0, min(1.0, code["confidence"]))
            except (ValueError, TypeError):
                code["confidence"] = 0.0

    try:
        result["overall_confidence"] = float(result.get("overall_confidence", 0.0))
        result["overall_confidence"] = max(0.0, min(1.0, result["overall_confidence"]))
    except (ValueError, TypeError):
        result["overall_confidence"] = 0.0

    # Enforce escalation if confidence is too low
    if result["overall_confidence"] < CONFIDENCE_THRESHOLD:
        result["recommend_escalation"] = True

    return result


def _fallback_coding(extracted: dict, retrieved_codes: list[dict]) -> dict:
    """
    Fallback coding when Gemini API fails.
    Uses retrieved codes with low confidence and recommends escalation.
    """
    icd10_codes = []
    cpt_codes = []

    for code in retrieved_codes:
        entry = {
            "code": code.get("code", "Unknown"),
            "description": code.get("description", "Unknown"),
            "confidence": min(0.40, code.get("similarity_score", 0.0)),
            "reasoning": "Auto-assigned from RAG retrieval — LLM coding unavailable, requires manual review",
        }
        if code.get("type") == "ICD10":
            icd10_codes.append(entry)
        else:
            cpt_codes.append(entry)

    return {
        "icd10_codes": icd10_codes[:5],
        "cpt_codes": cpt_codes[:3],
        "overall_confidence": 0.30,
        "coding_notes": "FALLBACK: Gemini API unavailable. Codes assigned from RAG retrieval only. Manual review required.",
        "recommend_escalation": True,
    }
