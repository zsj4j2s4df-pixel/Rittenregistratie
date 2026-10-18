// Conservative offline preflight for the whole-hostname setup. This does not
// authenticate users, provision internal accounts or change remote resources.
type AccessPolicy={decision?:string;include?:{email?:{email?:string}}[]};
type AccessApp={type?:string;aud?:string;domain?:string;destinations?:{type?:string;uri?:string;overrides?:unknown[]}[];policies?:AccessPolicy[]};
export function reviewAccessSetup(input:{origin:string;authDomain:string;app:AccessApp;allowedEmails:string[]}){
 const issues:string[]=[];let hostname='';
 try{const url=new URL(input.origin);if(url.protocol!=='https:'||url.origin!==input.origin)throw Error();hostname=url.hostname;}catch{issues.push('APP_ORIGIN moet een exacte HTTPS-origin zonder pad zijn.');}
 if(!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(input.authDomain))issues.push('Gebruik de exacte Access-organisatiedomeinnaam.');
 const {app}=input;if(app.type!=='self_hosted')issues.push('Een self_hosted Access-app is vereist.');
 if(typeof app.aud!=='string'||!app.aud.trim()||app.aud.length>256)issues.push('De echte Application Audience ontbreekt of is ongeldig.');
 const destinations=app.destinations;
 // destinations supersede legacy domain. Never silently accept account-wide
 // Workers, a different host, path-only coverage or public auth overrides.
 const wholeHost=destinations!==undefined?destinations.length===1&&destinations[0].type==='public'&&destinations[0].uri===hostname&&!(destinations[0].overrides?.length):app.domain===hostname;
 if(!hostname||!wholeHost)issues.push('Deze controle vereist één exacte publieke hostnaam zonder pad, wildcard of openbare override; andere configuraties vereisen gerichte review.');
 const allowed=new Set(input.allowedEmails.map(email=>email.trim().toLowerCase()));
 if(!allowed.size||[...allowed].some(email=>!/^\S+@[^@\s]+\.[^@\s]+$/.test(email)))issues.push('Geef expliciet toegestane login-e-mailadressen op.');
 const seen=new Set<string>();const policies=app.policies??[];
 if(!policies.length)issues.push('Lees de werkelijke Access-policies terug; een policy-ID alleen bewijst geen allowlist.');
 for(const policy of policies){
  if(policy.decision!=='allow'){issues.push('Deze controle accepteert uitsluitend expliciete Allow-policies; andere beslissingen vereisen gerichte review.');continue;}
  if(!policy.include?.length)issues.push('Allow-policy zonder expliciete inclusieregel.');
  for(const rule of policy.include??[]){const email=rule.email?.email?.trim().toLowerCase();if(Object.keys(rule).length!==1||!email||!allowed.has(email))issues.push('Allow bevat een onbekende of bredere selector dan de afgesproken e-mailallowlist.');else seen.add(email);}
 }
 if([...allowed].some(email=>!seen.has(email)))issues.push('Niet alle afgesproken gebruikers staan in de teruggelezen allowlist.');
 return {readyForOwnerReview:issues.length===0,issues,...(issues.length?{}:{bindings:{APP_ORIGIN:input.origin,ACCESS_ISSUER:'https://'+input.authDomain,ACCESS_AUDIENCE:app.aud}}),limitation:'Alleen configuratiecontrole; geen bewijs van login, accountprovisioning, revocation of voertuigrechten.'};
}
