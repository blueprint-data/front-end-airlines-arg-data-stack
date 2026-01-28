"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQ_ITEMS = [
  {
    id: "faq-01",
    question: "¿Qué puedo ver en este dashboard de aerolíneas?",
    answer:
      "Comparás puntualidad, demoras y cancelaciones de vuelos que salen de Argentina, por aerolínea y destino.",
  },
  {
    id: "faq-02",
    question: "¿Cómo me ayuda a elegir vuelos?",
    answer:
      "Te muestra qué aerolíneas y rutas vienen rindiendo mejor para decidir con datos reales, no con intuición.",
  },
  {
    id: "faq-03",
    question: "¿De dónde salen los datos?",
    answer:
      "Se basan en fuentes públicas de Aeropuertos Argentina y se procesan para que puedas analizarlos rápido.",
  },
  {
    id: "faq-04",
    question: "¿Cada cuánto se actualiza?",
    answer:
      "Cada 12 horas nuestra pagina carga la nueva informacion, así siempre ves la tendencia más reciente.",
  },
  {
    id: "faq-05",
    question: "¿Puedo filtrar por origen, destino y aerolínea?",
    answer:
      "Sí. Podés filtrar por aeropuerto de origen, país/ciudad de destino y aerolínea.",
  },
  {
    id: "faq-06",
    question: "¿Qué significa “puntualidad”?",
    answer:
      "Vuelos a tiempo o temprano frente a demoras agrupadas por rangos.",
  },
]

export function FAQ() {
  return (
    <section className="cv-auto mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-3xl border border-white/5 bg-card/20 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/60">
            FAQ
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">
            Respuestas rápidas para decidir mejor
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todo lo esencial sobre puntualidad, demoras y cómo usar el dashboard.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
