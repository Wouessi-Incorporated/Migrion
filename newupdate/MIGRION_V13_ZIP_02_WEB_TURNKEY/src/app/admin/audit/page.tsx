'use client';
import Header from '@/components/Header';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';

export default function Audit(){
  const [token,setToken]=useState('');
  const [logs,setLogs]=useState<any[]>([]);
  useEffect(()=>{
    const t=localStorage.getItem('token')||'';
    setToken(t);
    (async()=>{
      try{
        const r=await api('/v1/admin/audit/export','GET',undefined,t);
        setLogs(r.logs||[]);
      }catch(e){}
    })();
  },[]);

  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'0 0 6px'}}>Audit log</h1>
        <div style={{color:'#193044'}}>Append-only events (latest 1000).</div>
        <div style={{marginTop:16,border:'1px solid #E3E3E4',borderRadius:16,background:'#fff'}}>
          {logs.slice(0,50).map((l:any)=> (
            <div key={l.id} style={{padding:12,borderTop:'1px solid #E3E3E4'}}>
              <b>{l.event}</b>
              <div style={{opacity:.8,fontSize:13}}>{new Date(l.createdAt).toLocaleString()}</div>
              <pre style={{whiteSpace:'pre-wrap',fontSize:12,marginTop:8}}>{JSON.stringify(l.payload,null,2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
