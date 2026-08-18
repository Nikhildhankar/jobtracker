import { app } from './app';
import { env } from './config/env';
import { connectDB } from './db/connect';

async function startServer() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 JobTracker Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
    console.log(`📡 Healthcheck available at: http://localhost:${env.PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
