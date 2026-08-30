"use client";

import {
  BriefcaseBusiness, CalendarClock, CheckCircle2, CircleUserRound, Globe2,
  LoaderCircle, Mail, MapPin, Phone, RefreshCw, Save, ShieldCheck, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentAccessToken } from "@/lib/supabase-access-token";
import { formatPartnerDate, formatPartnerDateTime } from "@/lib/partner-date";
import "./page.css";

type PartnerProfile = {
  id:string; business_name:string; contact_name:string; email:string; phone:string;
  address:string|null; city:string|null; state:string|null; postal_code:string|null;
  website:string|null; status:"ACTIVE"|"SUSPENDED"|"PENDING";
  created_at:string; updated_at:string;
};
type ProfileForm = { businessName:string; contactName:string; phone:string; address:string;
  city:string; state:string; postalCode:string; website:string };
type FieldErrors = Partial<Record<keyof ProfileForm,string>>;

const API_BASE=process.env.NEXT_PUBLIC_PARTNER_API_URL||"http://localhost:8090/api/v1";
const emptyForm:ProfileForm={businessName:"",contactName:"",phone:"",address:"",city:"",state:"",postalCode:"",website:""};
function toForm(profile:PartnerProfile):ProfileForm{return {businessName:profile.business_name,contactName:profile.contact_name,
  phone:profile.phone,address:profile.address??"",city:profile.city??"",state:profile.state??"",
  postalCode:profile.postal_code??"",website:profile.website??""}}
function initials(name:string){return name.split(" ").filter(Boolean).slice(0,2).map(word=>word[0]).join("").toUpperCase()||"P"}
function display(value:string|null){return value?.trim()||"Not provided"}
function validate(form:ProfileForm){const errors:FieldErrors={};if(form.businessName.trim().length<2)errors.businessName="Business name must be at least 2 characters.";
  if(form.contactName.trim().length<2)errors.contactName="Contact name must be at least 2 characters.";
  if(form.phone.trim().length<7)errors.phone="Phone number must be at least 7 characters.";
  if(form.website.trim()){try{new URL(form.website)}catch{errors.website="Enter a complete URL, for example https://example.com."}}
  return errors;}
async function profileApi<T>(init?:RequestInit):Promise<T>{const token=await getCurrentAccessToken();let response:Response;
  try{response=await fetch(`${API_BASE}/profile`,{...init,headers:{Authorization:`Bearer ${token}`,...(init?.body?{"Content-Type":"application/json"}:{}),...init?.headers}})}catch{throw new Error("Could not connect to the profile service. Check your connection and try again.")}
  const result=await response.json().catch(()=>null);if(!response.ok){const fallback=response.status===401?"Your session has expired. Please sign in again.":response.status===403?"You do not have permission to update this profile.":response.status===404?"Partner profile not found.":response.status===400?"Some profile fields are invalid.":"Unable to process the profile request.";throw new Error(result?.error?.message||fallback)}return result.data;}

function SectionCard({title,description,icon:Icon,children,className=""}:{title:string;description?:string;icon:LucideIcon;children:React.ReactNode;className?:string}){
  return <section className={`profile-card ${className}`.trim()}><header className="card-heading"><span className="card-icon"><Icon size={18}/></span><div><h2>{title}</h2>{description&&<p>{description}</p>}</div></header>{children}</section>}
function InfoRow({label,value,href}:{label:string;value:string|null;href?:string}){const missing=!value?.trim();return <div className="info-row"><dt>{label}</dt><dd className={missing?"missing-value":undefined}>{missing?"Not provided":href?<a href={href} target="_blank" rel="noopener noreferrer">{value}</a>:value}</dd></div>}
function FormField({label,name,value,error,onChange,type="text",readOnly=false}:{label:string;name:keyof ProfileForm|"email";value:string;error?:string;onChange?:(name:keyof ProfileForm,value:string)=>void;type?:string;readOnly?:boolean}){
  return <label className="profile-field"><span>{label}</span><input type={type} value={value} readOnly={readOnly} aria-invalid={Boolean(error)} onChange={event=>onChange?.(name as keyof ProfileForm,event.target.value)}/>{error&&<small>{error}</small>}{readOnly&&<small className="field-help">Managed by your login account</small>}</label>}

export default function ProfilePage(){
  const [profile,setProfile]=useState<PartnerProfile|null>(null);const [form,setForm]=useState<ProfileForm>(emptyForm);
  const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [editing,setEditing]=useState(false);
  const [error,setError]=useState("");const [success,setSuccess]=useState("");const [fieldErrors,setFieldErrors]=useState<FieldErrors>({});
  const loadProfile=useCallback(async()=>{setLoading(true);setError("");try{const loaded=await profileApi<PartnerProfile>();setProfile(loaded);setForm(toForm(loaded))}catch(err){setError(err instanceof Error?err.message:"Unable to load profile.")}finally{setLoading(false)}},[]);
  useEffect(()=>{loadProfile()},[loadProfile]);
  const completion=useMemo(()=>{if(!profile)return 0;const values=[profile.business_name,profile.contact_name,profile.email,profile.phone,profile.address,profile.city,profile.state,profile.postal_code,profile.website];return Math.round(values.filter(value=>Boolean(value?.trim())).length/values.length*100)},[profile]);
  function updateField(name:keyof ProfileForm,value:string){setForm(current=>({...current,[name]:value}));setFieldErrors(current=>({...current,[name]:undefined}));setSuccess("")}
  function cancel(){if(profile)setForm(toForm(profile));setEditing(false);setFieldErrors({});setError("");setSuccess("")}
  async function save(event:React.FormEvent){event.preventDefault();const errors=validate(form);setFieldErrors(errors);if(Object.keys(errors).length)return;
    setSaving(true);setError("");setSuccess("");try{const updated=await profileApi<PartnerProfile>({method:"PATCH",body:JSON.stringify({businessName:form.businessName.trim(),contactName:form.contactName.trim(),phone:form.phone.trim(),address:form.address.trim(),city:form.city.trim(),state:form.state.trim(),postalCode:form.postalCode.trim(),website:form.website.trim()})});setProfile(updated);setForm(toForm(updated));setEditing(false);setSuccess("Profile saved successfully.")}catch(err){setError(err instanceof Error?err.message:"Unable to save profile.")}finally{setSaving(false)}}
  if(loading)return <div className="profile-page"><div className="profile-loading"><LoaderCircle size={28}/><strong>Loading your profile…</strong></div></div>;
  if(!profile)return <div className="profile-page"><section className="profile-card profile-error-state"><ShieldCheck size={28}/><h1>Could not load profile</h1><p>{error}</p><button type="button" className="edit-profile-btn" onClick={loadProfile}><RefreshCw size={16}/>Retry</button></section></div>;
  const location=[profile.city,profile.state].filter(Boolean).join(", ")||"Location not provided";
  return <div className="profile-page">
    {success&&<div className="profile-feedback success"><CheckCircle2 size={17}/><span>{success}</span><button onClick={()=>setSuccess("")} aria-label="Dismiss success"><X size={15}/></button></div>}
    {error&&<div className="profile-feedback error"><ShieldCheck size={17}/><span>{error}</span><button onClick={()=>setError("")} aria-label="Dismiss error"><X size={15}/></button></div>}
    <div className="profile-row profile-overview-row"><section className="profile-card business-profile-card"><div className="hero-top-bar"><span className="business-label">BUSINESS PROFILE</span>{!editing&&<button className="edit-profile-btn" type="button" onClick={()=>{setEditing(true);setSuccess("")}}><CircleUserRound size={16}/><span>Edit Profile</span></button>}</div><div className="business-identity-wrapper"><div className="business-logo" aria-label={`${profile.business_name} initials`}>{initials(profile.business_name)}</div><div className="business-copy"><h1 className="hero-heading">{profile.business_name}</h1><div className="business-badges"><span className="role-chip"><BriefcaseBusiness size={13}/>Partner</span><span className={`account-status-chip ${profile.status.toLowerCase()}`}>{profile.status}</span></div><p className="hero-subtext">Profile information for your Pickelton partner account.</p></div></div><div className="business-summary"><div className="summary-item"><span className="summary-icon"><MapPin size={16}/></span><div><small>Location</small><strong>{location}</strong></div></div><div className="summary-item"><span className="summary-icon"><Mail size={16}/></span><div><small>Login Email</small><strong>{profile.email}</strong></div></div><div className="summary-item"><span className="summary-icon"><CalendarClock size={16}/></span><div><small>Partner Since</small><strong>{formatPartnerDate(profile.created_at)}</strong></div></div></div></section>
      <SectionCard title="Profile Completion" description="Complete the available business and contact fields." icon={CheckCircle2} className="profile-statistics-card"><div className="completion-block"><div className="completion-heading"><div><span>Profile Completion</span><small>Based on saved partner fields</small></div><strong>{completion}%</strong></div><div className="completion-track" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${completion}%`}}/></div></div></SectionCard></div>
    {editing?<form className="profile-card profile-edit-form" onSubmit={save}><header className="card-heading"><span className="card-icon"><CircleUserRound size={18}/></span><div><h2>Edit Profile</h2><p>Changes are saved to your partner account.</p></div></header><div className="profile-form-grid"><FormField label="Business Name" name="businessName" value={form.businessName} error={fieldErrors.businessName} onChange={updateField}/><FormField label="Contact Name" name="contactName" value={form.contactName} error={fieldErrors.contactName} onChange={updateField}/><FormField label="Email" name="email" value={profile.email} readOnly/><FormField label="Phone" name="phone" value={form.phone} error={fieldErrors.phone} onChange={updateField}/><FormField label="Website" name="website" type="url" value={form.website} error={fieldErrors.website} onChange={updateField}/><FormField label="Address" name="address" value={form.address} error={fieldErrors.address} onChange={updateField}/><FormField label="City" name="city" value={form.city} error={fieldErrors.city} onChange={updateField}/><FormField label="State" name="state" value={form.state} error={fieldErrors.state} onChange={updateField}/><FormField label="Postal Code" name="postalCode" value={form.postalCode} error={fieldErrors.postalCode} onChange={updateField}/></div><div className="profile-form-actions"><button type="button" className="profile-cancel-btn" onClick={cancel} disabled={saving}>Cancel</button><button type="submit" className="edit-profile-btn" disabled={saving}>{saving?<LoaderCircle className="spin" size={16}/>:<Save size={16}/>} {saving?"Saving…":"Save Changes"}</button></div></form>:<>
      <div className="profile-row profile-contact-row"><SectionCard title="Contact Information" description="Current contact details for this partner account." icon={Mail}><div className="contact-grid"><div className="contact-item"><span className="contact-icon"><CircleUserRound size={16}/></span><span><small>Contact Name</small><strong>{profile.contact_name}</strong></span></div><a className="contact-item" href={`mailto:${profile.email}`}><span className="contact-icon"><Mail size={16}/></span><span><small>Email Address</small><strong>{profile.email}</strong></span></a><a className="contact-item" href={`tel:${profile.phone}`}><span className="contact-icon"><Phone size={16}/></span><span><small>Phone Number</small><strong>{profile.phone}</strong></span></a><div className="contact-item"><span className="contact-icon"><Globe2 size={16}/></span><span><small>Website</small><strong className={!profile.website?"missing-value":undefined}>{display(profile.website)}</strong></span></div></div></SectionCard>
        <SectionCard title="Account Information" description="Read-only account details." icon={ShieldCheck}><dl className="info-list"><InfoRow label="Account Status" value={profile.status}/><InfoRow label="Created" value={formatPartnerDate(profile.created_at)}/><InfoRow label="Last Profile Update" value={formatPartnerDateTime(profile.updated_at)}/></dl></SectionCard></div>
      <div className="profile-row profile-final-row"><SectionCard title="Business Information" description="Saved business details." icon={BriefcaseBusiness}><dl className="info-list information-columns"><InfoRow label="Business Name" value={profile.business_name}/><InfoRow label="Website" value={profile.website} href={profile.website??undefined}/><InfoRow label="Contact Name" value={profile.contact_name}/><InfoRow label="Email" value={profile.email}/><InfoRow label="Phone" value={profile.phone}/></dl></SectionCard><SectionCard title="Venue Address" description="Primary address stored on the partner profile." icon={MapPin}><dl className="info-list venue-columns"><InfoRow label="Address" value={profile.address}/><InfoRow label="City" value={profile.city}/><InfoRow label="State" value={profile.state}/><InfoRow label="Postal Code" value={profile.postal_code}/></dl>{!profile.address&&<div className="inline-notice"><MapPin size={16}/>Use Edit Profile to add the business address.</div>}</SectionCard></div></>}
  </div>;
}
