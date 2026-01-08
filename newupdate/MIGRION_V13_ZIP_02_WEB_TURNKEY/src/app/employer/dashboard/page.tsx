'use client';
import Header from '@/components/Header';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';

export default function EmployerDash(){
  const [token,setToken]=useState('');
  const [products,setProducts]=useState<any>(null);
  const [msg,setMsg]=useState('');
  const [purchaseId,setPurchaseId]=useState('');
  const [candidateId,setCandidateId]=useState('');

  useEffect(()=>{
    const t=localStorage.getItem('token')||'';
    setToken(t);
    (async()=>{ try{ setProducts(await api('/v1/employer/interview-products','GET',undefined,t)); }catch(e){} })();
  },[]);

  async function buy(sku:string){
    setMsg('');
    try{ const r=await api('/v1/employer/buy','POST',{sku},token); setPurchaseId(r.purchaseId); setMsg(`Paid: ${sku}`); }
    catch(e:any){ setMsg(`Blocked: ${e.data?.error}`); }
  }
  async function schedule(){
    setMsg('');
    try{
      const r=await api('/v1/employer/schedule-interview','POST',{
        candidateId,
        scheduledAt:new Date(Date.now()+86400000).toISOString(),
        durationMin:30,
        purchaseId
      },token);
      setMsg(`Scheduled interview: ${r.interviewId}`);
    }catch(e:any){ setMsg(`Blocked: ${e.data?.error}`); }
  }

  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'0 0 6px'}}>Employer dashboard</h1>
        <div style={{color:'#193044'}}>Employers pay to interview candidates. Scheduling is blocked without a paid purchase.</div>

        <div style={{marginTop:16,border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
          <b>Buy interview product</b>
          <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
            {products?.items?.map((i:any)=>(
              <button key={i.sku} onClick={()=>buy(i.sku)} style={{padding:'8px 10px'}}>{i.sku}</button>
            ))}
          </div>
          {purchaseId && <div style={{marginTop:10}}>purchaseId: {purchaseId}</div>}
        </div>

        <div style={{marginTop:16,border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
          <b>Schedule interview</b>
          <div style={{marginTop:10}}>
            <input value={candidateId} onChange={e=>setCandidateId(e.target.value)} placeholder="Candidate ID (UUID)" style={{width:'100%',padding:10,borderRadius:10,border:'1px solid #C3C6C9'}}/>
          </div>
          <button onClick={schedule} style={{marginTop:10,padding:'8px 10px'}}>Schedule</button>
        </div>

        {msg && <div style={{marginTop:14,padding:12,background:'#FAF8F5',border:'1px solid #C3C6C9',borderRadius:12}}>{msg}</div>}
      </div>
    </div>
  );
}
