import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const settingsRouter=Router();
settingsRouter.get("/",asyncHandler(async(request,response)=>{const r=await query("SELECT settings FROM partners WHERE id=$1",[request.auth.sub]);response.json({success:true,data:r.rows[0]?.settings??{}});}));
settingsRouter.put("/",validate(z.object({body:z.record(z.string(),z.unknown()),params:z.object({}),query:z.object({})})),asyncHandler(async(request,response)=>{const r=await query("UPDATE partners SET settings=$1,updated_at=NOW() WHERE id=$2 RETURNING settings",[request.validated.body,request.auth.sub]);response.json({success:true,data:r.rows[0].settings});}));
