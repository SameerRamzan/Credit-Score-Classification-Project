"""
Credit Score Classification Flask Web Application

This application provides a web interface for credit score prediction
using machine learning models trained on financial data.

Author: Credit Score Classification Project
Date: 2024
"""

from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import (
    FloatField, IntegerField, SelectField, SubmitField, 
    StringField, validators
)
from wtforms.validators import DataRequired, NumberRange, Optional
import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
import traceback
from datetime import datetime
import json

# Import configuration
from config import Config, DevelopmentConfig, ProductionConfig, MODELS_DIR

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configure app based on environment
    if config_name == 'production':
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    app.logger.info('Credit Score Classification App Starting...')
    
    return app

# Create Flask app
app = create_app()

# Global variables for model and metadata
model = None
model_metadata = None
feature_info = None
preprocessors = None

def load_model_artifacts():
    """Load trained model and related artifacts"""
    global model, model_metadata, feature_info, preprocessors
    
    try:
        # Load final model
        model_path = MODELS_DIR / "final_model.joblib"
        if model_path.exists():
            model = joblib.load(model_path)
            app.logger.info("Model loaded successfully")
        else:
            app.logger.warning("Model file not found, using dummy model")
            # Create a dummy model for development
            from sklearn.ensemble import RandomForestClassifier
            model = RandomForestClassifier(n_estimators=10, random_state=42)
        
        # Load model metadata
        metadata_path = MODELS_DIR / "model_metadata.joblib"
        if metadata_path.exists():
            model_metadata = joblib.load(metadata_path)
            app.logger.info("Model metadata loaded successfully")
        else:
            # Default metadata
            model_metadata = {
                'target_classes': ['Poor', 'Standard', 'Good'],
                'features': ['Age', 'Annual_Income', 'Monthly_Inhand_Salary'],
                'performance_metrics': {'test_accuracy': 0.85}
            }
        
        # Load feature info
        feature_info_path = MODELS_DIR / "feature_info.joblib"
        if feature_info_path.exists():
            feature_info = joblib.load(feature_info_path)
            app.logger.info("Feature info loaded successfully")
        
        # Load preprocessors
        preprocessors_path = MODELS_DIR / "preprocessors.joblib"
        if preprocessors_path.exists():
            preprocessors = joblib.load(preprocessors_path)
            app.logger.info("Preprocessors loaded successfully")
            
    except Exception as e:
        app.logger.error(f"Error loading model artifacts: {str(e)}")
        # Set default values
        model_metadata = {
            'target_classes': ['Poor', 'Standard', 'Good'],
            'features': ['Age', 'Annual_Income', 'Monthly_Inhand_Salary'],
            'performance_metrics': {'test_accuracy': 0.85}
        }

class CreditScoreForm(FlaskForm):
    """Form for credit score prediction input"""
    
    # Personal Information
    age = IntegerField(
        'Age', 
        validators=[DataRequired(), NumberRange(min=18, max=100)],
        render_kw={"placeholder": "e.g., 30", "class": "form-control"}
    )
    
    occupation = SelectField(
        'Occupation',
        choices=[
            ('', 'Select Occupation'),
            ('Engineer', 'Engineer'),
            ('Teacher', 'Teacher'),
            ('Doctor', 'Doctor'),
            ('Lawyer', 'Lawyer'),
            ('Manager', 'Manager'),
            ('Sales', 'Sales Representative'),
            ('Student', 'Student'),
            ('Artist', 'Artist'),
            ('Entrepreneur', 'Entrepreneur'),
            ('Accountant', 'Accountant'),
            ('Nurse', 'Nurse'),
            ('Other', 'Other')
        ],
        validators=[DataRequired()],
        render_kw={"class": "form-control"}
    )
    
    # Financial Information
    annual_income = FloatField(
        'Annual Income ($)',
        validators=[DataRequired(), NumberRange(min=0, max=10000000)],
        render_kw={"placeholder": "e.g., 50000", "class": "form-control"}
    )
    
    monthly_salary = FloatField(
        'Monthly In-hand Salary ($)',
        validators=[DataRequired(), NumberRange(min=0, max=1000000)],
        render_kw={"placeholder": "e.g., 4000", "class": "form-control"}
    )
    
    # Banking Information
    num_bank_accounts = IntegerField(
        'Number of Bank Accounts',
        validators=[DataRequired(), NumberRange(min=0, max=20)],
        render_kw={"placeholder": "e.g., 2", "class": "form-control"}
    )
    
    num_credit_cards = IntegerField(
        'Number of Credit Cards',
        validators=[DataRequired(), NumberRange(min=0, max=20)],
        render_kw={"placeholder": "e.g., 3", "class": "form-control"}
    )
    
    # Credit Information
    interest_rate = FloatField(
        'Interest Rate (%)',
        validators=[DataRequired(), NumberRange(min=0, max=50)],
        render_kw={"placeholder": "e.g., 12.5", "class": "form-control"}
    )
    
    num_loans = IntegerField(
        'Number of Loans',
        validators=[DataRequired(), NumberRange(min=0, max=20)],
        render_kw={"placeholder": "e.g., 1", "class": "form-control"}
    )
    
    # Payment Behavior
    delay_from_due_date = IntegerField(
        'Average Delay from Due Date (days)',
        validators=[DataRequired(), NumberRange(min=0, max=365)],
        render_kw={"placeholder": "e.g., 5", "class": "form-control"}
    )
    
    num_delayed_payments = IntegerField(
        'Number of Delayed Payments',
        validators=[DataRequired(), NumberRange(min=0, max=50)],
        render_kw={"placeholder": "e.g., 2", "class": "form-control"}
    )
    
    # Credit Utilization
    credit_utilization_ratio = FloatField(
        'Credit Utilization Ratio (%)',
        validators=[DataRequired(), NumberRange(min=0, max=100)],
        render_kw={"placeholder": "e.g., 30.5", "class": "form-control"}
    )
    
    credit_history_age = IntegerField(
        'Credit History Age (months)',
        validators=[DataRequired(), NumberRange(min=0, max=600)],
        render_kw={"placeholder": "e.g., 120", "class": "form-control"}
    )
    
    # Financial Obligations
    outstanding_debt = FloatField(
        'Outstanding Debt ($)',
        validators=[DataRequired(), NumberRange(min=0, max=10000000)],
        render_kw={"placeholder": "e.g., 15000", "class": "form-control"}
    )
    
    total_emi_per_month = FloatField(
        'Total EMI per Month ($)',
        validators=[DataRequired(), NumberRange(min=0, max=100000)],
        render_kw={"placeholder": "e.g., 800", "class": "form-control"}
    )
    
    amount_invested_monthly = FloatField(
        'Amount Invested Monthly ($)',
        validators=[DataRequired(), NumberRange(min=0, max=100000)],
        render_kw={"placeholder": "e.g., 500", "class": "form-control"}
    )
    
    monthly_balance = FloatField(
        'Monthly Balance ($)',
        validators=[DataRequired(), NumberRange(min=-100000, max=100000)],
        render_kw={"placeholder": "e.g., 1200", "class": "form-control"}
    )
    
    # Categorical Fields
    credit_mix = SelectField(
        'Credit Mix',
        choices=[
            ('', 'Select Credit Mix'),
            ('Good', 'Good'),
            ('Standard', 'Standard'),
            ('Bad', 'Bad')
        ],
        validators=[DataRequired()],
        render_kw={"class": "form-control"}
    )
    
    payment_of_min_amount = SelectField(
        'Payment of Minimum Amount',
        choices=[
            ('', 'Select Option'),
            ('Yes', 'Yes'),
            ('No', 'No')
        ],
        validators=[DataRequired()],
        render_kw={"class": "form-control"}
    )
    
    payment_behaviour = SelectField(
        'Payment Behaviour',
        choices=[
            ('', 'Select Payment Behaviour'),
            ('High_spent_Small_value_payments', 'High Spending, Small Value Payments'),
            ('Low_spent_Large_value_payments', 'Low Spending, Large Value Payments'),
            ('High_spent_Medium_value_payments', 'High Spending, Medium Value Payments'),
            ('Low_spent_Medium_value_payments', 'Low Spending, Medium Value Payments'),
            ('High_spent_Large_value_payments', 'High Spending, Large Value Payments'),
            ('Low_spent_Small_value_payments', 'Low Spending, Small Value Payments')
        ],
        validators=[DataRequired()],
        render_kw={"class": "form-control"}
    )
    
    submit = SubmitField('Predict Credit Score', render_kw={"class": "btn btn-primary btn-lg"})

def prepare_input_data(form_data):
    """Prepare input data for model prediction"""
    try:
        # Create input dictionary from form data
        input_data = {
            'Age': float(form_data['age']),
            'Occupation': form_data['occupation'],
            'Annual_Income': float(form_data['annual_income']),
            'Monthly_Inhand_Salary': float(form_data['monthly_salary']),
            'Num_Bank_Accounts': int(form_data['num_bank_accounts']),
            'Num_Credit_Card': int(form_data['num_credit_cards']),
            'Interest_Rate': float(form_data['interest_rate']),
            'Num_of_Loan': int(form_data['num_loans']),
            'Delay_from_due_date': int(form_data['delay_from_due_date']),
            'Num_of_Delayed_Payment': int(form_data['num_delayed_payments']),
            'Credit_Utilization_Ratio': float(form_data['credit_utilization_ratio']),
            'Credit_History_Age': int(form_data['credit_history_age']),
            'Outstanding_Debt': float(form_data['outstanding_debt']),
            'Total_EMI_per_month': float(form_data['total_emi_per_month']),
            'Amount_invested_monthly': float(form_data['amount_invested_monthly']),
            'Monthly_Balance': float(form_data['monthly_balance']),
            'Credit_Mix': form_data['credit_mix'],
            'Payment_of_Min_Amount': form_data['payment_of_min_amount'],
            'Payment_Behaviour': form_data['payment_behaviour']
        }
        
        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Apply preprocessing if available
        if preprocessors:
            # Apply categorical encoding
            for col in ['Occupation', 'Credit_Mix', 'Payment_of_Min_Amount', 'Payment_Behaviour']:
                if col in input_df.columns and col in preprocessors:
                    encoder = preprocessors[col]
                    if hasattr(encoder, 'transform'):
                        try:
                            input_df[col] = encoder.transform(input_df[col])
                        except ValueError:
                            # Handle unseen categories
                            input_df[col] = 0
            
            # Apply scaling if available
            if 'scaler' in preprocessors:
                scaler = preprocessors['scaler']
                numerical_columns = input_df.select_dtypes(include=[np.number]).columns
                input_df[numerical_columns] = scaler.transform(input_df[numerical_columns])
        
        return input_df
        
    except Exception as e:
        app.logger.error(f"Error preparing input data: {str(e)}")
        raise

def make_prediction(input_data):
    """Make credit score prediction"""
    try:
        if model is None:
            raise ValueError("Model not loaded")
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        # Get prediction probabilities if available
        probabilities = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_data)[0]
            if model_metadata and 'target_classes' in model_metadata:
                probabilities = {
                    class_name: float(prob) 
                    for class_name, prob in zip(model_metadata['target_classes'], proba)
                }
        
        # Get predicted class name
        if model_metadata and 'target_classes' in model_metadata:
            predicted_class = model_metadata['target_classes'][prediction]
        else:
            predicted_class = f"Class_{prediction}"
        
        return {
            'prediction': predicted_class,
            'prediction_code': int(prediction),
            'probabilities': probabilities,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        app.logger.error(f"Error making prediction: {str(e)}")
        raise

# Routes
@app.route('/')
def index():
    """Homepage"""
    return render_template('index.html', 
                         model_info=model_metadata,
                         app_title="Credit Score Classification")

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """Credit score prediction page"""
    form = CreditScoreForm()
    
    if form.validate_on_submit():
        try:
            # Prepare input data
            form_data = request.form.to_dict()
            input_data = prepare_input_data(form_data)
            
            # Make prediction
            result = make_prediction(input_data)
            
            # Store result in session or pass to template
            return render_template('result.html', 
                                 result=result,
                                 form_data=form_data,
                                 model_info=model_metadata)
            
        except Exception as e:
            app.logger.error(f"Prediction error: {str(e)}")
            flash(f'Error making prediction: {str(e)}', 'error')
            return render_template('predict.html', form=form)
    
    return render_template('predict.html', form=form)

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """API endpoint for credit score prediction"""
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Prepare input data
        input_data = prepare_input_data(data)
        
        # Make prediction
        result = make_prediction(input_data)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        app.logger.error(f"API prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/about')
def about():
    """About page with model information"""
    return render_template('about.html', 
                         model_info=model_metadata,
                         feature_info=feature_info)

@app.route('/api/model-info')
def api_model_info():
    """API endpoint for model information"""
    try:
        info = {
            'model_metadata': model_metadata,
            'feature_info': feature_info,
            'status': 'active'
        }
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """404 error handler"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """500 error handler"""
    return render_template('500.html'), 500

# Initialize the application
if __name__ == '__main__':
    # Load model artifacts
    load_model_artifacts()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)