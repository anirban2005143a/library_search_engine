/**
 * Environment Variable Validation
 * Ensures required configuration is present before app startup
 */

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "PORT",
];

const validate = () => {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join("\n")}\n\nPlease check your .env file.`,
    );
  }
};

export { validate };
