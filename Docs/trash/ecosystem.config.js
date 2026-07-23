module.exports = {
  apps: [
    {
      name: "amp-backend",
      script: "app.py",
      cwd: "Src/Backend",
      interpreter: "python3",
      env: {
        FLASK_APP: "app.py",
        PORT: 6333
      }
    },
    {
      name: "amp-frontend",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 5173",
      cwd: "Src/Frontend/amp",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
