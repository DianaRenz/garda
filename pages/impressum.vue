<template>
  <VContainer class="py-8">
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8">
        <h1 class="text-h5 font-weight-bold mb-6">Impressum</h1>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Angaben gemäß § 5 DDG</h2>
        <p class="text-body-2 mb-1">Diana Renz</p>
        <p class="text-body-2 mb-1">Hardenbergstr. 24</p>
        <p class="text-body-2 mb-1">80992 München</p>
        <p class="text-body-2 mb-1">Deutschland</p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Kontakt</h2>
        <p class="text-body-2 mb-1">E-Mail: d.renz@huntrees.com</p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p class="text-body-2 mb-1">Diana Renz</p>
        <p class="text-body-2 mb-1">Anschrift wie oben</p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Hinweis zur Nutzung</h2>
        <p class="text-body-2 mb-3">
          Diese Website wird nicht-kommerziell betrieben. Die hier vorgestellte
          Wohnung am Gardasee wird ausschließlich privat im Familien- und
          Freundeskreis genutzt und nicht vermietet. Es werden keine Einkünfte
          aus der Nutzung der Wohnung erzielt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Haftung für Inhalte</h2>
        <p class="text-body-2 mb-3">
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder
          nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung
          von Informationen nach den allgemeinen Gesetzen bleiben hiervon
          unberührt.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Haftung für Links</h2>
        <p class="text-body-2 mb-3">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
          der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt
          der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
          Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>

        <h2 class="text-h6 font-weight-bold mt-6 mb-3">Urheberrecht</h2>
        <p class="text-body-2 mb-3">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers.
        </p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

useHead({
  title: "Impressum",
  htmlAttrs: { lang: "de" },
});
</script>
