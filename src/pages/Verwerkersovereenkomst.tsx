import { Link } from 'react-router-dom';

const S = {
  page: { background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' } as const,
  wrap: { maxWidth: '720px', margin: '0 auto', background: 'white', padding: '48px 40px' } as const,
  h1: { fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' } as const,
  h2: { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginTop: '32px', marginBottom: '12px' } as const,
  p: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px' } as const,
  ul: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' } as const,
  date: { fontSize: '12px', color: '#999', marginBottom: '32px' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px', marginBottom: '16px' },
  th: { textAlign: 'left' as const, padding: '10px 12px', background: '#f8f9fa', borderBottom: '2px solid #e8e8e8', fontWeight: 700, color: '#333' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', color: '#555' },
};

export function Verwerkersovereenkomst() {
  return (
    <div style={S.page}>
      <div style={{ background: '#1a1a1a', color: 'white' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '14px', color: 'white', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recruitin B.V.</Link>
          <Link to="/" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>Terug naar home</Link>
        </div>
      </div>
      <div style={S.wrap}>
        <h1 style={S.h1}>Verwerkersovereenkomst</h1>
        <p style={S.date}>Conform artikel 28 AVG/GDPR | Laatst bijgewerkt: 14 april 2026</p>

        <p style={S.p}>Deze verwerkersovereenkomst is van toepassing op alle diensten waarbij Recruitin B.V. persoonsgegevens verwerkt namens de Opdrachtgever via de platforms Vacaturekanon, Kandidatentekort, Doelgroepenrapport, Recruitment APK, ProfielScore en gerelateerde diensten.</p>

        <h2 style={S.h2}>1. Partijen</h2>
        <table style={S.table}>
          <tbody>
            <tr><td style={S.th}>Verwerkingsverantwoordelijke</td><td style={S.td}>De Opdrachtgever (hierna: "Verantwoordelijke") — het bedrijf dat gebruik maakt van het Platform</td></tr>
            <tr><td style={S.th}>Verwerker</td><td style={S.td}>Recruitin B.V., Philippus Gastelaarsstraat 21b, 6981 BH Doesburg, KvK 75303647 (hierna: "Verwerker")</td></tr>
          </tbody>
        </table>

        <h2 style={S.h2}>2. Onderwerp en duur</h2>
        <p style={S.p}>2.1. Deze overeenkomst heeft betrekking op de verwerking van persoonsgegevens door Verwerker ten behoeve van Verantwoordelijke in het kader van recruitment dienstverlening via het Platform.</p>
        <p style={S.p}>2.2. De overeenkomst duurt voort zolang Verwerker persoonsgegevens verwerkt namens Verantwoordelijke.</p>

        <h2 style={S.h2}>3. Soort persoonsgegevens</h2>
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Categorie</th><th style={S.th}>Gegevens</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Contactgegevens opdrachtgever</td><td style={S.td}>Naam, e-mail, telefoonnummer, bedrijfsnaam, functie</td></tr>
            <tr><td style={S.td}>Kandidaatgegevens</td><td style={S.td}>Naam, e-mail, telefoonnummer, LinkedIn profiel, CV-gegevens (indien aangeleverd)</td></tr>
            <tr><td style={S.td}>Assessment antwoorden</td><td style={S.td}>Antwoorden op assessment-vragen, scores, categoriebeoordelingen</td></tr>
            <tr><td style={S.td}>Rapportagegegevens</td><td style={S.td}>AI-gegenereerde analyses, benchmarks, actieplannen</td></tr>
            <tr><td style={S.td}>Communicatiegegevens</td><td style={S.td}>E-mailcorrespondentie, WhatsApp berichten gerelateerd aan de dienst</td></tr>
            <tr><td style={S.td}>Technische gegevens</td><td style={S.td}>IP-adressen, browserinformatie, paginabezoeken</td></tr>
          </tbody>
        </table>

        <h2 style={S.h2}>4. Betrokkenen</h2>
        <ul style={S.ul}>
          <li>Medewerkers en contactpersonen van Verantwoordelijke</li>
          <li>Sollicitanten en kandidaten die reageren via het Platform</li>
          <li>Bezoekers van door Verwerker gecre\u00EBerde landingspagina's</li>
        </ul>

        <h2 style={S.h2}>5. Verplichtingen Verwerker</h2>
        <p style={S.p}>5.1. Verwerker verwerkt de persoonsgegevens uitsluitend in opdracht van en volgens de schriftelijke instructies van Verantwoordelijke, tenzij een wettelijke verplichting anders vereist.</p>
        <p style={S.p}>5.2. Verwerker garandeert dat personen die toegang hebben tot de persoonsgegevens gebonden zijn aan geheimhouding.</p>
        <p style={S.p}>5.3. Verwerker treft passende technische en organisatorische maatregelen om een beveiligingsniveau te waarborgen dat past bij het risico, waaronder:</p>
        <ul style={S.ul}>
          <li>Versleuteling van gegevens in transit (TLS/HTTPS) en at rest</li>
          <li>Toegangsbeperking op basis van need-to-know</li>
          <li>Regelmatige beveiligingsaudits en key rotatie</li>
          <li>Beveiligde API-sleutels (chmod 600, niet in broncode)</li>
          <li>Incidentresponsprocedure</li>
        </ul>

        <h2 style={S.h2}>6. Sub-verwerkers</h2>
        <p style={S.p}>6.1. Verantwoordelijke geeft hierbij algemene schriftelijke toestemming aan Verwerker om sub-verwerkers in te schakelen. Verwerker informeert Verantwoordelijke vooraf over wijzigingen in sub-verwerkers.</p>
        <p style={S.p}>6.2. Huidige sub-verwerkers:</p>
        <table style={S.table}>
          <thead>
            <tr><th style={S.th}>Sub-verwerker</th><th style={S.th}>Dienst</th><th style={S.th}>Locatie</th></tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>Anthropic</td><td style={S.td}>AI-analyse en rapportgeneratie</td><td style={S.td}>VS (EU SCC)</td></tr>
            <tr><td style={S.td}>Vercel</td><td style={S.td}>Website hosting en serverless functies</td><td style={S.td}>VS/EU</td></tr>
            <tr><td style={S.td}>Supabase</td><td style={S.td}>Database en bestandsopslag</td><td style={S.td}>EU (Frankfurt)</td></tr>
            <tr><td style={S.td}>Resend</td><td style={S.td}>E-mailverzending</td><td style={S.td}>VS/EU</td></tr>
            <tr><td style={S.td}>Pipedrive</td><td style={S.td}>CRM en leadbeheer</td><td style={S.td}>EU</td></tr>
            <tr><td style={S.td}>Stripe</td><td style={S.td}>Betalingsverwerking</td><td style={S.td}>EU</td></tr>
            <tr><td style={S.td}>Netlify</td><td style={S.td}>Landingspagina hosting</td><td style={S.td}>VS/EU</td></tr>
            <tr><td style={S.td}>Lemlist</td><td style={S.td}>E-mail nurture sequences</td><td style={S.td}>EU</td></tr>
            <tr><td style={S.td}>JotForm</td><td style={S.td}>Formulierverwerking</td><td style={S.td}>VS (EU)</td></tr>
            <tr><td style={S.td}>ElevenLabs</td><td style={S.td}>Audio/spraakgeneratie</td><td style={S.td}>VS</td></tr>
            <tr><td style={S.td}>Google (GA4)</td><td style={S.td}>Website analytics</td><td style={S.td}>VS (Privacy Shield)</td></tr>
            <tr><td style={S.td}>Meta</td><td style={S.td}>Advertentie pixel</td><td style={S.td}>VS/EU</td></tr>
            <tr><td style={S.td}>LinkedIn</td><td style={S.td}>Insight Tag / advertenties</td><td style={S.td}>VS/EU</td></tr>
          </tbody>
        </table>

        <h2 style={S.h2}>7. Datalekken</h2>
        <p style={S.p}>7.1. Verwerker meldt een datalek zonder onredelijke vertraging, en in ieder geval binnen 48 uur na ontdekking, aan Verantwoordelijke.</p>
        <p style={S.p}>7.2. De melding bevat minimaal: de aard van het datalek, de getroffen gegevens, de getroffen betrokkenen, de genomen maatregelen, en het contactpunt.</p>
        <p style={S.p}>7.3. Verwerker werkt mee aan het onderzoek en het informeren van de Autoriteit Persoonsgegevens en betrokkenen indien nodig.</p>

        <h2 style={S.h2}>8. Rechten van betrokkenen</h2>
        <p style={S.p}>8.1. Verwerker helpt Verantwoordelijke bij het beantwoorden van verzoeken van betrokkenen met betrekking tot hun rechten onder de AVG (inzage, correctie, verwijdering, overdracht, bezwaar).</p>
        <p style={S.p}>8.2. Verwerker stuurt verzoeken van betrokkenen die rechtstreeks bij Verwerker binnenkomen direct door naar Verantwoordelijke.</p>

        <h2 style={S.h2}>9. Doorgifte buiten de EER</h2>
        <p style={S.p}>9.1. Doorgifte van persoonsgegevens naar landen buiten de Europese Economische Ruimte vindt uitsluitend plaats op basis van een adequaatheidsbesluit, EU Standard Contractual Clauses (SCC), of een andere wettelijke grondslag conform artikel 46 AVG.</p>
        <p style={S.p}>9.2. Verwerker heeft met alle sub-verwerkers buiten de EER SCC's of gelijkwaardige waarborgen afgesloten.</p>

        <h2 style={S.h2}>10. Audit</h2>
        <p style={S.p}>10.1. Verantwoordelijke heeft het recht om jaarlijks een audit uit te voeren of te laten uitvoeren om naleving van deze overeenkomst te controleren.</p>
        <p style={S.p}>10.2. De kosten van de audit komen voor rekening van Verantwoordelijke, tenzij de audit aantoont dat Verwerker tekortschiet.</p>

        <h2 style={S.h2}>11. AI-verwerking specifiek</h2>
        <p style={S.p}>11.1. Persoonsgegevens die worden verwerkt door AI-systemen (Anthropic Claude) worden niet gebruikt voor het trainen van AI-modellen.</p>
        <p style={S.p}>11.2. AI-verwerking geschiedt via beveiligde API-verbindingen. Gegevens worden niet permanent opgeslagen door de AI-dienstverlener na verwerking.</p>
        <p style={S.p}>11.3. De output van AI-verwerking (rapporten, analyses) wordt opgeslagen in de beveiligde infrastructuur van Verwerker (Supabase/Vercel) en niet bij de AI-dienstverlener.</p>

        <h2 style={S.h2}>12. Be\u00EBindiging</h2>
        <p style={S.p}>12.1. Na be\u00EBindiging van de overeenkomst vernietigt Verwerker alle persoonsgegevens binnen 30 dagen, tenzij wettelijke bewaarplicht anders vereist.</p>
        <p style={S.p}>12.2. Verwerker verstrekt op verzoek een bevestiging van vernietiging aan Verantwoordelijke.</p>

        <h2 style={S.h2}>13. Toepasselijk recht</h2>
        <p style={S.p}>Op deze verwerkersovereenkomst is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Gelderland.</p>

        <h2 style={S.h2}>14. Contact</h2>
        <p style={S.p}>
          Recruitin B.V.<br />
          Philippus Gastelaarsstraat 21b<br />
          6981 BH Doesburg<br />
          E-mail: administratie@recruitin.nl<br />
          Telefoon: 0313-410507<br />
          KvK: 75303647
        </p>
      </div>
    </div>
  );
}
