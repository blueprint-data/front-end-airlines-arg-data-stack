"use client"

import Image from "next/image"
import { formatDateShort } from "@/lib/format"
import { Github, Linkedin, Globe, Mail, Plane } from "lucide-react"

interface FooterProps {
  generatedAt?: string
  lookbackDays?: number
}

export function Footer({ generatedAt, lookbackDays }: FooterProps) {
  const dateLabel = generatedAt ? formatDateShort(generatedAt) : ""
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "60 días"

  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto max-w-5xl px-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/blue-logo.svg"
            alt="Blueprintdata Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="font-bold text-foreground">Blueprintdata</span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <a
            href="https://www.linkedin.com/company/bpdata/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/blueprint-data"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://x.com/blueprintdata_"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="X (Twitter)"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-current"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <a
            href="https://www.blueprintdata.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            aria-label="Sitio principal"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              blueprintdata.xyz
            </span>
          </a>
          <span className="text-muted-foreground/40">•</span>
          <a
            href="mailto:contact@blueprintdata.xyz"
            className="hover:text-primary transition-colors"
            aria-label="Contacto"
          >
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              contact@blueprintdata.xyz
            </span>
          </a>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-mono text-muted-foreground">
            Los datos mostrados corresponden a una ventana móvil de {windowLabel} y son
            de carácter informativo.
          </p>
          <p className="text-xs font-mono text-muted-foreground/70">
            <span className="inline-flex items-center gap-2">
              <Plane className="h-3 w-3" />
              FUENTE: Datos públicos de
              <a
                href="https://www.aeropuertosargentina.com/es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                aeropuertosargentina.com
              </a>
            </span>
            {dateLabel ? ` // ÚLTIMA ACTUALIZACIÓN: ${dateLabel}` : ""}
          </p>
        </div>
      </div>
    </footer>
  )
}
