'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {BrandMark,VehicleHero} from '../brand';
import {useAppearance} from '../beheer/use-appearance';
export default function Login(){
 const {theme,toggleTheme}=useAppearance();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[recovery,setRecovery]=useState(false),[ready,setReady]=useState(false);
 const started=useRef(false);
 async function post(action:string,body:unknown){const r=await fetch('/api/auth/'+action,{method:'POST',credentials:'same-origin',redirect:'error',cache:'no-store',headers:{'Content-Type':'application/json','x-csrf-protection':'1'},body:JSON.stringify(body)});const data=await r.json() as {error?:unknown;message?:string};if(!r.ok)throw Error(typeof data.error==='string'?data.error:'Aanmelden mislukt.');return data;}
 async function run(work:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await work();}catch(e){setError(e instanceof Error?e.message:'Geen verbinding. Probeer opnieuw.');}finally{setBusy(false);}}
 useEffect(()=>{
  if(started.current)return;started.current=true;
  const params=new URLSearchParams(window.location.hash.slice(1));
  // Recovery credentials remain only in memory; remove URL fragment immediately.
  const accessToken=params.get('access_token'),refreshToken=params.get('refresh_token'),type=params.get('type');
  if(window.location.hash)window.history.replaceState(null,'','/login');
  if(accessToken&&refreshToken&&(type==='recovery'||type==='invite')){void Promise.resolve().then(()=>{setRecovery(true);return run(async()=>{await post('recovery',{accessToken,refreshToken});setReady(true);});});}
  else {void fetch('/api/auth/status',{cache:'no-store',redirect:'error'}).then(async r=>{if(!r.ok)throw Error();setReady(true);}).catch(()=>setError('De nieuwe aanmelding is nog niet beschikbaar. Gebruik voorlopig je bestaande toegang.'));}
 },[]);
 async function login(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,data=new FormData(form);await run(async()=>{await post('login',{email:data.get('email'),password:data.get('password'),remember:data.get('remember')==='on'});form.reset();window.location.assign('/ritten');});}
 return <main className={`brand-login ${theme}`}><div className="rk-login-layout"><div className="rk-login-visual"><VehicleHero name="Jouw Jeep. Jouw overzicht." description="Rust onderweg. Overzicht achteraf."/></div><section className="rk-login-form"><div className="rk-login-header"><BrandMark/><div><p>ELKE RIT. HELDER.</p><h1>{recovery?'Kies je wachtwoord':'Aanmelden'}</h1></div></div><button type="button" onClick={toggleTheme} aria-label={theme==='dark'?'Licht thema':'Donker thema'}>{theme==='dark'?'Desert':'Anthracite'}</button>
 {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 {recovery?<form className="editor-grid" onSubmit={e=>{e.preventDefault();const form=e.currentTarget,data=new FormData(form);void run(async()=>{if(data.get('password')!==data.get('confirm'))throw Error('De wachtwoorden zijn niet hetzelfde.');await post('password',{password:data.get('password')});form.reset();setRecovery(false);setMessage('Je wachtwoord is ingesteld. Je kunt nu de registratie openen.');});}}><label>Nieuw wachtwoord<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required disabled={busy||!ready}/></label><label>Herhaal wachtwoord<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required disabled={busy||!ready}/></label><button disabled={busy||!ready}>Wachtwoord opslaan</button><Link href="/ritten">Naar registratie</Link></form>:<>
 <form className="editor-grid" onSubmit={login}><div className="rk-remember-choice"><label><input name="remember" type="checkbox" aria-describedby="remember-help" disabled={busy||!ready}/>Ingelogd blijven op dit eigen apparaat</label><p id="remember-help">Kies dit eerst als je ingelogd wilt blijven. Niet aanvinken op een gedeeld apparaat. Je kunt altijd uitloggen.</p></div><label>E-mailadres<input name="email" type="email" autoComplete="username" maxLength={254} required disabled={busy||!ready}/></label><label>Wachtwoord<input name="password" type="password" autoComplete="current-password" maxLength={1024} required disabled={busy||!ready}/></label><button type="submit" disabled={busy||!ready}>Inloggen</button></form>
 <details><summary>Wachtwoord vergeten</summary><form className="editor-grid" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);void run(async()=>{const result=await post('recover',{email:data.get('email')});setMessage(result.message??'Controleer je e-mail.');});}}><label>E-mailadres<input name="email" type="email" autoComplete="email" maxLength={254} required disabled={busy||!ready}/></label><button disabled={busy||!ready}>Stuur herstellink</button></form></details><p>Je gebruikt een persoonlijk appaccount. Geen Cloudflare-, GitHub- of ChatGPT-wachtwoord nodig.</p><Link href="/ritten">Naar registratie</Link></>}
 <p><Link href="/hulp">Hulp bij starten en op je beginscherm zetten</Link></p></section></div></main>;
}
