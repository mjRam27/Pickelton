import bcrypt from "bcryptjs";
import { transaction, pool } from "../src/config/database.js";

const hash=await bcrypt.hash("Partner123!",12);
await transaction(async(client)=>{
  const partner=await client.query(`INSERT INTO partners(id,business_name,contact_name,email,password_hash,phone,address,city,state,postal_code,website)
    VALUES('90000000-0000-0000-0000-000000000001','Pickelton Sports Arena','Aarav Sharma','partner@pickelton.local',$1,'+919100000001','100 Arena Road','Bengaluru','Karnataka','560038','https://pickelton.local')
    ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash RETURNING id`,[hash]); const id=partner.rows[0].id;
  await client.query(`INSERT INTO courts(id,partner_id,name,sport,surface,indoor,hourly_rate,description,status) VALUES
    ('91000000-0000-0000-0000-000000000001',$1,'Center Court','PICKLEBALL','Acrylic',false,600,'Competition court with spectator seating.','ACTIVE'),
    ('91000000-0000-0000-0000-000000000002',$1,'Garden Court','PICKLEBALL','Synthetic',false,500,'Outdoor social-play court.','ACTIVE'),
    ('91000000-0000-0000-0000-000000000003',$1,'Indoor Court','MULTI_SPORT','Wood',true,750,'Climate-controlled multi-sport court.','ACTIVE') ON CONFLICT(id) DO NOTHING`,[id]);
  const people=[['92000000-0000-0000-0000-000000000001','Diya Rao','diya@example.com','+919200000001'],['92000000-0000-0000-0000-000000000002','Kabir Singh','kabir@example.com','+919200000002'],['92000000-0000-0000-0000-000000000003','Ananya Iyer','ananya@example.com','+919200000003'],['92000000-0000-0000-0000-000000000004','Rohan Mehta','rohan@example.com','+919200000004']];
  for(const p of people) await client.query("INSERT INTO customers(id,partner_id,name,email,phone) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING",[p[0],id,p[1],p[2],p[3]]);
  await client.query(`INSERT INTO bookings(id,partner_id,court_id,customer_id,reference,starts_at,ends_at,status,payment_status,total_amount) VALUES
    ('93000000-0000-0000-0000-000000000001',$1,'91000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000001','PB-SEED001',NOW()+INTERVAL '2 hours',NOW()+INTERVAL '3 hours','CONFIRMED','PAID',600),
    ('93000000-0000-0000-0000-000000000002',$1,'91000000-0000-0000-0000-000000000002','92000000-0000-0000-0000-000000000002','PB-SEED002',NOW()+INTERVAL '1 day',NOW()+INTERVAL '2 days 1 hour','PENDING','UNPAID',500),
    ('93000000-0000-0000-0000-000000000003',$1,'91000000-0000-0000-0000-000000000003','92000000-0000-0000-0000-000000000003','PB-SEED003',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'+INTERVAL '2 hours','COMPLETED','PAID',1500)
    ON CONFLICT(id) DO NOTHING`,[id]);
});
await pool.end(); console.log("Seeded partner@pickelton.local / Partner123!");
