module.exports = {
  apps: [
    {
      name: "sinabe-backend",
      cwd: __dirname,
      script: "src/index.js",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "sinabe-backend-dev",
      cwd: __dirname,
      script: "src/index.js",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
