// Transport selection only. Returned bytes are UNTRUSTED until the existing
// RS256/issuer/audience/expiry/subject verifier accepts them. No cookie-presence auth.
export function accessApplicationToken(request:Request):string|null {
 if(request.headers.has('cf-access-jwt-assertion')){
  const token=request.headers.get('cf-access-jwt-assertion')??'';
  return token.length>0&&token.length<=16384?token:null;
 }
 const cookie=request.headers.get('cookie');if(!cookie||cookie.length>65536)return null;
 const tokens:string[]=[];
 for(const item of cookie.split(';')){
  const equal=item.indexOf('=');if(equal<0)continue;
  if(item.slice(0,equal).trim()==='CF_Authorization')tokens.push(item.slice(equal+1).trim());
 }
 // Duplicate cookie names/path collisions are ambiguous. Do not pick whichever
 // happens to validate or decode/normalize token contents supplied by a client.
 if(tokens.length!==1||!tokens[0]||tokens[0].length>16384||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(tokens[0]))return null;
 return tokens[0];
}
