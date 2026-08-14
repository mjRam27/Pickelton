import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/database.js";
import { logger } from "./config/logger.js";

const server=createApp().listen(env.PORT,()=>logger.info({port:env.PORT},"Partner backend started"));
async function shutdown(signal){logger.info({signal},"Shutting down");server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),10_000).unref();}
process.on("SIGTERM",()=>shutdown("SIGTERM")); process.on("SIGINT",()=>shutdown("SIGINT"));
