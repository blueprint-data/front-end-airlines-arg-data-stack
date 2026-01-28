import { memo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { asset, cn } from "@/lib/utils"

export const Header = memo(function Header() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        const options: AddEventListenerOptions = { passive: true }
        window.addEventListener("scroll", handleScroll, options)
        return () => window.removeEventListener("scroll", handleScroll, options)
    }, [])

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-700",
                isScrolled
                    ? "rounded-b-[32px] border-b border-white/5 bg-background/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_35px_60px_-25px_rgba(2,6,23,0.55)]"
                    : "bg-gradient-to-b from-black/40 to-transparent border-transparent py-3"
            )}
        >
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
                <Link href="/" className="mr-4 flex items-center space-x-2 sm:mr-6 hover:opacity-80 transition-opacity">
                    <Image
                        src={asset("/blue-logo.svg")}
                        alt="Blueprintdata Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Blueprintdata
                    </span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center gap-4">
                        <a
                            href="https://blueprintdata.xyz/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:scale-105 active:scale-95"
                        >
                            Blog
                        </a>
                    </nav>
                </div>
            </div>
        </motion.header>
    )
})

Header.displayName = "Header"
