import { NextResponse } from "next/server"
import { BigQuery } from "@google-cloud/bigquery"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface GateMetrics {
    gate: string
    total_flights: number
    avg_delay_minutes: number
    delayed_flights: number
    on_time_flights: number
    on_time_percentage: number
    max_delay_minutes: number
    time_distribution: number[]
}

function tryParseServiceAccount(raw: string | undefined) {
    if (!raw) return null

    const trimmed = raw.trim()
    if (!trimmed) return null

    if (trimmed.startsWith("{")) {
        return JSON.parse(trimmed)
    }

    if (trimmed.endsWith(".json")) {
        const fs = require("node:fs")
        if (fs.existsSync(trimmed)) {
            const fileContents = fs.readFileSync(trimmed, "utf-8")
            return JSON.parse(fileContents)
        }
    }

    try {
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8")
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

function parseServiceAccount() {
    const candidates = [
        process.env.GCP_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
    ]

    for (const candidate of candidates) {
        const parsed = tryParseServiceAccount(candidate)
        if (parsed) return parsed
    }

    throw new Error(
        "Invalid service account JSON. Provide raw JSON, base64 JSON, or a path to a JSON key file."
    )
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    let serviceAccount = null
    try {
        serviceAccount = parseServiceAccount()
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to parse service account JSON",
            },
            { status: 500 }
        )
    }

    const projectId =
        serviceAccount?.project_id ||
        process.env.GCP_PROJECT_ID ||
        process.env.NEXT_PUBLIC_GCP_PROJECT_ID

    const bigquery = new BigQuery(
        serviceAccount
            ? {
                projectId,
                credentials: {
                    client_email: serviceAccount.client_email,
                    private_key: serviceAccount.private_key,
                },
            }
            : { projectId }
    )

    const query = `
    SELECT 
      gate,
      COUNT(*) as total_flights,
      ROUND(AVG(delay_minutes), 1) as avg_delay_minutes,
      SUM(CASE WHEN delay_minutes > 0 THEN 1 ELSE 0 END) as delayed_flights,
      SUM(CASE WHEN delay_minutes <= 0 THEN 1 ELSE 0 END) as on_time_flights,
      ROUND(
        SAFE_DIVIDE(
          SUM(CASE WHEN delay_minutes <= 0 THEN 1 ELSE 0 END),
          COUNT(*)
        ) * 100, 
        1
      ) as on_time_percentage,
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
    FROM \`enhanced-gizmo-484919-g9.marts.flights_performance\`
    WHERE gate IS NOT NULL AND gate != '' AND TRIM(gate) != ''
    GROUP BY gate
    ORDER BY total_flights DESC
    LIMIT @limit
  `

    try {
        const [rows] = await bigquery.query({
            query,
            params: { limit },
        })

        const data: GateMetrics[] = (rows as Record<string, unknown>[]).map((row) => {
            // Build hourly array
            const time_distribution = Array.from({ length: 24 }, (_, i) => {
                const key = `h${i.toString().padStart(2, '0')}`
                return Number(row[key] || 0)
            })

            return {
                gate: String(row.gate || ""),
                total_flights: Number(row.total_flights || 0),
                avg_delay_minutes: Number(row.avg_delay_minutes || 0),
                delayed_flights: Number(row.delayed_flights || 0),
                on_time_flights: Number(row.on_time_flights || 0),
                on_time_percentage: Number(row.on_time_percentage || 0),
                max_delay_minutes: Number(row.max_delay_minutes || 0),
                time_distribution,
            }
        })

        const response = NextResponse.json({
            data,
            metadata: {
                total_gates: data.length,
                fetched_at: new Date().toISOString(),
            },
        })

        response.headers.set(
            "Cache-Control",
            `s-maxage=3600, stale-while-revalidate=3600, max-age=0`
        )

        return response
    } catch (error) {
        console.error("Failed to fetch gates data:", error)
        return NextResponse.json(
            { error: "Failed to fetch gates data" },
            { status: 500 }
        )
    }
}
