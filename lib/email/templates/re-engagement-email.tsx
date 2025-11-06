import {
  Button,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface ReEngagementEmailProps {
  tutorName: string;
  daysSinceLastActivity: number;
  totalSessionsCompleted: number;
  averageRating: number;
  actionUrl: string;
}

export default function ReEngagementEmail({
  tutorName,
  daysSinceLastActivity,
  totalSessionsCompleted,
  averageRating,
  actionUrl,
}: ReEngagementEmailProps) {
  return (
    <BaseEmailLayout
      preview={`We miss you! Come back and continue making a difference.`}
    >
      <Text style={paragraph}>
        Hi {tutorName},
      </Text>
      <Text style={paragraph}>
        We noticed it's been {daysSinceLastActivity} days since your last tutoring session, and we wanted 
        to reach out. We really miss having you on the platform!
      </Text>

      <Section style={statsBox}>
        <Text style={statsHeading}>Your Impact So Far:</Text>
        <Text style={stat}>📚 {totalSessionsCompleted} students helped</Text>
        <Text style={stat}>⭐ {averageRating.toFixed(1)} average rating</Text>
        <Text style={stat}>💡 Countless "aha!" moments created</Text>
      </Section>

      <Text style={paragraph}>
        Your students appreciated your teaching style, and there are many more students who could benefit 
        from your expertise. Whatever kept you away, we'd love to help you come back.
      </Text>

      <Text style={sectionHeading}>We've Made Some Improvements:</Text>

      <Section style={bulletList}>
        <Text style={bullet}>✨ Enhanced platform features for easier tutoring</Text>
        <Text style={bullet}>📱 Better mobile experience</Text>
        <Text style={bullet}>🎯 Improved student matching system</Text>
        <Text style={bullet}>💰 New incentive programs</Text>
        <Text style={bullet}>🤝 Expanded tutor support and resources</Text>
      </Section>

      <Text style={sectionHeading}>How We Can Help You Return:</Text>

      <Section style={supportBox}>
        <Text style={supportText}>• Flexible scheduling that works with your life</Text>
        <Text style={supportText}>• Refresher training sessions available</Text>
        <Text style={supportText}>• Dedicated support team to address any concerns</Text>
        <Text style={supportText}>• Bonus opportunities for returning tutors</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          Browse Available Sessions
        </Button>
      </Section>

      <Text style={paragraph}>
        If there's anything we can do to make your return easier or address any concerns you might have, 
        please don't hesitate to reach out. We truly value your contribution to our community.
      </Text>

      <Text style={signature}>
        We hope to see you soon,<br />
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

const statsBox = {
  backgroundColor: '#ECFDF5',
  border: '1px solid #6EE7B7',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const statsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#065F46',
  marginBottom: '12px',
};

const stat = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#047857',
  marginBottom: '4px',
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
  backgroundColor: '#F3F4F6',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
};

const supportText = {
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

