import { z } from 'zod';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createSalesforceTask } from '../lib/salesforce/client';
import { isLiveSalesforceEnabled } from '../lib/salesforce/config';
import { mockRiskEscalations } from '../lib/data/mock-data';
import { SalesforceTask } from '../lib/types/impactpulse';

// 1. Load environment variables
config({ path: '.env.local' });

// 2. Validate environment
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  USE_LIVE_SALESFORCE: z.string().optional().default('false'),
});

const parsedEnv = envSchema.parse(process.env);

export const supabase = (parsedEnv.NEXT_PUBLIC_SUPABASE_URL && parsedEnv.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(parsedEnv.NEXT_PUBLIC_SUPABASE_URL, parsedEnv.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

// In-memory fallback stores when Supabase tables are not created or accessible in demo environment
export const inMemoryStore = {
  approvalRequests: new Map<string, any>(),
  riskEscalations: new Map<string, any>(),
  auditEvents: [] as any[],
  salesforceTasks: [] as any[],
};

// Initialize mockRiskEscalations into inMemoryStore
export function resetInMemoryStore() {
  inMemoryStore.approvalRequests.clear();
  inMemoryStore.riskEscalations.clear();
  inMemoryStore.auditEvents.length = 0;
  inMemoryStore.salesforceTasks.length = 0;

  for (const mockRisk of mockRiskEscalations) {
    inMemoryStore.riskEscalations.set(mockRisk.id, {
      id: mockRisk.id,
      organization_id: mockRisk.organizationId,
      program_id: mockRisk.programId,
      title: mockRisk.title,
      description: mockRisk.description,
      risk_level: mockRisk.riskLevel,
      detected_at: mockRisk.detectedAt,
      evidence_summary: [...mockRisk.evidenceSummary],
      recommended_action: mockRisk.recommendedAction,
      assigned_owner_name: mockRisk.assignedOwnerName,
      status: mockRisk.status,
      approval_status: mockRisk.approvalStatus,
      salesforce_task_id: mockRisk.salesforceTaskId || null,
    });
  }
}

resetInMemoryStore();

export interface SimulationOptions {
  riskEscalationId: string;
  approverId: string;
  decision?: 'approve' | 'reject';
  idempotencyKey?: string;
  silent?: boolean;
}

export interface SimulationResult {
  approvalOutcome: 'approved' | 'rejected';
  riskStatus: string;
  approvalRequestId: string;
  idempotencyKey: string;
  isDuplicateRun: boolean;
  salesforceTaskResult: {
    created: boolean;
    taskId?: string;
    mode: 'live' | 'mock' | 'none';
    subject?: string;
    priority?: string;
  };
  auditEventResult: {
    logged: boolean;
    eventId?: string;
    eventType: string;
  };
  sourceLabel: string;
  slackConfirmationMessage: string;
}

export async function simulateRiskEscalationApproval(options: SimulationOptions): Promise<SimulationResult> {
  const {
    riskEscalationId,
    approverId,
    decision = 'approve',
    idempotencyKey = `risk-escalation-approval-${riskEscalationId}`,
    silent = false,
  } = options;

  const isLive = isLiveSalesforceEnabled();
  const sourceLabel = isLive
    ? 'Salesforce Live API (Standard Task Object) + Supabase'
    : 'Salesforce Mock Client + Supabase [DEMO DATA]';

  // 1. Load pending_review / active risk escalation
  let riskRecord: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('risk_escalations')
        .select('*')
        .eq('id', riskEscalationId)
        .maybeSingle();

      if (!error && data) {
        riskRecord = data;
      }
    } catch {
      // Fall back to memory
    }
  }

  if (!riskRecord) {
    riskRecord = inMemoryStore.riskEscalations.get(riskEscalationId);
  }

  if (!riskRecord) {
    // If not found, synthesize a standard hero scenario record
    riskRecord = {
      id: riskEscalationId,
      organization_id: 'org-cfa-001',
      program_id: 'prog-001',
      title: 'Severe Mentor Bottleneck Threatening Spring Cohort Graduation',
      description: 'Completion rate has fallen to 42% against the 65% target. 18 learners are stalled in Module 2 for >14 days due to lack of 1:1 data modeling guidance.',
      risk_level: 'high',
      detected_at: new Date().toISOString(),
      evidence_summary: [
        'Completion rate: 42% (Target: 65%)',
        'Stalled learners: 18 individuals (>14 days without commit in Module 2)',
        'Mentor capacity: 2 active mentors (Demand: 18 requested)',
        'Potential impact: 18 learners miss employer interview round on April 15'
      ],
      recommended_action: 'Escalate to Executive Director. Reassign 3 volunteer mentors from Digital Workplace and generate high-priority Salesforce Task.',
      assigned_owner_name: 'Executive Director (Escalation Lead)',
      status: 'pending_review',
      approval_status: 'pending',
      salesforce_task_id: null,
    };
    inMemoryStore.riskEscalations.set(riskEscalationId, riskRecord);
  }

  // 2. Check for existing approval request by idempotency key
  let existingApproval: any = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (!error && data) {
        existingApproval = data;
      }
    } catch {
      // Supabase table check fallback
    }
  }

  if (!existingApproval) {
    existingApproval = inMemoryStore.approvalRequests.get(idempotencyKey);
  }

  // If already resolved (approved/rejected) with this idempotency key, enforce idempotency!
  if (existingApproval && (existingApproval.approval_status === 'approved' || existingApproval.approval_status === 'rejected')) {
    const isApproved = existingApproval.approval_status === 'approved';
    const taskId = existingApproval.salesforce_record_id || riskRecord.salesforce_task_id || undefined;
    const taskMode: 'live' | 'mock' | 'none' = isApproved
      ? (taskId?.startsWith('mock-') ? 'mock' : 'live')
      : 'none';

    const result: SimulationResult = {
      approvalOutcome: existingApproval.approval_status,
      riskStatus: isApproved ? 'escalated' : 'rejected',
      approvalRequestId: existingApproval.id,
      idempotencyKey,
      isDuplicateRun: true,
      salesforceTaskResult: {
        created: false, // Not created on duplicate run
        taskId,
        mode: taskMode,
        subject: 'Escalate Salesforce Career Foundations mentor-capacity risk',
        priority: 'High'
      },
      auditEventResult: {
        logged: false, // Already logged in prior run
        eventType: isApproved ? 'RISK_ESCALATION_APPROVED' : 'RISK_ESCALATION_REJECTED'
      },
      sourceLabel,
      slackConfirmationMessage: formatSlackMessage({
        outcome: existingApproval.approval_status,
        riskStatus: isApproved ? 'escalated' : 'rejected',
        riskTitle: riskRecord.title,
        approverId,
        taskId,
        taskMode,
        isDuplicate: true,
        sourceLabel
      })
    };

    if (!silent) {
      console.log(result.slackConfirmationMessage);
    }
    return result;
  }

  // Exact evidence payload for approval_requests
  const evidencePayload = {
    risk_escalation_id: riskRecord.id,
    program_id: riskRecord.program_id,
    risk_level: riskRecord.risk_level,
    completion_rate: 42,
    target_completion_rate: 65,
    stalled_learners: 18,
    mentor_capacity: 2,
    mentor_demand: 18,
    evidence_summary: riskRecord.evidence_summary || [],
    recommended_action: riskRecord.recommended_action,
    detected_at: riskRecord.detected_at,
    approver_id: approverId,
    is_demo_data: true,
  };

  const approvalRequestId = existingApproval?.id || `appr-${Date.now()}`;
  const nowIso = new Date().toISOString();

  let sfTaskId: string | null = null;
  let sfMode: 'live' | 'mock' | 'none' = 'none';

  // 3. Process decision: APPROVE vs REJECT
  if (decision === 'approve') {
    // 3a. If approve: Create Salesforce Task (Live or Mock)
    const taskPayload: SalesforceTask = {
      subject: 'Escalate Salesforce Career Foundations mentor-capacity risk',
      priority: 'High',
      status: 'Not Started',
      description: [
        '--- ImpactPulse Automated Risk Escalation ---',
        'Approved by: ' + approverId,
        'Approval Workflow: ImpactPulse Slack Interactive Button',
        'Status: Approved through the ImpactPulse workflow',
        '',
        '--- Aggregate Facts & Evidence ---',
        '• Program: Salesforce Career Foundations',
        '• Completion Rate: 42% (Benchmark Target: 65%)',
        '• Stalled Learners: 18 learners (>14 days in Module 2)',
        '• Mentor Capacity: 2 active mentors (18 requested, deficit: 16)',
        '• Cohort Risk: Severe bottleneck threatening Spring Cohort graduation',
        '',
        '--- Recommended Action ---',
        riskRecord.recommended_action || 'Reassign 3 volunteer mentors from Digital Workplace Essentials and assign an executive escalation lead.'
      ].join('\n')
    };

    const sfRes = await createSalesforceTask(taskPayload);
    sfTaskId = sfRes.taskId;
    sfMode = isLive ? 'live' : 'mock';
    inMemoryStore.salesforceTasks.push({ id: sfTaskId, ...taskPayload, mode: sfMode });

    // 3b. Update approval_requests
    const approvalRecord = {
      id: approvalRequestId,
      organization_id: riskRecord.organization_id || 'org-cfa-001',
      request_type: 'risk_escalation',
      title: 'Escalate Salesforce Career Foundations mentor-capacity risk',
      description: riskRecord.description,
      payload_json: evidencePayload,
      requested_by_slack_user_id: 'U_IMPACTPULSE_BOT',
      approver_slack_user_id: approverId,
      approval_status: 'approved',
      approved_at: nowIso,
      rejected_at: null,
      execution_status: 'completed',
      execution_result: `Task ${sfTaskId} created successfully in Salesforce (${sfMode} mode).`,
      salesforce_record_id: sfTaskId,
      idempotency_key: idempotencyKey,
      updated_at: nowIso,
      created_at: existingApproval?.created_at || nowIso,
    };

    inMemoryStore.approvalRequests.set(idempotencyKey, approvalRecord);

    if (supabase) {
      try {
        await supabase.from('approval_requests').upsert(approvalRecord, { onConflict: 'idempotency_key' });
      } catch {}
    }

    // 3c. Update risk_escalations to escalated
    riskRecord.status = 'escalated';
    riskRecord.approval_status = 'approved';
    riskRecord.salesforce_task_id = sfTaskId;
    riskRecord.updated_at = nowIso;
    inMemoryStore.riskEscalations.set(riskRecord.id, riskRecord);

    if (supabase) {
      try {
        await supabase.from('risk_escalations').update({
          status: 'escalated',
          approval_status: 'approved',
          salesforce_task_id: sfTaskId,
          updated_at: nowIso
        }).eq('id', riskRecord.id);
      } catch {}
    }

    // 3d. Create audit_events row
    const auditEvent = {
      id: `audit-${Date.now()}`,
      organization_id: riskRecord.organization_id || 'org-cfa-001',
      event_type: 'RISK_ESCALATION_APPROVED',
      actor_type: 'user',
      actor_id: approverId,
      entity_type: 'risk_escalation',
      entity_id: riskRecord.id,
      action_summary: `Executive approver ${approverId} approved risk escalation for Salesforce Career Foundations. Salesforce Task ${sfTaskId} generated.`,
      metadata_json: {
        idempotencyKey,
        salesforceTaskId: sfTaskId,
        salesforceMode: sfMode,
        taskSubject: 'Escalate Salesforce Career Foundations mentor-capacity risk',
        taskPriority: 'High',
        decision: 'approved',
        evidence: evidencePayload
      },
      created_at: nowIso
    };

    inMemoryStore.auditEvents.push(auditEvent);
    if (supabase) {
      try {
        await supabase.from('audit_events').insert(auditEvent);
      } catch {}
    }

    const result: SimulationResult = {
      approvalOutcome: 'approved',
      riskStatus: 'escalated',
      approvalRequestId,
      idempotencyKey,
      isDuplicateRun: false,
      salesforceTaskResult: {
        created: true,
        taskId: sfTaskId,
        mode: sfMode,
        subject: 'Escalate Salesforce Career Foundations mentor-capacity risk',
        priority: 'High'
      },
      auditEventResult: {
        logged: true,
        eventId: auditEvent.id,
        eventType: 'RISK_ESCALATION_APPROVED'
      },
      sourceLabel,
      slackConfirmationMessage: formatSlackMessage({
        outcome: 'approved',
        riskStatus: 'escalated',
        riskTitle: riskRecord.title,
        approverId,
        taskId: sfTaskId,
        taskMode: sfMode,
        isDuplicate: false,
        sourceLabel
      })
    };

    if (!silent) {
      console.log(result.slackConfirmationMessage);
    }
    return result;

  } else {
    // 4. If reject:
    const approvalRecord = {
      id: approvalRequestId,
      organization_id: riskRecord.organization_id || 'org-cfa-001',
      request_type: 'risk_escalation',
      title: 'Escalate Salesforce Career Foundations mentor-capacity risk',
      description: riskRecord.description,
      payload_json: evidencePayload,
      requested_by_slack_user_id: 'U_IMPACTPULSE_BOT',
      approver_slack_user_id: approverId,
      approval_status: 'rejected',
      approved_at: null,
      rejected_at: nowIso,
      execution_status: 'completed',
      execution_result: 'Risk escalation rejected by executive. No Salesforce task generated.',
      salesforce_record_id: null,
      idempotency_key: idempotencyKey,
      updated_at: nowIso,
      created_at: existingApproval?.created_at || nowIso,
    };

    inMemoryStore.approvalRequests.set(idempotencyKey, approvalRecord);

    if (supabase) {
      try {
        await supabase.from('approval_requests').upsert(approvalRecord, { onConflict: 'idempotency_key' });
      } catch {}
    }

    // Update risk escalation to rejected
    riskRecord.status = 'rejected';
    riskRecord.approval_status = 'rejected';
    riskRecord.updated_at = nowIso;
    inMemoryStore.riskEscalations.set(riskRecord.id, riskRecord);

    if (supabase) {
      try {
        await supabase.from('risk_escalations').update({
          status: 'rejected',
          approval_status: 'rejected',
          updated_at: nowIso
        }).eq('id', riskRecord.id);
      } catch {}
    }

    // Create audit_events row
    const auditEvent = {
      id: `audit-${Date.now()}`,
      organization_id: riskRecord.organization_id || 'org-cfa-001',
      event_type: 'RISK_ESCALATION_REJECTED',
      actor_type: 'user',
      actor_id: approverId,
      entity_type: 'risk_escalation',
      entity_id: riskRecord.id,
      action_summary: `Executive approver ${approverId} rejected risk escalation. No Salesforce task created.`,
      metadata_json: {
        idempotencyKey,
        decision: 'rejected',
        evidence: evidencePayload
      },
      created_at: nowIso
    };

    inMemoryStore.auditEvents.push(auditEvent);
    if (supabase) {
      try {
        await supabase.from('audit_events').insert(auditEvent);
      } catch {}
    }

    const result: SimulationResult = {
      approvalOutcome: 'rejected',
      riskStatus: 'rejected',
      approvalRequestId,
      idempotencyKey,
      isDuplicateRun: false,
      salesforceTaskResult: {
        created: false,
        mode: 'none'
      },
      auditEventResult: {
        logged: true,
        eventId: auditEvent.id,
        eventType: 'RISK_ESCALATION_REJECTED'
      },
      sourceLabel,
      slackConfirmationMessage: formatSlackMessage({
        outcome: 'rejected',
        riskStatus: 'rejected',
        riskTitle: riskRecord.title,
        approverId,
        taskMode: 'none',
        isDuplicate: false,
        sourceLabel
      })
    };

    if (!silent) {
      console.log(result.slackConfirmationMessage);
    }
    return result;
  }
}

function formatSlackMessage(params: {
  outcome: 'approved' | 'rejected';
  riskStatus: string;
  riskTitle: string;
  approverId: string;
  taskId?: string;
  taskMode: 'live' | 'mock' | 'none';
  isDuplicate: boolean;
  sourceLabel: string;
}): string {
  const isApproved = params.outcome === 'approved';
  const icon = isApproved ? '✅' : '🚫';
  const outcomeBadge = isApproved ? 'APPROVED' : 'REJECTED';

  const lines = [
    '═══════════════════════════════════════════════════════════════════',
    `🔔 [SLACK NOTIFICATION] ImpactPulse Executive Governance Action`,
    '═══════════════════════════════════════════════════════════════════',
    `${icon} Approval Outcome:      ${outcomeBadge}${params.isDuplicate ? ' (Idempotent replay - no duplicate task created)' : ''}`,
    `📌 Request Title:          Escalate Salesforce Career Foundations mentor-capacity risk`,
    `⚠️ Program Risk Status:    ${params.riskStatus.toUpperCase()} (Target: 65% | Actual: 42% | Deficit: 16 mentors)`,
    `👤 Executive Approver:     ${params.approverId}`,
  ];

  if (isApproved && params.taskId) {
    const modeBadge = params.taskMode === 'live' ? '[LIVE SALESFORCE API]' : '[MOCK SALESFORCE CLIENT]';
    lines.push(
      `☁️ Salesforce Task:        ${params.taskId} ${modeBadge}`,
      `   • Subject:              Escalate Salesforce Career Foundations mentor-capacity risk`,
      `   • Priority:             High`,
      `   • Status:               Not Started`
    );
  } else {
    lines.push(`☁️ Salesforce Task:        None (Skipped per rejection policy)`);
  }

  lines.push(
    `🔒 Audit Event:            LOGGED (Event: RISK_ESCALATION_${outcomeBadge})`,
    `🏷️ Source & Freshness:     ${params.sourceLabel}`,
    '═══════════════════════════════════════════════════════════════════'
  );

  return lines.join('\n');
}

// CLI Execution Support
async function runCli() {
  const args = process.argv.slice(2);

  // Help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx tsx scripts/simulate-risk-escalation-approval.ts [options]

Options:
  --id <riskId>        Risk Escalation ID (default: 'risk-001')
  --approver <userId>  Demo Executive Approver ID (default: 'U_EXEC_ELENA_ROSTOVA')
  --approve            Approve the risk escalation and generate Salesforce Task (default)
  --reject             Reject the risk escalation without creating Salesforce Task
  --key <idempKey>     Custom idempotency key for testing replay protection
  --help, -h           Show this help message
`);
    process.exit(0);
  }

  // Parse arguments
  let riskId = 'risk-001';
  let approverId = 'U_EXEC_ELENA_ROSTOVA';
  let decision: 'approve' | 'reject' = 'approve';
  let customKey: string | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      riskId = args[i + 1];
      i++;
    } else if (args[i] === '--approver' && args[i + 1]) {
      approverId = args[i + 1];
      i++;
    } else if (args[i] === '--approve') {
      decision = 'approve';
    } else if (args[i] === '--reject') {
      decision = 'reject';
    } else if (args[i] === '--key' && args[i + 1]) {
      customKey = args[i + 1];
      i++;
    }
  }

  try {
    await simulateRiskEscalationApproval({
      riskEscalationId: riskId,
      approverId,
      decision,
      idempotencyKey: customKey,
    });
  } catch (err: any) {
    console.error('❌ Simulation failed:', err?.message || err);
    process.exit(1);
  }
}

// If invoked directly from CLI
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.endsWith('simulate-risk-escalation-approval.ts'))) {
  runCli();
}
