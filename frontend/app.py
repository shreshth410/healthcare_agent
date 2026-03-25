"""
Streamlit Frontend
Clean, functional UI for the Healthcare AI Agent system.
Communicates with the FastAPI backend via HTTP.
"""

import streamlit as st
import httpx
import json
import pandas as pd
import os

# ── Configuration ────────────────────────────────────────────────────────

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
TIMEOUT = 120.0  # LLM calls can be slow

st.set_page_config(
    page_title="Healthcare AI Agent — Medical Coding",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ───────────────────────────────────────────────────────────

st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1a5276;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.0rem;
        color: #5d6d7e;
        margin-bottom: 2rem;
    }
    .code-card {
        background: #f8f9fa;
        border-left: 4px solid #2e86c1;
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 0 8px 8px 0;
    }
    .code-card-escalated {
        border-left-color: #e74c3c;
    }
    .code-card-warning {
        border-left-color: #f39c12;
    }
    .confidence-high { color: #27ae60; font-weight: bold; }
    .confidence-med { color: #f39c12; font-weight: bold; }
    .confidence-low { color: #e74c3c; font-weight: bold; }
    .session-green { background-color: #d5f5e3; }
    .session-yellow { background-color: #fdebd0; }
    .session-red { background-color: #fadbd8; }
    .stMetric { background: #eaf2f8; border-radius: 10px; padding: 10px; }
</style>
""", unsafe_allow_html=True)


# ── Helper Functions ─────────────────────────────────────────────────────

def api_call(method: str, endpoint: str, data: dict = None) -> dict | None:
    """Make an API call to the backend."""
    url = f"{API_BASE}{endpoint}"
    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            if method == "GET":
                resp = client.get(url)
            elif method == "POST":
                resp = client.post(url, json=data)
            else:
                return None
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        st.error("❌ Cannot connect to the API server. Make sure the FastAPI backend is running on port 8000.")
        return None
    except httpx.HTTPStatusError as e:
        st.error(f"❌ API Error ({e.response.status_code}): {e.response.text}")
        return None
    except Exception as e:
        st.error(f"❌ Unexpected error: {e}")
        return None


def confidence_color(conf: float) -> str:
    """Return CSS class based on confidence level."""
    if conf >= 0.80:
        return "confidence-high"
    elif conf >= 0.60:
        return "confidence-med"
    return "confidence-low"


def confidence_label(conf: float) -> str:
    """Return human-readable confidence label."""
    if conf >= 0.90:
        return "Very High"
    elif conf >= 0.80:
        return "High"
    elif conf >= 0.70:
        return "Moderate"
    elif conf >= 0.60:
        return "Acceptable"
    return "Low"


def render_code_table(codes: list, code_type: str):
    """Render a table of assigned codes with confidence bars."""
    if not codes:
        st.info(f"No {code_type} codes assigned.")
        return

    st.markdown(f"### {code_type} Codes")

    for code in codes:
        conf = code.get("confidence", 0.0)
        col1, col2, col3 = st.columns([1, 3, 2])

        with col1:
            st.markdown(f"**`{code.get('code', 'N/A')}`**")

        with col2:
            st.markdown(code.get("description", "No description"))
            if code.get("reasoning"):
                with st.expander("Reasoning"):
                    st.write(code["reasoning"])

        with col3:
            st.progress(conf, text=f"{conf:.0%} — {confidence_label(conf)}")


# ── Sidebar Navigation ──────────────────────────────────────────────────

st.sidebar.markdown("## 🏥 Healthcare AI Agent")
st.sidebar.markdown("---")
page = st.sidebar.radio(
    "Navigation",
    ["🔍 Analyze Note", "📋 Audit Trail", "🧪 Test Scenarios"],
    label_visibility="collapsed",
)

st.sidebar.markdown("---")
st.sidebar.markdown(
    """
    <div style='font-size: 0.8rem; color: #888;'>
    <b>Powered by:</b><br>
    • Gemini 2.0 Flash (all agents)<br>
    • ChromaDB + sentence-transformers (RAG)<br>
    • LangGraph (orchestration)
    </div>
    """,
    unsafe_allow_html=True,
)


# ══════════════════════════════════════════════════════════════════════════
# PAGE 1 — Analyze Note
# ══════════════════════════════════════════════════════════════════════════

if page == "🔍 Analyze Note":
    st.markdown('<div class="main-header">🔍 Analyze Clinical Note</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Paste a clinical note to get AI-powered ICD-10 and CPT code assignments</div>',
        unsafe_allow_html=True,
    )

    # Initialize session state
    if "analysis_result" not in st.session_state:
        st.session_state.analysis_result = None
    if "clinical_note" not in st.session_state:
        st.session_state.clinical_note = ""

    # Text area for clinical note
    note = st.text_area(
        "📝 Paste Clinical Note Here",
        value=st.session_state.clinical_note,
        height=300,
        placeholder="Enter or paste a clinical note here...\n\nTip: Use the Test Scenarios page to load example notes.",
        key="note_input",
    )

    col_btn1, col_btn2 = st.columns([1, 5])
    with col_btn1:
        analyze_btn = st.button("🚀 Analyze", type="primary", use_container_width=True)
    with col_btn2:
        clear_btn = st.button("🗑️ Clear", use_container_width=False)

    if clear_btn:
        st.session_state.analysis_result = None
        st.session_state.clinical_note = ""
        st.rerun()

    # ── Run Analysis ─────────────────────────────────────────────────────
    if analyze_btn and note.strip():
        with st.spinner("🔄 Running AI agent pipeline..."):
            # Show progress
            progress = st.progress(0, text="🔍 Extraction Agent — Analyzing clinical note...")
            progress.progress(20, text="🔍 Extraction Agent — Analyzing clinical note...")

            result = api_call("POST", "/analyze", {"note": note.strip()})

            if result:
                progress.progress(100, text="✅ Analysis complete!")
                st.session_state.analysis_result = result
                st.session_state.clinical_note = note
            else:
                progress.progress(100, text="❌ Analysis failed")

    elif analyze_btn:
        st.warning("Please enter a clinical note before analyzing.")

    # ── Display Results ──────────────────────────────────────────────────
    result = st.session_state.analysis_result

    if result:
        st.markdown("---")

        # ── Clarification Needed ─────────────────────────────────────────
        if result.get("needs_clarification"):
            st.warning("⚠️ **Clarification Needed**")

            question = result.get("clarification_question", "Additional information is required.")
            st.markdown(f"> {question}")

            clarification = st.text_area(
                "Your Response",
                placeholder="Provide the requested clarification...",
                key="clarification_input",
            )

            if st.button("📤 Submit Clarification", type="primary"):
                if clarification.strip():
                    session_id = result.get("session_id", "")
                    with st.spinner("🔄 Re-running with clarification..."):
                        new_result = api_call(
                            "POST",
                            f"/clarify/{session_id}",
                            {"clarification": clarification.strip()},
                        )
                        if new_result:
                            st.session_state.analysis_result = new_result
                            st.rerun()
                else:
                    st.warning("Please enter a clarification response.")

        # ── Escalation ───────────────────────────────────────────────────
        elif result.get("escalated"):
            st.error("🚨 **Case Escalated — Manual Review Required**")
            reason = result.get("escalation_reason", "Insufficient documentation confidence.")
            st.markdown(f"""
            <div class="code-card code-card-escalated">
                <b>Escalation Reason:</b><br>{reason}
            </div>
            """, unsafe_allow_html=True)

            st.markdown("**Recommendation:** This case requires physician addendum before coding can be completed.")

        # ── Successful Results ───────────────────────────────────────────
        else:
            st.success("✅ **Analysis Complete**")

        # Always show codes if available (even for escalated/clarification)
        approved = result.get("approved_codes", {})

        # Overall confidence metric
        overall_conf = approved.get("overall_confidence", 0.0)
        col_m1, col_m2, col_m3 = st.columns(3)

        with col_m1:
            st.metric(
                "Overall Confidence",
                f"{overall_conf:.0%}",
                delta=confidence_label(overall_conf),
            )
        with col_m2:
            icd_count = len(approved.get("icd10_codes", []))
            st.metric("ICD-10 Codes", icd_count)
        with col_m3:
            cpt_count = len(approved.get("cpt_codes", []))
            st.metric("CPT Codes", cpt_count)

        st.markdown("---")

        # Code tables
        tab1, tab2, tab3 = st.tabs(["🏷️ ICD-10 Codes", "🔧 CPT Codes", "📊 Details"])

        with tab1:
            render_code_table(approved.get("icd10_codes", []), "ICD-10")

        with tab2:
            render_code_table(approved.get("cpt_codes", []), "CPT")

        with tab3:
            # Coding notes
            coding_notes = approved.get("coding_notes", "")
            if coding_notes:
                st.markdown("#### 📝 Coding Notes")
                st.info(coding_notes)

            # Compliance notes
            compliance_notes = result.get("compliance_notes", "")
            if compliance_notes:
                st.markdown("#### 🛡️ Compliance Notes")
                st.info(compliance_notes)

            # Removed codes
            removed = result.get("removed_codes", [])
            if removed:
                st.markdown("#### ❌ Removed Codes")
                for rc in removed:
                    st.markdown(f"- **{rc.get('code', 'N/A')}**: {rc.get('reason', 'No reason')}")

            # Session info
            st.markdown("#### 📋 Session Info")
            st.markdown(f"- **Session ID:** `{result.get('session_id', 'N/A')}`")
            st.markdown(f"- **Timestamp:** {result.get('timestamp', 'N/A')}")


# ══════════════════════════════════════════════════════════════════════════
# PAGE 2 — Audit Trail
# ══════════════════════════════════════════════════════════════════════════

elif page == "📋 Audit Trail":
    st.markdown('<div class="main-header">📋 Audit Trail</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Review all coding sessions and their detailed audit logs</div>',
        unsafe_allow_html=True,
    )

    # Fetch sessions
    sessions_resp = api_call("GET", "/sessions")

    if sessions_resp and sessions_resp.get("sessions"):
        sessions = sessions_resp["sessions"]

        # Build session table
        rows = []
        for s in sessions:
            status = "✅ Clean"
            if s.get("escalated"):
                status = "🚨 Escalated"
            elif s.get("needs_clarification"):
                status = "⚠️ Clarification"

            rows.append({
                "Status": status,
                "Session ID": s["session_id"][:12] + "...",
                "Full ID": s["session_id"],
                "Timestamp": s.get("timestamp", "N/A"),
                "Confidence": f"{s.get('overall_confidence', 0):.0%}",
                "Preview": (s.get("raw_note_preview", "")[:80] + "...") if s.get("raw_note_preview") else "N/A",
            })

        df = pd.DataFrame(rows)

        # Display as styled table
        st.dataframe(
            df[["Status", "Session ID", "Timestamp", "Confidence", "Preview"]],
            use_container_width=True,
            hide_index=True,
        )

        # Session detail expander
        st.markdown("### 🔎 Session Details")
        selected_id = st.selectbox(
            "Select a session to view details",
            options=[r["Full ID"] for r in rows],
            format_func=lambda x: f"{x[:12]}... — {next((r['Timestamp'] for r in rows if r['Full ID'] == x), 'N/A')}",
        )

        if selected_id:
            audit_data = api_call("GET", f"/audit/{selected_id}")

            if audit_data:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Confidence", f"{audit_data.get('overall_confidence', 0):.0%}")
                with col2:
                    st.metric("Escalated", "Yes" if audit_data.get("escalated") else "No")
                with col3:
                    st.metric("Clarification", "Yes" if audit_data.get("needs_clarification") else "No")

                tab1, tab2, tab3, tab4 = st.tabs([
                    "📄 Note Preview",
                    "🔍 Extraction",
                    "🏷️ Final Codes",
                    "🛡️ Compliance",
                ])

                with tab1:
                    st.text(audit_data.get("raw_note_preview", "N/A"))

                with tab2:
                    extraction = audit_data.get("extraction_output", {})
                    if isinstance(extraction, str):
                        try:
                            extraction = json.loads(extraction)
                        except Exception:
                            pass
                    st.json(extraction)

                with tab3:
                    final_codes = audit_data.get("final_codes", {})
                    if isinstance(final_codes, str):
                        try:
                            final_codes = json.loads(final_codes)
                        except Exception:
                            pass
                    st.json(final_codes)

                with tab4:
                    compliance = audit_data.get("compliance_result", {})
                    if isinstance(compliance, str):
                        try:
                            compliance = json.loads(compliance)
                        except Exception:
                            pass
                    st.json(compliance)

                if audit_data.get("clarification_question"):
                    st.markdown("#### ❓ Clarification Question")
                    st.warning(audit_data["clarification_question"])

                if audit_data.get("clarification_response"):
                    st.markdown("#### 💬 Clarification Response")
                    st.info(audit_data["clarification_response"])

    else:
        st.info("No sessions found. Analyze a clinical note to create the first session.")


# ══════════════════════════════════════════════════════════════════════════
# PAGE 3 — Test Scenarios
# ══════════════════════════════════════════════════════════════════════════

elif page == "🧪 Test Scenarios":
    st.markdown('<div class="main-header">🧪 Test Scenarios</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Load pre-built clinical notes to test different agent behaviors</div>',
        unsafe_allow_html=True,
    )

    scenarios = {
        "scenario_1": {
            "title": "Scenario 1 — Clean Cardiology Note (STEMI)",
            "description": (
                "A 58-year-old male with hypertension and type 2 diabetes presenting with "
                "acute inferior STEMI. Well-documented with clear vitals, labs, ECG findings, "
                "and treatment plan. Expected outcome: **high-confidence ICD-10 and CPT coding** "
                "with no clarification needed."
            ),
            "icon": "✅",
            "file": "tests/scenario_1.txt",
        },
        "scenario_2": {
            "title": "Scenario 2 — Ambiguous Note (Missing Details)",
            "description": (
                "A vaguely documented chest pain presentation. Duration, laterality, history, "
                "and medications are all missing or unclear. Expected outcome: **clarification "
                "request** with specific questions about duration and onset to distinguish "
                "between angina and MI."
            ),
            "icon": "⚠️",
            "file": "tests/scenario_2.txt",
        },
        "scenario_3": {
            "title": "Scenario 3 — Contradictory Note (Escalation)",
            "description": (
                "A note with contradictory findings: patient denies and reports chest pain, "
                "normal ECG with elevated troponins, 'no cardiac history' but on cardiac meds. "
                "Expected outcome: **escalation** due to low confidence from contradictory "
                "documentation."
            ),
            "icon": "🚨",
            "file": "tests/scenario_3.txt",
        },
    }

    for key, scenario in scenarios.items():
        with st.container():
            st.markdown(f"### {scenario['icon']} {scenario['title']}")
            st.markdown(scenario["description"])

            if st.button(f"📋 Load {scenario['title'].split('—')[0].strip()}", key=key):
                # Read the scenario file
                file_path = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)),
                    scenario["file"],
                )
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        note_text = f.read()
                    st.session_state.clinical_note = note_text
                    st.session_state.analysis_result = None
                    st.info(f"✅ Loaded {scenario['title']}. Switch to **Analyze Note** page to run analysis.")
                except FileNotFoundError:
                    st.error(f"Scenario file not found: {file_path}")

            st.markdown("---")
