import {
  Button,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface EngagementAlertEmailProps {
  tutorName: string;
  issueType: 'no_login' | 'no_sessions' | 'declining_engagement';
  daysSinceLastLogin?: number;
  daysSinceLastSession?: number;
  engagementTrend?: 'declining' | 'stable' | 'improving';
  actionUrl: string;
}

export default function EngagementAlertEmail({
  tutorName,
  issueType,
  daysSinceLastLogin,
  daysSinceLastSession,
  engagementTrend,
  actionUrl,
}: EngagementAlertEmailProps) {
  const getIssueMessage = () => {
    switch (issueType) {
      case 'no_login':
        return `We noticed you haven't logged into the platform in ${daysSinceLastLogin} days. We're here to support you!`;
      case 'no_sessions':
        return `It's been ${daysSinceLastSession} days since your last tutoring session. We'd love to help you get back on track.`;
      case 'declining_engagement':
        return `We've noticed a decline in your session engagement metrics over the past few weeks. Let's work together to improve.`;
      default:
        return "We wanted to check in and see how you're doing.";
    }
  };

  const getActionText = () => {
    switch (issueType) {
      case 'no_login':
        return 'Log In Now';
      case 'no_sessions':
        return 'View Available Sessions';
      case 'declining_engagement':
        return 'View Your Dashboard';
      default:
        return 'Visit Dashboard';
    }
  };

  return (
    <BaseEmailLayout
      preview={`We'd love to see you back on the platform, ${tutorName}!`}
    >
      <Text style={paragraph}>
        Hi {tutorName},
      </Text>
      <Text style={paragraph}>
        {getIssueMessage()}
      </Text>

      <Text style={paragraph}>
        Your success is important to us, and we have resources available to help you:
      </Text>

      <Section style={bulletList}>
        <Text style={bullet}>• Training materials and best practices</Text>
        <Text style={bullet}>• 1-on-1 coaching sessions</Text>
        <Text style={bullet}>• Peer community support</Text>
        <Text style={bullet}>• Technical assistance</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          {getActionText()}
        </Button>
      </Section>

      <Text style={paragraph}>
        If you're facing any challenges or have questions, please don't hesitate to reach out. 
        We're here to support your success!
      </Text>

      <Text style={signature}>
        Best regards,<br />
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

const bulletList = {
  marginBottom: '16px',
};

const bullet = {
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '8px',
  color: '#4B5563',
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

