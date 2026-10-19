'use client';
import {useId,useState,type FormHTMLAttributes} from 'react';
// Report missing/invalid fields in the form instead of relying on a transient
// browser bubble. Do not replace server validation or send an invalid request.
export default function ValidatedForm({children,onSubmit,...props}:FormHTMLAttributes<HTMLFormElement>){
 const [issue,setIssue]=useState('');const id=useId();
 return <form {...props} noValidate aria-describedby={issue?id:undefined} onInvalid={e=>e.preventDefault()} onInput={()=>setIssue('')} onSubmit={e=>{
  e.preventDefault();const form=e.currentTarget;setIssue('');
  if(!form.checkValidity()){
   const field=Array.from(form.elements).find(control=>(control instanceof HTMLInputElement||control instanceof HTMLSelectElement||control instanceof HTMLTextAreaElement)&&control.willValidate&&!control.validity.valid);
   if(field instanceof HTMLInputElement||field instanceof HTMLSelectElement||field instanceof HTMLTextAreaElement){
    const label=field.labels?.[0]?.textContent?.trim()||'het gemarkeerde veld';
    setIssue(field.validity.valueMissing?'Vul '+label+' in.':'Controleer '+label+'.');field.focus();field.scrollIntoView({block:'center',behavior:'auto'});
   }else setIssue('Controleer de verplichte velden.');
   return;
  }
  onSubmit?.(e);
 }}>{children}{issue&&<p id={id} role="alert">{issue}</p>}</form>;
}
