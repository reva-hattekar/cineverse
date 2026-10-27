const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

const VIVA_DIR = path.resolve(__dirname, '../Viva_Preparation');

async function buildVivaMasterPack() {
  console.log('1. Reading markdown files...');
  const evalMd = fs.readFileSync(path.join(VIVA_DIR, 'CINEVERSE_Project_Evaluation.md'), 'utf8');
  const qaMd = fs.readFileSync(path.join(VIVA_DIR, 'CINEVERSE_Viva_Questions_Answers.md'), 'utf8');
  const sqlMd = fs.readFileSync(path.join(VIVA_DIR, 'CINEVERSE_SQL_Practical_Viva.md'), 'utf8');
  const demoMd = fs.readFileSync(path.join(VIVA_DIR, 'CINEVERSE_Demo_Script.md'), 'utf8');
  const revMd = fs.readFileSync(path.join(VIVA_DIR, 'CINEVERSE_Last_Minute_Revision.md'), 'utf8');

  console.log('2. Converting markdown to HTML...');
  function mdToHtml(md) {
    let html = md
      // Escape HTML chars
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Unescape some safe symbols
      .replace(/&amp;rarr;/g, '&rarr;')
      .replace(/&amp;harr;/g, '&harr;')
      .replace(/&amp;le;/g, '&le;')
      .replace(/&amp;ge;/g, '&ge;')
      // Code blocks
      .replace(/```sql([\s\S]*?)```/g, '<pre><code class="language-sql">$1</code></pre>')
      .replace(/```javascript([\s\S]*?)```/g, '<pre><code class="language-javascript">$1</code></pre>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headings
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr/>')
      // List items
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

    // Simple table parser
    html = html.replace(/(\|.+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|.+\|\r?\n?)+)/g, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 3) return match;
      const headers = lines[0].split('|').slice(1, -1).map(h => `<th>${h.trim()}</th>`).join('');
      const rows = lines.slice(2).map(line => {
        const cells = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table class="viva-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    return html;
  }

  const combinedHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CINEVERSE — Master Viva Preparation Guide</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111827;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      color: #0f172a;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 6px;
      margin-top: 24pt;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: avoid;
    }
    h2 {
      font-size: 14pt;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18pt;
    }
    h3 {
      font-size: 12pt;
      color: #0f172a;
      margin-top: 14pt;
    }
    h4 {
      font-size: 11pt;
      color: #991b1b;
      margin-top: 10pt;
      margin-bottom: 2pt;
    }
    p {
      margin-top: 4pt;
      margin-bottom: 6pt;
      text-align: justify;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
    }
    pre {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #1e3a8a;
      padding: 8pt;
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 6pt 0;
    }
    table.viva-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      font-size: 9.5pt;
    }
    table.viva-table th, table.viva-table td {
      border: 1px solid #94a3b8;
      padding: 6pt 8pt;
      text-align: left;
    }
    table.viva-table th {
      background: #f1f5f9;
      font-weight: bold;
    }
    li {
      margin-bottom: 3pt;
    }
    .cover-page {
      height: 95vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 12pt;
    }
    .cover-subtitle {
      font-size: 15pt;
      color: #475569;
      margin-bottom: 24pt;
    }
    .cover-meta {
      font-size: 11pt;
      color: #334155;
      margin-top: 36pt;
      line-height: 1.8;
    }
  </style>
</head>
<body>

<div class="cover-page">
  <div class="cover-title">CINEVERSE</div>
  <div class="cover-subtitle">Complete RDBMS Project Evaluation & Viva Voce Preparation Master Guide</div>
  <hr style="width: 60%; margin: 20px auto; border: 1px solid #94a3b8;"/>
  <div class="cover-meta">
    <strong>Course:</strong> Relational Database Management Systems Laboratory (CSE)<br/>
    <strong>Institution:</strong> Manipal University Jaipur (MUJ)<br/>
    <strong>Database:</strong> MySQL 8.0 (InnoDB) — <code>MovieTheaterDB</code><br/>
    <strong>Technology Stack:</strong> Node.js, Express, React, Vite, Three.js<br/>
    <strong>Date of Evaluation:</strong> October 2026
  </div>
</div>

<div class="section-eval">
  ${mdToHtml(evalMd)}
</div>

<div class="section-qa">
  ${mdToHtml(qaMd)}
</div>

<div class="section-sql">
  ${mdToHtml(sqlMd)}
</div>

<div class="section-demo">
  ${mdToHtml(demoMd)}
</div>

<div class="section-rev">
  ${mdToHtml(revMd)}
</div>

</body>
</html>
  `;

  const htmlPath = path.join(VIVA_DIR, 'CINEVERSE_Viva_Master_Source.html');
  fs.writeFileSync(htmlPath, combinedHtmlContent);
  console.log('✅ Generated HTML source:', htmlPath);

  console.log('3. Rendering PDF via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(combinedHtmlContent, { waitUntil: 'load' });

  const pdfPath = path.join(VIVA_DIR, 'CINEVERSE_Viva_Preparation_Master_Guide.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
  });
  await browser.close();
  console.log('✅ Generated Master PDF:', pdfPath);

  console.log('4. Generating Master DOCX document...');
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'CINEVERSE — Master Viva Preparation Guide',
          heading: HeadingLevel.TITLE
        }),
        new Paragraph({
          text: 'Comprehensive RDBMS Lab Project Evaluation & Viva Question Bank',
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Institution: ', bold: true }),
            new TextRun('Manipal University Jaipur (MUJ)\n'),
            new TextRun({ text: 'Database: ', bold: true }),
            new TextRun('MySQL 8.0 (MovieTheaterDB)\n'),
            new TextRun({ text: 'Stack: ', bold: true }),
            new TextRun('Node.js, Express REST API, React 18, Vite\n')
          ]
        }),
        new Paragraph({
          text: 'Note: Full structured sections are available in CINEVERSE_Project_Evaluation.md, CINEVERSE_Viva_Questions_Answers.md, CINEVERSE_SQL_Practical_Viva.md, CINEVERSE_Demo_Script.md, and CINEVERSE_Last_Minute_Revision.md.',
          heading: HeadingLevel.HEADING_3
        })
      ]
    }]
  });

  const docxPath = path.join(VIVA_DIR, 'CINEVERSE_Viva_Preparation_Master_Guide.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log('✅ Generated Master DOCX:', docxPath);

  console.log('🎉 ALL VIVA PACK DELIVERABLES COMPLETED!');
}

buildVivaMasterPack().catch(console.error);

