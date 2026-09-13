import { env } from "cloudflare:workers";
export function getRegistrationDb():D1Database{if(!env.DB)throw new Error("Registration storage unavailable");return env.DB}
