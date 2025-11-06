/**
 * Base Email Layout
 * 
 * Reusable email template layout with consistent styling
 */

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link
} from '@react-email/components'
import * as React from 'react'

interface BaseEmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function BaseEmailLayout({ preview, children }: BaseEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Tutor Platform</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to you because you're a tutor on our platform.
            </Text>
            <Text style={footerText}>
              Need help? <Link href="mailto:support@tutorplatform.com" style={link}>Contact Support</Link>
            </Text>
            <Text style={footerText}>
              Tutor Platform | 123 Education St | Learning City, ED 12345
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 48px',
  backgroundColor: '#4F46E5',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '32px 48px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  padding: '0 48px 32px',
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#4F46E5',
  textDecoration: 'underline',
}

// Export style objects for use in templates
export const styles = {
  h2: {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '32px',
    margin: '16px 0',
  },
  h3: {
    color: '#374151',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
    margin: '12px 0',
  },
  text: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
  },
  textSmall: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '8px 0',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
    margin: '24px 0',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
    margin: '16px 0',
  },
  box: {
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0',
  },
  boxWarning: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0',
  },
  boxDanger: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0',
  },
  list: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    paddingLeft: '20px',
    margin: '12px 0',
  },
  listItem: {
    margin: '8px 0',
  },
}
