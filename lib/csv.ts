function protectCsvFormula(value: string) {
  if (/^[=+\-@]/.test(value)) return `'${value}`;
  return value;
}

export function csvCell(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);

  const safe = protectCsvFormula(text);
  return `"${safe.replace(/"/g, '""')}"`;
}

export function createCsv(rows: unknown[][]) {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return "\uFEFF" + body;
}

export function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
