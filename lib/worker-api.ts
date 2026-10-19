import { createConfiguredApi, createConfiguredMcp, type RuntimeBindings } from './server-handler.ts';

let configured: ReturnType<typeof createConfiguredApi> | undefined;
export async function handleApiRequest(request:Request) {
 if(!configured){
  let bindings:RuntimeBindings={};
  // Workers provides bindings. Node previews do not support the cloudflare:
  // scheme; keep that unsupported runtime closed instead of crashing on import.
  try { const { env } = await import('cloudflare:workers'); bindings=env as RuntimeBindings; } catch { /* no Worker bindings */ }
  configured=createConfiguredApi(bindings);
 }
 return configured(request);
}

let configuredMcp: ReturnType<typeof createConfiguredMcp> | undefined;
export async function handleMcpRequest(request:Request) {
 if(!configuredMcp){
  let bindings:RuntimeBindings={};
  try { const { env } = await import('cloudflare:workers'); bindings=env as RuntimeBindings; } catch { /* no Worker bindings */ }
  configuredMcp=createConfiguredMcp(bindings);
 }
 return configuredMcp(request);
}
