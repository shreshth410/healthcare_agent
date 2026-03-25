"""
Extraction Agent
Uses Gemini Flash to extract structured medical information from clinical notes.
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

EXTRACTION_PROMPT = """You are a medical information extraction specialist. Analyze the following clinical note and extract structured information.

Return ONLY valid JSON (no markdown, no backticks, no explanation) with exactly this schema:
{{
  "chief_complaint": "string — the primary reason for the visit",
  "symptoms": ["list of symptoms mentioned"],
  "vitals": {{"vital_name": "value with units"}},
  "history": ["list of relevant past medical history items"],
  "medications": ["list of current medications with dosages"],
  "procedures_mentioned": ["list of procedures mentioned or planned"],
  "ambiguous_fields": ["list of fields that are unclear, missing, or contradictory"]
}}

Rules:
- If a field is not mentioned in the note, set it to an empty list/object and add the field name to ambiguous_fields.
- If information is contradictory, include both versions and add the field to ambiguous_fields with a note about the contradiction.
- Always include units for vitals when available.
- Be thorough — extract every symptom, medication, and procedure mentioned.

CLINICAL NOTE:
{note}"""


def run_extraction(raw_note: str) -> dict:
    """
    Extract structured medical information from a clinical note using Gemini Flash.

    Args:
        raw_note: The raw clinical note text.

    Returns:
        Dict with extracted medical information and ambiguous fields.
    """
    prompt = EXTRACTION_PROMPT.format(note=raw_note)

    model = genai.GenerativeModel("gemini-2.0-flash")

    # Try up to 2 times (initial + 1 retry)
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
                # Remove first and last lines (```json and ```)
                lines = [l for l in lines if not l.strip().startswith("```")]
                response_text = "\n".join(lines)

            extracted = json.loads(response_text)

            # Validate required keys exist
            required_keys = [
                "chief_complaint", "symptoms", "vitals",
                "history", "medications", "procedures_mentioned",
                "ambiguous_fields",
            ]
            for key in required_keys:
                if key not in extracted:
                    extracted[key] = [] if key != "vitals" and key != "chief_complaint" else (
                        {} if key == "vitals" else "Not specified"
                    )

            return extracted

        except json.JSONDecodeError as e:
            if attempt == 0:
                print(f"[ExtractionAgent] JSON parse failed (attempt 1), retrying: {e}")
                continue
            print(f"[ExtractionAgent] JSON parse failed (attempt 2), using fallback: {e}")
            return _fallback_extraction(raw_note)

        except Exception as e:
            if attempt == 0:
                print(f"[ExtractionAgent] API error (attempt 1), retrying: {e}")
                continue
            print(f"[ExtractionAgent] API error (attempt 2), using fallback: {e}")
            return _fallback_extraction(raw_note)

    return _fallback_extraction(raw_note)


def _fallback_extraction(raw_note: str) -> dict:
    """
    Fallback extraction using simple keyword matching when LLM fails.
    Ensures the pipeline doesn't crash.
    """
    note_lower = raw_note.lower()

    symptoms = []
    symptom_keywords = [
        "chest pain", "shortness of breath", "dyspnea", "nausea", "vomiting",
        "headache", "dizziness", "fever", "cough", "fatigue", "diaphoresis",
        "palpitations", "edema", "syncope", "abdominal pain",
    ]
    for kw in symptom_keywords:
        if kw in note_lower:
            symptoms.append(kw)

    medications = []
    med_keywords = [
        "lisinopril", "metformin", "atorvastatin", "aspirin", "metoprolol",
        "clopidogrel", "nitroglycerin", "omeprazole", "amlodipine",
        "losartan", "warfarin", "heparin", "insulin",
    ]
    for med in med_keywords:
        if med in note_lower:
            medications.append(med)

    return {
        "chief_complaint": "Unable to extract — LLM unavailable, manual review required",
        "symptoms": symptoms if symptoms else ["Unable to extract"],
        "vitals": {},
        "history": ["Unable to extract — LLM unavailable"],
        "medications": medications if medications else ["Unable to extract"],
        "procedures_mentioned": [],
        "ambiguous_fields": [
            "chief_complaint", "vitals", "history",
            "LLM extraction failed — all fields require manual verification",
        ],
    }
