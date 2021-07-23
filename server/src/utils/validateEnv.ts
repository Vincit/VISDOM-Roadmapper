const requiredEnvVars = [
  'NODE_ENV',
  'RDS_PORT',
  'RDS_HOSTNAME',
  'RDS_DB_NAME',
  'RDS_USERNAME',
  'RDS_PASSWORD',
  'SERVER_PORT',
  'SESSION_SECRET',
  'CORS_ORIGIN',
  'JIRA_CONSUMER_KEY',
];

export const validateEnv = () => {
  let isValid = true;
  for (const v of requiredEnvVars) {
    if (!process.env[v]) {
      console.error(`Missing required environment variable: ${v}`);
      isValid = false;
    }
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test' &&
    process.env.NODE_ENV !== 'development'
  ) {
    console.error("NODE_ENV must be one of 'production' 'test' 'development'");
    isValid = false;
  }

  if (Number.isNaN(Number(process.env.SERVER_PORT))) {
    console.error('SERVER_PORT must be a number');
    isValid = false;
  }

  return isValid;
};
