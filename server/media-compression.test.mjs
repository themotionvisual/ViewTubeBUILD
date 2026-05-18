import { describe, expect, it } from "vitest"
import { parseMultipartSingleFile } from "./media-compression.mjs"

const buildMultipart = ({ boundary, mode, filename, mimeType, content }) => {
  const CRLF = "\r\n"
  const chunks = [
    `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name=\"mode\"${CRLF}${CRLF}` +
      `${mode}${CRLF}`,
    `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name=\"file\"; filename=\"${filename}\"${CRLF}` +
      `Content-Type: ${mimeType}${CRLF}${CRLF}`,
  ]

  const start = Buffer.from(chunks.join(""), "utf8")
  const payload = Buffer.from(content, "utf8")
  const end = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, "utf8")
  return Buffer.concat([start, payload, end])
}

describe("parseMultipartSingleFile", () => {
  it("extracts mode and file part", () => {
    const boundary = "----vtBoundary"
    const body = buildMultipart({
      boundary,
      mode: "analysis",
      filename: "clip.mp4",
      mimeType: "video/mp4",
      content: "abc123",
    })

    const parsed = parseMultipartSingleFile(body, boundary)
    expect(parsed.mode).toBe("analysis")
    expect(parsed.filePart?.filename).toBe("clip.mp4")
    expect(parsed.filePart?.mimeType).toBe("video/mp4")
    expect(parsed.filePart?.data.toString("utf8")).toBe("abc123")
  })
})
