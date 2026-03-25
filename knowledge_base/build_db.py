"""
Knowledge Base Builder
Embeds ICD-10 and CPT code data into a persistent ChromaDB collection.
Run once before starting the application:
    python -m knowledge_base.build_db
"""

import os
import csv
import sys

from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_PATH = os.path.join(DATA_DIR, "icd10_sample.csv")

# ---------------------------------------------------------------------------
# 200 realistic ICD-10 + CPT code entries
# ---------------------------------------------------------------------------
CODES = [
    # ── Cardiology (ICD-10) ──────────────────────────────────────────────
    {"code": "I20.0", "description": "Unstable angina", "category": "Cardiology", "keywords": "chest pain angina unstable acute coronary syndrome", "type": "ICD10"},
    {"code": "I20.9", "description": "Angina pectoris, unspecified", "category": "Cardiology", "keywords": "chest pain angina unspecified", "type": "ICD10"},
    {"code": "I21.0", "description": "ST elevation myocardial infarction involving left main coronary artery", "category": "Cardiology", "keywords": "STEMI heart attack left main coronary MI", "type": "ICD10"},
    {"code": "I21.1", "description": "ST elevation myocardial infarction involving left anterior descending coronary artery", "category": "Cardiology", "keywords": "STEMI heart attack LAD anterior wall MI", "type": "ICD10"},
    {"code": "I21.2", "description": "ST elevation myocardial infarction involving left circumflex coronary artery", "category": "Cardiology", "keywords": "STEMI heart attack circumflex lateral wall MI", "type": "ICD10"},
    {"code": "I21.3", "description": "ST elevation myocardial infarction of unspecified site", "category": "Cardiology", "keywords": "STEMI heart attack myocardial infarction unspecified", "type": "ICD10"},
    {"code": "I21.4", "description": "Non-ST elevation myocardial infarction", "category": "Cardiology", "keywords": "NSTEMI heart attack non-ST elevation MI troponin", "type": "ICD10"},
    {"code": "I25.10", "description": "Atherosclerotic heart disease of native coronary artery without angina pectoris", "category": "Cardiology", "keywords": "coronary artery disease CAD atherosclerosis", "type": "ICD10"},
    {"code": "I25.110", "description": "Atherosclerotic heart disease of native coronary artery with unstable angina pectoris", "category": "Cardiology", "keywords": "CAD with unstable angina coronary artery disease", "type": "ICD10"},
    {"code": "I50.9", "description": "Heart failure, unspecified", "category": "Cardiology", "keywords": "heart failure CHF congestive cardiac failure", "type": "ICD10"},
    {"code": "I50.20", "description": "Unspecified systolic (congestive) heart failure", "category": "Cardiology", "keywords": "systolic heart failure CHF reduced ejection fraction HFrEF", "type": "ICD10"},
    {"code": "I50.30", "description": "Unspecified diastolic (congestive) heart failure", "category": "Cardiology", "keywords": "diastolic heart failure CHF preserved ejection fraction HFpEF", "type": "ICD10"},
    {"code": "I48.0", "description": "Paroxysmal atrial fibrillation", "category": "Cardiology", "keywords": "atrial fibrillation paroxysmal afib arrhythmia irregular heartbeat", "type": "ICD10"},
    {"code": "I48.1", "description": "Persistent atrial fibrillation", "category": "Cardiology", "keywords": "atrial fibrillation persistent afib arrhythmia", "type": "ICD10"},
    {"code": "I48.2", "description": "Chronic atrial fibrillation", "category": "Cardiology", "keywords": "atrial fibrillation chronic permanent afib arrhythmia", "type": "ICD10"},
    {"code": "I48.91", "description": "Unspecified atrial fibrillation", "category": "Cardiology", "keywords": "atrial fibrillation afib unspecified arrhythmia", "type": "ICD10"},
    {"code": "I10", "description": "Essential (primary) hypertension", "category": "Cardiology", "keywords": "hypertension high blood pressure HTN essential primary", "type": "ICD10"},
    {"code": "I11.0", "description": "Hypertensive heart disease with heart failure", "category": "Cardiology", "keywords": "hypertensive heart disease heart failure HTN", "type": "ICD10"},
    {"code": "I42.0", "description": "Dilated cardiomyopathy", "category": "Cardiology", "keywords": "dilated cardiomyopathy DCM heart enlarged", "type": "ICD10"},
    {"code": "I42.1", "description": "Obstructive hypertrophic cardiomyopathy", "category": "Cardiology", "keywords": "hypertrophic cardiomyopathy HOCM obstructive", "type": "ICD10"},
    {"code": "I49.9", "description": "Cardiac arrhythmia, unspecified", "category": "Cardiology", "keywords": "arrhythmia cardiac rhythm disorder unspecified", "type": "ICD10"},
    {"code": "I47.1", "description": "Supraventricular tachycardia", "category": "Cardiology", "keywords": "SVT supraventricular tachycardia rapid heart rate", "type": "ICD10"},
    {"code": "I47.2", "description": "Ventricular tachycardia", "category": "Cardiology", "keywords": "ventricular tachycardia VT rapid heart rate dangerous", "type": "ICD10"},
    {"code": "R00.0", "description": "Tachycardia, unspecified", "category": "Cardiology", "keywords": "tachycardia rapid heart rate fast pulse", "type": "ICD10"},
    {"code": "R00.1", "description": "Bradycardia, unspecified", "category": "Cardiology", "keywords": "bradycardia slow heart rate", "type": "ICD10"},
    # ── Pulmonology (ICD-10) ─────────────────────────────────────────────
    {"code": "J18.9", "description": "Pneumonia, unspecified organism", "category": "Pulmonology", "keywords": "pneumonia lung infection respiratory unspecified", "type": "ICD10"},
    {"code": "J18.1", "description": "Lobar pneumonia, unspecified organism", "category": "Pulmonology", "keywords": "lobar pneumonia lung infection consolidation", "type": "ICD10"},
    {"code": "J15.9", "description": "Unspecified bacterial pneumonia", "category": "Pulmonology", "keywords": "bacterial pneumonia lung infection", "type": "ICD10"},
    {"code": "J44.1", "description": "Chronic obstructive pulmonary disease with acute exacerbation", "category": "Pulmonology", "keywords": "COPD exacerbation chronic obstructive pulmonary disease flare", "type": "ICD10"},
    {"code": "J44.0", "description": "Chronic obstructive pulmonary disease with acute lower respiratory infection", "category": "Pulmonology", "keywords": "COPD infection chronic obstructive pulmonary disease", "type": "ICD10"},
    {"code": "J44.9", "description": "Chronic obstructive pulmonary disease, unspecified", "category": "Pulmonology", "keywords": "COPD chronic obstructive pulmonary disease unspecified", "type": "ICD10"},
    {"code": "J45.20", "description": "Mild intermittent asthma, uncomplicated", "category": "Pulmonology", "keywords": "asthma mild intermittent wheeze bronchospasm", "type": "ICD10"},
    {"code": "J45.30", "description": "Mild persistent asthma, uncomplicated", "category": "Pulmonology", "keywords": "asthma mild persistent wheeze", "type": "ICD10"},
    {"code": "J45.40", "description": "Moderate persistent asthma, uncomplicated", "category": "Pulmonology", "keywords": "asthma moderate persistent wheeze dyspnea", "type": "ICD10"},
    {"code": "J45.50", "description": "Severe persistent asthma, uncomplicated", "category": "Pulmonology", "keywords": "asthma severe persistent wheeze dyspnea", "type": "ICD10"},
    {"code": "J45.901", "description": "Unspecified asthma with acute exacerbation", "category": "Pulmonology", "keywords": "asthma exacerbation acute attack wheeze", "type": "ICD10"},
    {"code": "J90", "description": "Pleural effusion, not elsewhere classified", "category": "Pulmonology", "keywords": "pleural effusion fluid lung pleura", "type": "ICD10"},
    {"code": "J93.9", "description": "Pneumothorax, unspecified", "category": "Pulmonology", "keywords": "pneumothorax collapsed lung air chest", "type": "ICD10"},
    {"code": "J96.00", "description": "Acute respiratory failure, unspecified whether with hypoxia or hypercapnia", "category": "Pulmonology", "keywords": "acute respiratory failure hypoxia hypercapnia", "type": "ICD10"},
    {"code": "J80", "description": "Acute respiratory distress syndrome", "category": "Pulmonology", "keywords": "ARDS acute respiratory distress syndrome", "type": "ICD10"},
    {"code": "R06.02", "description": "Shortness of breath", "category": "Pulmonology", "keywords": "shortness of breath dyspnea SOB breathlessness", "type": "ICD10"},
    {"code": "R05.9", "description": "Cough, unspecified", "category": "Pulmonology", "keywords": "cough unspecified", "type": "ICD10"},
    {"code": "J06.9", "description": "Acute upper respiratory infection, unspecified", "category": "Pulmonology", "keywords": "upper respiratory infection URI cold", "type": "ICD10"},
    # ── Endocrinology (ICD-10) ───────────────────────────────────────────
    {"code": "E10.9", "description": "Type 1 diabetes mellitus without complications", "category": "Endocrinology", "keywords": "type 1 diabetes mellitus insulin dependent T1DM", "type": "ICD10"},
    {"code": "E10.65", "description": "Type 1 diabetes mellitus with hyperglycemia", "category": "Endocrinology", "keywords": "type 1 diabetes hyperglycemia high blood sugar", "type": "ICD10"},
    {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications", "category": "Endocrinology", "keywords": "type 2 diabetes mellitus T2DM non-insulin dependent", "type": "ICD10"},
    {"code": "E11.65", "description": "Type 2 diabetes mellitus with hyperglycemia", "category": "Endocrinology", "keywords": "type 2 diabetes hyperglycemia high blood sugar", "type": "ICD10"},
    {"code": "E11.40", "description": "Type 2 diabetes mellitus with diabetic neuropathy, unspecified", "category": "Endocrinology", "keywords": "type 2 diabetes neuropathy nerve damage diabetic", "type": "ICD10"},
    {"code": "E11.21", "description": "Type 2 diabetes mellitus with diabetic nephropathy", "category": "Endocrinology", "keywords": "type 2 diabetes nephropathy kidney disease diabetic", "type": "ICD10"},
    {"code": "E11.311", "description": "Type 2 diabetes mellitus with unspecified diabetic retinopathy with macular edema", "category": "Endocrinology", "keywords": "type 2 diabetes retinopathy eye macular edema", "type": "ICD10"},
    {"code": "E03.9", "description": "Hypothyroidism, unspecified", "category": "Endocrinology", "keywords": "hypothyroidism underactive thyroid low thyroid", "type": "ICD10"},
    {"code": "E05.90", "description": "Thyrotoxicosis, unspecified without thyrotoxic crisis or storm", "category": "Endocrinology", "keywords": "hyperthyroidism thyrotoxicosis overactive thyroid", "type": "ICD10"},
    {"code": "E05.00", "description": "Thyrotoxicosis with diffuse goiter without thyrotoxic crisis or storm", "category": "Endocrinology", "keywords": "Graves disease hyperthyroidism diffuse goiter", "type": "ICD10"},
    {"code": "E06.3", "description": "Autoimmune thyroiditis", "category": "Endocrinology", "keywords": "Hashimoto thyroiditis autoimmune thyroid", "type": "ICD10"},
    {"code": "E78.5", "description": "Hyperlipidemia, unspecified", "category": "Endocrinology", "keywords": "hyperlipidemia high cholesterol dyslipidemia", "type": "ICD10"},
    {"code": "E78.00", "description": "Pure hypercholesterolemia, unspecified", "category": "Endocrinology", "keywords": "hypercholesterolemia high cholesterol elevated LDL", "type": "ICD10"},
    {"code": "E66.01", "description": "Morbid (severe) obesity due to excess calories", "category": "Endocrinology", "keywords": "morbid obesity severe BMI excess calories", "type": "ICD10"},
    {"code": "E66.9", "description": "Obesity, unspecified", "category": "Endocrinology", "keywords": "obesity overweight BMI elevated", "type": "ICD10"},
    {"code": "E87.1", "description": "Hypo-osmolality and hyponatremia", "category": "Endocrinology", "keywords": "hyponatremia low sodium electrolyte imbalance", "type": "ICD10"},
    {"code": "E87.6", "description": "Hypokalemia", "category": "Endocrinology", "keywords": "hypokalemia low potassium electrolyte imbalance", "type": "ICD10"},
    # ── Neurology (ICD-10) ───────────────────────────────────────────────
    {"code": "I63.9", "description": "Cerebral infarction, unspecified", "category": "Neurology", "keywords": "stroke cerebral infarction CVA ischemic brain", "type": "ICD10"},
    {"code": "I63.50", "description": "Cerebral infarction due to unspecified occlusion or stenosis of unspecified cerebral artery", "category": "Neurology", "keywords": "stroke cerebral infarction occlusion stenosis ischemic", "type": "ICD10"},
    {"code": "I61.9", "description": "Nontraumatic intracerebral hemorrhage, unspecified", "category": "Neurology", "keywords": "hemorrhagic stroke intracerebral hemorrhage brain bleed", "type": "ICD10"},
    {"code": "G45.9", "description": "Transient cerebral ischemic attack, unspecified", "category": "Neurology", "keywords": "TIA transient ischemic attack mini stroke", "type": "ICD10"},
    {"code": "G43.909", "description": "Migraine, unspecified, not intractable, without status migrainosus", "category": "Neurology", "keywords": "migraine headache unspecified", "type": "ICD10"},
    {"code": "G43.001", "description": "Migraine without aura, not intractable, with status migrainosus", "category": "Neurology", "keywords": "migraine without aura status migrainosus headache", "type": "ICD10"},
    {"code": "G43.101", "description": "Migraine with aura, not intractable, with status migrainosus", "category": "Neurology", "keywords": "migraine with aura status migrainosus headache visual", "type": "ICD10"},
    {"code": "G40.909", "description": "Epilepsy, unspecified, not intractable, without status epilepticus", "category": "Neurology", "keywords": "epilepsy seizure disorder unspecified", "type": "ICD10"},
    {"code": "G40.901", "description": "Epilepsy, unspecified, not intractable, with status epilepticus", "category": "Neurology", "keywords": "epilepsy seizure status epilepticus", "type": "ICD10"},
    {"code": "G20", "description": "Parkinson disease", "category": "Neurology", "keywords": "Parkinson disease tremor rigidity bradykinesia", "type": "ICD10"},
    {"code": "G30.9", "description": "Alzheimer disease, unspecified", "category": "Neurology", "keywords": "Alzheimer disease dementia cognitive decline memory loss", "type": "ICD10"},
    {"code": "G35", "description": "Multiple sclerosis", "category": "Neurology", "keywords": "multiple sclerosis MS demyelinating disease", "type": "ICD10"},
    {"code": "R51.9", "description": "Headache, unspecified", "category": "Neurology", "keywords": "headache cephalalgia unspecified", "type": "ICD10"},
    {"code": "G47.00", "description": "Insomnia, unspecified", "category": "Neurology", "keywords": "insomnia sleep disorder sleeplessness", "type": "ICD10"},
    {"code": "R55", "description": "Syncope and collapse", "category": "Neurology", "keywords": "syncope fainting collapse loss of consciousness", "type": "ICD10"},
    {"code": "R56.9", "description": "Unspecified convulsions", "category": "Neurology", "keywords": "seizure convulsions unspecified", "type": "ICD10"},
    # ── Gastroenterology (ICD-10) ────────────────────────────────────────
    {"code": "K21.0", "description": "Gastro-esophageal reflux disease with esophagitis", "category": "Gastroenterology", "keywords": "GERD reflux esophagitis heartburn acid", "type": "ICD10"},
    {"code": "K21.9", "description": "Gastro-esophageal reflux disease without esophagitis", "category": "Gastroenterology", "keywords": "GERD reflux heartburn acid without esophagitis", "type": "ICD10"},
    {"code": "K35.80", "description": "Unspecified acute appendicitis", "category": "Gastroenterology", "keywords": "appendicitis acute appendix inflammation RLQ pain", "type": "ICD10"},
    {"code": "K50.90", "description": "Crohn disease, unspecified, without complications", "category": "Gastroenterology", "keywords": "Crohn disease inflammatory bowel disease IBD", "type": "ICD10"},
    {"code": "K50.10", "description": "Crohn disease of large intestine without complications", "category": "Gastroenterology", "keywords": "Crohn disease large intestine colon IBD", "type": "ICD10"},
    {"code": "K51.90", "description": "Ulcerative colitis, unspecified, without complications", "category": "Gastroenterology", "keywords": "ulcerative colitis UC inflammatory bowel disease", "type": "ICD10"},
    {"code": "K25.9", "description": "Gastric ulcer, unspecified, without hemorrhage or perforation", "category": "Gastroenterology", "keywords": "gastric ulcer stomach ulcer peptic", "type": "ICD10"},
    {"code": "K26.9", "description": "Duodenal ulcer, unspecified, without hemorrhage or perforation", "category": "Gastroenterology", "keywords": "duodenal ulcer peptic ulcer", "type": "ICD10"},
    {"code": "K80.20", "description": "Calculus of gallbladder without cholecystitis without obstruction", "category": "Gastroenterology", "keywords": "gallstones cholelithiasis gallbladder stones", "type": "ICD10"},
    {"code": "K85.90", "description": "Acute pancreatitis without necrosis or infection, unspecified", "category": "Gastroenterology", "keywords": "acute pancreatitis pancreas inflammation", "type": "ICD10"},
    {"code": "K76.0", "description": "Fatty (change of) liver, not elsewhere classified", "category": "Gastroenterology", "keywords": "fatty liver NAFLD steatosis hepatic", "type": "ICD10"},
    {"code": "K74.60", "description": "Unspecified cirrhosis of liver", "category": "Gastroenterology", "keywords": "cirrhosis liver chronic liver disease fibrosis", "type": "ICD10"},
    {"code": "K92.1", "description": "Melena", "category": "Gastroenterology", "keywords": "melena GI bleeding black stool tarry", "type": "ICD10"},
    {"code": "K92.0", "description": "Hematemesis", "category": "Gastroenterology", "keywords": "hematemesis vomiting blood GI bleeding upper", "type": "ICD10"},
    {"code": "R10.9", "description": "Unspecified abdominal pain", "category": "Gastroenterology", "keywords": "abdominal pain belly pain stomach ache unspecified", "type": "ICD10"},
    {"code": "R11.2", "description": "Nausea with vomiting, unspecified", "category": "Gastroenterology", "keywords": "nausea vomiting emesis", "type": "ICD10"},
    # ── Orthopedics (ICD-10) ─────────────────────────────────────────────
    {"code": "S72.001A", "description": "Fracture of unspecified part of neck of right femur, initial encounter", "category": "Orthopedics", "keywords": "hip fracture femur neck right initial", "type": "ICD10"},
    {"code": "S72.002A", "description": "Fracture of unspecified part of neck of left femur, initial encounter", "category": "Orthopedics", "keywords": "hip fracture femur neck left initial", "type": "ICD10"},
    {"code": "S82.001A", "description": "Unspecified fracture of right patella, initial encounter", "category": "Orthopedics", "keywords": "patella fracture kneecap right initial", "type": "ICD10"},
    {"code": "S52.501A", "description": "Unspecified fracture of the lower end of right radius, initial encounter", "category": "Orthopedics", "keywords": "radius fracture wrist distal right Colles", "type": "ICD10"},
    {"code": "S42.001A", "description": "Fracture of unspecified part of right clavicle, initial encounter", "category": "Orthopedics", "keywords": "clavicle fracture collarbone right initial", "type": "ICD10"},
    {"code": "S93.401A", "description": "Sprain of unspecified ligament of right ankle, initial encounter", "category": "Orthopedics", "keywords": "ankle sprain ligament right initial", "type": "ICD10"},
    {"code": "S83.511A", "description": "Sprain of anterior cruciate ligament of right knee, initial encounter", "category": "Orthopedics", "keywords": "ACL sprain anterior cruciate knee right", "type": "ICD10"},
    {"code": "M54.5", "description": "Low back pain", "category": "Orthopedics", "keywords": "low back pain lumbago lumbar spine", "type": "ICD10"},
    {"code": "M54.2", "description": "Cervicalgia", "category": "Orthopedics", "keywords": "neck pain cervicalgia cervical spine", "type": "ICD10"},
    {"code": "M79.3", "description": "Panniculitis, unspecified", "category": "Orthopedics", "keywords": "panniculitis subcutaneous inflammation", "type": "ICD10"},
    {"code": "M17.11", "description": "Primary osteoarthritis, right knee", "category": "Orthopedics", "keywords": "osteoarthritis knee right degenerative joint", "type": "ICD10"},
    {"code": "M17.12", "description": "Primary osteoarthritis, left knee", "category": "Orthopedics", "keywords": "osteoarthritis knee left degenerative joint", "type": "ICD10"},
    {"code": "M25.511", "description": "Pain in right shoulder", "category": "Orthopedics", "keywords": "shoulder pain right joint", "type": "ICD10"},
    {"code": "M75.110", "description": "Incomplete rotator cuff tear or rupture of right shoulder, not specified as traumatic", "category": "Orthopedics", "keywords": "rotator cuff tear shoulder right incomplete", "type": "ICD10"},
    {"code": "M51.16", "description": "Intervertebral disc disorders with radiculopathy, lumbar region", "category": "Orthopedics", "keywords": "herniated disc lumbar radiculopathy sciatica", "type": "ICD10"},
    # ── Psychiatry (ICD-10) ──────────────────────────────────────────────
    {"code": "F32.1", "description": "Major depressive disorder, single episode, moderate", "category": "Psychiatry", "keywords": "depression major depressive disorder MDD moderate single", "type": "ICD10"},
    {"code": "F32.2", "description": "Major depressive disorder, single episode, severe without psychotic features", "category": "Psychiatry", "keywords": "depression major depressive disorder MDD severe", "type": "ICD10"},
    {"code": "F33.1", "description": "Major depressive disorder, recurrent, moderate", "category": "Psychiatry", "keywords": "depression MDD recurrent moderate", "type": "ICD10"},
    {"code": "F33.2", "description": "Major depressive disorder, recurrent severe without psychotic features", "category": "Psychiatry", "keywords": "depression MDD recurrent severe", "type": "ICD10"},
    {"code": "F41.1", "description": "Generalized anxiety disorder", "category": "Psychiatry", "keywords": "anxiety GAD generalized anxiety disorder worry", "type": "ICD10"},
    {"code": "F41.0", "description": "Panic disorder without agoraphobia", "category": "Psychiatry", "keywords": "panic disorder panic attacks anxiety", "type": "ICD10"},
    {"code": "F43.10", "description": "Post-traumatic stress disorder, unspecified", "category": "Psychiatry", "keywords": "PTSD post-traumatic stress disorder trauma", "type": "ICD10"},
    {"code": "F31.9", "description": "Bipolar disorder, unspecified", "category": "Psychiatry", "keywords": "bipolar disorder manic depressive unspecified", "type": "ICD10"},
    {"code": "F31.30", "description": "Bipolar disorder, current episode depressed, mild or moderate severity, unspecified", "category": "Psychiatry", "keywords": "bipolar disorder depressed episode mild moderate", "type": "ICD10"},
    {"code": "F31.10", "description": "Bipolar disorder, current episode manic without psychotic features, unspecified", "category": "Psychiatry", "keywords": "bipolar disorder manic episode", "type": "ICD10"},
    {"code": "F20.9", "description": "Schizophrenia, unspecified", "category": "Psychiatry", "keywords": "schizophrenia psychosis psychotic disorder", "type": "ICD10"},
    {"code": "F10.20", "description": "Alcohol dependence, uncomplicated", "category": "Psychiatry", "keywords": "alcohol dependence alcoholism substance use disorder", "type": "ICD10"},
    {"code": "F17.210", "description": "Nicotine dependence, cigarettes, uncomplicated", "category": "Psychiatry", "keywords": "nicotine dependence smoking cigarettes tobacco", "type": "ICD10"},
    {"code": "F90.9", "description": "Attention-deficit hyperactivity disorder, unspecified type", "category": "Psychiatry", "keywords": "ADHD attention deficit hyperactivity disorder", "type": "ICD10"},
    {"code": "F50.00", "description": "Anorexia nervosa, unspecified", "category": "Psychiatry", "keywords": "anorexia nervosa eating disorder", "type": "ICD10"},
    # ── General / Infectious / Hematology (ICD-10) ───────────────────────
    {"code": "I10", "description": "Essential (primary) hypertension", "category": "General", "keywords": "hypertension high blood pressure HTN essential", "type": "ICD10"},
    {"code": "E66.9", "description": "Obesity, unspecified", "category": "General", "keywords": "obesity overweight BMI", "type": "ICD10"},
    {"code": "A41.9", "description": "Sepsis, unspecified organism", "category": "General", "keywords": "sepsis septicemia systemic infection SIRS", "type": "ICD10"},
    {"code": "A41.01", "description": "Sepsis due to Methicillin susceptible Staphylococcus aureus", "category": "General", "keywords": "MSSA sepsis staph aureus infection", "type": "ICD10"},
    {"code": "R65.20", "description": "Severe sepsis without septic shock", "category": "General", "keywords": "severe sepsis organ dysfunction without shock", "type": "ICD10"},
    {"code": "R65.21", "description": "Severe sepsis with septic shock", "category": "General", "keywords": "severe sepsis septic shock organ failure", "type": "ICD10"},
    {"code": "N39.0", "description": "Urinary tract infection, site not specified", "category": "General", "keywords": "UTI urinary tract infection bladder kidney", "type": "ICD10"},
    {"code": "D64.9", "description": "Anemia, unspecified", "category": "General", "keywords": "anemia low hemoglobin low red blood cells", "type": "ICD10"},
    {"code": "D50.9", "description": "Iron deficiency anemia, unspecified", "category": "General", "keywords": "iron deficiency anemia low iron ferritin", "type": "ICD10"},
    {"code": "R50.9", "description": "Fever, unspecified", "category": "General", "keywords": "fever pyrexia elevated temperature", "type": "ICD10"},
    {"code": "Z87.891", "description": "Personal history of nicotine dependence", "category": "General", "keywords": "history smoking former smoker tobacco", "type": "ICD10"},
    {"code": "Z79.4", "description": "Long-term (current) use of insulin", "category": "General", "keywords": "insulin use long-term diabetes", "type": "ICD10"},
    {"code": "Z79.01", "description": "Long-term (current) use of anticoagulants", "category": "General", "keywords": "anticoagulant warfarin blood thinner long-term", "type": "ICD10"},
    {"code": "R07.9", "description": "Chest pain, unspecified", "category": "General", "keywords": "chest pain unspecified thoracic pain", "type": "ICD10"},
    {"code": "R07.1", "description": "Chest pain on breathing", "category": "General", "keywords": "pleuritic chest pain breathing pleurisy", "type": "ICD10"},
    {"code": "R09.02", "description": "Hypoxemia", "category": "General", "keywords": "hypoxemia low oxygen blood O2 desaturation", "type": "ICD10"},
    {"code": "J96.01", "description": "Acute respiratory failure with hypoxia", "category": "General", "keywords": "acute respiratory failure hypoxia low oxygen", "type": "ICD10"},
    {"code": "N17.9", "description": "Acute kidney failure, unspecified", "category": "General", "keywords": "acute kidney injury AKI renal failure", "type": "ICD10"},
    {"code": "N18.9", "description": "Chronic kidney disease, unspecified", "category": "General", "keywords": "chronic kidney disease CKD renal insufficiency", "type": "ICD10"},
    {"code": "K72.00", "description": "Acute and subacute hepatic failure without coma", "category": "General", "keywords": "acute hepatic failure liver failure", "type": "ICD10"},
    {"code": "B34.9", "description": "Viral infection, unspecified", "category": "General", "keywords": "viral infection unspecified virus", "type": "ICD10"},
    {"code": "L03.90", "description": "Cellulitis, unspecified", "category": "General", "keywords": "cellulitis skin infection soft tissue", "type": "ICD10"},
    {"code": "T78.40XA", "description": "Allergy, unspecified, initial encounter", "category": "General", "keywords": "allergy allergic reaction hypersensitivity initial", "type": "ICD10"},
    {"code": "R42", "description": "Dizziness and giddiness", "category": "General", "keywords": "dizziness vertigo lightheaded giddiness", "type": "ICD10"},
    {"code": "R53.83", "description": "Other fatigue", "category": "General", "keywords": "fatigue tiredness exhaustion malaise", "type": "ICD10"},
    {"code": "R63.4", "description": "Abnormal weight loss", "category": "General", "keywords": "weight loss abnormal unexplained", "type": "ICD10"},
    {"code": "M79.3", "description": "Panniculitis, unspecified", "category": "General", "keywords": "panniculitis inflammation subcutaneous tissue", "type": "ICD10"},
    {"code": "R73.03", "description": "Prediabetes", "category": "General", "keywords": "prediabetes impaired glucose tolerance pre-diabetes", "type": "ICD10"},
    # ── CPT Codes (Procedures) ───────────────────────────────────────────
    {"code": "99213", "description": "Office or other outpatient visit, established patient, low complexity", "category": "E&M", "keywords": "office visit established patient low complexity outpatient", "type": "CPT"},
    {"code": "99214", "description": "Office or other outpatient visit, established patient, moderate complexity", "category": "E&M", "keywords": "office visit established patient moderate complexity outpatient", "type": "CPT"},
    {"code": "99215", "description": "Office or other outpatient visit, established patient, high complexity", "category": "E&M", "keywords": "office visit established patient high complexity outpatient", "type": "CPT"},
    {"code": "99203", "description": "Office or other outpatient visit, new patient, low complexity", "category": "E&M", "keywords": "office visit new patient low complexity outpatient", "type": "CPT"},
    {"code": "99204", "description": "Office or other outpatient visit, new patient, moderate complexity", "category": "E&M", "keywords": "office visit new patient moderate complexity outpatient", "type": "CPT"},
    {"code": "99205", "description": "Office or other outpatient visit, new patient, high complexity", "category": "E&M", "keywords": "office visit new patient high complexity outpatient", "type": "CPT"},
    {"code": "99281", "description": "Emergency department visit, self-limited or minor problem", "category": "E&M", "keywords": "emergency department visit minor ED ER", "type": "CPT"},
    {"code": "99282", "description": "Emergency department visit, low to moderate severity", "category": "E&M", "keywords": "emergency department visit low moderate ED ER", "type": "CPT"},
    {"code": "99283", "description": "Emergency department visit, moderate severity", "category": "E&M", "keywords": "emergency department visit moderate severity ED ER", "type": "CPT"},
    {"code": "99284", "description": "Emergency department visit, high severity", "category": "E&M", "keywords": "emergency department visit high severity ED ER urgent", "type": "CPT"},
    {"code": "99285", "description": "Emergency department visit, high severity with significant threat to life", "category": "E&M", "keywords": "emergency department visit critical life threatening ED ER", "type": "CPT"},
    {"code": "99221", "description": "Initial hospital inpatient care, low complexity", "category": "E&M", "keywords": "hospital admission inpatient initial low complexity", "type": "CPT"},
    {"code": "99222", "description": "Initial hospital inpatient care, moderate complexity", "category": "E&M", "keywords": "hospital admission inpatient initial moderate complexity", "type": "CPT"},
    {"code": "99223", "description": "Initial hospital inpatient care, high complexity", "category": "E&M", "keywords": "hospital admission inpatient initial high complexity", "type": "CPT"},
    {"code": "99232", "description": "Subsequent hospital inpatient care, moderate complexity", "category": "E&M", "keywords": "hospital subsequent inpatient follow-up moderate", "type": "CPT"},
    {"code": "99233", "description": "Subsequent hospital inpatient care, high complexity", "category": "E&M", "keywords": "hospital subsequent inpatient follow-up high complexity", "type": "CPT"},
    {"code": "99291", "description": "Critical care, first 30-74 minutes", "category": "E&M", "keywords": "critical care ICU intensive first 30 minutes", "type": "CPT"},
    {"code": "93000", "description": "Electrocardiogram, routine ECG with at least 12 leads", "category": "Cardiology", "keywords": "ECG EKG electrocardiogram 12 lead heart tracing", "type": "CPT"},
    {"code": "93306", "description": "Echocardiography, transthoracic, complete", "category": "Cardiology", "keywords": "echocardiogram TTE transthoracic echo ultrasound heart", "type": "CPT"},
    {"code": "93458", "description": "Catheter placement in coronary artery for coronary angiography", "category": "Cardiology", "keywords": "cardiac catheterization coronary angiography heart catheter", "type": "CPT"},
    {"code": "92928", "description": "Percutaneous transcatheter placement of intracoronary stent", "category": "Cardiology", "keywords": "PCI stent coronary percutaneous intervention angioplasty", "type": "CPT"},
    {"code": "33533", "description": "Coronary artery bypass, using arterial graft; single arterial graft", "category": "Cardiology", "keywords": "CABG coronary artery bypass graft surgery", "type": "CPT"},
    {"code": "71046", "description": "Radiologic examination, chest; 2 views", "category": "Radiology", "keywords": "chest X-ray CXR radiograph 2 views", "type": "CPT"},
    {"code": "71250", "description": "Computed tomography, thorax; without contrast", "category": "Radiology", "keywords": "CT chest thorax computed tomography without contrast", "type": "CPT"},
    {"code": "74177", "description": "Computed tomography, abdomen and pelvis; with contrast", "category": "Radiology", "keywords": "CT abdomen pelvis computed tomography with contrast", "type": "CPT"},
    {"code": "70553", "description": "MRI brain without contrast followed by with contrast", "category": "Radiology", "keywords": "MRI brain magnetic resonance imaging contrast", "type": "CPT"},
    {"code": "80053", "description": "Comprehensive metabolic panel", "category": "Laboratory", "keywords": "CMP comprehensive metabolic panel blood chemistry", "type": "CPT"},
    {"code": "85025", "description": "Complete blood count (CBC) with automated differential", "category": "Laboratory", "keywords": "CBC complete blood count differential WBC RBC platelets", "type": "CPT"},
    {"code": "82553", "description": "Creatine kinase MB fraction", "category": "Laboratory", "keywords": "CK-MB creatine kinase cardiac enzyme heart", "type": "CPT"},
    {"code": "84484", "description": "Troponin, quantitative", "category": "Laboratory", "keywords": "troponin cardiac biomarker heart attack MI quantitative", "type": "CPT"},
    {"code": "83036", "description": "Hemoglobin A1c", "category": "Laboratory", "keywords": "HbA1c hemoglobin A1c diabetes glycated hemoglobin", "type": "CPT"},
    {"code": "80061", "description": "Lipid panel", "category": "Laboratory", "keywords": "lipid panel cholesterol triglycerides HDL LDL", "type": "CPT"},
    {"code": "81001", "description": "Urinalysis, automated, with microscopy", "category": "Laboratory", "keywords": "urinalysis UA urine test microscopy", "type": "CPT"},
    {"code": "36556", "description": "Insertion of non-tunneled centrally inserted central venous catheter", "category": "Procedures", "keywords": "central line insertion CVC central venous catheter", "type": "CPT"},
    {"code": "31500", "description": "Intubation, endotracheal, emergency procedure", "category": "Procedures", "keywords": "intubation endotracheal tube ETT emergency airway", "type": "CPT"},
    {"code": "32551", "description": "Tube thoracostomy, includes connection to drainage system", "category": "Procedures", "keywords": "chest tube thoracostomy drainage pleural", "type": "CPT"},
    {"code": "49083", "description": "Abdominal paracentesis", "category": "Procedures", "keywords": "paracentesis abdominal fluid drainage ascites", "type": "CPT"},
    {"code": "62270", "description": "Lumbar puncture (spinal tap)", "category": "Procedures", "keywords": "lumbar puncture spinal tap LP CSF", "type": "CPT"},
    {"code": "43239", "description": "Esophagogastroduodenoscopy with biopsy", "category": "Procedures", "keywords": "EGD upper endoscopy esophagogastroduodenoscopy biopsy", "type": "CPT"},
    {"code": "45378", "description": "Colonoscopy, diagnostic", "category": "Procedures", "keywords": "colonoscopy diagnostic colon screening", "type": "CPT"},
    {"code": "27447", "description": "Arthroplasty, knee, condyles and plateau", "category": "Procedures", "keywords": "total knee replacement arthroplasty TKR TKA", "type": "CPT"},
    {"code": "27130", "description": "Arthroplasty, acetabular and proximal femoral prosthetic replacement (total hip replacement)", "category": "Procedures", "keywords": "total hip replacement arthroplasty THR THA", "type": "CPT"},
    {"code": "29881", "description": "Arthroscopy, knee, surgical; with meniscectomy", "category": "Procedures", "keywords": "knee arthroscopy meniscectomy meniscus surgery", "type": "CPT"},
    {"code": "47562", "description": "Laparoscopic cholecystectomy", "category": "Procedures", "keywords": "cholecystectomy gallbladder removal laparoscopic", "type": "CPT"},
    {"code": "44970", "description": "Laparoscopic appendectomy", "category": "Procedures", "keywords": "appendectomy laparoscopic appendix removal", "type": "CPT"},
    {"code": "90837", "description": "Psychotherapy, 60 minutes", "category": "Psychiatry", "keywords": "psychotherapy 60 minutes therapy counseling", "type": "CPT"},
    {"code": "96127", "description": "Brief emotional/behavioral assessment", "category": "Psychiatry", "keywords": "PHQ-9 GAD-7 depression anxiety screening assessment", "type": "CPT"},
]


def build_database():
    """Build the ChromaDB collection from the inline code data."""
    import chromadb
    from sentence_transformers import SentenceTransformer

    print("=" * 60)
    print("Healthcare AI Agent — Knowledge Base Builder")
    print("=" * 60)

    # ── Write CSV for reference ──────────────────────────────────────────
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"\n[1/4] Writing {len(CODES)} codes to {CSV_PATH} …")
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["code", "description", "category", "keywords", "type"])
        writer.writeheader()
        writer.writerows(CODES)
    print(f"  ✓ CSV written ({len(CODES)} rows)")

    # ── Load embedding model ─────────────────────────────────────────────
    print("\n[2/4] Loading sentence-transformers model (all-MiniLM-L6-v2) …")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("  ✓ Model loaded")

    # ── Prepare texts & embed ────────────────────────────────────────────
    print("\n[3/4] Generating embeddings …")
    texts = [f"{c['description']} {c['keywords']}" for c in CODES]
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=64)
    print(f"  ✓ {len(embeddings)} embeddings generated (dim={embeddings.shape[1]})")

    # ── Store in ChromaDB ────────────────────────────────────────────────
    print(f"\n[4/4] Storing in ChromaDB at {CHROMA_PERSIST_DIR} …")
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

    # Delete existing collection if present (idempotent rebuild)
    try:
        client.delete_collection("icd10_codes")
        print("  ↻ Deleted existing collection")
    except Exception:
        pass

    collection = client.create_collection(
        name="icd10_codes",
        metadata={"hnsw:space": "cosine"},
    )

    # Add in batches
    batch_size = 50
    for i in range(0, len(CODES), batch_size):
        batch = CODES[i : i + batch_size]
        batch_texts = texts[i : i + batch_size]
        batch_embeddings = embeddings[i : i + batch_size].tolist()
        batch_ids = [f"code_{i + j}" for j in range(len(batch))]
        batch_metadatas = [
            {
                "code": c["code"],
                "description": c["description"],
                "category": c["category"],
                "keywords": c["keywords"],
                "type": c["type"],
            }
            for c in batch
        ]
        collection.add(
            ids=batch_ids,
            documents=batch_texts,
            embeddings=batch_embeddings,
            metadatas=batch_metadatas,
        )
        print(f"  ✓ Added batch {i // batch_size + 1} ({len(batch)} codes)")

    print(f"\n{'=' * 60}")
    print(f"Done! Collection 'icd10_codes' has {collection.count()} entries.")
    print(f"Persist directory: {os.path.abspath(CHROMA_PERSIST_DIR)}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    build_database()
