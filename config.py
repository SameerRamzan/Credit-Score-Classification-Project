import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Data paths
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
CLEANED_DATA_DIR = DATA_DIR / "cleaned"

# Model paths
MODELS_DIR = BASE_DIR / "models"

# Flask app configuration
class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True

# Model configuration
MODEL_CONFIG = {
    'random_state': 42,
    'test_size': 0.2,
    'validation_size': 0.2,
    'cv_folds': 5,
    'scoring_metric': 'accuracy',
    'models': {
        'logistic_regression': {
            'C': [0.1, 1, 10, 100],
            'max_iter': [1000, 2000]
        },
        'random_forest': {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5, 10]
        },
        'xgboost': {
            'n_estimators': [100, 200],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.1, 0.2]
        },
        'lightgbm': {
            'n_estimators': [100, 200],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.1, 0.2]
        }
    }
}

# Feature engineering configuration
FEATURE_CONFIG = {
    'numerical_features': [
        'Age', 'Annual_Income', 'Monthly_Inhand_Salary', 'Num_Bank_Accounts',
        'Num_Credit_Card', 'Interest_Rate', 'Num_of_Loan', 'Delay_from_due_date',
        'Num_of_Delayed_Payment', 'Credit_Mix', 'Outstanding_Debt',
        'Credit_History_Age', 'Monthly_Balance'
    ],
    'categorical_features': [
        'Occupation', 'Credit_Mix', 'Payment_of_Min_Amount', 'Payment_Behaviour'
    ],
    'target_feature': 'Credit_Score',
    'feature_selection_k': 15
}

# Data preprocessing configuration
PREPROCESSING_CONFIG = {
    'missing_value_threshold': 0.7,
    'outlier_method': 'IQR',
    'scaling_method': 'StandardScaler',
    'encoding_method': 'LabelEncoder'
}