export function escapePrintHtml(value) {
  const text = String(value ?? '')
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatPrintDateTime(dateTimeStr, locale = 'en-US') {
  if (!dateTimeStr) return '-'
  try {
    const date = new Date(dateTimeStr)
    return date
      .toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(',', ' at')
  } catch {
    return dateTimeStr
  }
}

const renderRows = (rows = []) =>
  rows
    .map(({ label, value }) => {
      const displayValue =
        value === null || value === undefined || String(value).trim() === '' ? '-' : String(value)

      return `
        <div class="print-row">
          <div class="print-label">${escapePrintHtml(label)}</div>
          <div class="print-value">${escapePrintHtml(displayValue)}</div>
        </div>
      `
    })
    .join('')

export function openTransactionPrintWindow({
  title,
  pageTitle,
  logoUrl,
  popupMessage,
  sections = [],
}) {
  const win = window.open('', '_blank')
  if (!win) {
    alert(popupMessage)
    return
  }

  const renderedSections = sections
    .filter((section) => section && Array.isArray(section.rows) && section.rows.length > 0)
    .map(
      (section) => `
        <section class="print-section">
          <h2>${escapePrintHtml(section.title)}</h2>
          <div class="print-card">
            ${renderRows(section.rows)}
          </div>
        </section>
      `
    )
    .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapePrintHtml(title)}</title>
        <style>
          :root {
            --border: #dbe3dd;
            --soft: #f6faf7;
            --text: #0f172a;
            --muted: #5b6472;
            --brand: #2f6f1e;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: var(--text);
            background: #ffffff;
          }
          .page {
            max-width: 980px;
            margin: 0 auto;
          }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding-bottom: 18px;
            margin-bottom: 24px;
            border-bottom: 2px solid var(--border);
          }
          .print-header h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.2;
          }
          .print-logo {
            height: 42px;
            width: auto;
          }
          .print-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .print-section h2 {
            margin: 0 0 10px;
            font-size: 16px;
            font-weight: 700;
            color: var(--brand);
          }
          .print-card {
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            background: #fff;
          }
          .print-row {
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 18px;
            padding: 11px 16px;
            border-bottom: 1px solid var(--border);
            align-items: start;
          }
          .print-row:nth-child(odd) {
            background: var(--soft);
          }
          .print-row:last-child {
            border-bottom: none;
          }
          .print-label {
            font-weight: 700;
            color: var(--muted);
          }
          .print-value {
            color: var(--text);
            word-break: break-word;
          }
          @media print {
            body {
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="print-header">
            <h1>${escapePrintHtml(pageTitle)}</h1>
            <img class="print-logo" src="${escapePrintHtml(logoUrl)}" alt="Paysey" />
          </div>
          ${renderedSections}
        </div>
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 150);
          };
        </script>
      </body>
    </html>
  `)

  win.document.close()
}
