"""
Experiment Assignments Generator
Generates tutor assignments to experiments with exposure and conversion tracking
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
from typing import Dict, List, Set
import os


class ExperimentAssignmentsGenerator:
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
    def matches_target_segment(self, tutor: pd.Series, aggregates: pd.Series, target_segment: Dict) -> bool:
        """Check if tutor matches experiment targeting criteria"""
        if not target_segment:
            return True
        
        # Check churn risk level
        if 'churn_risk_level' in target_segment:
            if 'churn_risk_level' in aggregates.index:
                if aggregates['churn_risk_level'] not in target_segment['churn_risk_level']:
                    return False
        
        # Check poor first session flag
        if 'poor_first_session_flag' in target_segment:
            if 'poor_first_session_flag' in aggregates.index:
                if aggregates['poor_first_session_flag'] != target_segment['poor_first_session_flag']:
                    return False
        
        # Check first session count
        if 'first_session_count' in target_segment:
            if 'first_session_count' in aggregates.index:
                min_count = target_segment['first_session_count'].get('min', 0)
                if aggregates['first_session_count'] < min_count:
                    return False
        
        # Check engagement score
        if 'avg_engagement_score' in target_segment:
            if 'avg_engagement_score' in aggregates.index:
                max_score = target_segment['avg_engagement_score'].get('max', 10.0)
                min_score = target_segment['avg_engagement_score'].get('min', 0.0)
                score = aggregates['avg_engagement_score']
                if score > max_score or score < min_score:
                    return False
        
        # Check sessions count
        if 'total_sessions_7d' in target_segment:
            if 'total_sessions_7d' in aggregates.index:
                max_sessions = target_segment['total_sessions_7d'].get('max', 1000)
                if aggregates['total_sessions_7d'] > max_sessions:
                    return False
        
        # Check months experience
        if 'months_experience' in target_segment:
            max_exp = target_segment['months_experience'].get('max', 120)
            min_exp = target_segment['months_experience'].get('min', 0)
            if tutor['months_experience'] > max_exp or tutor['months_experience'] < min_exp:
                return False
        
        # Check rating
        if 'avg_rating_7d' in target_segment:
            if 'avg_rating_7d' in aggregates.index:
                max_rating = target_segment['avg_rating_7d'].get('max', 5.0)
                min_rating = target_segment['avg_rating_7d'].get('min', 0.0)
                rating = aggregates['avg_rating_7d'] if pd.notna(aggregates['avg_rating_7d']) else 0
                if rating > max_rating or rating < min_rating:
                    return False
        
        return True
    
    def generate_assignments(self, experiments_df: pd.DataFrame, tutors_df: pd.DataFrame,
                            aggregates_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate experiment assignments for tutors
        
        Args:
            experiments_df: DataFrame with experiments
            tutors_df: DataFrame with tutor profiles
            aggregates_df: DataFrame with tutor aggregates
        
        Returns:
            DataFrame with experiment assignments
        """
        assignments = []
        
        # Merge tutors and aggregates for easy lookup
        tutor_agg = tutors_df.merge(aggregates_df, on='tutor_id', how='left')
        
        for _, experiment in experiments_df.iterrows():
            experiment_id = experiment['experiment_id']
            variants = json.loads(experiment['variants'])
            target_segment = json.loads(experiment['target_segment']) if pd.notna(experiment['target_segment']) else {}
            start_date = pd.to_datetime(experiment['start_date'])
            end_date = pd.to_datetime(experiment['end_date']) if pd.notna(experiment['end_date']) else None
            status = experiment['status']
            
            # Filter tutors by target segment
            eligible_tutors = []
            for _, tutor_row in tutor_agg.iterrows():
                if self.matches_target_segment(tutor_row, tutor_row, target_segment):
                    eligible_tutors.append(tutor_row['tutor_id'])
            
            # For completed experiments, assign all eligible tutors
            # For active experiments, assign subset (typically 60-80% of eligible)
            if status == 'completed':
                assigned_tutors = eligible_tutors
            else:
                assigned_count = int(len(eligible_tutors) * np.random.uniform(0.6, 0.8))
                assigned_tutors = random.sample(eligible_tutors, min(assigned_count, len(eligible_tutors)))
            
            # Randomly assign variants (equal distribution)
            variant_probs = [1.0 / len(variants)] * len(variants)
            
            for tutor_id in assigned_tutors:
                variant = np.random.choice(variants, p=variant_probs)
                assigned_at = start_date + timedelta(hours=random.randint(0, 24))
                
                # Exposure tracking (when variant was actually shown)
                # For completed experiments, most were exposed
                # For active experiments, fewer exposed yet
                if status == 'completed':
                    exposed_prob = np.random.uniform(0.85, 0.98)
                else:
                    exposed_prob = np.random.uniform(0.3, 0.7)  # Only some exposed so far
                
                exposed_at = None
                converted_at = None
                conversion_value = None
                
                if np.random.random() < exposed_prob:
                    exposed_at = assigned_at + timedelta(hours=random.randint(1, 48))
                    
                    # Conversion tracking (if desired action occurred)
                    # Control: 5-15% conversion
                    # Treatment variants: 8-20% conversion
                    if variant == 'control':
                        conversion_rate = np.random.uniform(0.05, 0.15)
                    else:
                        conversion_rate = np.random.uniform(0.08, 0.20)
                    
                    if np.random.random() < conversion_rate:
                        converted_at = exposed_at + timedelta(hours=random.randint(1, 168))  # Within 1 week
                        
                        # Conversion value depends on experiment type
                        if 'engagement' in experiment['primary_metric'].lower():
                            conversion_value = np.random.uniform(0.5, 2.0)  # Engagement lift
                        elif 'churn' in experiment['primary_metric'].lower():
                            conversion_value = np.random.uniform(0.1, 0.5)  # Churn reduction
                        else:
                            conversion_value = np.random.uniform(0.05, 0.3)  # Generic improvement
                
                assignments.append({
                    'experiment_id': experiment_id,
                    'tutor_id': tutor_id,
                    'variant': variant,
                    'assigned_at': assigned_at,
                    'exposed_at': exposed_at,
                    'converted_at': converted_at,
                    'conversion_value': conversion_value
                })
        
        df = pd.DataFrame(assignments)
        
        # Sort by assigned_at
        if len(df) > 0:
            df = df.sort_values('assigned_at')
        
        return df


def generate_experiment_assignments(experiments_df: pd.DataFrame, tutors_df: pd.DataFrame,
                                    aggregates_df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    """Convenience function to generate experiment assignments"""
    generator = ExperimentAssignmentsGenerator(seed=seed)
    return generator.generate_assignments(experiments_df, tutors_df, aggregates_df)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate experiment assignments CSV')
    parser.add_argument('--experiments-csv', type=str, default='data/experiments.csv',
                       help='Path to experiments CSV')
    parser.add_argument('--tutors-csv', type=str, default='data/tutor_profiles.csv',
                       help='Path to tutor profiles CSV')
    parser.add_argument('--aggregates-csv', type=str, default='data/tutor_aggregates.csv',
                       help='Path to tutor aggregates CSV')
    parser.add_argument('--output', type=str, default='data/experiment_assignments.csv',
                       help='Output CSV path')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    
    # Load data
    experiments_df = pd.read_csv(args.experiments_csv)
    tutors_df = pd.read_csv(args.tutors_csv)
    aggregates_df = pd.read_csv(args.aggregates_csv)
    
    # Generate assignments
    print(f"Generating experiment assignments...")
    assignments_df = generate_experiment_assignments(experiments_df, tutors_df, aggregates_df, args.seed)
    
    assignments_df.to_csv(args.output, index=False)
    print(f"Generated {len(assignments_df)} experiment assignments")
    print(f"Saved to {args.output}")
    
    # Print summary
    if len(assignments_df) > 0:
        print("\nAssignment summary:")
        print(assignments_df.groupby(['experiment_id', 'variant']).size())

