"""
Interventions Generator
Generates historical interventions with before/after metrics and experiment linkages
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from typing import Dict, List, Optional
import os


class InterventionsGenerator:
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
        # Intervention templates
        self.templates = {
            'engagement': {
                'subject': 'Your engagement can improve!',
                'content_template': 'Hi {tutor_name}, we noticed your engagement score has been declining. Here are some tips to improve...'
            },
            'first_session': {
                'subject': 'First Session Coaching Available',
                'content_template': 'Hi {tutor_name}, we see you have first sessions coming up. Would you like coaching support?'
            },
            'quality': {
                'subject': 'Coaching: Improving Your Ratings',
                'content_template': 'Hi {tutor_name}, your recent ratings have declined. Let\'s work together to improve...'
            },
            'technical': {
                'subject': 'Technical Support Available',
                'content_template': 'Hi {tutor_name}, we noticed you\'ve had technical issues. Our support team can help...'
            },
            'churn': {
                'subject': 'We\'d love to keep you!',
                'content_template': 'Hi {tutor_name}, we noticed some concerns. Let\'s talk about how we can support you...'
            }
        }
    
    def determine_intervention_type(self, aggregates: pd.Series) -> str:
        """Determine intervention type based on tutor metrics"""
        # Priority order
        if aggregates.get('poor_first_session_flag', False):
            return 'first_session'
        elif aggregates.get('churn_risk_level') == 'High':
            return 'churn'
        elif aggregates.get('avg_rating_7d', 5.0) < 3.8:
            return 'quality'
        elif aggregates.get('technical_issue_rate', 0) > 0.15:
            return 'technical'
        elif aggregates.get('avg_engagement_score', 6.0) < 5.5:
            return 'engagement'
        else:
            # Default to engagement
            return 'engagement'
    
    def generate_interventions(self, tutors_df: pd.DataFrame, aggregates_df: pd.DataFrame,
                              sessions_df: pd.DataFrame, experiments_df: pd.DataFrame,
                              assignments_df: pd.DataFrame, n_days: int = 30) -> pd.DataFrame:
        """
        Generate interventions with before/after metrics
        
        Args:
            tutors_df: Tutor profiles
            aggregates_df: Tutor aggregates
            sessions_df: Session data
            experiments_df: Experiments
            assignments_df: Experiment assignments
            n_days: Number of days in period
        
        Returns:
            DataFrame with interventions
        """
        interventions = []
        start_date = datetime.now() - timedelta(days=n_days)
        
        # Merge data for easy lookup
        tutor_agg = tutors_df.merge(aggregates_df, on='tutor_id', how='left')
        sessions_df['session_datetime_parsed'] = pd.to_datetime(sessions_df['session_datetime'])
        
        # Filter for high/medium risk tutors
        at_risk_tutors = tutor_agg[
            tutor_agg['churn_risk_level'].isin(['High', 'Medium'])
        ].copy()
        
        # Generate 50-100 interventions spread over the period
        num_interventions = int(np.random.uniform(50, 100))
        
        # Create lookup for experiment assignments
        assignment_lookup = {}
        if len(assignments_df) > 0:
            for _, assignment in assignments_df.iterrows():
                key = (assignment['experiment_id'], assignment['tutor_id'])
                assignment_lookup[key] = assignment
        
        tutor_intervention_count = {}
        
        for i in range(num_interventions):
            # Select random tutor from at-risk pool
            tutor_idx = random.randint(0, len(at_risk_tutors) - 1)
            tutor_row = at_risk_tutors.iloc[tutor_idx]
            tutor_id = tutor_row['tutor_id']
            
            # Limit interventions per tutor (2-4 max)
            if tutor_id not in tutor_intervention_count:
                tutor_intervention_count[tutor_id] = 0
            
            if tutor_intervention_count[tutor_id] >= 4:
                continue
            
            tutor_intervention_count[tutor_id] += 1
            
            # Determine intervention type
            intervention_type = self.determine_intervention_type(tutor_row)
            
            # Random day within period (weighted toward middle/end)
            day_offset = int(np.random.beta(a=2, b=1) * n_days)
            created_at = start_date + timedelta(days=day_offset)
            
            # Look for experiment assignment
            experiment_id = None
            experiment_variant = None
            
            # Check if tutor is in any experiment
            tutor_experiments = assignments_df[
                (assignments_df['tutor_id'] == tutor_id) &
                (pd.to_datetime(experiments_df['start_date']).max() <= created_at)
            ] if len(assignments_df) > 0 else pd.DataFrame()
            
            if len(tutor_experiments) > 0:
                # Pick one experiment (prefer ones that match intervention type)
                matching_experiments = experiments_df[
                    experiments_df['experiment_id'].isin(tutor_experiments['experiment_id'].unique())
                ]
                
                if len(matching_experiments) > 0:
                    exp = matching_experiments.iloc[0]
                    assignment = tutor_experiments[tutor_experiments['experiment_id'] == exp['experiment_id']].iloc[0]
                    experiment_id = exp['experiment_id']
                    experiment_variant = assignment['variant']
            
            # Generate before metrics (at time of intervention)
            tutor_sessions_before = sessions_df[
                (sessions_df['tutor_id'] == tutor_id) &
                (sessions_df['session_datetime_parsed'] <= created_at)
            ]
            
            engagement_before = tutor_sessions_before['engagement_score'].mean() if len(tutor_sessions_before) > 0 else tutor_row.get('avg_engagement_score', 6.0)
            sessions_before_count = len(tutor_sessions_before[
                tutor_sessions_before['session_datetime_parsed'] >= created_at - timedelta(days=7)
            ])
            
            # Determine outcome (60% success, 25% ignored, 15% partial)
            outcome_roll = np.random.random()
            
            if outcome_roll < 0.6:
                # Success case
                status = 'responded'
                opened_at = created_at + timedelta(hours=random.randint(1, 48))
                delivered_at = opened_at - timedelta(minutes=random.randint(1, 60))
                
                # Some also get clicked
                if np.random.random() < 0.7:
                    clicked_at = opened_at + timedelta(minutes=random.randint(1, 30))
                    response_type = 'positive'
                else:
                    clicked_at = None
                    response_type = 'positive'
                
                # Calculate after metrics (improvement)
                improvement_factor = np.random.uniform(0.05, 0.25)  # 5-25% improvement
                engagement_after = engagement_before * (1 + improvement_factor)
                
                # Sessions increased
                sessions_after_count = sessions_before_count + random.randint(1, 4)
                
            elif outcome_roll < 0.85:
                # Ignored case
                status = 'delivered'
                delivered_at = created_at + timedelta(minutes=random.randint(1, 60))
                opened_at = None
                clicked_at = None
                response_type = None
                
                # No improvement
                engagement_after = engagement_before * np.random.uniform(0.98, 1.02)  # Slight variation
                sessions_after_count = sessions_before_count + random.randint(-1, 1)
                
            else:
                # Partial success
                status = 'opened'
                delivered_at = created_at + timedelta(minutes=random.randint(1, 60))
                opened_at = delivered_at + timedelta(hours=random.randint(2, 72))
                clicked_at = None
                response_type = 'neutral'
                
                # Minor improvement
                improvement_factor = np.random.uniform(0.01, 0.08)  # 1-8% improvement
                engagement_after = engagement_before * (1 + improvement_factor)
                sessions_after_count = sessions_before_count + random.randint(0, 2)
            
            # Generate content
            template = self.templates[intervention_type]
            tutor_name = f"Tutor {tutor_id[-3:]}"
            content = template['content_template'].format(tutor_name=tutor_name)
            
            # Calculate after metrics (future sessions)
            tutor_sessions_after = sessions_df[
                (sessions_df['tutor_id'] == tutor_id) &
                (sessions_df['session_datetime_parsed'] > created_at) &
                (sessions_df['session_datetime_parsed'] <= created_at + timedelta(days=14))
            ]
            
            # Override with actual data if available
            if len(tutor_sessions_after) > 0:
                actual_engagement_after = tutor_sessions_after['engagement_score'].mean()
                if pd.notna(actual_engagement_after):
                    engagement_after = actual_engagement_after
                
                sessions_after_count = len(tutor_sessions_after[
                    tutor_sessions_after['session_datetime_parsed'] >= created_at + timedelta(days=7)
                ])
            
            intervention = {
                'intervention_id': f'INT{i+1:04d}',
                'tutor_id': tutor_id,
                'intervention_type': intervention_type,
                'channel': 'email',
                'subject': template['subject'],
                'content': content,
                'template_id': f'template_{intervention_type}_001',
                'experiment_id': experiment_id,
                'experiment_variant': experiment_variant,
                'sent_at': created_at,
                'delivered_at': delivered_at,
                'opened_at': opened_at,
                'clicked_at': clicked_at,
                'responded_at': clicked_at if clicked_at else None,
                'response_type': response_type,
                'response_notes': f'Intervention {intervention_type} - {status}' if response_type else None,
                'engagement_before': round(engagement_before, 2),
                'engagement_after': round(engagement_after, 2),
                'sessions_before_count': sessions_before_count,
                'sessions_after_count': sessions_after_count,
                'status': status,
                'error_message': None,
                'created_at': created_at,
                'updated_at': opened_at if opened_at else created_at
            }
            
            interventions.append(intervention)
        
        df = pd.DataFrame(interventions)
        
        # Sort by created_at
        if len(df) > 0:
            df = df.sort_values('created_at')
        
        return df


def generate_interventions(tutors_df: pd.DataFrame, aggregates_df: pd.DataFrame,
                          sessions_df: pd.DataFrame, experiments_df: pd.DataFrame,
                          assignments_df: pd.DataFrame, n_days: int = 30, seed: int = 42) -> pd.DataFrame:
    """Convenience function to generate interventions"""
    generator = InterventionsGenerator(seed=seed)
    return generator.generate_interventions(tutors_df, aggregates_df, sessions_df, 
                                          experiments_df, assignments_df, n_days)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate interventions CSV')
    parser.add_argument('--tutors-csv', type=str, default='data/tutor_profiles.csv',
                       help='Path to tutor profiles CSV')
    parser.add_argument('--aggregates-csv', type=str, default='data/tutor_aggregates.csv',
                       help='Path to tutor aggregates CSV')
    parser.add_argument('--sessions-csv', type=str, default='data/sessions.csv',
                       help='Path to sessions CSV')
    parser.add_argument('--experiments-csv', type=str, default='data/experiments.csv',
                       help='Path to experiments CSV')
    parser.add_argument('--assignments-csv', type=str, default='data/experiment_assignments.csv',
                       help='Path to experiment assignments CSV')
    parser.add_argument('--output', type=str, default='data/interventions.csv',
                       help='Output CSV path')
    parser.add_argument('--days', type=int, default=30,
                       help='Number of days in data period')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    
    # Load data
    tutors_df = pd.read_csv(args.tutors_csv)
    aggregates_df = pd.read_csv(args.aggregates_csv)
    sessions_df = pd.read_csv(args.sessions_csv)
    experiments_df = pd.read_csv(args.experiments_csv)
    assignments_df = pd.read_csv(args.assignments_csv)
    
    # Generate interventions
    print(f"Generating interventions...")
    interventions_df = generate_interventions(tutors_df, aggregates_df, sessions_df,
                                             experiments_df, assignments_df, args.days, args.seed)
    
    interventions_df.to_csv(args.output, index=False)
    print(f"Generated {len(interventions_df)} interventions")
    print(f"Saved to {args.output}")
    
    # Print summary
    if len(interventions_df) > 0:
        print("\nIntervention summary:")
        print(f"Success: {len(interventions_df[interventions_df['status'] == 'responded'])}")
        print(f"Ignored: {len(interventions_df[interventions_df['status'] == 'delivered'])}")
        print(f"Partial: {len(interventions_df[interventions_df['status'] == 'opened'])}")
        print("\nBy type:")
        print(interventions_df['intervention_type'].value_counts())

