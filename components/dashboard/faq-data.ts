export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
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
