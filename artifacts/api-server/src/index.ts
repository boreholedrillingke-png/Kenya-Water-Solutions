import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Keep-alive: Render's free plan sleeps after ~15 min without public traffic.
  // Pinging our own public URL every 10 min counts as traffic and prevents it.
  const publicUrl = process.env["RENDER_EXTERNAL_URL"];
  if (publicUrl) {
    const ping = () =>
      fetch(`${publicUrl}/api/healthz`).catch((err) =>
        logger.warn({ err }, "Keep-alive ping failed"),
      );
    setInterval(ping, 10 * 60 * 1000).unref?.();
  }
});
