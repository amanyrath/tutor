"""
Synthetic Tutor Quality Data Generator
Generates realistic tutoring session data with proper correlations and distributions
"""
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from typing import Dict, List
import argparse
import os
import time
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt

class TutorDataGenerator:
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
        # Realistic constraints from PRD
        self.subjects = ['Math', 'Science', 'English', 'History', 'Test Prep', 'Programming']
        self.grade_levels = ['Elementary', 'Middle School', 'High School', 'College', 'Adult']
        
    def generate_tutor_profiles(self, n_tutors: int = 150) -> pd.DataFrame:
        """Generate tutor profile data with realistic distributions"""
        
        tutors = []
        for tutor_id in range(1, n_tutors + 1):
            # Experience follows power law (many new, few veterans)
            months_experience = int(np.random.gamma(shape=2, scale=12))
            months_experience = max(1, min(months_experience, 120))  # Cap at 10 years
            
            # Total sessions correlates with experience
            base_sessions = months_experience * np.random.uniform(8, 25)
            total_sessions = int(base_sessions * np.random.uniform(0.7, 1.3))
            
            # Base reliability (most tutors are reliable)
            base_reliability = np.random.beta(a=8, b=2)  # Skewed toward high reliability
            
            # Historical rating (correlates with experience and reliability)
            experience_bonus = min(months_experience / 60, 0.15)  # Up to +0.15 for experience
            avg_historical_rating = np.clip(
                3.5 + base_reliability * 1.2 + experience_bonus + np.random.normal(0, 0.15),
                2.0, 5.0
            )
            
            # Reschedule rate (inverse correlation with reliability)
            reschedule_rate = np.clip(
                (1 - base_reliability) * 0.25 + np.random.uniform(0, 0.05),
                0.0, 0.35
            )
            
            # No-show count (rare but impactful - 16% have issues per PRD)
            has_no_show_issue = np.random.random() < 0.16
            no_show_count = int(np.random.poisson(3)) if has_no_show_issue else 0
            
            # Subject specialization
            primary_subject = random.choice(self.subjects)
            num_subjects = np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2])
            subjects_taught = random.sample(self.subjects, num_subjects)
            if primary_subject not in subjects_taught:
                subjects_taught[0] = primary_subject
            
            tutors.append({
                'tutor_id': f'T{tutor_id:04d}',
                'months_experience': months_experience,
                'total_sessions_completed': total_sessions,
                'avg_historical_rating': round(avg_historical_rating, 2),
                'subjects_taught': ','.join(subjects_taught),
                'primary_subject': primary_subject,
                'reschedule_rate': round(reschedule_rate, 3),
                'no_show_count': no_show_count,
                'reliability_score': round(base_reliability, 3),
                'certification_level': np.random.choice(['Basic', 'Advanced', 'Expert'], 
                                                       p=[0.5, 0.35, 0.15]),
                'active_status': np.random.choice([True, False], p=[0.92, 0.08]),
                'last_login': None  # Will be updated later from engagement events
            })
        
        return pd.DataFrame(tutors)
    
    def generate_sessions(self, tutors_df: pd.DataFrame, 
                         n_days: int = 30, 
                         sessions_per_day: int = 750) -> pd.DataFrame:
        """Generate session data with realistic patterns and correlations (vectorized)"""
        
        start_date = datetime.now() - timedelta(days=n_days)
        
        # Calculate total sessions accounting for weekends
        total_sessions = 0
        session_days = []
        for day in range(n_days):
            current_date = start_date + timedelta(days=day)
            day_of_week = current_date.weekday()
            daily_sessions = int(sessions_per_day * 0.7) if day_of_week >= 5 else sessions_per_day
            total_sessions += daily_sessions
            session_days.extend([day] * daily_sessions)
        
        session_days = np.array(session_days)
        
        # Prepare tutor data for vectorized selection
        active_tutors = tutors_df[tutors_df['active_status'] == True].copy()
        tutor_weights = active_tutors['total_sessions_completed'].values
        tutor_weights = tutor_weights / tutor_weights.sum()  # Normalize
        
        # Create tutor lookup arrays
        tutor_ids_array = active_tutors['tutor_id'].values
        tutor_idx_to_id = {i: tid for i, tid in enumerate(tutor_ids_array)}
        
        # Pre-build tutor attribute arrays for fast lookup
        tutor_reliability = active_tutors['reliability_score'].values
        tutor_no_show_count = active_tutors['no_show_count'].values
        tutor_months_exp = active_tutors['months_experience'].values
        tutor_subjects_dict = {row['tutor_id']: row['subjects_taught'].split(',') 
                              for _, row in active_tutors.iterrows()}
        
        # Create tutor-specific peak hours (some morning, some evening)
        tutor_peak_hours = {}
        for idx, tutor_id in enumerate(tutor_ids_array):
            reliability = tutor_reliability[idx]
            # Morning people: 35% of tutors prefer 8-12am
            # Evening people: 65% prefer 3-9pm
            is_morning_person = np.random.random() < 0.35
            if is_morning_person:
                preferred_start = random.choice([8, 9, 10])
                preferred_end = preferred_start + 4
            else:
                preferred_start = random.choice([15, 16, 17, 18])
                preferred_end = min(preferred_start + 4, 21)
            
            tutor_peak_hours[tutor_id] = {
                'preferred_start': preferred_start,
                'preferred_end': preferred_end,
                'is_morning': is_morning_person
            }
        
        # Generate tutor-specific trends based on reliability
        tutor_trends = {}
        for idx, tutor_id in enumerate(tutor_ids_array):
            reliability = tutor_reliability[idx]
            
            # Lower reliability tutors have declining trends
            if reliability < 0.6:
                engagement_trend = np.random.uniform(-0.15, -0.05)
                empathy_trend = np.random.uniform(-0.12, -0.03)
                clarity_trend = np.random.uniform(-0.13, -0.04)
                satisfaction_trend = np.random.uniform(-0.14, -0.05)
            # Higher reliability tutors improve or stay stable
            elif reliability > 0.8:
                engagement_trend = np.random.uniform(-0.02, 0.10)
                empathy_trend = np.random.uniform(-0.02, 0.08)
                clarity_trend = np.random.uniform(-0.01, 0.09)
                satisfaction_trend = np.random.uniform(-0.02, 0.10)
            # Mid-range tutors have mixed trends
            else:
                engagement_trend = np.random.uniform(-0.08, 0.05)
                empathy_trend = np.random.uniform(-0.06, 0.04)
                clarity_trend = np.random.uniform(-0.07, 0.05)
                satisfaction_trend = np.random.uniform(-0.08, 0.06)
            
            tutor_trends[tutor_id] = {
                'engagement': engagement_trend,
                'empathy': empathy_trend,
                'clarity': clarity_trend,
                'satisfaction': satisfaction_trend
            }
        
        # Generate daily variance factors for each metric
        daily_variance = {
            'engagement': np.random.uniform(0.85, 1.15, n_days),
            'empathy': np.random.uniform(0.92, 1.08, n_days),
            'clarity': np.random.uniform(0.90, 1.10, n_days),
            'satisfaction': np.random.uniform(0.88, 1.12, n_days)
        }
        
        # Vectorized tutor selection (weighted by total_sessions_completed)
        tutor_indices = np.random.choice(len(active_tutors), size=total_sessions, p=tutor_weights)
        tutor_ids = tutor_ids_array[tutor_indices]
        
        # Get tutor attributes for each session
        tutor_reliability_arr = tutor_reliability[tutor_indices]
        tutor_no_show_count_arr = tutor_no_show_count[tutor_indices]
        tutor_months_exp_arr = tutor_months_exp[tutor_indices]
        
        # Pre-generate all random values with tutor-specific peak hours
        hours = []
        for tutor_id in tutor_ids:
            pattern = tutor_peak_hours[tutor_id]
            preferred_start = pattern['preferred_start']
            preferred_end = pattern['preferred_end']
            
            # 70% of sessions in preferred hours, 30% outside
            if np.random.random() < 0.7:
                # Within preferred hours
                hour = random.randint(preferred_start, preferred_end)
            else:
                # Outside preferred hours (struggling tutors more likely to take odd hours)
                tutor_idx = tutor_ids_array.tolist().index(tutor_id)
                reliability = tutor_reliability[tutor_idx]
                if reliability < 0.6:
                    # Struggling tutors take odd hours more often
                    hour = random.choice([6, 7, 22, 23] + list(range(9, 22)))
                else:
                    # Regular tutors take standard hours
                    hour = random.choice(range(9, 22))
            
            hours.append(hour)
        
        hours = np.array(hours)
        minutes = np.random.randint(0, 60, size=total_sessions)
        
        # Session duration
        scheduled_durations = np.random.choice([30, 60, 90], size=total_sessions, p=[0.15, 0.75, 0.10])
        actual_durations = (scheduled_durations * np.random.uniform(0.85, 1.15, size=total_sessions)).astype(int)
        
        # Subject and grade level (need to handle subject selection from tutor's subjects)
        subjects_list = []
        for tutor_id in tutor_ids:
            subjects = tutor_subjects_dict[tutor_id]
            subjects_list.append(np.random.choice(subjects))
        subjects_arr = np.array(subjects_list)
        
        grade_levels_arr = np.random.choice(self.grade_levels, size=total_sessions)
        
        # Connection quality - correlate with peak usage hours (6-9pm has more issues)
        connection_qualities = []
        for i, hour in enumerate(hours):
            day_idx = session_days[i]
            day_of_week = (start_date + timedelta(days=int(day_idx))).weekday()
            
            # Peak hours (6-9pm) have more connection issues
            if 18 <= hour <= 21:
                # Peak hours: more "Fair" and "Poor" connections
                quality = np.random.choice(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    p=[0.50, 0.30, 0.15, 0.05]
                )
            elif day_of_week >= 5:  # Weekend
                # Weekends slightly better connection
                quality = np.random.choice(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    p=[0.65, 0.28, 0.06, 0.01]
                )
            else:
                # Normal hours
                quality = np.random.choice(
                    ['Excellent', 'Good', 'Fair', 'Poor'],
                    p=[0.60, 0.30, 0.08, 0.02]
                )
            connection_qualities.append(quality)
        
        connection_qualities = np.array(connection_qualities)
        connection_penalty_map = {'Excellent': 0, 'Good': -0.1, 'Fair': -0.3, 'Poor': -0.6}
        connection_penalties = np.array([connection_penalty_map[cq] for cq in connection_qualities])
        
        # Student and tutor show-up
        student_showed = np.random.random(size=total_sessions) > 0.03
        tutor_no_show_probs = np.clip(tutor_no_show_count_arr * 0.01, 0, 0.15)
        tutor_showed = np.random.random(size=total_sessions) > tutor_no_show_probs
        session_completed = student_showed & tutor_showed
        
        # First session indicator (only for completed sessions)
        is_first_session = np.zeros(total_sessions, dtype=bool)
        is_first_session[session_completed] = np.random.random(size=session_completed.sum()) < 0.15
        
        # Generate datetime array with weekend patterns
        session_datetimes = []
        for i, day in enumerate(session_days):
            current_date = start_date + timedelta(days=int(day))
            day_of_week = current_date.weekday()
            
            # Adjust hours for weekends (more flexible hours)
            hour = int(hours[i])
            if day_of_week >= 5:  # Weekend
                # Weekends have more spread out hours
                hour = max(8, min(hour + random.randint(-1, 1), 21))
            
            dt = current_date.replace(hour=hour, minute=int(minutes[i]))
            session_datetimes.append(dt)
        
        # Pre-allocate arrays for completed session metrics
        completed_mask = session_completed
        n_completed = completed_mask.sum()
        
        # Initialize all arrays with NaN/None
        student_attention_pct = np.full(total_sessions, np.nan, dtype=float)
        tutor_camera_on_pct = np.full(total_sessions, np.nan, dtype=float)
        tutor_speak_ratio = np.full(total_sessions, np.nan, dtype=float)
        screen_share_pct = np.full(total_sessions, np.nan, dtype=float)
        overall_sentiment = np.full(total_sessions, np.nan, dtype=float)
        student_sentiment = np.full(total_sessions, np.nan, dtype=float)
        tutor_sentiment = np.full(total_sessions, np.nan, dtype=float)
        empathy_score = np.full(total_sessions, np.nan, dtype=float)
        clarity_score = np.full(total_sessions, np.nan, dtype=float)
        engagement_score = np.full(total_sessions, np.nan, dtype=float)
        student_rating = np.full(total_sessions, np.nan, dtype=float)
        student_satisfaction = np.full(total_sessions, np.nan, dtype=float)
        would_recommend = np.full(total_sessions, np.nan, dtype=float)
        had_technical_issues = np.full(total_sessions, np.nan, dtype=float)
        
        # Generate metrics only for completed sessions
        if n_completed > 0:
            # Get tutor attributes for completed sessions only
            completed_tutor_reliability = tutor_reliability_arr[completed_mask]
            completed_tutor_months_exp = tutor_months_exp_arr[completed_mask]
            completed_is_first = is_first_session[completed_mask]
            completed_connection_penalties = connection_penalties[completed_mask]
            
            # Video engagement metrics
            student_attention_pct[completed_mask] = np.clip(
                np.random.beta(5, 2, size=n_completed) * 100 * 
                (0.8 + completed_tutor_reliability * 0.2),
                        10, 100
                    )
                    
            tutor_camera_on_pct[completed_mask] = np.clip(
                np.random.beta(9, 1, size=n_completed) * 100,
                        70, 100
                    )
                    
            tutor_speak_ratio[completed_mask] = np.clip(
                np.random.normal(0.50, 0.12, size=n_completed),
                        0.20, 0.80
                    )
                    
            screen_share_pct[completed_mask] = np.clip(
                np.random.beta(3, 2, size=n_completed) * 100,
                        10, 95
                    )
                    
            # Sentiment scores
            overall_sentiment[completed_mask] = np.clip(
                np.random.normal(0.3 + completed_tutor_reliability * 0.4, 0.15, size=n_completed),
                        -0.5, 0.95
                    )
                    
            student_sentiment[completed_mask] = np.clip(
                overall_sentiment[completed_mask] + np.random.normal(0.05, 0.1, size=n_completed),
                        -0.5, 0.95
                    )
                    
            tutor_sentiment[completed_mask] = np.clip(
                np.random.normal(0.5, 0.15, size=n_completed),
                        -0.2, 0.95
                    )
                    
            # Quality scores with time-based trends and daily variance
            # Get tutor IDs for completed sessions
            completed_tutor_ids = tutor_ids[completed_mask]
            completed_session_days = session_days[completed_mask]
            
            # Empathy score with trends
            base_empathy = (5 + completed_tutor_reliability * 3 + 
                           (completed_tutor_months_exp / 60) * 1.5 +
                           np.random.normal(0, 0.8, size=n_completed))
            
            # Apply tutor-specific trends and daily variance
            empathy_with_variance = np.zeros(n_completed)
            for i, (tutor_id, day) in enumerate(zip(completed_tutor_ids, completed_session_days)):
                trend = tutor_trends[tutor_id]['empathy']
                daily_var = daily_variance['empathy'][day]
                time_factor = 1 + (trend * (day / n_days))
                empathy_with_variance[i] = base_empathy[i] * time_factor * daily_var
            
            empathy_score[completed_mask] = np.clip(empathy_with_variance, 1, 10)
                    
            # Clarity score with trends
            base_clarity = (5 + completed_tutor_reliability * 3 +
                           np.random.normal(0, 1, size=n_completed))
            
            clarity_with_variance = np.zeros(n_completed)
            for i, (tutor_id, day) in enumerate(zip(completed_tutor_ids, completed_session_days)):
                trend = tutor_trends[tutor_id]['clarity']
                daily_var = daily_variance['clarity'][day]
                time_factor = 1 + (trend * (day / n_days))
                clarity_with_variance[i] = base_clarity[i] * time_factor * daily_var
            
            clarity_score[completed_mask] = np.clip(clarity_with_variance, 1, 10)
                    
            # Engagement score with trends
            base_engagement = ((student_attention_pct[completed_mask] * 0.4 +
                               (1 - np.abs(tutor_speak_ratio[completed_mask] - 0.5) * 2) * 30 +
                               (overall_sentiment[completed_mask] + 1) * 15) / 10)
            
            engagement_with_variance = np.zeros(n_completed)
            for i, (tutor_id, day) in enumerate(zip(completed_tutor_ids, completed_session_days)):
                trend = tutor_trends[tutor_id]['engagement']
                daily_var = daily_variance['engagement'][day]
                time_factor = 1 + (trend * (day / n_days))
                engagement_with_variance[i] = base_engagement[i] * time_factor * daily_var
            
            engagement_score[completed_mask] = np.clip(engagement_with_variance, 1, 10)
            
            # Student rating
            quality_factor = (empathy_score[completed_mask] + 
                            clarity_score[completed_mask] + 
                            engagement_score[completed_mask]) / 30
            
            first_session_penalties = np.where(completed_is_first, -0.3, 0)
            
            student_rating[completed_mask] = np.clip(
                2.0 + quality_factor * 2.8 + first_session_penalties + 
                completed_connection_penalties + 
                np.random.normal(0, 0.4, size=n_completed),
                1, 5
            )
            
            # Student satisfaction with trends
            base_satisfaction = (student_rating[completed_mask] * 2 + 
                                np.random.normal(0, 0.5, size=n_completed))
            
            satisfaction_with_variance = np.zeros(n_completed)
            for i, (tutor_id, day) in enumerate(zip(completed_tutor_ids, completed_session_days)):
                trend = tutor_trends[tutor_id]['satisfaction']
                daily_var = daily_variance['satisfaction'][day]
                time_factor = 1 + (trend * (day / n_days))
                satisfaction_with_variance[i] = base_satisfaction[i] * time_factor * daily_var
            
            student_satisfaction[completed_mask] = np.clip(satisfaction_with_variance, 1, 10)
                    
            # Would recommend
            would_recommend[completed_mask] = student_satisfaction[completed_mask] >= 7.0
            
            # Technical issues
            had_technical_issues[completed_mask] = np.random.random(size=n_completed) < 0.08
        
        # Set is_first_session to None for incomplete sessions (handle as object array)
        is_first_session_series = np.where(session_completed, is_first_session.astype(object), None)
        
        # Create session IDs
        session_ids = [f'S{i+1:06d}' for i in range(total_sessions)]
        
        # Build DataFrame from arrays
        df = pd.DataFrame({
            'session_id': session_ids,
            'tutor_id': tutor_ids,
            'session_datetime': session_datetimes,
            'scheduled_duration_min': scheduled_durations,
            'actual_duration_min': actual_durations,
            'subject': subjects_arr,
            'grade_level': grade_levels_arr,
            'is_first_session': is_first_session_series,
                    'session_completed': session_completed,
                    'student_showed': student_showed,
                    'tutor_showed': tutor_showed,
            'connection_quality': connection_qualities,
            'had_technical_issues': np.where(~np.isnan(had_technical_issues), 
                                            had_technical_issues.astype(bool), None),
            'student_attention_pct': np.where(~np.isnan(student_attention_pct), 
                                            np.round(student_attention_pct, 1), None),
            'tutor_camera_on_pct': np.where(~np.isnan(tutor_camera_on_pct), 
                                          np.round(tutor_camera_on_pct, 1), None),
            'tutor_speak_ratio': np.where(~np.isnan(tutor_speak_ratio), 
                                        np.round(tutor_speak_ratio, 3), None),
            'screen_share_pct': np.where(~np.isnan(screen_share_pct), 
                                       np.round(screen_share_pct, 1), None),
            'overall_sentiment': np.where(~np.isnan(overall_sentiment), 
                                        np.round(overall_sentiment, 3), None),
            'student_sentiment': np.where(~np.isnan(student_sentiment), 
                                        np.round(student_sentiment, 3), None),
            'tutor_sentiment': np.where(~np.isnan(tutor_sentiment), 
                                      np.round(tutor_sentiment, 3), None),
            'empathy_score': np.where(~np.isnan(empathy_score), 
                                    np.round(empathy_score, 2), None),
            'clarity_score': np.where(~np.isnan(clarity_score), 
                                    np.round(clarity_score, 2), None),
            'engagement_score': np.where(~np.isnan(engagement_score), 
                                       np.round(engagement_score, 2), None),
            'student_rating': np.where(~np.isnan(student_rating), 
                                     np.round(student_rating, 1), None),
            'student_satisfaction': np.where(~np.isnan(student_satisfaction), 
                                           np.round(student_satisfaction, 1), None),
            'would_recommend': np.where(~np.isnan(would_recommend), 
                                      would_recommend.astype(bool), None)
        })
        
        return df
    
    def calculate_tutor_aggregates(self, sessions_df: pd.DataFrame, 
                                   tutors_df: pd.DataFrame) -> pd.DataFrame:
        """Calculate rolling tutor metrics for churn prediction"""
        
        # Merge to get tutor info
        df = sessions_df.merge(tutors_df[['tutor_id', 'months_experience']], on='tutor_id')
        
        # Only completed sessions
        completed = df[df['session_completed'] == True].copy()
        
        # Calculate per-tutor aggregates
        tutor_metrics = []
        
        for tutor_id in df['tutor_id'].unique():
            tutor_sessions = completed[completed['tutor_id'] == tutor_id]
            
            if len(tutor_sessions) == 0:
                continue
            
            # Time-based metrics (last 7, 30 days)
            now = df['session_datetime'].max()
            last_7d = tutor_sessions[tutor_sessions['session_datetime'] >= now - timedelta(days=7)]
            last_30d = tutor_sessions[tutor_sessions['session_datetime'] >= now - timedelta(days=30)]
            
            # Calculate churn indicators
            tutor_info = tutors_df[tutors_df['tutor_id'] == tutor_id].iloc[0]
            
            # Churn probability based on multiple factors
            churn_signals = 0
            
            # Signal 1: Declining ratings
            if len(last_7d) >= 3:
                recent_rating = last_7d['student_rating'].mean()
                overall_rating = tutor_sessions['student_rating'].mean()
                if recent_rating < overall_rating - 0.3:
                    churn_signals += 1
            
            # Signal 2: Low engagement
            if tutor_sessions['engagement_score'].mean() < 5.5:
                churn_signals += 1
            
            # Signal 3: High reschedule rate
            if tutor_info['reschedule_rate'] > 0.15:
                churn_signals += 1
            
            # Signal 4: Poor first sessions (24% churn indicator)
            first_sessions = tutor_sessions[tutor_sessions['is_first_session'] == True]
            if len(first_sessions) > 0 and first_sessions['student_rating'].mean() < 3.5:
                churn_signals += 2  # Weighted higher per PRD
            
            # Signal 5: No-shows
            if tutor_info['no_show_count'] > 2:
                churn_signals += 1
            
            # Signal 6: Declining activity
            if len(last_7d) < len(last_30d) / 4:  # Less than expected
                churn_signals += 1
            
            # Convert signals to probability
            churn_probability = min(churn_signals * 0.12, 0.85)
            churn_probability += np.random.uniform(0, 0.1)  # Add noise
            
            # Risk category
            if churn_probability >= 0.5:
                risk_level = 'High'
            elif churn_probability >= 0.3:
                risk_level = 'Medium'
            else:
                risk_level = 'Low'
            
            tutor_metrics.append({
                'tutor_id': tutor_id,
                'total_sessions_30d': len(last_30d),
                'total_sessions_7d': len(last_7d),
                'avg_rating_30d': round(last_30d['student_rating'].mean(), 2) if len(last_30d) > 0 else None,
                'avg_rating_7d': round(last_7d['student_rating'].mean(), 2) if len(last_7d) > 0 else None,
                'avg_engagement_score': round(tutor_sessions['engagement_score'].mean(), 2),
                'avg_empathy_score': round(tutor_sessions['empathy_score'].mean(), 2),
                'avg_clarity_score': round(tutor_sessions['clarity_score'].mean(), 2),
                'avg_student_satisfaction': round(tutor_sessions['student_satisfaction'].mean(), 2),
                'first_session_avg_rating': round(first_sessions['student_rating'].mean(), 2) if len(first_sessions) > 0 else None,
                'first_session_count': len(first_sessions),
                'poor_first_session_flag': len(first_sessions) > 0 and first_sessions['student_rating'].mean() < 3.5,
                'recommendation_rate': round(tutor_sessions['would_recommend'].mean(), 3),
                'technical_issue_rate': round(tutor_sessions['had_technical_issues'].mean(), 3),
                'sentiment_trend_7d': round(last_7d['overall_sentiment'].mean(), 3) if len(last_7d) > 0 else None,
                'churn_probability': round(churn_probability, 3),
                'churn_risk_level': risk_level,
                'churn_signals_detected': churn_signals
            })
        
        return pd.DataFrame(tutor_metrics)
    
    def train_churn_model(self, tutors_df: pd.DataFrame, 
                         tutor_aggregates_df: pd.DataFrame,
                         output_dir: str = "data") -> None:
        """Train logistic regression model on churn data and generate feature importance"""
        
        # Merge tutor and aggregate data
        tutor_agg = tutor_aggregates_df.merge(
            tutors_df[['tutor_id', 'certification_level', 'months_experience']], 
            on='tutor_id', 
            how='left'
        )
        
        # Create experience_level from months_experience
        tutor_agg['experience_level'] = pd.cut(
            tutor_agg['months_experience'],
            bins=[0, 12, 36, 120],
            labels=['Junior', 'Mid', 'Senior']
        )
        
        # Add region (default to US-East for now, can be enhanced later)
        tutor_agg['region'] = 'US-East'
        
        # Encode categorical variables
        tutor_agg_encoded = pd.get_dummies(
            tutor_agg, 
            columns=['experience_level', 'region', 'certification_level'], 
            drop_first=True,
            dummy_na=True
        )
        
        # Create churned target variable from churn_probability
        # Use a threshold to create binary target
        tutor_agg_encoded['churned'] = (tutor_agg_encoded['churn_probability'] > 0.5).astype(int)
        
        # Select features for model
        feature_cols = [col for col in tutor_agg_encoded.columns 
                       if col not in ['tutor_id', 'churned', 'churn_probability', 'churn_risk_level', 'churn_signals_detected']]
        
        X = tutor_agg_encoded[feature_cols].fillna(0)
        y = tutor_agg_encoded['churned']
        
        # Skip if no churned tutors or all churned
        if y.sum() == 0 or y.sum() == len(y):
            print("⚠️  All tutors have same churn status. Skipping model training.")
            return
        
        # Split data (use stratify if both classes present)
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.25, random_state=42, stratify=y
            )
        except ValueError:
            # Fallback if stratify fails
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.25, random_state=42
            )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = LogisticRegression(max_iter=500, random_state=42)
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        # Print report
        print("\n📊 Logistic Regression Churn Model Report:")
        print(classification_report(y_test, y_pred))
        
        # Feature importance
        importance = pd.DataFrame({
            "feature": feature_cols,
            "importance": model.coef_[0]
        }).sort_values(by="importance", ascending=False)
        
        importance_path = os.path.join(output_dir, "churn_feature_importance.csv")
        importance.to_csv(importance_path, index=False)
        print(f"\n💡 Top Predictive Features Saved: {importance_path}")
        
        # Visualization
        plt.figure(figsize=(10, 6))
        top_features = importance.head(15)
        colors = ['red' if x < 0 else 'green' for x in top_features['importance']]
        top_features.plot.barh(x="feature", y="importance", legend=False, color=colors)
        plt.title("Top Predictors of Tutor Churn (Synthetic Data)")
        plt.xlabel("Coefficient (Importance)")
        plt.tight_layout()
        
        viz_path = os.path.join(output_dir, "churn_feature_importance.png")
        plt.savefig(viz_path, dpi=150, bbox_inches='tight')
        print(f"📈 Feature importance visualization saved: {viz_path}")
        plt.close()

# Usage Example
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate synthetic tutor quality data')
    parser.add_argument('--mode', type=str, choices=['production', 'dev'], default='production',
                       help='Dataset mode: production (default) or dev')
    parser.add_argument('--tutors', type=int, default=None,
                       help='Number of tutors to generate (overrides mode default)')
    parser.add_argument('--days', type=int, default=None,
                       help='Number of days to generate sessions for (overrides mode default)')
    parser.add_argument('--sessions-per-day', type=int, default=None,
                       help='Sessions per day (overrides mode default)')
    parser.add_argument('--output-dir', type=str, default='data',
                       help='Output directory for CSV files (default: data)')
    parser.add_argument('--no-model', action='store_true',
                       help='Skip ML model training')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed (default: 42)')
    parser.add_argument('--include-engagement-events', action='store_true', default=True,
                       help='Include engagement events generation (default: True)')
    parser.add_argument('--no-engagement-events', dest='include_engagement_events', action='store_false',
                       help='Skip engagement events generation')
    parser.add_argument('--include-interventions', action='store_true', default=True,
                       help='Include interventions generation (default: True)')
    parser.add_argument('--no-interventions', dest='include_interventions', action='store_false',
                       help='Skip interventions generation')
    parser.add_argument('--include-experiments', action='store_true', default=True,
                       help='Include experiments generation (default: True)')
    parser.add_argument('--no-experiments', dest='include_experiments', action='store_false',
                       help='Skip experiments generation')
    
    args = parser.parse_args()
    
    # Set defaults based on mode
    if args.mode == 'dev':
        default_tutors = 25
        default_days = 14
        default_sessions_per_day = 100
    else:  # production
        default_tutors = 150
        default_days = 30
        default_sessions_per_day = 750  # 150 tutors × 5 sessions/day avg (minimum viable for patterns)
    
    n_tutors = args.tutors if args.tutors is not None else default_tutors
    n_days = args.days if args.days is not None else default_days
    sessions_per_day = args.sessions_per_day if args.sessions_per_day is not None else default_sessions_per_day
    
    # Import new generators
    scripts_dir = os.path.join(os.path.dirname(__file__), 'scripts')
    if os.path.exists(scripts_dir):
        sys.path.insert(0, scripts_dir)
    else:
        # Fallback: try current directory
        sys.path.insert(0, os.path.dirname(__file__))
    
    try:
        from generate_engagement_events import generate_engagement_events
        from generate_experiments import generate_experiments
        from generate_experiment_assignments import generate_experiment_assignments
        from generate_interventions import generate_interventions
    except ImportError as e:
        print(f"⚠️  Warning: Could not import new generators: {e}")
        print("   Make sure scripts are in the scripts/ directory")
        generate_engagement_events = None
        generate_experiments = None
        generate_experiment_assignments = None
        generate_interventions = None
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize generator
    generator = TutorDataGenerator(seed=args.seed)
    
    # Timing
    start_time = time.time()
    
    # Generate data
    print(f"🚀 Generating {args.mode} dataset...")
    print(f"   Tutors: {n_tutors}, Days: {n_days}, Sessions/day: {sessions_per_day}")
    print()
    
    print("📝 Generating tutor profiles...")
    tutor_start = time.time()
    tutors = generator.generate_tutor_profiles(n_tutors=n_tutors)
    print(f"   ✓ Generated {len(tutors)} tutors in {time.time() - tutor_start:.2f}s")
    
    print("\n📚 Generating session data...")
    session_start = time.time()
    sessions = generator.generate_sessions(tutors, n_days=n_days, sessions_per_day=sessions_per_day)
    print(f"   ✓ Generated {len(sessions)} sessions in {time.time() - session_start:.2f}s")
    
    print("\n📊 Calculating tutor aggregates...")
    agg_start = time.time()
    tutor_aggregates = generator.calculate_tutor_aggregates(sessions, tutors)
    print(f"   ✓ Calculated aggregates for {len(tutor_aggregates)} tutors in {time.time() - agg_start:.2f}s")
    
    # Save to CSV
    print("\n💾 Saving CSV files...")
    tutors_path = os.path.join(args.output_dir, 'tutor_profiles.csv')
    sessions_path = os.path.join(args.output_dir, 'sessions.csv')
    aggregates_path = os.path.join(args.output_dir, 'tutor_aggregates.csv')
    
    tutors.to_csv(tutors_path, index=False)
    sessions.to_csv(sessions_path, index=False)
    tutor_aggregates.to_csv(aggregates_path, index=False)
    
    print(f"   ✓ Saved files to {args.output_dir}/")
    
    # Generate new data types
    engagement_events = None
    experiments = None
    experiment_assignments = None
    interventions = None
    
    # Generate engagement events
    if args.include_engagement_events and generate_engagement_events:
        print("\n📱 Generating engagement events...")
        events_start = time.time()
        try:
            engagement_events = generate_engagement_events(tutors, sessions, None, n_days, args.seed)
            events_path = os.path.join(args.output_dir, 'engagement_events.csv')
            engagement_events.to_csv(events_path, index=False)
            print(f"   ✓ Generated {len(engagement_events)} engagement events in {time.time() - events_start:.2f}s")
        except Exception as e:
            print(f"   ⚠️  Failed to generate engagement events: {e}")
    
    # Generate experiments
    if args.include_experiments and generate_experiments:
        print("\n🧪 Generating experiments...")
        exp_start = time.time()
        try:
            experiments = generate_experiments(n_days, args.seed)
            experiments_path = os.path.join(args.output_dir, 'experiments.csv')
            experiments.to_csv(experiments_path, index=False)
            print(f"   ✓ Generated {len(experiments)} experiments in {time.time() - exp_start:.2f}s")
        except Exception as e:
            print(f"   ⚠️  Failed to generate experiments: {e}")
    
    # Generate experiment assignments
    if args.include_experiments and experiments is not None and generate_experiment_assignments:
        print("\n📋 Generating experiment assignments...")
        assign_start = time.time()
        try:
            experiment_assignments = generate_experiment_assignments(experiments, tutors, tutor_aggregates, args.seed)
            assignments_path = os.path.join(args.output_dir, 'experiment_assignments.csv')
            experiment_assignments.to_csv(assignments_path, index=False)
            print(f"   ✓ Generated {len(experiment_assignments)} experiment assignments in {time.time() - assign_start:.2f}s")
        except Exception as e:
            print(f"   ⚠️  Failed to generate experiment assignments: {e}")
    
    # Generate interventions (depends on experiments and assignments)
    if args.include_interventions and generate_interventions and experiments is not None and experiment_assignments is not None:
        print("\n💌 Generating interventions...")
        interv_start = time.time()
        try:
            interventions = generate_interventions(tutors, tutor_aggregates, sessions, 
                                                  experiments, experiment_assignments, n_days, args.seed)
            interventions_path = os.path.join(args.output_dir, 'interventions.csv')
            interventions.to_csv(interventions_path, index=False)
            print(f"   ✓ Generated {len(interventions)} interventions in {time.time() - interv_start:.2f}s")
        except Exception as e:
            print(f"   ⚠️  Failed to generate interventions: {e}")
        
        # Update engagement events with email events from interventions
        if engagement_events is not None and generate_engagement_events:
            print("\n📧 Updating engagement events with email interactions...")
            try:
                engagement_events = generate_engagement_events(tutors, sessions, interventions, n_days, args.seed)
                events_path = os.path.join(args.output_dir, 'engagement_events.csv')
                engagement_events.to_csv(events_path, index=False)
                print(f"   ✓ Updated engagement events with email interactions")
            except Exception as e:
                print(f"   ⚠️  Failed to update engagement events: {e}")
    
    # Update tutor last_login from engagement events
    if engagement_events is not None and len(engagement_events) > 0:
        print("\n🕐 Updating tutor last_login timestamps...")
        try:
            login_events = engagement_events[engagement_events['event_type'] == 'login'].copy()
            if len(login_events) > 0:
                login_events['timestamp'] = pd.to_datetime(login_events['timestamp'])
                last_logins = login_events.groupby('tutor_id')['timestamp'].max()
                
                # Update tutors DataFrame
                for tutor_id, last_login in last_logins.items():
                    tutors.loc[tutors['tutor_id'] == tutor_id, 'last_login'] = last_login
                
                # For tutors without logins, set to 7-30 days ago
                tutors_without_logins = tutors[tutors['last_login'].isna()]
                for _, tutor in tutors_without_logins.iterrows():
                    days_ago = random.randint(7, 30)
                    tutors.loc[tutors['tutor_id'] == tutor['tutor_id'], 'last_login'] = \
                        datetime.now() - timedelta(days=days_ago)
                
                # Save updated tutors
                tutors.to_csv(tutors_path, index=False)
                print(f"   ✓ Updated last_login for {len(last_logins)} tutors")
        except Exception as e:
            print(f"   ⚠️  Failed to update last_login: {e}")
    
    print(f"   ✓ Saved files to {args.output_dir}/")
    
    # Train ML model (unless skipped)
    if not args.no_model and args.mode == 'production':
        print("\n🤖 Training churn prediction model...")
        try:
            generator.train_churn_model(tutors, tutor_aggregates, output_dir=args.output_dir)
        except Exception as e:
            print(f"   ⚠️  Model training failed: {e}")
    
    # Print summary statistics
    total_time = time.time() - start_time
    print("\n" + "="*60)
    print("📈 DATA GENERATION SUMMARY")
    print("="*60)
    print(f"Tutors generated: {len(tutors)}")
    print(f"Sessions generated: {len(sessions):,}")
    print(f"Completed sessions: {sessions['session_completed'].sum():,}")
    print(f"Completion rate: {sessions['session_completed'].mean():.1%}")
    if sessions['student_rating'].notna().sum() > 0:
        print(f"Average ratings: {sessions['student_rating'].mean():.2f}")
    print(f"High churn risk tutors: {(tutor_aggregates['churn_risk_level'] == 'High').sum()}")
    print(f"Poor first session tutors: {tutor_aggregates['poor_first_session_flag'].sum()}")
    
    if engagement_events is not None:
        print(f"Engagement events: {len(engagement_events):,}")
    if experiments is not None:
        print(f"Experiments: {len(experiments)} (completed: {len(experiments[experiments['status'] == 'completed'])}, active: {len(experiments[experiments['status'] == 'active'])})")
    if experiment_assignments is not None:
        print(f"Experiment assignments: {len(experiment_assignments):,}")
    if interventions is not None:
        print(f"Interventions: {len(interventions)} (success: {len(interventions[interventions['status'] == 'responded'])}, ignored: {len(interventions[interventions['status'] == 'delivered'])})")
    
    print(f"\n⏱️  Total generation time: {total_time:.2f}s")
    print(f"\n📁 Files saved to {args.output_dir}/:")
    print(f"   - tutor_profiles.csv")
    print(f"   - sessions.csv")
    print(f"   - tutor_aggregates.csv")
    if engagement_events is not None:
        print(f"   - engagement_events.csv")
    if experiments is not None:
        print(f"   - experiments.csv")
    if experiment_assignments is not None:
        print(f"   - experiment_assignments.csv")
    if interventions is not None:
        print(f"   - interventions.csv")
    if not args.no_model and args.mode == 'production':
        print(f"   - churn_feature_importance.csv")
        print(f"   - churn_feature_importance.png")
    print("="*60)
