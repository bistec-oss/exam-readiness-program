// Dependency-free generator for a simple, single-page A4 PDF (Helvetica text).
// Produces a well-formed PDF 1.4 document with a correct xref table.

function escapeText(s: string): string {
  // Keep printable ASCII; PDF text strings escape \ ( ).
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E]/g, " ");
}

export type PdfLine = { text: string; size?: number; gap?: number };

export function buildPdf(lines: PdfLine[]): Buffer {
  const pageHeight = 842;
  const left = 56;
  let y = pageHeight - 72;

  let content = "BT\n";
  let currentSize = 0;
  let first = true;
  for (const line of lines) {
    const size = line.size ?? 11;
    if (size !== currentSize) {
      content += `/F1 ${size} Tf\n`;
      currentSize = size;
    }
    if (first) {
      content += `${left} ${y} Td\n`;
      first = false;
    } else {
      const gap = line.gap ?? Math.round(currentSize * 1.5);
      content += `0 -${gap} Td\n`;
      y -= gap;
    }
    content += `(${escapeText(line.text)}) Tj\n`;
  }
  content += "ET";

  const contentBuf = Buffer.from(content, "latin1");

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${contentBuf.length} >>`,
  ];

  const chunks: Buffer[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (b: Buffer) => { chunks.push(b); pos += b.length; };

  const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
  push(header);

  for (let i = 0; i < objects.length; i++) {
    offsets[i] = pos;
    const objNum = i + 1;
    if (objNum === 5) {
      // Content stream object embeds the raw stream bytes.
      push(Buffer.from(`${objNum} 0 obj\n${objects[i]}\nstream\n`, "latin1"));
      push(contentBuf);
      push(Buffer.from("\nendstream\nendobj\n", "latin1"));
    } else {
      push(Buffer.from(`${objNum} 0 obj\n${objects[i]}\nendobj\n`, "latin1"));
    }
  }

  const xrefStart = pos;
  const count = objects.length + 1; // +1 for the free object 0
  let xref = `xref\n0 ${count}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 0; i < objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  push(Buffer.from(xref, "latin1"));

  return Buffer.concat(chunks);
}
