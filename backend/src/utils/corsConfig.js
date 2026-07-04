const allowedBase = process.env.ALLOWED_BASE_DOMAIN || '';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const localhostOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const isAllowedByBaseDomain = (origin) => {
  if (!allowedBase) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'https:' && process.env.NODE_ENV === 'production') return false;
    return hostname === allowedBase || hostname.endsWith(`.${allowedBase}`);
  } catch {
    return false;
  }
};

module.exports = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const isExplicitAllowed = allowedOrigins.includes(origin);
    const isLocalAllowed = isDev && localhostOrigins.has(origin);
    const isBaseAllowed = isAllowedByBaseDomain(origin);

    if (isExplicitAllowed || isLocalAllowed || isBaseAllowed) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
};
