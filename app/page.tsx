import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué puedo ver en este dashboard de aerolíneas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Comparás puntualidad, demoras y cancelaciones de vuelos que salen de Argentina, por aerolínea y destino.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo me ayuda a elegir vuelos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Te muestra qué aerolíneas y rutas vienen rindiendo mejor para decidir con datos reales, no con intuición.",
        },
      },
      {
        "@type": "Question",
        name: "¿De dónde salen los datos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Se basan en fuentes públicas de Aeropuertos Argentina y se procesan para que puedas analizarlos rápido.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cada cuánto se actualiza?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Usamos una ventana móvil de 30/60/90 días, así siempre ves la tendencia más reciente.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo filtrar por origen, destino y aerolínea?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Podés filtrar por aeropuerto de origen, país/ciudad de destino y aerolínea.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué significa “puntualidad”?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vuelos a tiempo o temprano frente a demoras agrupadas por rangos.",
        },
      },
    ],
  }

  return (
    <>
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
