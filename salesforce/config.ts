export interface SalesforceOAuthConfig {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getSalesforceConfig(): SalesforceOAuthConfig {
  return {
    loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
    clientId: process.env.SALESFORCE_CLIENT_ID || '',
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
    redirectUri: process.env.SALESFORCE_REDIRECT_URI || 'http://localhost:3000/api/auth/salesforce/callback',
  };
}

export const isLiveSalesforceEnabled = (): boolean => {
  return process.env.USE_LIVE_SALESFORCE === 'true' && !!process.env.SALESFORCE_CLIENT_ID;
};
