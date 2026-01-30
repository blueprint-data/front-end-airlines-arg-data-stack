import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { FAQ_ITEMS } from "@/components/dashboard/faq-data"

export default function DashboardPage() {
  const siteUrl = "https://infoaeropuertos.ar"
  const organizationJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Blueprintdata",
    url: "https://blueprintdata.xyz",
    logo: `${siteUrl}/blue-logo.svg`,
    sameAs: [
      "https://www.linkedin.com/company/bpdata/",
      "https://github.com/blueprint-data",
      "https://x.com/blueprintdata_",
    ],
  }
  const websiteJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Info Aeropuertos Argentina",
    url: siteUrl,
    inLanguage: "es-AR",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  }
  const datasetJson = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Puntualidad de Vuelos en Argentina",
    description:
      "Datos de puntualidad, demoras y cancelaciones de vuelos que operan desde aeropuertos de Argentina.",
    url: siteUrl,
    creator: {
      "@id": `${siteUrl}/#organization`,
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    license: "https://creativecommons.org/licenses/by/4.0/",
    distribution: {
      "@type": "DataDownload",
      contentUrl: `${siteUrl}/data/manifest.json`,
      encodingFormat: "application/json",
    },
    spatialCoverage: {
      "@type": "Place",
      name: "Argentina",
    },
    temporalCoverage: "P30D",
  }
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm font-mono text-muted-foreground">Cargando dashboard...</p>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </>
  )
}
