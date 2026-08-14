import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { allowedOrigins } from "./config/env.js";
import { query } from "./config/database.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { apiRouter } from "./routes.js";

export function createApp(){
  const app=express();
  app.disable("x-powered-by");
  app.use((request,response,next)=>{request.id=request.headers["x-request-id"]??crypto.randomUUID();response.setHeader("x-request-id",request.id);next();});
  app.use(pinoHttp({logger})); app.use(helmet());
  app.use(cors({origin(origin,callback){if(!origin||allowedOrigins.includes(origin)) return callback(null,true);callback(new Error("Origin not allowed"));},credentials:true}));
  app.use(express.json({limit:"1mb"}));
  app.use(rateLimit({windowMs:60_000,limit:120,standardHeaders:"draft-8",legacyHeaders:false}));
  app.get("/health",async(_request,response,next)=>{try{await query("SELECT 1");response.json({status:"ok",service:"pickelton-partner-backend"});}catch(error){next(error);}});
  app.use("/api/v1",apiRouter); app.use(notFound); app.use(errorHandler); return app;
}
