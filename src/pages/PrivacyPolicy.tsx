import { Link } from 'react-router-dom';

const S = {
  page: { background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' } as const,
  wrap: { maxWidth: '720px', margin: '0 auto', background: 'white', padding: '48px 40px' } as const,
  h1: { fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' } as const,
  h2: { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginTop: '32px', marginBottom: '12px' } as const,
  p: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px' } as const,
  ul: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' } as const,
  date: { fontSize: '12px', color: '#999', marginBottom: '32px' } as const,
};

export function PrivacyPolicy() {
  return (
    <div style={S.page}>
      <div style={{ background: '#1a1a1a', color: 'white' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '14px', color: 'white', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recruitin B.V.</Link>
          <Link to="/" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>Terug naar home</Link>
        </div>
      </div>
      <div style={S.wrap}>
        <h1 style={S.h1}>Privacyverklaring</h1>
        <p style={S.date}>Laatst bijgewerkt: 14 april 2026</p>

        <p style={S.p}>Recruitin B.V. (KvK: 75303647) respecteert de privacy van alle gebruikers van haar websites en diensten. Deze privacyverklaring is van toepassing op de volgende websites en producten:</p>
        <ul style={S.ul}>
          <li>recruitin.nl</li>
          <li>recruitmentapk.nl (Recruitment APK)</li>
          <li>kandidatentekort.nl (Kandidatentekort Analyse)</li>
          <li>vacaturekanon.nl (Vacaturekanon)</li>
          <li>doelgroepenrapport.nl (Doelgroepenrapport)</li>
          <li>profielscore.nl (ProfielScore)</li>
        </ul>

        <h2 style={S.h2}>1. Welke gegevens verzamelen wij</h2>
        <p style={S.p}><strong>Contactgegevens:</strong> Bedrijfsnaam, naam, e-mailadres, telefoonnummer, sector en vestigingslocatie wanneer u een formulier invult.</p>
        <p style={S.p}><strong>Assessment antwoorden:</strong> Uw antwoorden op onze assessment-vragen worden gebruikt om uw persoonlijke rapport te genereren.</p>
        <p style={S.p}><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie en paginabezoeken via cookies en tracking pixels (Google Analytics, Meta Pixel, LinkedIn Insight Tag).</p>
        <p style={S.p}><strong>Betalingsgegevens:</strong> Worden verwerkt door Stripe en nooit door ons opgeslagen.</p>

        <h2 style={S.h2}>2. Waarvoor gebruiken wij uw gegevens</h2>
        <ul style={S.ul}>
          <li>Het genereren en verzenden van uw persoonlijke rapport of analyse</li>
          <li>Contact opnemen over uw resultaten of onze dienstverlening</li>
          <li>Het verbeteren van onze diensten en website-ervaring</li>
          <li>Het verzenden van relevante opvolg-e-mails (maximaal 4 e-mails)</li>
          <li>Marketing doeleinden (retargeting) via Meta en LinkedIn, alleen met uw toestemming via cookies</li>
        </ul>

        <h2 style={S.h2}>3. AI-verwerking</h2>
        <p style={S.p}>Wij gebruiken AI-technologie (Claude van Anthropic) om gepersonaliseerde rapporten te genereren op basis van uw assessment antwoorden. Uw gegevens worden hiervoor verwerkt via de Anthropic API. Anthropic slaat geen klantgegevens op na verwerking en gebruikt deze niet voor training van AI-modellen.</p>

        <h2 style={S.h2}>4. Verwerkers en derden</h2>
        <p style={S.p}>Wij delen uw gegevens met de volgende verwerkers, uitsluitend voor de hierboven genoemde doeleinden:</p>
        <ul style={S.ul}>
          <li><strong>Anthropic</strong> (AI-analyse) — VS, EU Standard Contractual Clauses</li>
          <li><strong>Resend</strong> (e-mailverzending) — VS/EU</li>
          <li><strong>Vercel</strong> (website hosting) — VS/EU</li>
          <li><strong>Supabase</strong> (database) — EU (Frankfurt)</li>
          <li><strong>Pipedrive</strong> (CRM) — EU</li>
          <li><strong>Stripe</strong> (betalingen) — EU</li>
          <li><strong>Google</strong> (Analytics) — VS, Privacy Shield</li>
          <li><strong>Meta</strong> (Pixel/advertenties) — VS/EU</li>
          <li><strong>LinkedIn</strong> (Insight Tag) — VS/EU</li>
        </ul>
        <p style={S.p}>Wij verkopen uw gegevens nooit aan derden.</p>

        <h2 style={S.h2}>5. Bewaartermijn</h2>
        <p style={S.p}>Uw contactgegevens en rapportdata worden bewaard zolang dit noodzakelijk is voor onze dienstverlening, met een maximum van 24 maanden na laatste contact. Betalingsgegevens worden bewaard conform de wettelijke bewaarplicht (7 jaar).</p>

        <h2 style={S.h2}>6. Cookies</h2>
        <p style={S.p}>Onze websites gebruiken functionele cookies (noodzakelijk) en analytische/marketing cookies (alleen met uw toestemming). Via de cookiebanner kunt u uw voorkeuren beheren. Meer informatie vindt u in ons <Link to="/cookies" style={{ color: '#09aedd' }}>cookiebeleid</Link>.</p>

        <h2 style={S.h2}>7. Uw rechten (AVG/GDPR)</h2>
        <p style={S.p}>U heeft het recht om:</p>
        <ul style={S.ul}>
          <li>Uw gegevens in te zien (inzagerecht)</li>
          <li>Uw gegevens te laten corrigeren (correctierecht)</li>
          <li>Uw gegevens te laten verwijderen (recht op vergetelheid)</li>
          <li>Bezwaar te maken tegen verwerking</li>
          <li>Uw gegevens over te dragen (dataportabiliteit)</li>
          <li>Een klacht in te dienen bij de Autoriteit Persoonsgegevens</li>
        </ul>
        <p style={S.p}>Voor het uitoefenen van uw rechten kunt u contact opnemen via administratie@recruitin.nl.</p>

        <h2 style={S.h2}>8. Beveiliging</h2>
        <p style={S.p}>Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen, waaronder versleutelde verbindingen (HTTPS/TLS), beveiligde API-sleutels, en toegangsbeperking tot persoonsgegevens.</p>

        <h2 style={S.h2}>9. Contact</h2>
        <p style={S.p}>
          Recruitin B.V.<br />
          Philippus Gastelaarsstraat 21b<br />
          6981 BH Doesburg<br />
          Telefoon: 0313-410507<br />
          E-mail: administratie@recruitin.nl<br />
          KvK: 75303647<br />
          BTW: NL860230533B01
        </p>
      </div>
    </div>
  );
}
