import { NextRequest, NextResponse } from 'next/server';
import { verifySlackSignature } from '@/lib/slack/verify-signature';
import { buildProjectRiskBlocks, buildBoardBriefBlocks, buildHelpBlocks } from '@/lib/slack/blocks';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signingSecret = process.env.SLACK_SIGNING_SECRET || '';

    // Signature verification (can be bypassed for local mock testing if signing secret is not set)
    if (signingSecret) {
      const signature = req.headers.get('x-slack-signature');
      const timestamp = req.headers.get('x-slack-request-timestamp');
      const isValid = verifySlackSignature({
        signingSecret,
        requestSignature: signature,
        timestamp,
        body: rawBody
      });

      if (!isValid) {
        return new NextResponse('Invalid Slack signature', { status: 401 });
      }
    }

    const params = new URLSearchParams(rawBody);
    const command = params.get('command') || '';
    const text = (params.get('text') || '').trim().toLowerCase();
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ap-27-df-26-impact-pulse-hack02.vercel.app';

    if (command === '/impact-help' || command === '/help' || text === 'help') {
      const blocks = buildHelpBlocks({ appUrl });
      return NextResponse.json({
        response_type: 'in_channel',
        blocks
      });
    }

    if (command === '/project-risk' || command === '/escalate-risk') {
      const blocks = buildProjectRiskBlocks({ appUrl });
      return NextResponse.json({
        response_type: 'in_channel',
        blocks
      });
    }

    if (command === '/board-brief') {
      const blocks = buildBoardBriefBlocks({ appUrl });
      return NextResponse.json({
        response_type: 'in_channel',
        blocks
      });
    }

    if (command === '/decision-queue') {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: '📋 *ImpactPulse Pending Decisions Queue*\n1. [High Priority] Escalate Salesforce Career Foundations mentor shortage.\n2. [Normal Priority] Approve Q1 2025 Executive Governance & Impact Brief.\n\nUse `/project-risk` or `/board-brief` to inspect and take action.'
      });
    }

    // Default response includes help guide
    const blocks = buildHelpBlocks({ appUrl });
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `Command \`${command}\` received. Here is your ImpactPulse command guide:`,
      blocks
    });

  } catch (error) {
    console.error('Slack command handler error:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '⚠️ An error occurred processing the Slack command.'
    }, { status: 500 });
  }
}
