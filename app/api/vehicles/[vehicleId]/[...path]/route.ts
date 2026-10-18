import { createConfiguredApi, type RuntimeBindings } from '../../../../../lib/server-handler.ts';

let configured: ReturnType<typeof createConfiguredApi> | undefined;
async function handle(request:Request) {
 if(!configured){
  let bindings:RuntimeBindings={};
  // Workers provides bindings. Node previews do not support the cloudflare:
  // scheme; keep that unsupported runtime closed instead of crashing on import.
  try { const { env } = await import('cloudflare:workers'); bindings=env as RuntimeBindings; } catch { /* no Worker bindings */ }
  configured=createConfiguredApi(bindings);
 }
 return configured(request);
}
export const dynamic='force-dynamic';
export const GET=handle;
export const POST=handle;
export const PATCH=handle;
export const DELETE=handle;
export const OPTIONS=handle;
