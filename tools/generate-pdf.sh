#!/usr/bin/env bash
# Generate PDF versions of the integration guides from their Markdown sources.
#
# The guides live in Markdown so they version with the code and show up in review
# diffs. PDFs are build output, not source -- generate them on demand for anyone
# who needs a file to hand over, and do not commit them.
#
#   ./tools/generate-pdf.sh [outdir]     # default outdir: ./build/docs
#
# Requires pandoc and Google Chrome. Both are used headlessly; nothing is uploaded.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$ROOT/build/docs}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

command -v pandoc >/dev/null || { echo "pandoc not found (brew install pandoc)" >&2; exit 1; }
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (override with CHROME=...)" >&2; exit 1; }

mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/style.css" <<'CSS'
@page { size: A4; margin: 18mm 16mm; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.5;
       color: #111; max-width: none; }
h1 { font-size: 20pt; border-bottom: 2px solid #333; padding-bottom: 6px; }
h2 { font-size: 15pt; margin-top: 22px; border-bottom: 1px solid #ccc; padding-bottom: 3px;
     page-break-after: avoid; }
h3 { font-size: 12.5pt; margin-top: 16px; page-break-after: avoid; }
h4 { font-size: 11pt; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9pt;
        page-break-inside: avoid; }
th, td { border: 1px solid #999; padding: 5px 7px; text-align: left; vertical-align: top; }
th { background: #f0f0f0; }
code { font-family: "Courier New", monospace; font-size: 9pt; background: #f4f4f4;
       padding: 1px 3px; border-radius: 2px; }
pre { background: #f4f4f4; border: 1px solid #ddd; padding: 8px 10px; border-radius: 3px;
      page-break-inside: avoid; overflow-wrap: break-word; white-space: pre-wrap; }
pre code { background: none; padding: 0; font-size: 8.5pt; }
blockquote { border-left: 3px solid #888; margin: 10px 0; padding: 4px 12px; color: #333;
             background: #fafafa; }
a { color: #0b5cad; text-decoration: none; }
CSS

render() {  # render <src.md> <out.pdf> <title>
  local src="$1" pdf="$2" title="$3"
  local html="$TMP/$(basename "${pdf%.pdf}").html"
  pandoc "$src" -f gfm -t html5 --standalone --embed-resources \
         --metadata title="$title" --css "$TMP/style.css" -o "$html"
  # Chrome exits on its own once the PDF is written; guard against a hang.
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --no-first-run \
            --user-data-dir="$TMP/profile-$(basename "$pdf")" \
            --print-to-pdf="$pdf" "file://$html" >/dev/null 2>&1 &
  local pid=$!
  for _ in $(seq 1 60); do [ -s "$pdf" ] && break; sleep 0.5; done
  sleep 1; kill $pid 2>/dev/null || true; wait $pid 2>/dev/null || true
  [ -s "$pdf" ] || { echo "failed to render $pdf" >&2; return 1; }
  echo "  $(basename "$pdf")  ($(wc -c < "$pdf" | tr -d ' ') bytes)"
}

echo "Generating guides into $OUT"
render "$ROOT/demo-npm/README.md" \
       "$OUT/Exotel-Voice-Websdk-Integration-Guide.pdf" \
       "Exotel Voice WebSDK - npm Integration Guide"
render "$ROOT/demo-non-npm/README.md" \
       "$OUT/Exotel-Voice-Websdk-Bundle-Integration-Guide.pdf" \
       "Exotel Voice WebSDK - Bundle Integration Guide"
echo "Done."
