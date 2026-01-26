import { Storage } from "@google-cloud/storage";
import { BigQuery } from "@google-cloud/bigquery";
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
    const bigquery = new BigQuery({ projectId, credentials });

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

    console.log("Downloading files from GCS...");
    for (const [key, filePath] of Object.entries(objects)) {
        try {
            const destination = path.join(dataDir, `${key}.json`);
            await storage.bucket(bucketName).file(filePath).download({ destination });
            console.log(`✓ ${key} synced`);
        } catch (e) {
            console.error(`Error syncing ${key}:`, e);
        }
    }

    console.log("Fetching BigQuery Gates data...");
    const bqQuery = `
    SELECT 
      gate,
      COUNT(*) as total_flights,
      ROUND(AVG(delay_minutes), 1) as avg_delay_minutes,
      SUM(CASE WHEN delay_minutes > 0 THEN 1 ELSE 0 END) as delayed_flights,
      SUM(CASE WHEN delay_minutes <= 0 THEN 1 ELSE 0 END) as on_time_flights,
      ROUND(SAFE_DIVIDE(SUM(CASE WHEN delay_minutes <= 0 THEN 1 ELSE 0 END), COUNT(*)) * 100, 1) as on_time_percentage,
      MAX(delay_minutes) as max_delay_minutes,
      -- Hourly distribution
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 0) as h00,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 1) as h01,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 2) as h02,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 3) as h03,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 4) as h04,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 5) as h05,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 6) as h06,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 7) as h07,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 8) as h08,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 9) as h09,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 10) as h10,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 11) as h11,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 12) as h12,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 13) as h13,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 14) as h14,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 15) as h15,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 16) as h16,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 17) as h17,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 18) as h18,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 19) as h19,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 20) as h20,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 21) as h21,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 22) as h22,
      COUNTIF(EXTRACT(HOUR FROM COALESCE(actual_timestamp, scheduled_timestamp)) = 23) as h23
    FROM \`${projectId}.marts.flights_performance\`
    WHERE gate IS NOT NULL AND gate != ''
    GROUP BY gate
    ORDER BY total_flights DESC
    LIMIT 100
  `;

    try {
        const [rows] = await bigquery.query(bqQuery);

        // Transform rows to include time_distribution array
        const formattedRows = rows.map((row: any) => {
            const time_distribution = Array.from({ length: 24 }, (_, i) => {
                const key = `h${i.toString().padStart(2, '0')}`;
                return Number(row[key] || 0);
            });

            return {
                gate: String(row.gate),
                total_flights: Number(row.total_flights),
                avg_delay_minutes: Number(row.avg_delay_minutes),
                delayed_flights: Number(row.delayed_flights),
                on_time_flights: Number(row.on_time_flights),
                on_time_percentage: Number(row.on_time_percentage),
                max_delay_minutes: Number(row.max_delay_minutes),
                time_distribution
            };
        });

        fs.writeFileSync(path.join(dataDir, "gates.json"), JSON.stringify(formattedRows));
        console.log("✓ gates.json synced");
    } catch (e) {
        console.error("Error fetching BigQuery:", e);
    }

    // Create manifest.json for the frontend
    const manifest = {
        generated_at: new Date().toISOString(),
        urls: {
            headline: "/data/headline.json",
            airline_breakdown: "/data/airline_breakdown.json",
            tops: "/data/tops.json",
            bucket_distribution: "/data/bucket_distribution.json",
            daily_status: "/data/daily_status.json",
            routes_metrics: "/data/routes_metrics.json",
            gates_analysis: "/data/gates.json"
        }
    };
    fs.writeFileSync(path.join(dataDir, "manifest.json"), JSON.stringify(manifest));
    console.log("✓ manifest.json created");
}

sync().catch(console.error);
