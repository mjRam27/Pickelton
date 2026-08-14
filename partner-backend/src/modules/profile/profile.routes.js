import { Router } from "express";
import { z } from "zod";
import { query } from "../../config/database.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const profileRouter=Router();
profileRouter.get("/",asyncHandler(async(request,response)=>{const r=await query("SELECT id,business_name,contact_name,email,phone,address,city,state,postal_code,website,status,created_at,updated_at FROM partners WHERE id=$1",[request.auth.sub]);response.json({success:true,data:r.rows[0]});}));
profileRouter.patch("/",validate(z.object({body:z.object({businessName:z.string().min(2).optional(),contactName:z.string().min(2).optional(),phone:z.string().min(7).optional(),address:z.string().optional(),city:z.string().optional(),state:z.string().optional(),postalCode:z.string().optional(),website:z.url().or(z.literal("")).optional()}).strict(),params:z.object({}),query:z.object({})})),asyncHandler(async(request,response)=>{
  const current=(await query("SELECT * FROM partners WHERE id=$1",[request.auth.sub])).rows[0]; const p={...current,...request.validated.body};
  const r=await query(`UPDATE partners SET business_name=$1,contact_name=$2,phone=$3,address=$4,city=$5,state=$6,postal_code=$7,website=$8,updated_at=NOW() WHERE id=$9 RETURNING id,business_name,contact_name,email,phone,address,city,state,postal_code,website,status,updated_at`,[p.businessName??p.business_name,p.contactName??p.contact_name,p.phone,p.address,p.city,p.state,p.postalCode??p.postal_code,p.website||null,request.auth.sub]);response.json({success:true,data:r.rows[0]});
}));
