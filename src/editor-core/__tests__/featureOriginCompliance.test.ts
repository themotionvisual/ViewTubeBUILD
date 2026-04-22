import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN_IMPORT_MARKERS = [
  "docs/Gemini Pro Video Editors",
  "docs/HTML/CLINE_VIDX_V1.html",
  "docs/HTML/CLINE_VIDX_V2.html",
  "89f8f",
  "08b36",
  "53880",
  "45039",
  "6882b",
];

const readAllFiles = (rootDir: string): string[] => {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];
  entries.forEach((entry) => {
    const next = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllFiles(next));
      return;
    }
    if (next.endsWith(".ts") || next.endsWith(".tsx")) {
      files.push(next);
    }
  });
  return files;
};

describe("feature origin compliance", () => {
  it("does not import numbered reference codebases into runtime modules", () => {
    const roots = [
      path.resolve(process.cwd(), "src/editor-core"),
      path.resolve(process.cwd(), "src/editor-ui"),
    ];
    const files = roots.flatMap(readAllFiles);

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      const importLikeLines = content
        .split("\n")
        .filter((line) => line.includes("import") || line.includes("require("));
      FORBIDDEN_IMPORT_MARKERS.forEach((marker) => {
        const found = importLikeLines.some((line) => line.includes(marker));
        expect(found, `${file} imports forbidden marker ${marker}`).toBe(false);
      });
    });
  });
});
