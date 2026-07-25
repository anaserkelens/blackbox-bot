const startedAt = new Date();
const recentErrors = [];
let apiRequestCount = 0;
let lastApiRequestAt = null;
let consoleCaptureInstalled = false;

function installConsoleErrorCapture() {
  if (consoleCaptureInstalled) {
    return;
  }

  consoleCaptureInstalled = true;
  const originalConsoleError = console.error.bind(console);

  console.error = (...values) => {
    recordBotError('Application', values);
    originalConsoleError(...values);
  };
}

function recordBotError(source, error) {
  const message = normalizeError(error);

  recentErrors.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    source: String(source || 'Application').slice(0, 80),
    message: redactSecrets(message).slice(0, 1200),
    createdAt: new Date().toISOString(),
  });
  recentErrors.splice(50);
}

function recordApiRequest() {
  apiRequestCount += 1;
  lastApiRequestAt = new Date().toISOString();
}

function getTelemetrySnapshot(client) {
  const uptimeSeconds = Math.max(0, Math.floor(process.uptime()));
  const discordReady = Boolean(client.isReady());
  const latency = Number(client.ws?.ping);

  return {
    generatedAt: new Date().toISOString(),
    runtime: {
      startedAt: startedAt.toISOString(),
      uptimeSeconds,
      railway: Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_DEPLOYMENT_ID),
      environment: process.env.RAILWAY_ENVIRONMENT_NAME || null,
      service: process.env.RAILWAY_SERVICE_NAME || null,
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || null,
      replicaId: process.env.RAILWAY_REPLICA_ID || null,
      nodeVersion: process.version,
    },
    discord: {
      ready: discordReady,
      latencyMs: Number.isFinite(latency) && latency >= 0 ? Math.round(latency) : null,
      guilds: client.guilds?.cache?.size || 0,
      userTag: client.user?.tag || null,
    },
    api: {
      healthy: true,
      requestCount: apiRequestCount,
      lastRequestAt: lastApiRequestAt,
    },
    errors: recentErrors.slice(0, 20).map((item) => ({ ...item })),
  };
}

function normalizeError(error) {
  if (Array.isArray(error)) {
    return error.map(normalizeError).join(' ');
  }

  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error || 'Unknown error');
}

function redactSecrets(value) {
  return String(value)
    .replace(/(authorization|token|password|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/[A-Za-z\d_-]{24}\.[A-Za-z\d_-]{6}\.[A-Za-z\d_-]{20,}/g, '[redacted-token]');
}

module.exports = {
  getTelemetrySnapshot,
  installConsoleErrorCapture,
  recordApiRequest,
  recordBotError,
};
