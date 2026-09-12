import crypto from 'crypto';

/**
 * Verifies the incoming HTTP request from Slack using HMAC SHA256.
 * See: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature({
  signingSecret,
  requestSignature,
  timestamp,
  body
}: {
  signingSecret: string;
  requestSignature: string | null;
  timestamp: string | null;
  body: string;
}): boolean {
  if (!signingSecret || !requestSignature || !timestamp) {
    return false;
  }

  // Prevent replay attacks (5 minute threshold)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || reqTime < fiveMinutesAgo) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  const mySignature = `v0=${hmac.update(sigBaseString).digest('hex')}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(requestSignature, 'utf8')
    );
  } catch {
    return false;
  }
}
