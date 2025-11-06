import {
  Button,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface TechnicalIssuesEmailProps {
  tutorName: string;
  issueRate: number;
  recentSessionsWithIssues: number;
  totalRecentSessions: number;
  actionUrl: string;
}

export default function TechnicalIssuesEmail({
  tutorName,
  issueRate,
  recentSessionsWithIssues,
  totalRecentSessions,
  actionUrl,
}: TechnicalIssuesEmailProps) {
  return (
    <BaseEmailLayout
      preview={`Technical support available to improve your session quality`}
    >
      <Text style={paragraph}>
        Hi {tutorName},
      </Text>
      <Text style={paragraph}>
        We've noticed that you've experienced technical issues in {recentSessionsWithIssues} out of your 
        last {totalRecentSessions} sessions ({(issueRate * 100).toFixed(0)}% rate).
      </Text>

      <Text style={paragraph}>
        Technical problems can significantly impact the learning experience and your satisfaction scores. 
        Let's work together to resolve these issues!
      </Text>

      <Section style={issueBox}>
        <Text style={issueHeading}>Common Technical Issues:</Text>
        <Text style={issue}>🎥 Video quality and camera problems</Text>
        <Text style={issue}>🔊 Audio connection and microphone issues</Text>
        <Text style={issue}>🌐 Internet connectivity and bandwidth</Text>
        <Text style={issue}>💻 Platform performance and browser compatibility</Text>
      </Section>

      <Text style={sectionHeading}>Quick Fixes to Try:</Text>

      <Section style={bulletList}>
        <Text style={bullet}>• Test your equipment 15 minutes before each session</Text>
        <Text style={bullet}>• Use a wired internet connection if possible</Text>
        <Text style={bullet}>• Close unnecessary applications and browser tabs</Text>
        <Text style={bullet}>• Update your browser to the latest version</Text>
        <Text style={bullet}>• Consider upgrading your internet plan if issues persist</Text>
      </Section>

      <Text style={sectionHeading}>We're Here to Help:</Text>

      <Section style={supportBox}>
        <Text style={supportText}>
          Our IT support team is ready to assist you with:
        </Text>
        <Text style={supportItem}>✓ Equipment troubleshooting</Text>
        <Text style={supportItem}>✓ Network optimization guidance</Text>
        <Text style={supportItem}>✓ Platform setup assistance</Text>
        <Text style={supportItem}>✓ Hardware upgrade recommendations</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          Contact Technical Support
        </Button>
      </Section>

      <Text style={paragraph}>
        In some cases, we may be able to provide equipment assistance or stipends for internet upgrades. 
        Don't let technical issues hold you back from delivering great sessions!
      </Text>

      <Text style={signature}>
        Here to support you,<br />
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

const issueBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #FCD34D',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const issueHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400E',
  marginBottom: '12px',
};

const issue = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
  color: '#78350F',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1F2937',
  marginBottom: '12px',
  marginTop: '24px',
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

const supportBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #93C5FD',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const supportText = {
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
  color: '#1E3A8A',
};

const supportItem = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '4px',
  color: '#1E40AF',
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

