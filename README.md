# 🏥 Healthcare AI Agent — ICD-10/CPT Medical Coding

A multi-agent AI system that takes clinical notes as input, extracts medical information, retrieves relevant ICD-10/CPT codes via RAG, assigns codes with confidence scores, flags ambiguous cases for clarification, refuses to guess when confidence is too low, and logs every decision in an audit trail.

## Architecture

```
  Clinical Note
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│  Extraction  │────▶│  Enrichment  │────▶│   Coding   │────▶│  Compliance  │────▶│   Audit   │
│  (Gemini)    │     │  (ChromaDB)  │     │  (Gemini)  │     │  (Gemini)    │     │  (SQLite) │
└──────────────┘     └──────────────┘     └────────────┘     └──────┬───────┘     └───────────┘
                                                                    │
                                                          ┌────────┼────────┐
                                                          ▼        ▼        ▼
                                                       Approve  Clarify  Escalate
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Agent Orchestration | LangGraph (StateGraph) |
| LLM | Gemini 2.0 Flash |
| Vector Database | ChromaDB (persistent, local) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Backend | FastAPI |
| Frontend | Streamlit |
| Audit Storage | SQLite |
| Containerization | Docker + docker-compose |

## Quick Start

### 1. Clone & Setup

```bash
git clone <repo-url>
cd healthcare-agent
cp .env.example .env
# Edit .env and add your API key:
#   GOOGLE_API_KEY=AI...
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Build Knowledge Base

```bash
python -m knowledge_base.build_db
```

This embeds 200 ICD-10/CPT codes into ChromaDB. Only needs to run once.

### 4. Start the Backend

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start the Frontend

```bash
streamlit run frontend/app.py
```

Open **http://localhost:8501** in your browser.

## Running with Docker

```bash
# Create .env file with your API key first
cp .env.example .env

# Build and start
docker-compose up --build

# Build the knowledge base (first time only)
docker-compose exec api python -m knowledge_base.build_db
```

- **API**: http://localhost:8000
- **Frontend**: http://localhost:8501
- **API Docs**: http://localhost:8000/docs

## Test Scenarios

Three pre-built clinical notes are included to demonstrate different agent behaviors:

| Scenario | File | Expected Outcome |
|----------|------|------------------|
| 1 — Clean STEMI | `tests/scenario_1.txt` | ✅ High-confidence coding |
| 2 — Ambiguous Note | `tests/scenario_2.txt` | ⚠️ Clarification request |
| 3 — Contradictory Note | `tests/scenario_3.txt` | 🚨 Escalation |

Load these from the **Test Scenarios** page in the Streamlit UI, or use curl:

```bash
# Scenario 1 — Clean
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d "{\"note\": \"$(cat tests/scenario_1.txt)\"}"

# Scenario 2 — Ambiguous
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d "{\"note\": \"$(cat tests/scenario_2.txt)\"}"

# Scenario 3 — Contradictory
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d "{\"note\": \"$(cat tests/scenario_3.txt)\"}"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze a clinical note (full pipeline) |
| POST | `/clarify/{session_id}` | Re-run with clarification response |
| GET | `/audit/{session_id}` | Get full audit log for a session |
| GET | `/sessions` | List last 20 session summaries |
| GET | `/health` | Health check |

## Project Structure

```
healthcare-agent/
├── agents/
│   ├── orchestrator.py         # LangGraph pipeline definition
│   ├── extraction_agent.py     # Gemini 2.0 Flash — clinical data extraction
│   ├── enrichment_agent.py     # ChromaDB RAG retrieval
│   ├── coding_agent.py         # Gemini 2.0 Flash — code assignment
│   ├── compliance_agent.py     # Gemini 2.0 Flash — guardrails & compliance
│   └── audit_agent.py          # SQLite audit logging
├── knowledge_base/
│   ├── build_db.py             # Build ChromaDB from 200 inline codes
│   ├── retriever.py            # ChromaDB query functions
│   └── data/
│       └── icd10_sample.csv    # Generated reference CSV
├── backend/
│   └── main.py                 # FastAPI application
├── frontend/
│   └── app.py                  # Streamlit UI
├── database/
│   └── .gitkeep                # SQLite DB created at runtime
├── tests/
│   ├── scenario_1.txt          # Clean cardiology note
│   ├── scenario_2.txt          # Ambiguous note
│   └── scenario_3.txt          # Contradictory note
├── docs/
│   └── architecture.md         # Architecture documentation
├── .env.example                # Environment template
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## Key Design Decisions

- **Unified LLM**: Gemini 2.0 Flash for all agents — extraction, coding, and compliance
- **Hard Guardrail**: No code is ever assigned with confidence below 0.60 — the compliance agent enforces this
- **Graceful Degradation**: Every agent has a fallback path if the LLM API fails
- **Complete Audit Trail**: Every session is logged to SQLite regardless of outcome
- **RAG over Hallucination**: Codes are retrieved from a verified database, not generated from memory
