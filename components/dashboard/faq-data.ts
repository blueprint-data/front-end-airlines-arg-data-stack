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
      "Cada 12 horas se cargan nuevos datos, así siempre ves la tendencia más reciente.",
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
  {
    id: "faq-07",
    question: "¿Cuál es la aerolínea más puntual en Argentina?",
    answer:
      "Depende del período analizado. Usá el ranking del dashboard para ver qué aerolíneas vienen rindiendo mejor en los últimos días.",
  },
  {
    id: "faq-08",
    question: "¿Por qué hay demoras en los vuelos?",
    answer:
      "Las demoras pueden deberse al clima, congestión aeroportuaria, disponibilidad de aeronaves o cuestiones operativas. El dashboard te ayuda a comparar desempeño por aerolínea y ruta.",
  },
  {
    id: "faq-09",
    question: "¿Qué aerolínea cancela menos vuelos?",
    answer:
      "Varía según el período y la ruta. Filtrá por aerolínea para ver su tasa de cancelaciones y compararla con el promedio.",
  },
  {
    id: "faq-10",
    question: "¿Cómo uso el ranking para elegir mejor un vuelo?",
    answer:
      "Primero elegí tu aeropuerto de origen y destino, y después compará aerolíneas. Una diferencia pequeña en puntualidad puede traducirse en muchas horas ahorradas a lo largo del tiempo.",
  },
  {
    id: "faq-11",
    question: "¿Los datos incluyen demoras y cancelaciones?",
    answer:
      "Sí. Vas a ver vuelos a tiempo, demoras por rangos y cancelaciones para analizar el desempeño completo.",
  },
  {
    id: "faq-12",
    question: "¿De dónde salen los datos y cómo se procesan?",
    answer:
      "Se basan en fuentes públicas de Aeropuertos Argentina y se procesan para que puedas analizarlos rápido. Se publican en una actualización automática cada 12 horas.",
  },
]
