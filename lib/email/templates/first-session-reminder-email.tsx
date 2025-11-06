import {
  Button,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface FirstSessionReminderEmailProps {
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  gradeLevel: string;
  actionUrl: string;
}

export default function FirstSessionReminderEmail({
  tutorName,
  sessionDate,
  sessionTime,
  subject,
  gradeLevel,
  actionUrl,
}: FirstSessionReminderEmailProps) {
  return (
    <BaseEmailLayout
      preview={`First session reminder: ${subject} on ${sessionDate}`}
    >
      <Text style={paragraph}>
        Hi {tutorName},
      </Text>
      <Text style={paragraph}>
        You have an upcoming first session scheduled! First impressions matter, and we want to help you 
        make it great.
      </Text>

      <Section style={sessionDetails}>
        <Text style={detailsHeading}>Session Details:</Text>
        <Text style={detail}><strong>Date:</strong> {sessionDate}</Text>
        <Text style={detail}><strong>Time:</strong> {sessionTime}</Text>
        <Text style={detail}><strong>Subject:</strong> {subject}</Text>
        <Text style={detail}><strong>Grade Level:</strong> {gradeLevel}</Text>
      </Section>

      <Text style={callout}>
        💡 Remember: First sessions have a significant impact on long-term success. Tutors with strong 
        first sessions see 24% higher retention rates!
      </Text>

      <Text style={paragraph}>
        Here are some tips for an excellent first session:
      </Text>

      <Section style={bulletList}>
        <Text style={bullet}>✓ Join 5 minutes early to test your tech setup</Text>
        <Text style={bullet}>✓ Start with a warm introduction and build rapport</Text>
        <Text style={bullet}>✓ Ask about the student's goals and learning style</Text>
        <Text style={bullet}>✓ Use interactive teaching methods</Text>
        <Text style={bullet}>✓ End with a clear plan for next steps</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          View Session Details
        </Button>
      </Section>

      <Text style={paragraph}>
        You've got this! If you have any questions or need support, we're here to help.
      </Text>

      <Text style={signature}>
        Good luck!<br />
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

const sessionDetails = {
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const detailsHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1F2937',
  marginBottom: '8px',
};

const detail = {
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '4px',
  color: '#4B5563',
};

const callout = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #FCD34D',
  borderRadius: '6px',
  padding: '16px',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '24px',
  color: '#92400E',
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

