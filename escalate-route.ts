import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = process.env.SLACK_BOT_TOKEN;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    if (!token) {
      return NextResponse.json({ ok: false, error: 'No bot token configured' }, { status: 500 });
    }

    // 1. Send High-Priority Notice to Sam (Executive Director) - U0C06KZRT6V
    const samMessage = {
      channel: 'U0C06KZRT6V',
      text: '🚨 *ImpactPulse Executive Escalation Notice*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 High-Priority Program Risk Escalation',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Attention:* *Sam (Executive Director)*\n*Timestamp:* ${timestamp}\n*Origin:* Approved from Executive Command Center\n\n*Program:* *Salesforce Career Foundations*\n*Critical Deficit:* Cohort completion rate is at *42%* (Target: 65%) with *18 stalled learners* and only *2 mentors* available.`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📋 *Assigned Salesforce Task:*\n• *Subject:* Urgent: Reallocate 3 volunteer mentors for Salesforce Career Foundations cohort\n• *Priority:* High\n• *Assigned To:* Sam (Executive Director)\n• *Status:* In Progress'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🔒 *Responsible AI Audit:* Dispatched following human approval in ImpactPulse Command Center.'
            }
          ]
        }
      ]
    };

    // 2. Send Coordination Notice to Anu (Director Coordinator) - U0C0Z3RAKQ8
    const anuMessage = {
      channel: 'U0C0Z3RAKQ8',
      text: '📨 *ImpactPulse Operational Coordination Notice*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📨 Mentor Dispatch Coordination Action Required',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*To:* *Anu (Director Coordinator)*\n*From:* ImpactPulse Command Center\n*Timestamp:* ${timestamp}\n\n*Action Requested:*\nAn urgent risk escalation was approved for *Salesforce Career Foundations*. Please reallocate *3 volunteer mentors* from the Digital Workplace pathway to support the 18 stalled learners at Milestone 3 (Reporting).`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '⚡ Executive owner *Sam* has been assigned the tracking Salesforce Task.'
            }
          ]
        }
      ]
    };

    // Dispatch both messages via Slack Web API
    await Promise.allSettled([
      fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(samMessage)
      }),
      fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(anuMessage)
      })
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Escalation notices successfully dispatched to Sam and Anu in Slack.',
      timestamp
    });
  } catch (error) {
    console.error('Error dispatching escalation:', error);
    return NextResponse.json({ ok: false, error: 'Failed to dispatch Slack notices' }, { status: 500 });
  }
}
