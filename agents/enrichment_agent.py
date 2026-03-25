"""
Enrichment Agent
Uses ChromaDB + sentence-transformers to retrieve candidate ICD-10/CPT codes
based on extracted clinical information.
"""

import sys
import os

# Add project root to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from knowledge_base.retriever import retrieve_icd10, retrieve_cpt


def run_enrichment(extracted: dict) -> list[dict]:
    """
    Retrieve candidate ICD-10 and CPT codes based on extracted clinical data.

    Args:
        extracted: Dict from extraction agent with chief_complaint, symptoms, etc.

    Returns:
        List of dicts with code, description, type, similarity_score.
    """
    try:
        # Build search query from chief complaint + symptoms
        chief = extracted.get("chief_complaint", "")
        symptoms = extracted.get("symptoms", [])
        history = extracted.get("history", [])

        # Combine into a rich query string
        query_parts = []
        if chief and chief != "Not specified":
            query_parts.append(chief)
        if symptoms:
            query_parts.extend([s for s in symptoms if s != "Unable to extract"])
        if history:
            query_parts.extend([h for h in history if h != "Unable to extract — LLM unavailable"])

        query_text = " ".join(query_parts) if query_parts else "general medical assessment"

        print(f"[EnrichmentAgent] Search query: {query_text[:120]}...")

        # Retrieve ICD-10 codes (top 8)
        icd10_codes = retrieve_icd10(query_text, top_k=8)
        print(f"[EnrichmentAgent] Retrieved {len(icd10_codes)} ICD-10 candidates")

        # Retrieve CPT codes if procedures are mentioned
        cpt_codes = []
        procedures = extracted.get("procedures_mentioned", [])
        if procedures:
            proc_query = " ".join(procedures)
            cpt_codes = retrieve_cpt(proc_query, top_k=3)
            print(f"[EnrichmentAgent] Retrieved {len(cpt_codes)} CPT candidates for procedures")
        else:
            # Still retrieve general E&M CPT codes based on the visit context
            cpt_codes = retrieve_cpt(query_text, top_k=3)
            print(f"[EnrichmentAgent] Retrieved {len(cpt_codes)} general CPT candidates")

        all_codes = icd10_codes + cpt_codes
        return all_codes

    except Exception as e:
        print(f"[EnrichmentAgent] Error during retrieval: {e}")
        return [
            {
                "code": "R69",
                "description": "Illness, unspecified — retrieval error occurred",
                "type": "ICD10",
                "category": "General",
                "similarity_score": 0.0,
            }
        ]
