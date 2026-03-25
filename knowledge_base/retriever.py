"""
ChromaDB Retriever
Provides query functions for the ICD-10/CPT knowledge base.
"""

import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")


def retrieve_codes(query_text: str, top_k: int = 8, code_type: str | None = None) -> list[dict]:
    """
    Retrieve the most similar ICD-10/CPT codes from ChromaDB.

    Args:
        query_text: Natural language search query (e.g., symptoms, diagnosis).
        top_k: Number of results to return.
        code_type: Optional filter — "ICD10" or "CPT". None returns both.

    Returns:
        List of dicts with keys: code, description, type, category, similarity_score.
    """
    import chromadb

    try:
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        collection = client.get_collection("icd10_codes")
    except Exception as e:
        print(f"[Retriever] Error connecting to ChromaDB: {e}")
        return []

    # Build where filter if code_type specified
    where_filter = {"type": code_type} if code_type else None

    try:
        results = collection.query(
            query_texts=[query_text],
            n_results=top_k,
            where=where_filter,
            include=["metadatas", "distances"],
        )
    except Exception as e:
        print(f"[Retriever] Query error: {e}")
        return []

    if not results or not results["metadatas"] or not results["metadatas"][0]:
        return []

    codes = []
    for metadata, distance in zip(results["metadatas"][0], results["distances"][0]):
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # Convert to similarity: 1 - (distance / 2)
        similarity = max(0.0, 1.0 - (distance / 2.0))
        codes.append(
            {
                "code": metadata["code"],
                "description": metadata["description"],
                "type": metadata["type"],
                "category": metadata["category"],
                "similarity_score": round(similarity, 4),
            }
        )

    return codes


def retrieve_icd10(query_text: str, top_k: int = 8) -> list[dict]:
    """Convenience: retrieve only ICD-10 codes."""
    return retrieve_codes(query_text, top_k=top_k, code_type="ICD10")


def retrieve_cpt(query_text: str, top_k: int = 3) -> list[dict]:
    """Convenience: retrieve only CPT codes."""
    return retrieve_codes(query_text, top_k=top_k, code_type="CPT")
