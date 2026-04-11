// Simple structured logger — kein externes Package nötig
const levels = { info: '✅', warn: '⚠️ ', error: '❌' };

function log(level, ...args) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] ${levels[level] || '  '} [${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

module.exports = {
  info:  (...a) => log('info',  ...a),
  warn:  (...a) => log('warn',  ...a),
  error: (...a) => log('error', ...a),
};
