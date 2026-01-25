import Image from "next/image"
import Link from "next/link"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Image
                        src="/blue-logo.svg"
                        alt="Blueprintdata Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                    <span className="font-bold sm:inline-block">
                        Blueprintdata
                    </span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center">
                        {/* Add nav items here if needed later */}
                    </nav>
                </div>
            </div>
        </header>
    )
}
