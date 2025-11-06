"""
Experiments Generator
Generates realistic A/B test experiments with both completed and active experiments
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
from typing import Dict, List
import os


class ExperimentsGenerator:
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
    def generate_experiments(self, n_days: int = 30) -> pd.DataFrame:
        """
        Generate experiments with both completed and active status
        
        Args:
            n_days: Number of days in the data period
        
        Returns:
            DataFrame with experiments
        """
        experiments = []
        now = datetime.now()
        
        # Experiment 1: "First Session Coaching Email" - COMPLETED
        # Completed 15 days ago
        exp1_start = now - timedelta(days=n_days + 5)
        exp1_end = now - timedelta(days=15)
        
        experiments.append({
            'experiment_id': 'EXP001',
            'name': 'First Session Coaching Email',
            'hypothesis': 'Personalized coaching emails improve first session quality and reduce tutor churn',
            'description': 'Testing whether personalized coaching emails vs generic emails vs video tutorials improve first session outcomes',
            'variants': json.dumps(['control', 'treatment_a', 'treatment_b']),
            'target_segment': json.dumps({
                'churn_risk_level': ['High', 'Medium'],
                'poor_first_session_flag': True,
                'first_session_count': {'min': 1}
            }),
            'primary_metric': 'engagement_lift',
            'secondary_metrics': json.dumps({
                'first_session_rating_improvement': True,
                'churn_reduction': True,
                'email_open_rate': True
            }),
            'start_date': exp1_start,
            'end_date': exp1_end,
            'status': 'completed',
            'sample_size': 87,
            'significance': 0.012,  # p-value < 0.05
            'winner': 'treatment_a',
            'notes': 'Treatment A (personalized email) showed 15% engagement lift compared to control. Statistical significance achieved.',
            'created_at': exp1_start,
            'updated_at': exp1_end
        })
        
        # Experiment 2: "Engagement Reminder Timing" - COMPLETED
        # Completed 7 days ago
        exp2_start = now - timedelta(days=n_days - 3)
        exp2_end = now - timedelta(days=7)
        
        experiments.append({
            'experiment_id': 'EXP002',
            'name': 'Engagement Reminder Timing',
            'hypothesis': 'Evening reminders have higher response rates than morning or afternoon reminders',
            'description': 'Testing optimal time to send engagement reminders to tutors with declining activity',
            'variants': json.dumps(['control', 'morning', 'evening']),
            'target_segment': json.dumps({
                'churn_risk_level': ['Medium'],
                'avg_engagement_score': {'max': 6.0},
                'total_sessions_7d': {'max': 5}
            }),
            'primary_metric': 'email_response_rate',
            'secondary_metrics': json.dumps({
                'session_count_increase': True,
                'login_frequency': True
            }),
            'start_date': exp2_start,
            'end_date': exp2_end,
            'status': 'completed',
            'sample_size': 45,
            'significance': 0.038,
            'winner': 'evening',
            'notes': 'Evening reminders showed 8% higher response rate. Optimal send time: 6-8pm tutor local time.',
            'created_at': exp2_start,
            'updated_at': exp2_end
        })
        
        # Experiment 3: "Quality Feedback Format" - ACTIVE
        # Started 5 days ago, ongoing
        exp3_start = now - timedelta(days=5)
        
        experiments.append({
            'experiment_id': 'EXP003',
            'name': 'Quality Feedback Format',
            'hypothesis': 'Visual feedback formats (charts, graphs) improve tutor understanding and adoption of quality improvements',
            'description': 'Testing different formats for delivering quality feedback: text-only, detailed text, and visual charts',
            'variants': json.dumps(['control', 'detailed', 'visual']),
            'target_segment': json.dumps({
                'churn_risk_level': ['High', 'Medium', 'Low'],
                'avg_rating_7d': {'max': 4.2}
            }),
            'primary_metric': 'engagement_improvement',
            'secondary_metrics': json.dumps({
                'rating_improvement': True,
                'intervention_opened_rate': True,
                'time_to_improvement': True
            }),
            'start_date': exp3_start,
            'end_date': None,
            'status': 'active',
            'sample_size': 62,
            'significance': None,  # Still collecting data
            'winner': None,
            'notes': 'Experiment in progress. Currently collecting data. Target sample size: 90 tutors.',
            'created_at': exp3_start,
            'updated_at': exp3_start
        })
        
        # Experiment 4: "Intervention Frequency" - ACTIVE
        # Started 2 days ago
        exp4_start = now - timedelta(days=2)
        
        experiments.append({
            'experiment_id': 'EXP004',
            'name': 'Intervention Frequency',
            'hypothesis': 'Biweekly interventions are more effective than weekly or monthly interventions',
            'description': 'Testing optimal frequency for sending interventions to at-risk tutors',
            'variants': json.dumps(['weekly', 'biweekly', 'monthly']),
            'target_segment': json.dumps({
                'churn_risk_level': ['High'],
                'avg_engagement_score': {'max': 5.5}
            }),
            'primary_metric': 'churn_reduction',
            'secondary_metrics': json.dumps({
                'engagement_increase': True,
                'intervention_fatigue': True  # Track if too frequent = negative
            }),
            'start_date': exp4_start,
            'end_date': None,
            'status': 'active',
            'sample_size': 28,
            'significance': None,
            'winner': None,
            'notes': 'Experiment just started. Monitoring for intervention fatigue signals.',
            'created_at': exp4_start,
            'updated_at': exp4_start
        })
        
        # Experiment 5: "Coaching Session Effectiveness" - COMPLETED (optional third completed)
        exp5_start = now - timedelta(days=n_days + 10)
        exp5_end = now - timedelta(days=20)
        
        experiments.append({
            'experiment_id': 'EXP005',
            'name': 'Coaching Session Effectiveness',
            'hypothesis': 'Group coaching sessions are as effective as 1-on-1 sessions for quality improvement',
            'description': 'Testing whether group coaching sessions can scale coaching support effectively',
            'variants': json.dumps(['control', '1on1', 'group']),
            'target_segment': json.dumps({
                'churn_risk_level': ['Medium'],
                'months_experience': {'max': 12}
            }),
            'primary_metric': 'quality_score_improvement',
            'secondary_metrics': json.dumps({
                'satisfaction_with_coaching': True,
                'cost_per_tutor': True
            }),
            'start_date': exp5_start,
            'end_date': exp5_end,
            'status': 'completed',
            'sample_size': 51,
            'significance': 0.089,  # Not quite significant (p > 0.05)
            'winner': None,  # No clear winner
            'notes': 'No statistically significant difference found. Group coaching showed similar outcomes to 1-on-1 at lower cost.',
            'created_at': exp5_start,
            'updated_at': exp5_end
        })
        
        df = pd.DataFrame(experiments)
        
        # Format dates properly
        df['start_date'] = pd.to_datetime(df['start_date'])
        df['end_date'] = pd.to_datetime(df['end_date'])
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['updated_at'] = pd.to_datetime(df['updated_at'])
        
        return df


def generate_experiments(n_days: int = 30, seed: int = 42) -> pd.DataFrame:
    """Convenience function to generate experiments"""
    generator = ExperimentsGenerator(seed=seed)
    return generator.generate_experiments(n_days)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate experiments CSV')
    parser.add_argument('--output', type=str, default='data/experiments.csv',
                       help='Output CSV path')
    parser.add_argument('--days', type=int, default=30,
                       help='Number of days in data period')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    
    print(f"Generating experiments...")
    experiments_df = generate_experiments(args.days, args.seed)
    
    experiments_df.to_csv(args.output, index=False)
    print(f"Generated {len(experiments_df)} experiments")
    print(f"Saved to {args.output}")
    
    print("\nExperiment summary:")
    print(f"Completed: {len(experiments_df[experiments_df['status'] == 'completed'])}")
    print(f"Active: {len(experiments_df[experiments_df['status'] == 'active'])}")

