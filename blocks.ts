export function buildProjectRiskBlocks({
  appUrl = 'https://impactpulse.org'
}: {
  appUrl?: string;
}) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 ImpactPulse Operational Risk Alert',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*High-risk Program:* *Salesforce Career Foundations*\n*Status:* High Risk — Immediate Capacity Bottleneck'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Completion Rate:*\n42% _(Benchmark Target: 65%)_'
        },
        {
          type: 'mrkdwn',
          text: '*Stalled Learners:*\n18 learners _(>14 days in Module 2)_'
        },
        {
          type: 'mrkdwn',
          text: '*Mentor Ratio:*\n2 mentors for 18 learners _(Severe gap)_'
        },
        {
          type: 'mrkdwn',
          text: '*Employer Deadline:*\nSpring Hiring Cohort in 21 days'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '💡 *Recommended Next Action (Grounded Decision Support):*\nEscalate immediately to *Sam (Executive Director)* and dispatch coordination notice to *Anu (Director Coordinator)*. Reassign 3 volunteer mentors from Digital Workplace and generate a high-priority Salesforce Task.'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '⚡ Escalate Risk (Create Task)',
            emoji: true
          },
          style: 'danger',
          value: 'risk_001',
          action_id: 'action_escalate_risk'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📊 Open Dashboard',
            emoji: true
          },
          url: `${appUrl}/internal/executive`,
          action_id: 'action_open_dashboard'
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🔍 *Data Provenance:* Salesforce Tasks & Cohort Tracking | *Confidence:* High | *Timestamp:* Just now'
        }
      ]
    }
  ];
}

export function buildBoardBriefBlocks({
  appUrl = 'https://impactpulse.org'
}: {
  appUrl?: string;
}) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 ImpactPulse Executive Governance Brief (Q1 2025)',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Executive Summary:*\nCommunity Forward Alliance has reached *1,240 learners served* (83% of annual goal) with *68% progression* across 5 pathways. Fundraising is at *$360,000* toward the $500,000 quarterly goal with *$115,000* in late-stage pipeline.'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '⚠️ *Identified Risks:*\n• Flagship Salesforce Career Foundations is stalled at 42% completion (target 65%).\n• Technical mentor bottleneck (2 mentors vs 18 needed).\n• Two late-stage grant opportunities lack assigned next activities in Salesforce.'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '✅ *Decisions Needed:*\n1. Reassign 3 mentors from Digital Workplace to Salesforce Foundations.\n2. Create high-priority stewardship tasks for pending pipeline gifts.'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✅ Request Board Review & Log Approval',
            emoji: true
          },
          style: 'primary',
          value: 'brief_001',
          action_id: 'action_approve_brief'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏛️ View Command Center',
            emoji: true
          },
          url: `${appUrl}/internal/executive`,
          action_id: 'action_view_brief_web'
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🤖 *Responsible AI Disclosure:* Summary synthesizes verified Salesforce CRM & program metrics. Approval is logged to Salesforce audit trail.'
        }
      ]
    }
  ];
}

export function buildHelpBlocks({
  appUrl = 'https://impactpulse.org'
}: {
  appUrl?: string;
}) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🛡️ ImpactPulse: Executive Watchtower Command Guide',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Welcome to *ImpactPulse*! This Slack agent provides *governed decision support* by pairing real-time learner pacing with volunteer and donor CRM telemetry in Salesforce.'
      }
    },

    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📋 Available Slash Commands:*\n\n' +
          '• `/project-risk` or `/escalate-risk`\n' +
          '  Surfaces the prioritized program risk card (e.g., Salesforce Career Foundations at 42% completion with 18 stalled learners) with the interactive `⚡ Escalate Risk` button.\n\n' +
          '• `/board-brief`\n' +
          '  Generates the Q1 2025 Executive Governance & Impact Brief with fundraising metrics ($360k raised) and the `✅ Approve Brief` action button.\n\n' +
          '• `/decision-queue`\n' +
          '  Lists all items currently pending executive sign-off.\n\n' +
          '• `/impact-help` or `/help`\n' +
          '  Displays this command guide and quick-action menu.'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*⚡ Interactive Quick Actions:*'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🚨 View Risk Alert',
            emoji: true
          },
          style: 'danger',
          value: 'risk_001',
          action_id: 'action_escalate_risk'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 View Board Brief',
            emoji: true
          },
          style: 'primary',
          value: 'brief_001',
          action_id: 'action_approve_brief'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📊 Open Command Center',
            emoji: true
          },
          url: `${appUrl}/internal/executive`,
          action_id: 'action_open_dashboard'
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🔒 *Responsible AI Policy:* No CRM tasks, emails, or status changes occur without explicit human approval.'
        }
      ]
    }
  ];
}

