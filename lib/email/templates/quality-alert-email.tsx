import {
  Button,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface QualityAlertEmailProps {
  tutorName: string;
  alertType: 'low_rating' | 'poor_engagement' | 'low_empathy' | 'clarity_issues';
  metricValue: number;
  benchmark: number;
  recentSessionCount: number;
  actionUrl: string;
}

export default function QualityAlertEmail({
  tutorName,
  alertType,
  metricValue,
  benchmark,
  recentSessionCount,
  actionUrl,
}: QualityAlertEmailProps) {
  const getAlertMessage = () => {
    switch (alertType) {
      case 'low_rating':
        return `Your recent average rating is ${metricValue.toFixed(1)} out of 5.0, which is below our benchmark of ${benchmark.toFixed(1)}.`;
      case 'poor_engagement':
        return `Your engagement score has dropped to ${metricValue.toFixed(1)} out of 10, below the benchmark of ${benchmark.toFixed(1)}.`;
      case 'low_empathy':
        return `Your empathy score is currently ${metricValue.toFixed(1)} out of 10, below our target of ${benchmark.toFixed(1)}.`;
      case 'clarity_issues':
        return `Your clarity score has fallen to ${metricValue.toFixed(1)} out of 10, below the benchmark of ${benchmark.toFixed(1)}.`;
      default:
        return "We've noticed some areas where you could improve.";
    }
  };

  const getImprovementTips = () => {
    switch (alertType) {
      case 'low_rating':
        return [
          'Ask students for feedback during sessions',
          'End sessions with clear summaries and next steps',
          'Check in regularly to ensure understanding',
          'Be responsive to student needs and questions',
        ];
      case 'poor_engagement':
        return [
          'Use more interactive teaching methods',
          'Ask open-ended questions to encourage participation',
          'Balance speaking time with student interaction',
          'Use visual aids and screen sharing more frequently',
        ];
      case 'low_empathy':
        return [
          'Practice active listening techniques',
          'Acknowledge student frustrations and challenges',
          'Show patience when students struggle',
          'Build rapport before diving into content',
        ];
      case 'clarity_issues':
        return [
          'Break down complex concepts into smaller steps',
          'Use concrete examples and analogies',
          'Check for understanding before moving forward',
          'Provide written summaries of key points',
        ];
      default:
        return ['Review your recent session feedback', 'Consider scheduling a coaching session'];
    }
  };

  return (
    <BaseEmailLayout
      preview={`Let's improve your tutoring quality metrics together`}
    >
      <Text style={paragraph}>
        Hi {tutorName},
      </Text>
      <Text style={paragraph}>
        We're reaching out because we want to support your growth as a tutor. Based on your last {recentSessionCount} sessions, 
        we've identified an opportunity for improvement.
      </Text>

      <Section style={alertBox}>
        <Text style={alertHeading}>Quality Metric Alert</Text>
        <Text style={alertMessage}>{getAlertMessage()}</Text>
      </Section>

      <Text style={paragraph}>
        Don't worry - this is completely normal, and we're here to help! Here are some specific tips to improve:
      </Text>

      <Section style={bulletList}>
        {getImprovementTips().map((tip, index) => (
          <Text key={index} style={bullet}>• {tip}</Text>
        ))}
      </Section>

      <Text style={paragraph}>
        We also recommend:
      </Text>

      <Section style={resourceBox}>
        <Text style={resourceText}>📚 Review our training modules on this topic</Text>
        <Text style={resourceText}>👥 Schedule a 1-on-1 coaching session</Text>
        <Text style={resourceText}>💬 Connect with our tutor community for peer tips</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          View Your Performance Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Remember, every great tutor continues learning and improving. We believe in your potential 
        and are committed to helping you succeed!
      </Text>

      <Text style={signature}>
        We're here for you,<br />
        Your Tutor Success Team
      </Text>
    </BaseEmailLayout>
  );
}

// Styles
const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
  color: '#374151',
};

const alertBox = {
  backgroundColor: '#FEF2F2',
  border: '1px solid #FCA5A5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const alertHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#991B1B',
  marginBottom: '8px',
};

const alertMessage = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#7F1D1D',
};

const bulletList = {
  marginBottom: '24px',
};

const bullet = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
  color: '#4B5563',
};

const resourceBox = {
  backgroundColor: '#F3F4F6',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
};

const resourceText = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
  color: '#374151',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  marginTop: '32px',
  color: '#374151',
};

