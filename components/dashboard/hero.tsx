import { motion, useReducedMotion } from "framer-motion"
import { formatDateShort } from "@/lib/format"
import { memo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

interface HeroProps {
  generatedAt?: string
  lookbackDays?: number
}

export const Hero = memo(function Hero({ generatedAt, lookbackDays }: HeroProps) {
  const dateLabel = generatedAt ? formatDateShort(generatedAt) : "";
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "30 días"
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const reduceMotion = prefersReducedMotion || isMobile
  const baseTransition = reduceMotion ? { duration: 0 } : { duration: 0.5 }
  const baseInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }

  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16">

      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.span
          initial={baseInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTransition}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-mono font-medium text-primary backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse motion-reduce:animate-none rounded-full bg-primary" />
          DATOS HISTÓRICOS - ÚLTIMOS {windowLabel}
        </motion.span>

        <motion.h1
          initial={baseInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.1 }}
          className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance"
        >
          InfoAeropuertos<br />
          <span className="text-primary text-glow-primary">Argentina</span>
        </motion.h1>
        <motion.p
          initial={baseInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.2 }}
          className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-medium leading-relaxed"
        >
          Compará el desempeño real de los vuelos que salen de Argentina.
          <span className="block mt-2 text-foreground/80">Chequeá puntualidad, demoras y cancelaciones en tiempo real.</span>
        </motion.p>

        <motion.div
          initial={baseInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...baseTransition, delay: reduceMotion ? 0 : 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs "
        >
          <span>Desarrollado por</span>
          <div className="flex items-center gap-1">
            <Image
              src="/blue-logo.svg"
              alt="blueprintdata"
              width={16}
              height={16}
              className="opacity-70"
            />
            <span className="font-medium">blueprintdata</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
})

Hero.displayName = "Hero"
