import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"
import fs from "node:fs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DEFAULT_OBJECTS: Record<string, string> = {
  headline: "prod/exports/headline.json",
  airline_breakdown: "prod/exports/airline_breakdown.json",
  tops: "prod/exports/tops.json",
  bucket_distribution: "prod/exports/bucket_distribution.json",
  daily_status: "prod/exports/daily_status.json",
  routes_metrics: "prod/exports/routes_metrics.json",
}

function tryParseServiceAccount(raw: string | undefined) {
  if (!raw) return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed)
  }

  if (trimmed.endsWith(".json") && fs.existsSync(trimmed)) {
    const fileContents = fs.readFileSync(trimmed, "utf-8")
    return JSON.parse(fileContents)
  }

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf-8")
    return JSON.parse(decoded)
  } catch (error) {
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

function resolveObjectMap(): Record<string, string> {
  const rawMap = process.env.SIGNED_OBJECT_MAP
  if (!rawMap) return DEFAULT_OBJECTS
  const parsed = JSON.parse(rawMap)
  if (!parsed || typeof parsed !== "object") {
    throw new Error("SIGNED_OBJECT_MAP must be a JSON object")
  }
  return parsed
}

export async function GET() {
  const bucketName =
    process.env.SIGNED_GCS_BUCKET_NAME ||
    process.env.EXPORT_GCS_BUCKET_NAME ||
    process.env.GCS_BUCKET_NAME

  if (!bucketName) {
    return NextResponse.json(
      { error: "Missing bucket name" },
      { status: 500 }
    )
  }

  const expirationDays = Number(process.env.SIGNED_URL_EXPIRATION_DAYS || 7)
  const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
  const generatedAt = new Date()

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

  const storage = new Storage(
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

  const objects = resolveObjectMap()
  const urls: Record<string, string> = {}

  for (const [key, objectPath] of Object.entries(objects)) {
    const file = storage.bucket(bucketName).file(objectPath)
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: expiresAt,
      version: "v4",
    })
    urls[key] = url
  }

  const response = NextResponse.json({
    generated_at: generatedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    expiration_days: expirationDays,
    urls,
  })

  response.headers.set(
    "Cache-Control",
    `s-maxage=3600, stale-while-revalidate=3600, max-age=0`
  )

  return response
}
