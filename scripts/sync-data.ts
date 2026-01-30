import { Storage } from "@google-cloud/storage";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Cargar variables de .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function sync() {
    const projectId = process.env.GCP_PROJECT_ID || "enhanced-gizmo-484919-g9";
    const bucketName = process.env.SIGNED_GCS_BUCKET_NAME || process.env.GCS_BUCKET_NAME;
    const serviceAccountRaw = process.env.GCP_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS;

    function tryParseServiceAccount(raw: string | undefined) {
        if (!raw) return null;
        const trimmed = raw.trim();
        if (trimmed.startsWith("{")) return JSON.parse(trimmed);
        if (trimmed.endsWith(".json") && fs.existsSync(trimmed)) {
            return JSON.parse(fs.readFileSync(trimmed, "utf-8"));
        }
        // Soporte para Base64 (GitHub Actions friendly)
        try {
            const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
            if (decoded.startsWith("{")) return JSON.parse(decoded);
        } catch (e) {
            // No era base64 o falló el parse
        }
        return null;
    }

    const credentials = tryParseServiceAccount(serviceAccountRaw);

    if (!projectId || !bucketName || !credentials) {
        console.error("Missing env vars for sync. Need GCP_PROJECT_ID, BUCKET and credentials.");
        process.exit(1);
    }

    const storage = new Storage({ projectId, credentials });
    const dataDir = path.join(process.cwd(), "public", "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // Mapeo original para asegurar compatibilidad
    const rawMap = process.env.SIGNED_OBJECT_MAP;
    const objects: Record<string, string> = rawMap ? JSON.parse(rawMap) : {
        headline: "prod/exports/headline.json",
        airline_breakdown: "prod/exports/airline_breakdown.json",
        tops: "prod/exports/tops.json",
        bucket_distribution: "prod/exports/bucket_distribution.json",
        daily_status: "prod/exports/daily_status.json",
        routes_metrics: "prod/exports/routes_metrics.json",
    };

    // Autodetectar gates_analysis si no está en el mapa (mismo path que headline)
    if (!objects.gates_analysis && objects.headline) {
        const headlinePath = objects.headline;
        const lastSlash = headlinePath.lastIndexOf("/");
        objects.gates_analysis = lastSlash >= 0
            ? `${headlinePath.slice(0, lastSlash + 1)}gates_analysis.json`
            : "gates_analysis.json";
    }

    console.log("Downloading files from GCS...");
    for (const [key, filePath] of Object.entries(objects)) {
        try {
            const destination = path.join(dataDir, `${key}.json`);
            await storage.bucket(bucketName).file(filePath).download({ destination });
            console.log(`✓ ${key} synced`);
        } catch (e) {
            console.warn(`⚠ ${key} not found in bucket (tried ${filePath})`);
        }
    }

    // Seccion de Gates: el archivo que baja puede ser gates_analysis.json o gates.json
    // El frontend busca manifest.urls.gates_analysis, asi que nos aseguramos que apunte al descargado
    const manifestUrls: Record<string, string> = {};
    for (const key of Object.keys(objects)) {
        manifestUrls[key] = `./data/${key}.json`;
    }

    // Create manifest.json for the frontend
    const EXPIRATION_HOURS = 6;
    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + EXPIRATION_HOURS * 60 * 60 * 1000);

    const manifest = {
        generated_at: generatedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        urls: manifestUrls
    };

    fs.writeFileSync(path.join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("✓ manifest.json created");
}

sync().catch(console.error);
