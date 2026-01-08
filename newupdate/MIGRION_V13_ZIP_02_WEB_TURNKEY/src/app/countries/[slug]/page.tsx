import Header from '@/components/Header';
import {marked} from 'marked';
import {headers} from 'next/headers';

async function getPage(slug:string, locale:string){
  const u = new URL(process.env.NEXT_PUBLIC_API_URL + '/v1/public/page');
  u.searchParams.set('slug', `country-${slug}`);
  u.searchParams.set('locale', locale);
  const r = await fetch(u.toString(), {cache:'no-store'});
  return (await r.json()).page;
}

export default async function Country({params}:{params:{slug:string}}){
  const al = headers().get('accept-language')||'en';
  const locale = al.toLowerCase().startsWith('fr')?'fr':al.toLowerCase().startsWith('de')?'de':'en';
  const page = await getPage(params.slug, locale);
  const html = marked.parse(page?.bodyMd || '');
  return (
    <div>
      <Header/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        <h1 style={{margin:'0 0 10px'}}>{page?.title || params.slug}</h1>
        <div style={{opacity:.8,marginBottom:12}}>locale: {locale} (EN fallback)</div>
        <div style={{border:'1px solid #E3E3E4',borderRadius:16,padding:18,background:'#fff'}} dangerouslySetInnerHTML={{__html: html}} />
        <div style={{marginTop:14,padding:16,border:'1px dashed #C3C6C9',borderRadius:16,background:'#FAF8F5'}}>
          Video slot (CMS): {page?.videoUrl || '(not set)'} — will auto-detect per locale in CMS.
        </div>
      </div>
    </div>
  );
}
