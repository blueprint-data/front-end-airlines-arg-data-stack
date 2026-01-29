# Airlines Data Argentina - Dashboard

Un dashboard interactivo construido con **Next.js/App Router** que expone métricas operativas y de puntualidad de las aerolíneas que operan desde Argentina. Integra visualizaciones hero, ranking, tendencias, buckets y gates para tomar decisiones rápidas sobre desempeño y demoras.

## 🔍 Qué resuelve

- Presentar los últimos **15 días** de demoras promedio con detalles en tooltip (desktop) y tarjetas explicativas (mobile).
- Mostrar el ranking de aerolíneas con porcentaje de puntualidad, vuelos y demora media, acompañado de filtros por origen, país, ciudad y aerolínea.
- Ofrecer buckets operativos, análisis de gates y rutas más movidas alimentados por datos frescos desde GCS/BigQuery.
- Automatizar lint, type-check, despliegue y releases semánticos (`vX.Y.Z`) siguiendo Conventional Commits.

## 🧱 Arquitectura y datos

- **Front-end**: Next.js 16.1.6 + TypeScript, Tailwind CSS, ShadcnUI y Recharts para los gráficos.
- **Pipeline**: El repositorio [`blueprint-data/airlines-arg-data-stack`](https://github.com/blueprint-data/airlines-arg-data-stack) genera los JSON firmados que terminan en el bucket de GCS consumido aquí. Esa fuente ejecuta las consultas en BigQuery, agrupa métricas históricas y publica los snapshots en `gs://`.
- **Sincronización**: `scripts/sync-data.ts` descarga los archivos firmados (`SIGNED_OBJECT_MAP`) desde el bucket (`SIGNED_GCS_BUCKET_NAME`) usando la cuenta del servicio (`GCP_SERVICE_ACCOUNT_JSON`) y los coloca en `data/` para el build.
- **Hosting**: GitHub Pages publica el contenido estático a partir del directorio `dist/` generado por `npm run build`.

## 📦 Instalación y desarrollo local

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   Rellena `.env.local` con:
   - `GCP_PROJECT_ID`
   - `SIGNED_GCS_BUCKET_NAME`
   - `GCP_SERVICE_ACCOUNT_JSON`
   - `SIGNED_OBJECT_MAP`

3. **Sincronizar los datos**
   ```bash
   npm run sync-data
   ```

4. **Levantar el servidor**
   ```bash
   npm run dev
   ```

5. **Construir (sin re-sincronizar); útil para workflows**
   ```bash
   npm run build:next
   ```

## ⚙️ GitHub Actions

### 1. CI (`.github/workflows/ci.yml`)

Cada push/PR a `main` instala dependencias y ejecuta `npm run lint` + `npx tsc --noEmit`.

### 2. Deploy (`.github/workflows/deploy.yml`)

Cada push y un cron cada 12h:
- Sincroniza los últimos JSON desde GCS (`npm run sync-data`).
- Corre `next build` completo, copia el contenido a `dist/` y lo publica en GitHub Pages.

### 3. Release (`.github/workflows/release.yml` + `.releaserc.json`)

- Produce `dist.tar.gz` con `npm run build:next`.
- Ejecuta `semantic-release` (Conventional Commits) para calcular el siguiente `vX.Y.Z`, crear notas y publicar en GitHub Releases, adjuntando el artefacto.
- Los tipos de commit (`feat`, `fix`, `perf`, `docs`, `ci`, `chore`) aparecen en secciones separadas del changelog.

## 🔁 Versionamiento semántico

- Usa Conventional Commits al escribir `feat/`, `fix/`, `perf/` o similares.
- `semantic-release` (configurado en `.releaserc.json`) analiza la historia, sube el release y etiqueta automáticamente en `main`.
- Si necesitás un `vX.Y.Z` manual, podés crear el tag antes del push y la acción lo respetará.

## 📚 Recursos

- Repositorio de datos y consulta: [`blueprint-data/airlines-data`](https://github.com/blueprint-data/airlines-data).
- Bucket firmado y coordenadas en GCP: las mismas credenciales que aparecen en `.env.local`.

## 🏗️ Para contribuir

1. Corre `npm run lint` y `npx tsc --noEmit` localmente antes de mandar el PR.
2. Etiqueta los commits con Conventional Commits para que `semantic-release` detecte la magnitud del cambio.
3. Verifica el draft de release generado por GitHub antes de mergear, especialmente si incluíste nuevos assets.

---
*Dashboard mantenido por Blueprintdata con datos de la aviación argentina.*
