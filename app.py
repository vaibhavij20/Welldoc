import streamlit as st
import pandas as pd
import joblib
import shap
import numpy as np
import google.generativeai as genai

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(
    page_title="AI Diabetes Risk Assessor",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- 2. LOAD MODEL ASSETS ---
@st.cache_resource
def load_assets():
    """Loads the pre-trained model, scaler, explainer, and columns."""
    try:
        model = joblib.load('xgb_model.joblib')
        scaler = joblib.load('scaler.joblib')
        explainer = joblib.load('shap_explainer.joblib')
        columns = pd.read_csv('training_columns.csv').columns
        return model, scaler, explainer, columns
    except FileNotFoundError:
        return None, None, None, None

model, scaler, explainer, training_columns = load_assets()

if not model or not explainer or not training_columns.any():
    st.error("Model assets not found! Please ensure all .joblib and .csv files from your notebook are in the same directory.")
    st.stop()

# --- 3. GOOGLE GEMINI API CONFIGURATION ---
try:
    GOOGLE_API_KEY = st.secrets["GOOGLE_API_KEY"]
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro')
except (KeyError, Exception):
    st.error("Google API Key is not configured. Please add it to your Streamlit secrets.", icon="🚨")
    gemini_model = None

# --- 4. HELPER FUNCTIONS ---
def st_shap(plot, height=None):
    """Renders a SHAP plot HTML in Streamlit."""
    shap_html = f"<head>{shap.getjs()}</head><body>{plot.html()}</body>"
    st.components.v1.html(shap_html, height=height)

# --- 5. USER INTERFACE ---
st.title("AI-Powered Patient Wellness Assistant")
st.markdown("An interactive tool to assess a patient's long-term diabetes control and provide wellness tips.")
st.divider()

col1, col2 = st.columns([1, 1], gap="large")

# --- Column 1: Patient Data Input and Risk Assessment ---
with col1:
    st.header("Step 1: Assess Patient's Overall Risk")
    with st.expander("Enter Patient's Historical Summary Data", expanded=True):
        # These sliders now match the features from your final model
        std_glucose_alltime = st.slider("Glucose Variability (Std. Dev. all-time)", 10.0, 100.0, 50.0)
        min_glucose_alltime = st.slider("Lowest Glucose Reading (all-time)", 40, 100, 70)
        max_glucose_alltime = st.slider("Highest Glucose Reading (all-time)", 200, 600, 350)
        avg_daily_insulin_alltime = st.slider("Average Daily Insulin (units)", 10, 80, 35)
        hypo_event_count_alltime = st.number_input("Total Hypoglycemic Events (all-time)", 0, 50, 5)
        mean_glucose_last_30_days = st.slider("Average Glucose (last 30 days)", 80, 400, 160)
        std_glucose_last_30_days = st.slider("Glucose Variability (last 30 days)", 10.0, 100.0, 60.0)
        glycemic_variability_index = st.slider("Glycemic Variability Index (std/mean)", 0.1, 1.0, 0.4)

    if st.button("Assess Patient Risk", type="primary", use_container_width=True):
        # Create a DataFrame with the exact structure the model expects
        input_data = pd.DataFrame(0, index=[0], columns=training_columns)
        
        # Populate with user inputs
        input_data['std_glucose_alltime'] = std_glucose_alltime
        input_data['min_glucose_alltime'] = min_glucose_alltime
        input_data['max_glucose_alltime'] = max_glucose_alltime
        input_data['avg_daily_insulin_alltime'] = avg_daily_insulin_alltime
        input_data['hypo_event_count_alltime'] = hypo_event_count_alltime
        input_data['mean_glucose_last_30_days'] = mean_glucose_last_30_days
        input_data['std_glucose_last_30_days'] = std_glucose_last_30_days
        input_data['glycemic_variability_index'] = glycemic_variability_index

        # Scale the input data using the loaded scaler
        input_data_scaled = scaler.transform(input_data)
        
        # --- Live Prediction ---
        prediction_proba = model.predict_proba(input_data_scaled)[0][1]
        st.session_state['risk_score'] = prediction_proba
        
        st.subheader("Risk Assessment Results")
        risk_level = "Well-Controlled"
        if prediction_proba > 0.50: risk_level = "High-Risk"
        
        st.metric(label="Patient's Long-Term Control Status", value=risk_level, delta=f"{prediction_proba:.1%} confidence")

        # --- Dynamic SHAP Explanation ---
        st.write("**What's Driving This Assessment?**")
        input_df_scaled = pd.DataFrame(input_data_scaled, columns=training_columns)
        shap_values_single = explainer.shap_values(input_df_scaled)
        force_plot = shap.force_plot(explainer.expected_value, shap_values_single[0, :], input_data.iloc[0, :], matplotlib=False)
        st_shap(force_plot, 400)

# --- Column 2: AI Wellness Assistant ---
with col2:
    st.header("Step 2: Get a Wellness Suggestion")
    
    if 'risk_score' in st.session_state:
        risk_score = st.session_state['risk_score']
        if risk_score > 0.5:
            st.warning(f"**Current Status: HIGH-RISK** ({risk_score:.1%})", icon="⚠️")
        else:
            st.success(f"**Current Status: WELL-CONTROLLED** ({risk_score:.1%})", icon="✅")
            
        user_issue = st.text_area("Describe the patient's current issue or question:", height=100)

        if st.button("Get Suggestion", use_container_width=True):
            if not user_issue:
                st.error("Please describe the issue first.")
            else:
                with st.spinner("🧠 Generating a personalized tip..."):
                    # This part can remain the same, using the risk score for context
                    # ... GenAI logic from previous responses ...
                    st.info("GenAI Assistant placeholder: The generated suggestion would appear here.")

    else:
        st.info("Please assess patient risk on the left to activate the assistant.")