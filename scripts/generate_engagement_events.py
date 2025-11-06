"""
Engagement Events Generator
Generates realistic tutor engagement events with high correlation to session activity
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
from typing import Dict, List, Tuple
import os


class EngagementEventsGenerator:
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
        
    def generate_events(self, tutors_df: pd.DataFrame, sessions_df: pd.DataFrame,
                       interventions_df: pd.DataFrame = None,
                       n_days: int = 30) -> pd.DataFrame:
        """
        Generate engagement events with realistic patterns
        
        Args:
            tutors_df: DataFrame with tutor profiles
            sessions_df: DataFrame with session data
            interventions_df: Optional DataFrame with interventions (for email events)
            n_days: Number of days to generate events for
        
        Returns:
            DataFrame with engagement events
        """
        events = []
        start_date = datetime.now() - timedelta(days=n_days)
        
        # Group sessions by tutor and date
        sessions_df['session_date'] = pd.to_datetime(sessions_df['session_datetime']).dt.date
        sessions_df['session_datetime_parsed'] = pd.to_datetime(sessions_df['session_datetime'])
        
        # Create tutor-specific patterns
        tutor_patterns = {}
        for _, tutor in tutors_df.iterrows():
            tutor_id = tutor['tutor_id']
            
            # Determine tutor's preferred hours (morning vs evening)
            is_morning_person = np.random.random() < 0.35  # 35% are morning people
            preferred_hour_start = random.choice([8, 9, 10]) if is_morning_person else random.choice([16, 17, 18])
            preferred_hour_end = preferred_hour_start + 4
            
            # Activity level (based on reliability - more reliable = more active)
            activity_level = tutor['reliability_score'] * np.random.uniform(0.8, 1.2)
            
            tutor_patterns[tutor_id] = {
                'preferred_hour_start': preferred_hour_start,
                'preferred_hour_end': preferred_hour_end,
                'is_morning_person': is_morning_person,
                'activity_level': activity_level,
                'coaching_sessions': tutor.get('coaching_sessions', 0) if 'coaching_sessions' in tutor else 0
            }
        
        # Generate events for each tutor
        for tutor_id in tutors_df['tutor_id'].unique():
            tutor_info = tutors_df[tutors_df['tutor_id'] == tutor_id].iloc[0]
            pattern = tutor_patterns[tutor_id]
            
            # Get tutor's sessions
            tutor_sessions = sessions_df[sessions_df['tutor_id'] == tutor_id].copy()
            tutor_sessions = tutor_sessions.sort_values('session_datetime_parsed')
            
            # Generate login events (2-5 per week)
            logins_per_week = int(np.random.uniform(2, 5))
            total_logins = int(logins_per_week * (n_days / 7))
            
            # Generate login events
            login_events = []
            for _ in range(total_logins):
                # Random day within the period
                day_offset = random.randint(0, n_days - 1)
                event_date = start_date + timedelta(days=day_offset)
                
                # Determine login time based on tutor pattern
                if pattern['is_morning_person']:
                    hour = random.choice([7, 8, 9, 10, 11])
                else:
                    hour = random.choice([17, 18, 19, 20, 21])
                
                login_time = event_date.replace(hour=hour, minute=random.randint(0, 59))
                
                # 60% correlation: login 1-4 hours before a session
                correlated_session = None
                if tutor_sessions.shape[0] > 0 and np.random.random() < 0.6:
                    # Find sessions on the same day or next day
                    same_day_sessions = tutor_sessions[
                        (tutor_sessions['session_datetime_parsed'].dt.date == login_time.date()) |
                        (tutor_sessions['session_datetime_parsed'].dt.date == (login_time.date() + timedelta(days=1)))
                    ]
                    
                    if same_day_sessions.shape[0] > 0:
                        session = same_day_sessions.iloc[0]
                        session_time = session['session_datetime_parsed']
                        
                        # If session is later, adjust login to be 1-4 hours before
                        if session_time > login_time:
                            hours_before = random.uniform(1, 4)
                            login_time = session_time - timedelta(hours=hours_before)
                            correlated_session = session['session_id']
                
                login_events.append({
                    'tutor_id': tutor_id,
                    'event_type': 'login',
                    'event_data': json.dumps({
                        'ip_address': f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                        'device': random.choice(['desktop', 'mobile', 'tablet']),
                        'correlated_session': correlated_session
                    }),
                    'timestamp': login_time
                })
            
            # Generate session_scheduled events (30-60 min after login for upcoming sessions)
            for login_event in login_events[:int(len(login_events) * 0.7)]:  # 70% of logins lead to scheduling
                scheduled_time = login_event['timestamp'] + timedelta(minutes=random.randint(30, 60))
                
                # Find a session that makes sense
                future_sessions = tutor_sessions[tutor_sessions['session_datetime_parsed'] > scheduled_time]
                if future_sessions.shape[0] > 0:
                    session = future_sessions.iloc[0]
                    events.append({
                        'tutor_id': tutor_id,
                        'event_type': 'session_scheduled',
                        'event_data': json.dumps({
                            'session_id': session['session_id'],
                            'scheduled_for': session['session_datetime_parsed'].isoformat()
                        }),
                        'timestamp': scheduled_time
                    })
            
            # Generate session_completed events (immediately after session completion)
            completed_sessions = tutor_sessions[tutor_sessions['session_completed'] == True]
            for _, session in completed_sessions.iterrows():
                completion_time = session['session_datetime_parsed'] + timedelta(
                    minutes=int(session.get('actual_duration_min', 60))
                )
                
                events.append({
                    'tutor_id': tutor_id,
                    'event_type': 'session_completed',
                    'event_data': json.dumps({
                        'session_id': session['session_id'],
                        'duration_minutes': session.get('actual_duration_min', 60),
                        'rating': float(session.get('student_rating', 0)) if pd.notna(session.get('student_rating')) else None
                    }),
                    'timestamp': completion_time
                })
            
            # Add login events
            events.extend(login_events)
            
            # Generate profile_updated events (1-2 per month)
            profile_updates = int(np.random.uniform(1, 2) * (n_days / 30))
            for _ in range(profile_updates):
                day_offset = random.randint(0, n_days - 1)
                update_time = start_date + timedelta(days=day_offset, hours=random.randint(10, 18))
                
                events.append({
                    'tutor_id': tutor_id,
                    'event_type': 'profile_updated',
                    'event_data': json.dumps({
                        'field': random.choice(['bio', 'availability', 'subjects', 'certification']),
                        'previous_value': 'old_value',
                        'new_value': 'new_value'
                    }),
                    'timestamp': update_time
                })
            
            # Generate message_sent events (occasional communication)
            messages_per_month = int(np.random.uniform(2, 5))
            total_messages = int(messages_per_month * (n_days / 30))
            for _ in range(total_messages):
                day_offset = random.randint(0, n_days - 1)
                message_time = start_date + timedelta(days=day_offset, hours=random.randint(9, 20))
                
                events.append({
                    'tutor_id': tutor_id,
                    'event_type': 'message_sent',
                    'event_data': json.dumps({
                        'recipient_type': random.choice(['student', 'admin', 'support']),
                        'message_length': random.randint(50, 500)
                    }),
                    'timestamp': message_time
                })
            
            # Generate coaching events (if tutor has coaching sessions)
            if pattern['coaching_sessions'] > 0:
                coaching_count = min(pattern['coaching_sessions'], int(n_days / 7))  # At most weekly
                for i in range(coaching_count):
                    # Schedule coaching 1-2 days before attendance
                    day_offset = random.randint(0, n_days - 2)
                    scheduled_time = start_date + timedelta(days=day_offset, hours=random.randint(10, 16))
                    attended_time = scheduled_time + timedelta(days=random.randint(1, 2), hours=random.randint(10, 16))
                    
                    events.append({
                        'tutor_id': tutor_id,
                        'event_type': 'coaching_scheduled',
                        'event_data': json.dumps({
                            'scheduled_for': attended_time.isoformat()
                        }),
                        'timestamp': scheduled_time
                    })
                    
                    events.append({
                        'tutor_id': tutor_id,
                        'event_type': 'coaching_attended',
                        'event_data': json.dumps({
                            'duration_minutes': random.randint(30, 60),
                            'topic': random.choice(['engagement', 'quality', 'technical', 'support'])
                        }),
                        'timestamp': attended_time
                    })
        
        # Generate email engagement events (if interventions provided)
        if interventions_df is not None and len(interventions_df) > 0:
            for _, intervention in interventions_df.iterrows():
                tutor_id = intervention['tutor_id']
                sent_at = pd.to_datetime(intervention['sent_at'])
                
                if pd.notna(sent_at):
                    # Email opened (70% of sent emails)
                    if np.random.random() < 0.7:
                        opened_at = sent_at + timedelta(hours=random.randint(1, 48))
                        
                        events.append({
                            'tutor_id': tutor_id,
                            'event_type': 'email_opened',
                            'event_data': json.dumps({
                                'intervention_id': intervention.get('intervention_id', ''),
                                'intervention_type': intervention.get('intervention_type', ''),
                                'email_provider': random.choice(['gmail', 'outlook', 'yahoo', 'other'])
                            }),
                            'timestamp': opened_at
                        })
                        
                        # Email clicked (30-40% of opens)
                        if np.random.random() < 0.35:
                            clicked_at = opened_at + timedelta(minutes=random.randint(1, 30))
                            
                            events.append({
                                'tutor_id': tutor_id,
                                'event_type': 'email_clicked',
                                'event_data': json.dumps({
                                    'intervention_id': intervention.get('intervention_id', ''),
                                    'link_clicked': random.choice(['dashboard', 'support', 'resources'])
                                }),
                                'timestamp': clicked_at
                            })
        
        # Create DataFrame
        events_df = pd.DataFrame(events)
        
        if len(events_df) > 0:
            # Sort by timestamp
            events_df = events_df.sort_values('timestamp')
            
            # Add event_id
            events_df['event_id'] = [f'EV{i+1:06d}' for i in range(len(events_df))]
            
            # Reorder columns
            events_df = events_df[['event_id', 'tutor_id', 'event_type', 'event_data', 'timestamp']]
        
        return events_df


def generate_engagement_events(tutors_df: pd.DataFrame, sessions_df: pd.DataFrame,
                                interventions_df: pd.DataFrame = None,
                                n_days: int = 30, seed: int = 42) -> pd.DataFrame:
    """Convenience function to generate engagement events"""
    generator = EngagementEventsGenerator(seed=seed)
    return generator.generate_events(tutors_df, sessions_df, interventions_df, n_days)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate engagement events CSV')
    parser.add_argument('--tutors-csv', type=str, default='data/tutor_profiles.csv',
                       help='Path to tutor profiles CSV')
    parser.add_argument('--sessions-csv', type=str, default='data/sessions.csv',
                       help='Path to sessions CSV')
    parser.add_argument('--interventions-csv', type=str, default=None,
                       help='Path to interventions CSV (optional)')
    parser.add_argument('--output', type=str, default='data/engagement_events.csv',
                       help='Output CSV path')
    parser.add_argument('--days', type=int, default=30,
                       help='Number of days to generate events for')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    
    # Load data
    tutors_df = pd.read_csv(args.tutors_csv)
    sessions_df = pd.read_csv(args.sessions_csv)
    interventions_df = None
    
    if args.interventions_csv and os.path.exists(args.interventions_csv):
        interventions_df = pd.read_csv(args.interventions_csv)
    
    # Generate events
    print(f"Generating engagement events for {len(tutors_df)} tutors over {args.days} days...")
    events_df = generate_engagement_events(tutors_df, sessions_df, interventions_df, args.days, args.seed)
    
    # Save
    events_df.to_csv(args.output, index=False)
    print(f"Generated {len(events_df)} engagement events")
    print(f"Saved to {args.output}")
    
    # Print summary
    if len(events_df) > 0:
        print("\nEvent type summary:")
        print(events_df['event_type'].value_counts())


