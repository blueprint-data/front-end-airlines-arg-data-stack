# Airlines Data Argentina - Dashboard

Un visor dinámico de métricas de aerolíneas en Argentina, diseñado para analizar puntualidad, demoras y tendencias del mercado aeronáutico.

## 🚀 Características

- **Visualizaciones Impactantes**: Gráficos de tendencias, distribución de vuelos (bucketing) y análisis de rankings.
- **Grillas Dinámicas**: Exploración profunda de rutas y métricas por aerolínea.
- **Análisis de Puertas (Gates)**: Optimización y puntualidad por cada gate del aeropuerto.
- **Arquitectura Serverless**: Despliegue estático en GitHub Pages con actualización automática de datos.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + ShadcnUI
- **Gráficos**: Recharts
- **Data Source**: Google Cloud Storage & Google BigQuery

## 📦 Instalación y Desarrollo Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` con las siguientes claves:
    - `GCP_PROJECT_ID`
    - `SIGNED_GCS_BUCKET_NAME`
    - `GCP_SERVICE_ACCOUNT_JSON`
    - `SIGNED_OBJECT_MAP`

3.  **Sincronizar datos (Local Bake)**:
    ```bash
    npm run sync-data
    ```

4.  **Iniciar servidor**:
    ```bash
    npm run dev
    ```

## 🚢 Despliegue Automático

El proyecto utiliza **GitHub Actions** para automatizar el ciclo de vida:

- **CI (Continuous Integration)**: En cada push se validan tipos (TS) y linting.
- **CD (Continuous Deployment)**: 
    - Se ejecuta un **Cron Job cada 12 horas**.
    - La Action descarga los últimos JSON de GCS.
    - Ejecuta consultas frescas a BigQuery para el análisis de Gates.
    - Genera el build estático y lo publica en **GitHub Pages**.

### Configuración en GitHub
Recuerda configurar los **Actions Secrets** con las mismas llaves del `.env.local`.

---
*Mantenimiento automático desatendido 24/7.*
