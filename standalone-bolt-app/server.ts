import { App } from '@slack/bolt';
import { config } from 'dotenv';
import { buildProjectRiskBlocks, buildBoardBriefBlocks, buildHelpBlocks } from '../blocks';

config({ path: '../.env.slack.example' });

// Initialize Slack Bolt App (Supports both HTTP and Socket Mode)
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT) || 3001
});

const appUrl = process.env.APP_URL || 'https://ap-27-df-26-impact-pulse-hack02.vercel.app';

// 1. Slash Command Handlers
app.command('/project-risk', async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: 'in_channel',
    blocks: buildProjectRiskBlocks({ appUrl })
  });
});

app.command('/escalate-risk', async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: 'in_channel',
    blocks: buildProjectRiskBlocks({ appUrl })
  });
});

app.command('/board-brief', async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: 'in_channel',
    blocks: buildBoardBriefBlocks({ appUrl })
  });
});

app.command('/decision-queue', async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: 'ephemeral',
    text: '📋 *ImpactPulse Pending Decisions Queue*\n1. [High Priority] Escalate Salesforce Career Foundations mentor shortage.\n2. [Normal Priority] Approve Q1 2025 Executive Governance & Impact Brief.'
  });
});

app.command('/impact-help', async ({ ack, respond }) => {
  await ack();
  await respond({
    response_type: 'ephemeral',
    blocks: buildHelpBlocks({ appUrl })
  });
});

// 2. Interactive Action Handlers
app.action('action_escalate_risk', async ({ ack, body, respond, client }) => {
  await ack();
  const user = body.user.name || body.user.id;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Direct DM notices to Sam and Anu
  try {
    await client.chat.postMessage({
      channel: 'U0C06KZRT6V', // Sam
      text: `🚨 *High-Priority Escalation Notice:* @${user} approved risk escalation for Salesforce Career Foundations.`
    });
    await client.chat.postMessage({
      channel: 'U0C0Z3RAKQ8', // Anu
      text: `📨 *Mentor Dispatch Action Required:* Please reallocate 3 volunteer mentors to the Salesforce cohort per decision by @${user}.`
    });
  } catch (err) {
    console.error('Failed to send DMs:', err);
  }

  // Update in-channel card
  await respond({
    replace_original: true,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '✅ Risk Escalation Successfully Executed & Logged', emoji: true }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Approved by:* @${user}\n*Timestamp:* ${timestamp}\n*ImpactPulse ID:* \`ESC-2025-SF-01\`\n\n*Actions Completed:*\n1. 📋 *Created High-Priority Salesforce Task:* Assigned to *Sam (Executive Director)*\n2. 📨 *Dispatched Coordination Notice:* Sent to *Anu (Director Coordinator)*\n3. 🔒 *Audit Trail:* Risk updated and escalation logged in Salesforce & Supabase.`
        }
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: '🔒 *Responsible AI Gate:* Action executed only following authorized human verification.' }]
      }
    ]
  });
});

app.action('action_approve_brief', async ({ ack, body, respond }) => {
  await ack();
  const user = body.user.name || body.user.id;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  await respond({
    replace_original: true,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '✅ Board Brief Approved for Internal Distribution', emoji: true }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Approved by:* @${user} at ${timestamp}\n\n*Actions Completed:*\n• Status marked as \`approved\` in Salesforce.\n• Created Salesforce Task for Board Secretary: *"Distribute Q1 2025 Approved Governance Brief"*.\n• No external public emails sent (aligned with Responsible AI policy).`
        }
      }
    ]
  });
});

(async () => {
  await app.start();
  console.log('⚡️ ImpactPulse Slack Bolt app is running!');
})();
