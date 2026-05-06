const escapeCell = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const exportRowsToXls = ({ fileName, sheetName, columns, rows }) => {
  const headerHtml = columns.map((item) => `<th>${escapeCell(item.title)}</th>`).join('')
  const bodyHtml = rows.map((row) => {
    const cells = columns.map((item) => `<td>${escapeCell(row[item.key])}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <meta name="ProgId" content="Excel.Sheet" />
        <meta name="Generator" content="Codex" />
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cfd7e3; padding: 6px 10px; font-size: 12px; }
          th { background: #eef4fb; font-weight: 600; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${bodyHtml}
          </tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob(['\ufeff', html], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `${fileName || sheetName || 'export'}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
