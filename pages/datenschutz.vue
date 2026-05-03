<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">
        <h1 class="text-h5 font-weight-bold mb-2">Datenschutzerklärung</h1>
        <p class="text-caption text-medium-emphasis mb-6">Stand: Mai 2026</p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">1. Verantwortlicher</h2>
        <p class="text-body-2 mb-3">
          Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne
          der Datenschutz-Grundverordnung (DSGVO) ist:
        </p>
        <p class="text-body-2 mb-1">Diana Renz</p>
        <p class="text-body-2 mb-1">Hardenbergstr. 24</p>
        <p class="text-body-2 mb-1">80992 München, Deutschland</p>
        <p class="text-body-2 mb-3">E-Mail: d.renz@huntrees.com</p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">2. Allgemeine Hinweise</h2>
        <p class="text-body-2 mb-3">
          Diese Website wird ausschließlich privat im Familien- und
          Freundeskreis betrieben. Sie dient der Verwaltung der Belegung einer
          privat genutzten Wohnung am Gardasee und stellt redaktionelle Inhalte
          zur Region bereit. Es findet keine kommerzielle Vermietung und keine
          Erzielung von Einkünften statt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">3. Hosting</h2>
        <p class="text-body-2 mb-3">
          Diese Website wird auf <strong>Firebase Hosting</strong> der Google
          LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) gehostet.
          Beim Aufruf der Seiten werden technisch erforderliche Verbindungsdaten
          (IP-Adresse, Datum/Uhrzeit, abgerufene URL, User-Agent) durch den
          Hosting-Anbieter verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
          DSGVO (berechtigtes Interesse am sicheren Betrieb der Website).
        </p>
        <p class="text-body-2 mb-3">
          Mit Google ist ein Vertrag zur Auftragsverarbeitung gemäß Art. 28
          DSGVO geschlossen. Eine Übermittlung in die USA findet auf Grundlage
          der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) statt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">4. Registrierung und Konto</h2>
        <p class="text-body-2 mb-3">
          Eine Registrierung ist ausschließlich über persönliche Einladungslinks
          möglich. Bei der Registrierung erheben wir folgende Daten:
        </p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>E-Mail-Adresse (für die Anmeldung)</li>
          <li>Name (bei Gastkonten)</li>
          <li>Telefonnummer (optional, bei Gastkonten)</li>
          <li>Verschlüsselter Passwort-Hash (durch Firebase Authentication)</li>
        </ul>
        <p class="text-body-2 mb-3">
          Die Verarbeitung erfolgt zur Erfüllung des Nutzungsverhältnisses
          (Art. 6 Abs. 1 lit. b DSGVO). Die Authentifizierung wird durch
          <strong>Firebase Authentication</strong> der Google LLC bereitgestellt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">5. Buchungsanfragen und Kalender</h2>
        <p class="text-body-2 mb-3">
          Wenn Sie eine Buchungsanfrage stellen, speichern wir die folgenden
          Angaben in <strong>Cloud Firestore</strong> (Google LLC):
        </p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>Name, E-Mail, Telefon (sofern angegeben)</li>
          <li>Gewünschte An- und Abreisedaten</li>
          <li>Notizen zur Anfrage</li>
          <li>Status der Anfrage (offen, bestätigt, abgelehnt, storniert)</li>
        </ul>
        <p class="text-body-2 mb-3">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung
          (vor-)vertraglicher Pflichten im Rahmen der privaten Nutzung).
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">6. E-Mail-Benachrichtigungen</h2>
        <p class="text-body-2 mb-3">
          Bei neuen Anfragen sowie bei Bestätigung oder Ablehnung versenden wir
          E-Mail-Benachrichtigungen über den Dienst <strong>EmailJS Inc.</strong>
          (USA — siehe
          <a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von EmailJS</a>).
          Übermittelt werden Name, E-Mail-Adresse, gewählte Daten und ggf.
          Anmerkungen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">7. Bilder und Inhalte des Reiseführers</h2>
        <p class="text-body-2 mb-3">
          Fotos der Wohnung und redaktionelle Inhalte werden in
          <strong>Firebase Storage</strong> bzw. Cloud Firestore (Google LLC)
          gespeichert. Es werden ausschließlich vom Betreiber hochgeladene
          Inhalte ohne personenbezogene Daten der Nutzer gespeichert.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">8. Cookies und lokaler Speicher</h2>
        <p class="text-body-2 mb-3">
          Diese Website verwendet ausschließlich technisch notwendige
          Speichertechniken, die für den Betrieb erforderlich sind. Eine
          Einwilligung gemäß § 25 Abs. 1 TTDSG ist daher nicht erforderlich
          (§ 25 Abs. 2 TTDSG).
        </p>
        <p class="text-body-2 mb-1"><strong>Cookies:</strong></p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>
            <code>i18n_redirected</code> — speichert die ausgewählte
            Sprache (gesetzt durch das Modul <code>@nuxtjs/i18n</code>).
            Lebensdauer: 1 Jahr.
          </li>
        </ul>
        <p class="text-body-2 mb-1"><strong>LocalStorage / IndexedDB:</strong></p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>Anmelde-Sitzung (Firebase Authentication)</li>
          <li>Bestätigung des Cookie-Hinweises (<code>garda.cookieNoticeAcked</code>)</li>
        </ul>
        <p class="text-body-2 mb-3">
          Es werden keine Analyse-, Tracking- oder Marketing-Cookies eingesetzt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">9. Auftragsverarbeiter</h2>
        <p class="text-body-2 mb-3">
          Wir setzen folgende Dienste als Auftragsverarbeiter im Sinne von
          Art. 28 DSGVO ein:
        </p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>
            <strong>Google LLC</strong> (USA) — Firebase Hosting, Firebase
            Authentication, Cloud Firestore, Firebase Storage. Datenverarbeitung
            in der Region <code>us-central1</code>.
          </li>
          <li>
            <strong>EmailJS Inc.</strong> (USA) — Versand von
            E-Mail-Benachrichtigungen.
          </li>
        </ul>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">10. Datenübermittlung in Drittländer</h2>
        <p class="text-body-2 mb-3">
          Die genannten Dienste verarbeiten Daten in den USA. Die Übermittlung
          erfolgt auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2
          lit. c DSGVO) sowie — soweit anwendbar — auf Grundlage des
          EU-US Data Privacy Framework. Trotz dieser Schutzmaßnahmen können
          US-Behörden unter Umständen auf die Daten zugreifen.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">11. Speicherdauer</h2>
        <p class="text-body-2 mb-3">
          Konto- und Buchungsdaten werden gespeichert, solange das Konto
          besteht oder solange die Daten zur Verwaltung früherer Aufenthalte
          benötigt werden. Auf Anfrage löschen wir Ihre Daten unverzüglich,
          sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">12. Ihre Rechte</h2>
        <p class="text-body-2 mb-3">
          Ihnen stehen jederzeit folgende Rechte zu:
        </p>
        <ul class="text-body-2 mb-3 pl-6">
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p class="text-body-2 mb-3">
          Bitte richten Sie entsprechende Anfragen an die im Impressum
          genannte E-Mail-Adresse.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">13. Beschwerderecht</h2>
        <p class="text-body-2 mb-3">
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
          zu beschweren (Art. 77 DSGVO). Eine Liste der Aufsichtsbehörden
          finden Sie unter:
          <a href="https://www.bfdi.bund.de/DE/Service/Anschriften/anschriften_node.html" target="_blank" rel="noopener noreferrer">
            www.bfdi.bund.de</a>.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">14. Änderungen dieser Erklärung</h2>
        <p class="text-body-2 mb-3">
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn
          sich die Rechtslage oder unsere Verarbeitung ändert. Die jeweils
          aktuelle Version ist auf dieser Seite abrufbar.
        </p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

useHead({
  title: "Datenschutz",
  htmlAttrs: { lang: "de" },
});
</script>
