'use client';
import Header from '@/components/Header';
import {useEffect,useState} from 'react';
import {api} from '@/lib/api';

export default function CandidateDash(){
  const [token,setToken]=useState('');
  const [msg,setMsg]=useState('');
  const [dest,setDest]=useState('switzerland');
  const [dests,setDests]=useState<any[]>([]);

  useEffect(()=>{
    const t=localStorage.getItem('token')||'';
    setToken(t);
    (async()=>{
      try{
        const r=await api('/v1/public/destinations','GET',undefined,t);
        setDests(r.dest||[]);
      }catch(e){}
    })();
  },[]);

  async function pay(phase:number, amountCents:number){
    setMsg('');
    try{ await api('/v1/candidate/pay-phase','POST',{phase,amountCents,currency:'USD',provider:'stripe_mock'},token); setMsg(`Paid Phase ${phase}.`); }
    catch(e:any){ setMsg(`Blocked: ${e.data?.error}`); }
  }
  async function setDestination(){
    setMsg('');
    try{ await api('/v1/candidate/set-destination','POST',{slug:dest},token); setMsg(`Destination set: ${dest}`); }
    catch(e:any){ setMsg(`Blocked: ${e.data?.error}`); }
  }
  async function p1(){ try{ await api('/v1/phase1/complete','POST',{},token); setMsg('Phase 1 completed.'); }catch(e:any){ setMsg(`Blocked: ${e.data?.error}`);} }
  async function p2(){ try{ await api('/v1/phase2/complete','POST',{},token); setMsg('Phase 2 completed.'); }catch(e:any){ setMsg(`Blocked: ${e.data?.error}`);} }
  async function fund(){ try{ await api('/v1/escrow/fund','POST',{},token); setMsg('Escrow funded (mock).'); }catch(e:any){ setMsg(`Blocked: ${e.data?.error}`);} }
  async function exec(){ try{ const r=await api('/v1/phase3/execute','POST',{},token); setMsg(r.status); }catch(e:any){ setMsg(`Blocked: ${e.data?.error}`);} }

  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'0 0 6px'}}>Candidate dashboard</h1>
        <div style={{color:'#193044',lineHeight:1.7,maxWidth:820}}>
          Backend is authoritative. If you didn’t pay the phase, every service call is blocked. Phase 3 is blocked unless escrow is funded.
        </div>

        <div style={{marginTop:16,border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
          <b>Destination (Phase 1 paid required)</b>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
            <select value={dest} onChange={e=>setDest(e.target.value)} style={{padding:10,borderRadius:10,border:'1px solid #C3C6C9'}}>
              {dests.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
            <button onClick={setDestination} style={{padding:'10px 14px',borderRadius:12,border:'1px solid #C3C6C9',fontWeight:900}}>Save</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginTop:16}}>
          <div style={{border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
            <b>Phase 1 – Readiness</b>
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>pay(1,49900)} style={{padding:'8px 10px'}}>Pay Phase 1</button>
              <button onClick={p1} style={{padding:'8px 10px'}}>Complete Phase 1</button>
            </div>
          </div>
          <div style={{border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
            <b>Phase 2 – Employer validation</b>
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>pay(2,99900)} style={{padding:'8px 10px'}}>Pay Phase 2</button>
              <button onClick={p2} style={{padding:'8px 10px'}}>Complete Phase 2</button>
            </div>
          </div>
          <div style={{border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
            <b>Phase 3 – Escrow execution</b>
            <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>pay(3,199900)} style={{padding:'8px 10px'}}>Pay Phase 3 fee</button>
              <button onClick={fund} style={{padding:'8px 10px'}}>Confirm escrow funded</button>
              <button onClick={exec} style={{padding:'8px 10px'}}>Execute</button>
            </div>
          </div>
        </div>

        {msg && <div style={{marginTop:14,padding:12,background:'#FAF8F5',border:'1px solid #C3C6C9',borderRadius:12}}>{msg}</div>}
      </div>
    </div>
  );
}
