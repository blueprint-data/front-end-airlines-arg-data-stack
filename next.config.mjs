const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Solo aplicamos la ruta base en producción (GitHub Pages)
  basePath: isProd ? '/front-end-airlines-arg-data-stack' : '',
  assetPrefix: isProd ? '/front-end-airlines-arg-data-stack/' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
