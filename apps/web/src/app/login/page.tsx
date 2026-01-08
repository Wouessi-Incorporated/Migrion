'use client';
import Header from '@/components/Header';
import {useState} from 'react';
import {api} from '@/lib/api';
export default function Login(){
  const [email,setEmail]=useState('candidate@migrion.local');
  const [password,setPassword]=useState('ChangeMeNow123!');
  const [msg,setMsg]=useState('');
  async function submit(){
    setMsg('');
    try{
      const r=await api('/v1/auth/login','POST',{email,password});
      localStorage.setItem('token',r.token);
      localStorage.setItem('role',r.role);
      location.href = r.role==='employer'?'/employer/dashboard':r.role==='admin'?'/admin/audit':'/candidate/dashboard';
    }catch(e:any){ setMsg('Login failed'); }
  }
  return (
    <div>
      <Header/>
      <div style={{maxWidth:520,margin:'0 auto',padding:24}}>
        <h1>Login</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,borderRadius:10,border:'1px solid #C3C6C9',marginBottom:10}}/>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={{width:'100%',padding:10,borderRadius:10,border:'1px solid #C3C6C9',marginBottom:10}}/>
        <button onClick={submit} style={{width:'100%',padding:'10px 14px',borderRadius:12,border:0,fontWeight:900,background:'#001E3C',color:'#fff'}}>Sign in</button>
        {msg && <div style={{marginTop:12,color:'#B00020'}}>{msg}</div>}
        <div style={{marginTop:12,opacity:.85,lineHeight:1.5}}>
          Seed accounts: candidate@migrion.local / employer@migrion.local / admin@migrion.local (pw: ChangeMeNow123!)
        </div>
      </div>
    </div>
  );
}
