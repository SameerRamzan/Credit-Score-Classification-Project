"""
Data Generation Script for Credit Score Classification
This script generates a synthetic dataset for demonstration purposes.
"""

import pandas as pd
import numpy as np
from faker import Faker
import random
from pathlib import Path

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)
fake = Faker()
Faker.seed(42)

def generate_credit_score_data(n_samples=10000):
    """
    Generate synthetic credit score dataset
    
    Parameters:
    n_samples (int): Number of samples to generate
    
    Returns:
    pd.DataFrame: Generated dataset
    """
    
    data = []
    
    for i in range(n_samples):
        # Basic demographics
        age = np.random.randint(18, 80)
        annual_income = np.random.lognormal(10, 1)  # Log-normal distribution for income
        
        # Account information
        num_bank_accounts = np.random.choice([1, 2, 3, 4, 5], p=[0.3, 0.3, 0.2, 0.15, 0.05])
        num_credit_cards = np.random.choice([0, 1, 2, 3, 4, 5], p=[0.1, 0.25, 0.3, 0.2, 0.1, 0.05])
        
        # Credit history (in months)
        credit_history_age = np.random.randint(6, 300)
        
        # Financial behavior
        monthly_inhand_salary = annual_income / 12 * np.random.uniform(0.8, 1.2)
        interest_rate = np.random.uniform(5, 25)
        num_of_loans = np.random.choice([0, 1, 2, 3, 4], p=[0.4, 0.3, 0.2, 0.08, 0.02])
        
        # Payment behavior
        delay_probs = np.exp(-np.arange(60) * 0.1)
        delay_probs = delay_probs / delay_probs.sum()  # Normalize probabilities
        delay_from_due_date = np.random.choice(range(0, 60), p=delay_probs)
        num_delayed_payments = np.random.poisson(2)
        
        # Outstanding debt
        outstanding_debt = annual_income * np.random.uniform(0, 2)
        
        # Monthly balance
        monthly_balance = monthly_inhand_salary * np.random.uniform(-0.5, 0.5)
        
        # Categorical features
        occupation = np.random.choice([
            'Engineer', 'Teacher', 'Doctor', 'Lawyer', 'Manager', 'Sales',
            'Student', 'Artist', 'Entrepreneur', 'Accountant', 'Nurse', 'Other'
        ])
        
        credit_mix = np.random.choice(['Good', 'Standard', 'Bad'], p=[0.3, 0.5, 0.2])
        payment_of_min_amount = np.random.choice(['Yes', 'No'], p=[0.7, 0.3])
        payment_behaviour = np.random.choice([
            'High_spent_Small_value_payments',
            'Low_spent_Large_value_payments', 
            'High_spent_Medium_value_payments',
            'Low_spent_Medium_value_payments',
            'High_spent_Large_value_payments',
            'Low_spent_Small_value_payments'
        ])
        
        # Calculate credit score based on features (simplified logic)
        credit_score_factors = [
            (credit_history_age / 300) * 0.3,  # Credit history length
            (1 - delay_from_due_date / 60) * 0.25,  # Payment timeliness
            (1 - outstanding_debt / annual_income) * 0.2 if annual_income > 0 else 0,  # Debt ratio
            (monthly_balance / monthly_inhand_salary) * 0.15 if monthly_inhand_salary > 0 else 0,  # Balance ratio
            (1 - num_delayed_payments / 10) * 0.1  # Payment history
        ]
        
        credit_score_numeric = sum(credit_score_factors) * 100
        
        # Add some noise
        credit_score_numeric += np.random.normal(0, 10)
        
        # Categorize credit score
        if credit_score_numeric >= 70:
            credit_score = 'Good'
        elif credit_score_numeric >= 40:
            credit_score = 'Standard'
        else:
            credit_score = 'Poor'
        
        # Add some randomness to make it more realistic
        if np.random.random() < 0.1:  # 10% random noise
            credit_score = np.random.choice(['Good', 'Standard', 'Poor'])
        
        # Create record
        record = {
            'ID': f'CUS_0x{i+1:06x}',
            'Customer_ID': f'CUS_{i+1:08d}',
            'Month': np.random.choice(['January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December']),
            'Name': fake.name(),
            'Age': age,
            'SSN': fake.ssn(),
            'Occupation': occupation,
            'Annual_Income': round(annual_income, 2),
            'Monthly_Inhand_Salary': round(monthly_inhand_salary, 2),
            'Num_Bank_Accounts': num_bank_accounts,
            'Num_Credit_Card': num_credit_cards,
            'Interest_Rate': round(interest_rate, 2),
            'Num_of_Loan': num_of_loans,
            'Type_of_Loan': np.random.choice(['Auto Loan', 'Credit-Builder Loan', 'Personal Loan', 
                                            'Home Equity Loan', 'Mortgage Loan', 'Student Loan', 
                                            'Debt Consolidation Loan', 'Payday Loan']),
            'Delay_from_due_date': delay_from_due_date,
            'Num_of_Delayed_Payment': num_delayed_payments,
            'Changed_Credit_Limit': np.random.uniform(-50, 100),
            'Num_Credit_Inquiries': np.random.randint(0, 10),
            'Credit_Mix': credit_mix,
            'Outstanding_Debt': round(outstanding_debt, 2),
            'Credit_Utilization_Ratio': round(np.random.uniform(0, 100), 2),
            'Credit_History_Age': credit_history_age,
            'Payment_of_Min_Amount': payment_of_min_amount,
            'Total_EMI_per_month': round(monthly_inhand_salary * np.random.uniform(0, 0.6), 2),
            'Amount_invested_monthly': round(monthly_inhand_salary * np.random.uniform(0, 0.3), 2),
            'Payment_Behaviour': payment_behaviour,
            'Monthly_Balance': round(monthly_balance, 2),
            'Credit_Score': credit_score
        }
        
        data.append(record)
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Generate dataset
    print("Generating synthetic credit score dataset...")
    df = generate_credit_score_data(10000)
    
    # Create output directory
    output_dir = Path("data/raw")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save dataset
    output_path = output_dir / "credit_score_data.csv"
    df.to_csv(output_path, index=False)
    
    print(f"Dataset generated and saved to {output_path}")
    print(f"Dataset shape: {df.shape}")
    print(f"Credit Score distribution:")
    print(df['Credit_Score'].value_counts())
    
    # Display first few rows
    print("\nFirst 5 rows:")
    print(df.head())