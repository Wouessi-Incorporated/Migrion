import Header from '@/components/Header';
import { marked } from 'marked';
import { headers } from 'next/headers';
import Link from 'next/link';

async function getPage(slug: string, locale: string) {
  try {
    const u = new URL((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/v1/public/page');
    u.searchParams.set('slug', `country-${slug}`);
    u.searchParams.set('locale', locale);
    const r = await fetch(u.toString(), { cache: 'no-store' }).catch(() => null);
    if (!r || !r.ok) return null;
    const data = await r.json();
    return data.page;
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
}

export default async function Country({ params }: { params: { slug: string } }) {
  const al = headers().get('accept-language') || 'en';
  const locale = al.toLowerCase().startsWith('fr') ? 'fr' : al.toLowerCase().startsWith('de') ? 'de' : 'en';
  const page = await getPage(params.slug, locale);
  const html = marked.parse(page?.bodyMd || '');
  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {!page ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }}>
            <h1>Pathway Under Construction</h1>
            <p style={{ opacity: 0.6 }}>The formal documentation for this destination is being verified by legal counsel.</p>
            <Link href="/countries" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Return to Destinations</Link>
          </div>
        ) : (
          <>
            <h1 style={{ margin: '0 0 10px' }}>{page.title}</h1>
            <div style={{ opacity: .8, marginBottom: 12 }}>Language: {locale.toUpperCase()}</div>
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 24,
                padding: 40,
                background: '#fff',
                lineHeight: 1.8,
                fontSize: '17px'
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {page.videoUrl && (
              <div style={{ marginTop: 24, padding: 24, background: '#001E3C', color: 'white', borderRadius: 24 }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Destination Briefing</h4>
                <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Video Player Placeholder: {page.videoUrl}
                </div>
              </div>
            )}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Link href="/signup" className="btn-secondary" style={{ padding: '16px 40px', fontSize: '18px', textDecoration: 'none' }}>
                Start Migration to {page.title.split(' ').pop()}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
