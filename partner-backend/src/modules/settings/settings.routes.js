import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";

export const settingsRouter = Router();
const supportedSettings = z.object({
  notifications: z.object({ email:z.boolean().optional(), sms:z.boolean().optional() }).strict().optional(),
  booking: z.object({ autoConfirm:z.boolean().optional(), cancellationHours:z.number().int().min(0).max(720).optional() }).strict().optional(),
  payments: z.object({ currency:z.enum(["INR"]).optional() }).strict().optional(),
}).strict().refine((value)=>Object.values(value).some((group)=>group&&Object.keys(group).length>0),{
  message:"At least one supported setting is required",
});
const settingsRequest=z.object({body:supportedSettings,params:z.object({}),query:z.object({})});

function publicSettings(settings={}){
  return {
    notifications:{ email:typeof settings.notifications?.email==="boolean"?settings.notifications.email:null,
      sms:typeof settings.notifications?.sms==="boolean"?settings.notifications.sms:null },
    booking:{ autoConfirm:typeof settings.booking?.autoConfirm==="boolean"?settings.booking.autoConfirm:null,
      cancellationHours:Number.isInteger(settings.booking?.cancellationHours)?settings.booking.cancellationHours:null },
    payments:{ currency:settings.payments?.currency==="INR"?"INR":null },
  };
}

settingsRouter.get("/",asyncHandler(async(request,response)=>{
  const result=await query("SELECT settings FROM partners WHERE id=$1",[request.auth.sub]);
  if(!result.rows[0])throw new HttpError(404,"Partner settings not found");
  response.json({success:true,data:publicSettings(result.rows[0].settings)});
}));

const updateSettings=asyncHandler(async(request,response)=>{
  const patch=request.validated.body;
  const result=await query(`UPDATE partners SET settings=
    COALESCE(settings,'{}'::jsonb)
    || CASE WHEN $1::jsonb IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('notifications',COALESCE(settings->'notifications','{}'::jsonb)||$1::jsonb) END
    || CASE WHEN $2::jsonb IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('booking',COALESCE(settings->'booking','{}'::jsonb)||$2::jsonb) END
    || CASE WHEN $3::jsonb IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('payments',COALESCE(settings->'payments','{}'::jsonb)||$3::jsonb) END,
    updated_at=NOW() WHERE id=$4 RETURNING settings`,[
      patch.notifications?JSON.stringify(patch.notifications):null,
      patch.booking?JSON.stringify(patch.booking):null,
      patch.payments?JSON.stringify(patch.payments):null,
      request.auth.sub,
    ]);
  if(!result.rows[0])throw new HttpError(404,"Partner settings not found");
  response.json({success:true,message:"Settings updated successfully",data:publicSettings(result.rows[0].settings)});
});

settingsRouter.patch("/",validate(settingsRequest),updateSettings);
settingsRouter.put("/",validate(settingsRequest),updateSettings);
