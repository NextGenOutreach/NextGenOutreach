module.exports = {
  apps: [{
    name: 'nextgen-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000, // Use port 3000 for shared hosting
      WEB_URL: 'https://yourdomain.com'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      WEB_URL: 'https://yourdomain.com'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
