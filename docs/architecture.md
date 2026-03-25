# Architecture — Healthcare AI Agent

## System Overview

A multi-agent AI system for automated ICD-10 and CPT medical coding. The system takes clinical notes as input, extracts medical information, retrieves relevant codes via RAG, assigns codes with confidence scores, enforces compliance guardrails, and maintains a complete audit trail.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     STREAMLIT FRONTEND                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐     │
│  │ Analyze  │  │ Audit Trail  │  │   Test Scenarios      │     │
│  │  Note    │  │   Viewer     │  │   (3 prebuilt notes)  │     │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────┘     │
│       │               │                      │                 │
└───────┼───────────────┼──────────────────────┼─────────────────┘
        │ HTTP          │ HTTP                 │
        ▼               ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                             │
│  POST /analyze  │  POST /clarify/{id}  │  GET /audit/{id}      │
│  GET /sessions  │  GET /health                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LANGGRAPH ORCHESTRATOR                          │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌────────┐   ┌──────────┐      │
│  │Extraction│──▶│Enrichment│──▶│ Coding │──▶│Compliance│      │
│  │  Agent   │   │  Agent   │   │ Agent  │   │  Agent   │      │
│  │(Gemini)  │   │(ChromaDB)│   │(Claude)│   │ (Claude) │      │
│  └──────────┘   └────┬─────┘   └────────┘   └────┬─────┘      │
│                      │                            │             │
│                      │                     ┌──────┴──────┐      │
│                      │                     │ Conditional │      │
│                      │                     │    Edge     │      │
│                      │                     └──┬───┬───┬──┘      │
│                      │                        │   │   │         │
│                      │              ┌─────────┘   │   └──────┐  │
│                      │              ▼             ▼          ▼  │
│                      │          Clarify      Escalate     Audit │
│                      │          (return)     (flag)       Agent │
│                      │                                   │     │
│                      ▼                                   ▼     │
│               ┌────────────┐                      ┌──────────┐ │
│               │  ChromaDB  │                      │  SQLite  │ │
│               │(persistent)│                      │(audit DB)│ │
│               └────────────┘                      └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Responsibilities

| Agent | LLM | Purpose |
|-------|-----|---------|
| Extraction | Gemini 1.5 Flash | Extract symptoms, vitals, history, medications from notes |
| Enrichment | None (RAG) | Retrieve candidate ICD-10/CPT codes from ChromaDB |
| Coding | Claude Sonnet | Assign codes with confidence scores and reasoning |
| Compliance | Claude Sonnet | Guardrails, ambiguity flagging, code verification |
| Audit | None (SQLite) | Log every session for complete audit trail |

## Data Flow

1. **Input**: Raw clinical note text
2. **Extraction**: Structured JSON with symptoms, vitals, history, medications, procedures
3. **Enrichment**: Top-8 ICD-10 + Top-3 CPT candidate codes via semantic search
4. **Coding**: Assigned codes with confidence scores (0.0–1.0) and reasoning
5. **Compliance**: Verified codes, clarification questions, or escalation
6. **Audit**: Full session logged to SQLite with all intermediate states
7. **Output**: Approved codes, confidence, session ID, and any flags

## Guardrails

- **Hard threshold**: No code assigned with confidence < 0.60
- **Clarification**: Ambiguous fields trigger specific, clinical clarification questions
- **Escalation**: Contradictory documentation or confidence < 0.60 triggers escalation
- **Compliance**: Every code verified against documented symptoms/procedures
- **Audit**: Every session logged regardless of outcome
