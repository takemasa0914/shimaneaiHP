import { getRegistrationDb } from "@/db";
import { envelopeSchema, PRIVACY_VERSION } from "@/lib/registration-schema";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const fail=(error:string,status:number)=>json({error},status);
export async function POST(request:Request){
 const origin=request.headers.get("origin");
 const requestOrigin=new URL(request.url).origin;
 // The public deployment origin is fixed, so forwarded host headers are not trusted.
 const allowedOrigins=new Set(["https://shimane-ai-hackathon-2026.takemasa.chatgpt.site"]);
 if(requestOrigin.startsWith("http://localhost:")||requestOrigin.startsWith("http://127.0.0.1:"))allowedOrigins.add(requestOrigin);
 if(origin&&!allowedOrigins.has(origin))return fail("このページからお申し込みください。",403);
 if(request.headers.get("sec-fetch-site")==="cross-site")return fail("このページからお申し込みください。",403);
 if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return fail("送信形式をご確認ください。",415);
 if(Number(request.headers.get("content-length"))>16384)return fail("入力内容が長すぎます。",413);
 let raw:unknown;try{const reader=request.body?.getReader();if(!reader)return fail("入力内容をご確認ください。",400);const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return fail("入力内容が長すぎます。",413)}chunks.push(value)}const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length}raw=JSON.parse(new TextDecoder().decode(bytes))}catch{return fail("入力内容をご確認ください。",400)}
 const parsed=envelopeSchema.safeParse(raw);if(!parsed.success)return fail("必須項目・メールアドレス・同意欄をご確認ください。",400);
 const {data,requestId,website,startedAt}=parsed.data;
 if(website||Date.now()-startedAt<800||startedAt>Date.now())return fail("入力内容を確認し、もう一度お試しください。",400);
 try{
 const db=getRegistrationDb();
 const table=data.kind==="student"?"student_applications":"business_registrations";
 const prior=await db.prepare(`SELECT receipt FROM ${table} WHERE request_id = ?`).bind(requestId).first<{receipt:string}>();
 if(prior)return json({receipt:prior.receipt});
 // A one-way, rotating hash is stored, never the visitor's raw network address.
 const now=Date.now();const window=30*60*1000;const bucket=Math.floor(now/window);
 const address=request.headers.get("cf-connecting-ip")||"unknown";
 const key=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(`${address}:${bucket}:shimane2026`)))).map(b=>b.toString(16).padStart(2,"0")).join("");
 const limit=await db.prepare("INSERT INTO submission_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key,(bucket+2)*window).first<{count:number}>();
 if(!limit||limit.count>40)return fail("送信回数が多くなっています。しばらく時間をおいてお試しください。",429);
 const receipt=`${data.kind==="student"?"ST":"CO"}-${requestId.slice(0,8).toUpperCase()}-${requestId.slice(-4).toUpperCase()}`;
 const createdAt=new Date().toISOString();
 if(data.kind==="student"){
 await db.prepare("INSERT INTO student_applications (request_id,receipt,created_at,name,email,school,school_type,grade,experience,age_group,guardian_consent,areas,message,consent_version,updates_opt_in,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING").bind(requestId,receipt,createdAt,data.name,data.email,data.school,data.schoolType,data.grade,data.experience,data.ageGroup,data.guardianConsent?1:0,JSON.stringify(data.areas),data.message,PRIVACY_VERSION,data.updatesOptIn?1:0,"received").run();
 }else{
 await db.prepare("INSERT INTO business_registrations (request_id,receipt,created_at,organization,name,email,department,location,participation,interests,areas,message,consent_version,updates_opt_in,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING").bind(requestId,receipt,createdAt,data.organization,data.name,data.email,data.department,data.location,data.participation,JSON.stringify(data.interests),JSON.stringify(data.areas),data.message,PRIVACY_VERSION,data.updatesOptIn?1:0,"received").run();
 }
 // Best-effort cleanup cannot turn an accepted application into a reported failure.
 try{await db.prepare("DELETE FROM submission_limits WHERE expires_at < ?").bind(now).run()}catch{console.error("Submission limit cleanup failed")}
 return json({receipt},201);
 }catch{console.error("Registration save failed");return fail("現在、受付を完了できません。入力内容を残したまま、時間をおいて再度送信してください。",503)}
}
export function GET(){return fail("このURLから応募情報を閲覧することはできません。",405)}
