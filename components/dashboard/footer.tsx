"use client"

import { memo } from "react"
import Image from "next/image"
import { formatDateShort } from "@/lib/format"
import { asset } from "@/lib/utils"
import { Github, Linkedin, Globe, Mail, Plane } from "lucide-react"

interface FooterProps {
  generatedAt?: string
  lookbackDays?: number
}

export const Footer = memo(function Footer({ generatedAt, lookbackDays }: FooterProps) {
  const dateLabel = generatedAt ? formatDateShort(generatedAt) : ""
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "60 días"

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-5xl px-4 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src={asset("/blue-logo.svg")}
            alt="Blueprintdata Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="font-bold text-foreground">Blueprintdata</span>
        </div>

        <div className="flex items-center gap-6 text-muted-foreground">
          <a
            href="https://www.linkedin.com/company/bpdata/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-all hover:scale-110 active:scale-90"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/blueprint-data"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-all hover:scale-110 active:scale-90"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://x.com/blueprintdata_"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-all hover:scale-110 active:scale-90"
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

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a
            href="https://www.blueprintdata.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors hover:underline underline-offset-4"
            aria-label="Sitio principal"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              blueprintdata.xyz
            </span>
          </a>
          <a
            href="https://blueprintdata.xyz/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors hover:underline underline-offset-4"
            aria-label="Blog"
          >
            Blog
          </a>
          <a
            href="mailto:contact@blueprintdata.xyz"
            className="hover:text-primary transition-colors hover:underline underline-offset-4"
            aria-label="Contacto"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              contact@blueprintdata.xyz
            </span>
          </a>
        </nav>

        <div className="text-center space-y-3 pt-4 border-t border-border/20 w-full max-w-sm">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Los datos mostrados corresponden a una ventana móvil de {windowLabel} y son
            de carácter informativo.
          </p>
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-tighter text-muted-foreground/60 uppercase">
              <Plane className="h-3 w-3" />
              FUENTE:
              <a
                href="https://www.aeropuertosargentina.com/es"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                aeropuertosargentina.com
              </a>
            </span>
            {dateLabel && (
              <span className="text-[10px] font-mono tracking-tighter text-muted-foreground/40 uppercase">
                Última actualización: {dateLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = "Footer"
