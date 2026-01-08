import Header from '@/components/Header';
import Link from 'next/link';

async function getDest(){
  const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/v1/public/destinations', {cache:'no-store', headers:{}});
  return (await r.json()).dest || [];
}

export default async function Countries(){
  const dest = await getDest();
  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'0 0 10px'}}>Destinations</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
          {dest.map((d:any)=>(
            <Link key={d.slug} href={`/countries/${d.slug}`} style={{textDecoration:'none',color:'#193044'}}>
              <div style={{border:'1px solid #E3E3E4',borderRadius:16,padding:16,background:'#fff'}}>
                <b>{d.name}</b>
                <div style={{marginTop:6,opacity:.8}}>{d.region}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
