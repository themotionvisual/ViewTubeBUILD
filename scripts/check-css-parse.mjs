import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const cssPath = path.resolve(process.cwd(), "src/index.css");
const cssText = await fs.readFile(cssPath, "utf8");

try {
  postcss.parse(cssText, { from: cssPath });
  console.log("CSS parse OK:", cssPath);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("CSS parse failed:", message);
  process.exit(1);
}
