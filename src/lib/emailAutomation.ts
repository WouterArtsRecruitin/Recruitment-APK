// ============================================================================
// EMAIL AUTOMATION HELPER
// Integrates with popular email marketing platforms
// Supports: Mailchimp, ActiveCampaign, HubSpot, ConvertKit, Brevo (Sendinblue)
// ============================================================================

export interface EmailSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

export interface EmailAutomationConfig {
  provider: 'mailchimp' | 'activecampaign' | 'hubspot' | 'convertkit' | 'brevo' | 'custom';
  apiKey: string;
  listId?: string;
  automationId?: string;
  apiUrl?: string;
}

// ============================================================================
// NURTURE SEQUENCE CONFIGURATION
// Define your email nurture sequence here
// ============================================================================

export const NURTURE_SEQUENCES = {
  assessment_completed: {
    name: 'Assessment Completed',
    description: 'Email sequence for users who completed the assessment',
    emails: [
      {
        day: 0,
        subject: 'Je Recruitment APK Rapport is Onderweg 📊',
        template: 'rapport_preview',
        description: 'Immediate confirmation with report preview',
      },
      {
        day: 2,
        subject: 'Case Study: Hoe [Bedrijf] 45% Sneller Werft',
        template: 'case_study_1',
        description: 'Relevant case study based on industry',
      },
      {
        day: 5,
        subject: '3 Quick Wins voor Jouw Recruitment [Video]',
        template: 'quick_wins_video',
        description: 'Video content with actionable tips',
      },
      {
        day: 8,
        subject: 'Klaar voor de Volgende Stap?',
        template: 'demo_invite',
        description: 'Invitation for strategy call',
      },
      {
        day: 14,
        subject: 'Nieuwe Inzichten: Recruitment Trends 2025',
        template: 'industry_insights',
        description: 'Value-add content',
      },
      {
        day: 21,
        subject: 'Laatste Kans: Gratis Recruitment Strategie Sessie',
        template: 'last_chance',
        description: 'Final offer with urgency',
      },
    ],
  },

  lead_magnet_download: {
    name: 'Lead Magnet Download',
    description: 'Email sequence for lead magnet downloads',
    emails: [
      {
        day: 0,
        subject: 'Hier is Je Download: [Resource Naam] 📥',
        template: 'download_delivery',
        description: 'Immediate download link delivery',
      },
      {
        day: 1,
        subject: 'Heb je de Checklist al Bekeken?',
        template: 'download_followup',
        description: 'Follow-up and engagement check',
      },
      {
        day: 3,
        subject: 'Ontdek Je Recruitment Score (Gratis Test)',
        template: 'assessment_invite',
        description: 'Invite to take the assessment',
      },
      {
        day: 7,
        subject: 'Bonus: Extra Tips die Niet in de Checklist Staan',
        template: 'bonus_content',
        description: 'Additional value content',
      },
    ],
  },

  abandoned_assessment: {
    name: 'Abandoned Assessment',
    description: 'Win-back sequence for abandoned assessments',
    emails: [
      {
        day: 0,
        subject: 'Je Recruitment APK Wacht op Je...',
        template: 'abandoned_reminder',
        description: 'Immediate reminder (1 hour after abandon)',
      },
      {
        day: 1,
        subject: 'Nog 2 Minuten en Je Hebt Inzicht 🎯',
        template: 'abandoned_urgency',
        description: 'Time-based urgency',
      },
      {
        day: 3,
        subject: 'Dit Mis je Als je de APK Niet Afrondt',
        template: 'abandoned_fomo',
        description: 'FOMO-based messaging',
      },
    ],
  },
};

// ============================================================================
// API INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Add subscriber to email list
 */
export async function addToEmailList(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (config.provider) {
      case 'mailchimp':
        return await addToMailchimp(subscriber, config);
      case 'activecampaign':
        return await addToActiveCampaign(subscriber, config);
      case 'hubspot':
        return await addToHubSpot(subscriber, config);
      case 'brevo':
        return await addToBrevo(subscriber, config);
      case 'convertkit':
        return await addToConvertKit(subscriber, config);
      case 'custom':
        return await addToCustomEndpoint(subscriber, config);
      default:
        console.log('[Email] Would add to list:', subscriber);
        return { success: true };
    }
  } catch (error) {
    console.error('[Email] Error adding subscriber:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger automation/workflow
 */
export async function triggerAutomation(
  subscriberEmail: string,
  automationName: keyof typeof NURTURE_SEQUENCES,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Email] Triggering automation "${automationName}" for ${subscriberEmail}`);

  // In production, this would call the email provider's API
  // to add the subscriber to a specific automation/workflow

  return { success: true };
}

// ============================================================================
// PROVIDER-SPECIFIC IMPLEMENTATIONS
// ============================================================================

async function addToMailchimp(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  const apiUrl = config.apiUrl || 'https://us1.api.mailchimp.com/3.0';
  const dataCenter = config.apiKey.split('-')[1] || 'us1';

  const response = await fetch(
    `https://${dataCenter}.api.mailchimp.com/3.0/lists/${config.listId}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`anystring:${config.apiKey}`)}`,
      },
      body: JSON.stringify({
        email_address: subscriber.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName || '',
          LNAME: subscriber.lastName || '',
          COMPANY: subscriber.company || '',
          PHONE: subscriber.phone || '',
        },
        tags: subscriber.tags || [],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Mailchimp API error');
  }

  return { success: true };
}

async function addToActiveCampaign(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${config.apiUrl}/api/3/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': config.apiKey,
    },
    body: JSON.stringify({
      contact: {
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        phone: subscriber.phone,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('ActiveCampaign API error');
  }

  // Add to list if listId provided
  if (config.listId) {
    const contactData = await response.json();
    await fetch(`${config.apiUrl}/api/3/contactLists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Token': config.apiKey,
      },
      body: JSON.stringify({
        contactList: {
          list: config.listId,
          contact: contactData.contact.id,
          status: 1,
        },
      }),
    });
  }

  return { success: true };
}

async function addToHubSpot(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      properties: {
        email: subscriber.email,
        firstname: subscriber.firstName,
        lastname: subscriber.lastName,
        company: subscriber.company,
        phone: subscriber.phone,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('HubSpot API error');
  }

  return { success: true };
}

async function addToBrevo(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      email: subscriber.email,
      attributes: {
        FIRSTNAME: subscriber.firstName,
        LASTNAME: subscriber.lastName,
        COMPANY: subscriber.company,
        PHONE: subscriber.phone,
      },
      listIds: config.listId ? [parseInt(config.listId)] : [],
      updateEnabled: true,
    }),
  });

  if (!response.ok) {
    throw new Error('Brevo API error');
  }

  return { success: true };
}

async function addToConvertKit(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${config.listId}/subscribe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        email: subscriber.email,
        first_name: subscriber.firstName,
        tags: subscriber.tags,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('ConvertKit API error');
  }

  return { success: true };
}

async function addToCustomEndpoint(
  subscriber: EmailSubscriber,
  config: EmailAutomationConfig
): Promise<{ success: boolean; error?: string }> {
  if (!config.apiUrl) {
    throw new Error('Custom endpoint URL required');
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(subscriber),
  });

  if (!response.ok) {
    throw new Error('Custom endpoint error');
  }

  return { success: true };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get email automation config from environment
 */
export function getEmailConfig(): EmailAutomationConfig | null {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER as EmailAutomationConfig['provider'];
  const apiKey = import.meta.env.VITE_EMAIL_API_KEY;

  if (!provider || !apiKey) {
    return null;
  }

  return {
    provider,
    apiKey,
    listId: import.meta.env.VITE_EMAIL_LIST_ID,
    automationId: import.meta.env.VITE_EMAIL_AUTOMATION_ID,
    apiUrl: import.meta.env.VITE_EMAIL_API_URL,
  };
}

/**
 * Convenience function to add subscriber and trigger automation
 */
export async function subscribeAndTrigger(
  subscriber: EmailSubscriber,
  automationName?: keyof typeof NURTURE_SEQUENCES
): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  if (!config) {
    console.log('[Email] No config found, skipping subscription');
    return { success: true };
  }

  // Add to list
  const result = await addToEmailList(subscriber, config);

  if (!result.success) {
    return result;
  }

  // Trigger automation if specified
  if (automationName) {
    await triggerAutomation(subscriber.email, automationName, config);
  }

  return { success: true };
}
