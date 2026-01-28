"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/components/dashboard/faq-data"

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
