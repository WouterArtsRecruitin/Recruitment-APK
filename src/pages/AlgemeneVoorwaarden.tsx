import { Link } from 'react-router-dom';

const S = {
  page: { background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' } as const,
  wrap: { maxWidth: '720px', margin: '0 auto', background: 'white', padding: '48px 40px' } as const,
  h1: { fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' } as const,
  h2: { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginTop: '32px', marginBottom: '12px' } as const,
  h3: { fontSize: '15px', fontWeight: 700, color: '#333', marginTop: '20px', marginBottom: '8px' } as const,
  p: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px' } as const,
  ul: { fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' } as const,
  date: { fontSize: '12px', color: '#999', marginBottom: '32px' } as const,
  important: { fontSize: '14px', color: '#991b1b', lineHeight: 1.7, marginBottom: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px' } as const,
};

export function AlgemeneVoorwaarden() {
  return (
    <div style={S.page}>
      <div style={{ background: '#1a1a1a', color: 'white' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '14px', color: 'white', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recruitin B.V.</Link>
          <Link to="/" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>Terug naar home</Link>
        </div>
      </div>
      <div style={S.wrap}>
        <h1 style={S.h1}>Algemene Voorwaarden</h1>
        <p style={S.date}>Laatst bijgewerkt: 14 april 2026</p>

        <p style={S.p}>Deze algemene voorwaarden zijn van toepassing op alle <strong>digitale diensten, platforms en online producten</strong> van Recruitin B.V., gevestigd te Doesburg, ingeschreven bij de KvK onder nummer 75303647.</p>
        <p style={S.p}>Voor opdrachten inzake Werving & Selectie, Recruitment Process Outsourcing (RPO), Interim Recruitment en Recruitmentmarketing zijn de <strong>Algemene Voorwaarden Recruitin BV</strong> (17 artikelen) van toepassing. Deze zijn op aanvraag beschikbaar via administratie@recruitin.nl.</p>
        <p style={S.p}>Onderstaande voorwaarden zijn specifiek van toepassing op het gebruik van onze online platforms en AI-gedreven tools.</p>

        <h2 style={S.h2}>1. Definities</h2>
        <ul style={S.ul}>
          <li><strong>Dienstverlener:</strong> Recruitin B.V.</li>
          <li><strong>Gebruiker:</strong> Iedere persoon of organisatie die gebruik maakt van onze websites, tools of diensten.</li>
          <li><strong>Platform:</strong> De websites recruitmentapk.nl, kandidatentekort.nl, vacaturekanon.nl, doelgroepenrapport.nl, profielscore.nl en recruitin.nl, inclusief alle bijbehorende tools en API's.</li>
          <li><strong>Rapport:</strong> Ieder door het Platform gegenereerd document, analyse of adviesrapport.</li>
          <li><strong>AI-gegenereerde content:</strong> Alle door kunstmatige intelligentie gegenereerde teksten, analyses, aanbevelingen en berekeningen.</li>
        </ul>

        <h2 style={S.h2}>2. Toepasselijkheid</h2>
        <p style={S.p}>2.1. Deze voorwaarden zijn van toepassing op elk gebruik van het Platform, elke aanbieding, offerte en overeenkomst tussen Dienstverlener en Gebruiker.</p>
        <p style={S.p}>2.2. Door gebruik te maken van het Platform of het invullen van een assessment, accepteert de Gebruiker deze voorwaarden.</p>
        <p style={S.p}>2.3. Afwijkingen van deze voorwaarden zijn alleen geldig indien schriftelijk overeengekomen.</p>

        <h2 style={S.h2}>3. Dienstverlening</h2>
        <p style={S.p}>3.1. Recruitin B.V. biedt online recruitment assessment tools, arbeidsmarktrapportages en gerelateerde diensten aan.</p>
        <p style={S.p}>3.2. De gratis diensten (assessments, basisrapporten) zijn beperkt tot maximaal 2 gebruiksmomenten per persoon/organisatie. Aanvullend gebruik vereist een betaald abonnement of eenmalige betaling.</p>
        <p style={S.p}>3.3. Dienstverlener behoudt zich het recht voor om de inhoud, functionaliteit en beschikbaarheid van het Platform te allen tijde te wijzigen zonder voorafgaande kennisgeving.</p>

        <h2 style={S.h2}>4. AI-Disclaimer</h2>
        <div style={S.important}>
          <strong>Belangrijk:</strong> Onze rapporten en analyses worden geheel of gedeeltelijk gegenereerd door kunstmatige intelligentie (AI). Deze AI-gegenereerde content is uitdrukkelijk bedoeld als indicatief advies en vormt geen vervanging voor professioneel advies.
        </div>
        <p style={S.p}>4.1. AI-gegenereerde content kan onnauwkeurigheden, fouten of verouderde informatie bevatten. Dienstverlener garandeert niet de juistheid, volledigheid of actualiteit van AI-gegenereerde content.</p>
        <p style={S.p}>4.2. Scores, benchmarks en sectorvergelijkingen zijn gebaseerd op algemene marktgegevens en referentiewaarden en vormen geen exacte weergave van de specifieke situatie van de Gebruiker.</p>
        <p style={S.p}>4.3. ROI-schattingen, besparingsberekeningen en prognoses zijn indicatief en kunnen niet worden opgevat als garantie op daadwerkelijke resultaten.</p>
        <p style={S.p}>4.4. De Gebruiker is zelf verantwoordelijk voor beslissingen die worden genomen op basis van AI-gegenereerde content. Dienstverlener aanvaardt geen aansprakelijkheid voor schade die voortvloeit uit het handelen op basis van AI-gegenereerde aanbevelingen.</p>
        <p style={S.p}>4.5. Gebruikersgegevens die worden verwerkt door AI-systemen van derden (waaronder Anthropic) vallen onder de privacyverklaring en de verwerkingsvoorwaarden van de betreffende dienstverlener.</p>

        <h2 style={S.h2}>5. Betalingen</h2>
        <p style={S.p}>5.1. Betaalde diensten worden gefactureerd via Stripe. Betaling geschiedt vooraf, tenzij schriftelijk anders overeengekomen.</p>
        <p style={S.p}>5.2. Alle genoemde prijzen zijn exclusief BTW, tenzij anders vermeld.</p>
        <p style={S.p}>5.3. Bij niet-tijdige betaling is Dienstverlener gerechtigd de toegang tot het Platform op te schorten totdat betaling is ontvangen.</p>
        <p style={S.p}>5.4. Abonnementen worden automatisch verlengd tenzij de Gebruiker minimaal 30 dagen voor het einde van de lopende termijn opzegt.</p>

        <h2 style={S.h2}>6. Herroepingsrecht</h2>
        <p style={S.p}>6.1. Voor digitale diensten die direct na aankoop worden geleverd (rapporten, analyses), doet de Gebruiker uitdrukkelijk afstand van het herroepingsrecht zodra de levering is gestart.</p>
        <p style={S.p}>6.2. De Gebruiker wordt hiervan op de hoogte gesteld v\u00F3\u00F3r de aankoop en bevestigt dit door het afronden van de betaling.</p>

        <h2 style={S.h2}>7. Aansprakelijkheid</h2>
        <p style={S.p}>7.1. Dienstverlener is uitsluitend aansprakelijk voor directe schade die het gevolg is van een aantoonbare tekortkoming in de nakoming van de overeenkomst.</p>
        <p style={S.p}>7.2. De totale aansprakelijkheid van Dienstverlener is te allen tijde beperkt tot het bedrag dat de Gebruiker heeft betaald voor de betreffende dienst in de 12 maanden voorafgaand aan de schadeveroorzakende gebeurtenis, met een maximum van \u20AC1.000,-.</p>
        <p style={S.p}>7.3. Dienstverlener is niet aansprakelijk voor:</p>
        <ul style={S.ul}>
          <li>Indirecte schade, gevolgschade, gederfde winst of gemiste besparingen</li>
          <li>Schade als gevolg van het gebruik van AI-gegenereerde content</li>
          <li>Schade als gevolg van onjuiste of onvolledige informatie verstrekt door de Gebruiker</li>
          <li>Schade als gevolg van onbeschikbaarheid van het Platform</li>
          <li>Schade als gevolg van handelen of nalaten van derden</li>
          <li>Onjuiste benchmarkgegevens, sectorvergelijkingen of marktanalyses</li>
        </ul>

        <h2 style={S.h2}>8. Garantie</h2>
        <p style={S.p}>8.1. Dienstverlener garandeert dat het Platform met redelijke zorg en vakmanschap wordt onderhouden.</p>
        <p style={S.p}>8.2. Dienstverlener geeft geen garantie op specifieke resultaten, conversiepercentages, besparingen, kandidaataantallen of andere uitkomsten die in rapporten worden genoemd.</p>
        <p style={S.p}>8.3. Het Platform wordt aangeboden "as is" en "as available". Dienstverlener garandeert geen ononderbroken of foutloze werking.</p>

        <h2 style={S.h2}>9. Intellectueel eigendom</h2>
        <p style={S.p}>9.1. Alle intellectuele eigendomsrechten op het Platform, de software, methoden, templates en content berusten bij Dienstverlener.</p>
        <p style={S.p}>9.2. Rapporten die zijn gegenereerd voor de Gebruiker mogen door de Gebruiker intern worden gebruikt. Verspreiding, publicatie of doorverkoop zonder toestemming is niet toegestaan.</p>
        <p style={S.p}>9.3. De Gebruiker verleent Dienstverlener het recht om geanonimiseerde en geaggregeerde gegevens te gebruiken voor het verbeteren van het Platform en het opstellen van sectorgemiddelden.</p>

        <h2 style={S.h2}>10. Vertrouwelijkheid</h2>
        <p style={S.p}>10.1. Alle door de Gebruiker verstrekte gegevens worden vertrouwelijk behandeld conform onze <Link to="/privacy" style={{ color: '#09aedd' }}>privacyverklaring</Link>.</p>
        <p style={S.p}>10.2. Rapporten zijn vertrouwelijk en uitsluitend bestemd voor de Gebruiker die het assessment heeft ingevuld.</p>

        <h2 style={S.h2}>11. Overmacht</h2>
        <p style={S.p}>11.1. In geval van overmacht (waaronder storingen bij derden, internetuitval, stroomuitval, wijzigingen in wet- of regelgeving, of pandemie) is Dienstverlener niet gehouden tot het nakomen van enige verplichting.</p>

        <h2 style={S.h2}>12. Wijzigingen</h2>
        <p style={S.p}>12.1. Dienstverlener behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen treden in werking 30 dagen na publicatie op het Platform.</p>

        <h2 style={S.h2}>13. Toepasselijk recht en geschillen</h2>
        <p style={S.p}>13.1. Op deze voorwaarden en alle overeenkomsten is Nederlands recht van toepassing.</p>
        <p style={S.p}>13.2. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Gelderland.</p>

        <h2 style={S.h2}>14. Contact</h2>
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
