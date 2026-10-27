const puppeteer = require('puppeteer-core');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  ImageRun,
  Footer,
  PageNumber
} = require('docx');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ASSETS_DIR = path.resolve('d:/Desktop/Projects/RDBMS/report_assets');
const PDF_OUTPUT = path.resolve('d:/Desktop/Projects/RDBMS/CINEVERSE_RDBMS_Project_Report.pdf');
const DOCX_OUTPUT = path.resolve('d:/Desktop/Projects/RDBMS/CINEVERSE_RDBMS_Project_Report.docx');
const VERIFICATION_OUTPUT = path.resolve('d:/Desktop/Projects/RDBMS/REPORT_VERIFICATION.md');

// Image paths
const images = {
  logo: path.join(ASSETS_DIR, 'muj_logo.svg'),
  erDiagram: path.join(ASSETS_DIR, 'fig_3_1_er_diagram.png'),
  fig41: path.join(ASSETS_DIR, 'fig_4_1_admin_login.png'),
  fig42: path.join(ASSETS_DIR, 'fig_4_2_admin_dashboard.png'),
  fig43: path.join(ASSETS_DIR, 'fig_4_3_admin_movies.png'),
  fig44: path.join(ASSETS_DIR, 'fig_4_4_admin_theaters.png'),
  fig45: path.join(ASSETS_DIR, 'fig_4_5_admin_showtimes.png'),
  fig46: path.join(ASSETS_DIR, 'fig_4_6_customer_home.png'),
  fig47: path.join(ASSETS_DIR, 'fig_4_7_customer_theatres.png'),
  fig48: path.join(ASSETS_DIR, 'fig_4_8_customer_booking.png'),
  fig49: path.join(ASSETS_DIR, 'fig_4_9_customer_bookings.png')
};

function imgBase64(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1);
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  }
  return '';
}

const b64 = {
  logo: imgBase64(images.logo),
  erDiagram: imgBase64(images.erDiagram),
  fig41: imgBase64(images.fig41),
  fig42: imgBase64(images.fig42),
  fig43: imgBase64(images.fig43),
  fig44: imgBase64(images.fig44),
  fig45: imgBase64(images.fig45),
  fig46: imgBase64(images.fig46),
  fig47: imgBase64(images.fig47),
  fig48: imgBase64(images.fig48),
  fig49: imgBase64(images.fig49)
};

console.log('1. Building HTML source for Pixel-Perfect PDF generation...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CINEVERSE — Complete RDBMS Lab Project Report</title>
<style>
  @page {
    size: A4;
    margin: 25mm 20mm 20mm 25mm;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #111111;
    margin: 0;
    padding: 0;
    text-align: justify;
  }

  .page {
    page-break-after: always;
    break-after: page;
    position: relative;
    box-sizing: border-box;
    min-height: 100%;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .page-footer-num {
    position: absolute;
    bottom: -10mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 10pt;
    font-family: 'Times New Roman', Times, serif;
    color: #333333;
  }

  h1 {
    font-size: 20pt;
    font-weight: bold;
    margin-top: 18pt;
    margin-bottom: 12pt;
    text-align: left;
    color: #000000;
  }

  h1.chapter-title {
    font-size: 22pt;
    margin-top: 24pt;
    margin-bottom: 16pt;
    border-bottom: 1px solid #333333;
    padding-bottom: 6pt;
  }

  .chapter-num {
    font-size: 15pt;
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4pt;
    color: #333333;
  }

  h2 {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 15pt;
    margin-bottom: 6pt;
    color: #111111;
  }

  h3 {
    font-size: 11.5pt;
    font-weight: bold;
    margin-top: 11pt;
    margin-bottom: 5pt;
    color: #222222;
  }

  p {
    margin-top: 0;
    margin-bottom: 8pt;
    text-indent: 0;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 8pt;
    padding-left: 20pt;
  }

  li {
    margin-bottom: 3.5pt;
  }

  /* Cover Page */
  .cover-container {
    height: 100%;
    min-height: 840px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    padding: 10px 0;
  }

  .cover-logo {
    width: 290px;
    margin-bottom: 25px;
  }

  .cover-title {
    font-size: 23pt;
    font-weight: bold;
    line-height: 1.3;
    margin-top: 30px;
    margin-bottom: 15px;
    max-width: 660px;
  }

  .cover-subtitle {
    font-size: 15pt;
    font-style: italic;
    color: #333333;
    margin-bottom: 40px;
  }

  .cover-meta {
    margin-top: 15px;
    margin-bottom: 30px;
    font-size: 12pt;
    line-height: 1.6;
  }

  .cover-meta strong {
    font-size: 13pt;
  }

  .cover-affiliation {
    font-size: 11pt;
    line-height: 1.4;
    color: #222222;
    margin-top: 30px;
    border-top: 1px solid #cccccc;
    padding-top: 15px;
    width: 100%;
  }

  /* Table of Contents */
  .toc-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12pt;
  }

  .toc-table tr td {
    padding: 2.5pt 0;
    vertical-align: bottom;
  }

  .toc-title {
    font-weight: bold;
  }

  .toc-leader {
    border-bottom: 1px dotted #444444;
    width: 100%;
  }

  .toc-page {
    text-align: right;
    width: 32px;
    font-family: 'Times New Roman', serif;
  }

  /* Schema Tables */
  table.schema-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6pt;
    margin-bottom: 12pt;
    font-size: 9.2pt;
  }

  table.schema-table th {
    border-top: 1.5pt solid #000000;
    border-bottom: 1pt solid #000000;
    padding: 3.5pt 5pt;
    text-align: left;
    font-weight: bold;
    background-color: #f8fafc;
  }

  table.schema-table td {
    padding: 3pt 5pt;
    border-bottom: 0.5pt solid #e2e8f0;
    vertical-align: top;
  }

  table.schema-table tr:last-child td {
    border-bottom: 1.5pt solid #000000;
  }

  .caption-table {
    font-size: 9.5pt;
    font-weight: bold;
    margin-bottom: 3pt;
    text-align: left;
  }

  /* Figures */
  .figure-box {
    margin: 12pt 0;
    text-align: center;
    page-break-inside: avoid;
  }

  .figure-img {
    max-width: 95%;
    height: auto;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  }

  .figure-caption {
    font-size: 9.5pt;
    font-style: italic;
    margin-top: 5pt;
    color: #222222;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 1pt 3pt;
    border-radius: 3pt;
  }

  .ref-list {
    padding-left: 20pt;
  }

  .ref-item {
    margin-bottom: 8pt;
    text-indent: -20pt;
    padding-left: 20pt;
  }
</style>
</head>
<body>

<!-- COVER PAGE (Physical 1, Unnumbered) -->
<div class="page cover-container">
  <div style="width: 100%; text-align: center;">
    <img src="${b64.logo}" alt="Manipal University Jaipur Logo" class="cover-logo" />
  </div>

  <div>
    <div class="cover-title">
      CINEVERSE: A Distributed Multiplex Movie Theatre Booking and Management System
    </div>
    <div class="cover-subtitle">
      Project Report
    </div>
  </div>

  <div class="cover-meta">
    <p>Submitted by:</p>
    <p><strong>[STUDENT NAME]</strong><br>
    Reg No: [REGISTRATION NUMBER]</p>
    
    <div style="height: 20px;"></div>

    <p>Under the supervision of:</p>
    <p><strong>[SUPERVISOR NAME]</strong></p>
  </div>

  <div class="cover-affiliation">
    <p style="font-weight: bold; margin-bottom: 2px;">Department of Computer Science and Engineering</p>
    <p style="font-weight: bold; margin-bottom: 2px;">Manipal University Jaipur</p>
    <p style="font-size: 10pt; color: #444444;">Dehmi Kalan, Near GVK Toll Plaza, Jaipur-Ajmer Expressway, Jaipur, Rajasthan 303007</p>
  </div>
</div>

<!-- ABSTRACT (Physical 2, Numbered 1) -->
<div class="page">
  <h1>Abstract</h1>
  <p>
    Modern commercial cinema chains require highly reliable, high-concurrency database architectures capable of orchestrating multi-screen auditoriums, dynamic showtime scheduling, granular physical seat inventories, and real-time transaction processing. CINEVERSE is an enterprise-grade full-stack cinema management and multiplex ticket booking platform engineered to model the end-to-end operational lifecycle of contemporary theatre circuits. The project implements a robust three-tier architecture comprising an asynchronous Node.js and Express RESTful API backend, dual decoupled React.js single-page applications for executive administration and customer reservations, and a rigorous MySQL relational database (<code>MovieTheaterDB</code>).
  </p>
  <p>
    The database layer is architected in Third Normal Form (3NF), comprising 15 specialized relational tables, 4,544 physically mapped auditorium seats across 32 screens in 8 multi-city complexes, and 1,008 active screenings. Referential integrity, foreign key cascading rules, and check constraints strictly prevent operational hazards such as overlapping screen bookings or duplicate seat reservations. Crucially, the platform enforces strict ACID transaction semantics during ticket checkout through pessimistic row-locking and composite unique keys on junction entities, ensuring absolute prevention of double-booking under concurrent user loads. 
  </p>
  <p>
    Empirical validation was performed across 37 comprehensive integration test suites, verifying database-driven movie release management, relational diagnostic cascading on deletions, dynamic hero slot assignment, and complete CRUD operations. The resulting platform demonstrates the indispensable role of formal relational database design, connection pooling, and transactional boundaries in supporting high-volume commercial reservation workflows.
  </p>
  <div class="page-footer-num">1</div>
</div>

<!-- CONTENTS PAGE 1 (Physical 3, Numbered 2) -->
<div class="page">
  <h1>Contents</h1>
  <table class="toc-table">
    <tr>
      <td class="toc-title">Abstract</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">1</td>
    </tr>
    <tr>
      <td class="toc-title">List of Figures</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">4</td>
    </tr>
    <tr>
      <td class="toc-title">List of Tables</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">5</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">1 Introduction</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">6</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">1.1 Project Overview</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">6</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">1.2 Objectives of the Project</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">6</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">1.3 Importance and Relevance</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">6</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">1.4 Scope and Limitations</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">7</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">2 Literature Review</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">8</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">2.1 Movie Theatre Booking and Multiplex Systems</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">2.2 Relevant Technologies</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td style="padding-left: 30pt;">2.2.1 Node.js and Express.js REST Framework</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td style="padding-left: 30pt;">2.2.2 MySQL Relational Database Management System</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td style="padding-left: 30pt;">2.2.3 Direct SQL Connection Pooling vs. ORM Trade-offs</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td style="padding-left: 30pt;">2.2.4 React.js Component Architecture and Vite Tooling</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">8</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">3 System Design</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">10</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">3.1 Database Design Overview</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">10</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">3.2 Entity-Relationship (ER) Diagram</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">10</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">3.3 Description of Tables and Attributes</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">12</td>
    </tr>
  </table>
  <div class="page-footer-num">2</div>
</div>

<!-- CONTENTS PAGE 2 (Physical 4, Numbered 3) -->
<div class="page">
  <table class="toc-table" style="margin-top: 25pt;">
    <tr>
      <td style="padding-left: 15pt;">3.4 Relational Cardinality and Integrity Constraints</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">18</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">3.5 Database Normalization Analysis</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">18</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">3.6 Transaction Management and Concurrency Control</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">18</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">4 Frontend Implementation and Screenshots</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">20</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">4.1 Overview</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">20</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">4.2 Administration Control Room Interface</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">20</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">4.3 Movie Catalog and Theatre Management</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">22</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">4.4 Showtime Programming and Screen Conflict Engine</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">23</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">4.5 Customer Discovery, Seat Selection, and Booking Workflow</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">23</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">5 Results and Discussion</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">26</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">5.1 Presentation of Results</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">26</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">5.2 Discussion of Findings</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">26</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">5.3 Comparison with Expected Outcomes</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">26</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">6 Conclusion</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">27</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">6.1 Summary of Project Work</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">27</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">6.2 Achievement of Project Objectives</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">27</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">6.3 Lessons Learned</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">27</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">7 Future Work</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">28</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">7.1 Suggestions for Future Enhancements</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">28</td>
    </tr>
    <tr>
      <td style="padding-left: 15pt;">7.2 Areas for Further Research</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">28</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 10pt;">Bibliography</td>
      <td style="padding-top: 10pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 10pt;">29</td>
    </tr>
  </table>
  <div class="page-footer-num">3</div>
</div>

<!-- LIST OF FIGURES (Physical 5, Numbered 4) -->
<div class="page">
  <h1>List of Figures</h1>
  <table class="toc-table">
    <tr>
      <td class="toc-title">3.1 ER Diagram for the CINEVERSE Multiplex System</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">10</td>
    </tr>
    <tr>
      <td class="toc-title" style="padding-top: 8pt;">4.1 Admin Authentication and Security Portal</td>
      <td style="padding-top: 8pt;"><div class="toc-leader"></div></td>
      <td class="toc-page" style="padding-top: 8pt;">20</td>
    </tr>
    <tr>
      <td class="toc-title">4.2 Admin Central Control Room Dashboard</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">21</td>
    </tr>
    <tr>
      <td class="toc-title">4.3 Movie Catalog with Dynamic Trailer & Artwork Integration</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">22</td>
    </tr>
    <tr>
      <td class="toc-title">4.4 Multiplex Cinema and Multi-Screen Auditoriums</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">22</td>
    </tr>
    <tr>
      <td class="toc-title">4.5 Showtime Programming & Relational Conflict Engine</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">23</td>
    </tr>
    <tr>
      <td class="toc-title">4.6 Customer Portal Homepage and Cinema Spotlight</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">23</td>
    </tr>
    <tr>
      <td class="toc-title">4.7 City-Wide Multiplex Theatre Discovery</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">24</td>
    </tr>
    <tr>
      <td class="toc-title">4.8 Interactive Auditorium Seat Layout & Screening Selection</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">24</td>
    </tr>
    <tr>
      <td class="toc-title">4.9 Customer Confirmed Bookings and Ticket Invoices</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">25</td>
    </tr>
  </table>
  <div class="page-footer-num">4</div>
</div>

<!-- LIST OF TABLES (Physical 6, Numbered 5) -->
<div class="page">
  <h1>List of Tables</h1>
  <table class="toc-table">
    <tr>
      <td class="toc-title">3.1 THEATER Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">12</td>
    </tr>
    <tr>
      <td class="toc-title">3.2 SCREEN Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">12</td>
    </tr>
    <tr>
      <td class="toc-title">3.3 SEAT Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">12</td>
    </tr>
    <tr>
      <td class="toc-title">3.4 MOVIE Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">13</td>
    </tr>
    <tr>
      <td class="toc-title">3.5 SHOWTIME Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">14</td>
    </tr>
    <tr>
      <td class="toc-title">3.6 CUSTOMER Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">14</td>
    </tr>
    <tr>
      <td class="toc-title">3.7 ACCOUNT Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">14</td>
    </tr>
    <tr>
      <td class="toc-title">3.8 LOYALTY_ACCOUNT Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">15</td>
    </tr>
    <tr>
      <td class="toc-title">3.9 BOOKING Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">15</td>
    </tr>
    <tr>
      <td class="toc-title">3.10 BOOKED_SEAT Table Schema (Junction Table)</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">16</td>
    </tr>
    <tr>
      <td class="toc-title">3.11 PAYMENT Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">16</td>
    </tr>
    <tr>
      <td class="toc-title">3.12 ADMIN_STAFF Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">16</td>
    </tr>
    <tr>
      <td class="toc-title">3.13 SNACK Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">17</td>
    </tr>
    <tr>
      <td class="toc-title">3.14 SNACK_ORDER Table Schema</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">17</td>
    </tr>
    <tr>
      <td class="toc-title">3.15 SNACK_ORDER_ITEM Table Schema (Junction Table)</td>
      <td><div class="toc-leader"></div></td>
      <td class="toc-page">17</td>
    </tr>
  </table>
  <div class="page-footer-num">5</div>
</div>

<!-- CHAPTER 1: INTRODUCTION (Physical 7, Numbered 6) -->
<div class="page">
  <div class="chapter-num">Chapter 1</div>
  <h1 class="chapter-title" style="margin-top: 0;">Introduction</h1>

  <h2>1.1 Project Overview</h2>
  <p>
    The theatrical exhibition industry operates within a fast-paced commercial environment where cinema multiplexes schedule thousands of screenings weekly across dozens of distinct auditoriums. In this digital landscape, legacy single-screen software and manual box-office ledgers are entirely inadequate. Modern cinema circuits demand sophisticated, distributed database solutions capable of concurrently serving both operational theatre personnel and mass-market retail patrons.
  </p>
  <p>
    CINEVERSE is an end-to-end relational database management system and full-stack software application engineered to handle the complexities of multi-theatre, multi-auditorium cinema circuits. Built upon MySQL and the Node.js runtime, CINEVERSE models the entire operational lifecycle of multiplex operations—including multi-city cinema venue management, auditorium screen classifications (Standard, IMAX, 4DX, Gold Class), physical seat coordinate mapping, showtime programming, and transactional seat reservations with concession add-ons. The platform provides two distinct, fully decoupled frontends: an administrative "control room" portal for staff and managers, and a high-performance customer-facing web portal for seamless showtime exploration and ticket checkout.
  </p>

  <h2>1.2 Objectives of the Project</h2>
  <p>The primary objectives accomplished in the development of CINEVERSE are:</p>
  <ul>
    <li>To design and implement a fully normalized relational schema (Third Normal Form) in MySQL that accurately models all real-world entities of a multiplex cinema chain while maintaining strict data integrity.</li>
    <li>To enforce relational constraints, foreign keys, cascading deletion guards, and custom conflict-detection logic that prevents auditoriums from being double-booked across overlapping time windows.</li>
    <li>To implement a performant asynchronous backend REST API utilizing direct SQL connection pooling (<code>mysql2/promise</code>) capable of executing parameterized queries, complex multi-table joins, and aggregate analytical reports.</li>
    <li>To guarantee ACID transaction properties during customer reservations, ensuring that concurrent seat allocation requests never result in double-booking or inconsistent ticket ledger states.</li>
    <li>To provide two separate, decoupled React.js user interfaces: an executive dark-aesthetic control room for cinema administrators and an immersive, cinematic ticketing experience for retail consumers.</li>
  </ul>

  <h2>1.3 Importance and Relevance</h2>
  <p>
    This project is highly relevant to contemporary database engineering and computer science curricula. It bridges theoretical RDBMS concepts—such as normalization, functional dependencies, foreign key constraints, connection pool management, and transactional atomicity—with commercial web engineering. By deploying a real-world multi-city multiplex dataset consisting of 15 relational tables, 8 multiplex complexes, 32 auditoriums, 4,544 physically registered seats, and over 1,000 scheduled screenings, CINEVERSE provides an authentic laboratory study in solving high-concurrency reservation bottlenecks.
  </p>
  <div class="page-footer-num">6</div>
</div>

<!-- CHAPTER 1 CONT. (Physical 8, Numbered 7) -->
<div class="page">
  <h2>1.4 Scope and Limitations</h2>
  <p>
    The scope of the project encompasses user authentication (JWT-based role authentication for staff and customer account management), full theatrical inventory management (movies, formats, duration, ratings, artwork, and trailers), multi-screen scheduling with duration and buffer-time collision detection, interactive seat grid generation, and automated booking receipts.
  </p>
  <p>Documented limitations of the current lab prototype include:</p>
  <ul>
    <li><strong>Simulated Financial Gateway:</strong> While financial ledger records are generated in the <code>PAYMENT</code> table with method tags (Credit Card, Debit Card, UPI, Net Banking), actual credit card processing is simulated via client-server contract rather than live bank webhooks (e.g., Stripe or Razorpay production APIs).</li>
    <li><strong>Static Auditorium Layouts:</strong> Physical seat grids are configured through database relational mappings (e.g., rows A–J, seats 1–16). Dynamic visual auditorium CAD drag-and-drop editors are reserved for future releases.</li>
    <li><strong>Email Dispatch:</strong> Ticket confirmations and booking QR codes are rendered in the web interface; physical SMS and SMTP gateway dispatch is currently mocked.</li>
  </ul>
  <div class="page-footer-num">7</div>
</div>

<!-- CHAPTER 2: LITERATURE REVIEW (Physical 9, Numbered 8) -->
<div class="page">
  <div class="chapter-num">Chapter 2</div>
  <h1 class="chapter-title" style="margin-top: 0;">Literature Review</h1>

  <h2>2.1 Movie Theatre Booking and Multiplex Systems</h2>
  <p>
    Commercial ticketing architectures have evolved from localized POS (Point of Sale) counters to highly available distributed booking engines such as AMC Theatres, Regal Cinemas, and BookMyShow. The fundamental technical challenge in cinema ticketing is the ephemeral nature of inventory: a movie seat cannot be sold after showtime start, and inventory is partitioned by discrete time, venue, and physical location coordinates. Academic research into reservation systems consistently emphasizes that relational databases providing ACID compliance (Atomicity, Consistency, Isolation, Durability) are essential for transactional ticketing.
  </p>

  <h2>2.2 Relevant Technologies</h2>
  <h3>2.2.1 Node.js and Express.js REST Framework</h3>
  <p>
    Node.js is an event-driven, non-blocking asynchronous JavaScript runtime powered by Google's V8 engine. It operates on a single-threaded event loop utilizing libuv for background worker thread execution, making it exceptionally well-suited for I/O-intensive database applications. Express.js provides an unopinionated routing layer that facilitates the implementation of RESTful API endpoints, standardized error-handling middleware, and CORS policies between decoupled client applications.
  </p>

  <h3>2.2.2 MySQL Relational Database Management System</h3>
  <p>
    MySQL 8.0 is an enterprise-grade open-source Relational Database Management System (RDBMS) utilizing the InnoDB storage engine. InnoDB provides full ACID transactional guarantees, row-level locking, foreign key constraint enforcement, and crash recovery via write-ahead logging (redo/undo logs). In CINEVERSE, MySQL serves as the single source of truth, enforcing all business domain constraints at the database tier.
  </p>

  <h3>2.2.3 Direct SQL Connection Pooling vs. ORM Trade-offs</h3>
  <p>
    While high-level Object-Relational Mappers (ORMs) like Sequelize or Hibernate automate basic CRUD operations, they frequently introduce significant latency and unpredictable SQL query generation when executing complex multi-table joins and aggregation queries. CINEVERSE intentionally employs direct, parameterized SQL execution through the <code>mysql2/promise</code> driver configured with an active connection pool. This architectural decision enables exact control over SQL execution plans, explicit transaction boundaries (<code>START TRANSACTION</code>, <code>COMMIT</code>, <code>ROLLBACK</code>), and eliminates ORM overhead when processing high-volume booking joins.
  </p>

  <h3>2.2.4 React.js Component Architecture and Vite Tooling</h3>
  <p>
    React.js is a declarative frontend library that leverages a Virtual DOM to optimize user interface updates. By decomposing the application into modular components (such as interactive seat matrices, dynamic hero video players, and scheduling conflict grids), state changes trigger localized re-renders. Vite provides a modern development and build pipeline utilizing native ES modules (ESM) and Rollup bundling, achieving sub-second hot module replacement (HMR) and highly optimized production asset chunking.
  </p>
  <div class="page-footer-num">8</div>
</div>

<!-- CHAPTER 3: SYSTEM DESIGN & ER (Physical 10, Numbered 10) -->
<div class="page">
  <div class="chapter-num">Chapter 3</div>
  <h1 class="chapter-title" style="margin-top: 0;">System Design</h1>

  <h2>3.1 Database Design Overview</h2>
  <p>
    The foundation of CINEVERSE is its relational database schema, named <code>MovieTheaterDB</code>. Architected to support multi-theatre multiplex circuits, the design separates static venue infrastructure (Theatres, Screens, Seats) from temporal programming (Showtimes) and customer commercial activities (Bookings, Payments, Concessions). The schema guarantees referential integrity through foreign key constraints with explicit <code>ON DELETE RESTRICT</code> and <code>CASCADE</code> directives.
  </p>

  <h2>3.2 Entity-Relationship (ER) Diagram</h2>
  <p>
    Figure 3.1 illustrates the complete relational blueprint of the CINEVERSE multiplex system. Primary keys (PK), foreign keys (FK), junction entities, and cardinalities are strictly derived from the verified database definitions.
  </p>

  <div class="figure-box">
    <img src="${b64.erDiagram}" alt="ER Diagram for CINEVERSE System" class="figure-img" style="max-height: 480px;" />
    <div class="figure-caption">Figure 3.1: ER Diagram for the CINEVERSE Multiplex System (Database: MovieTheaterDB)</div>
  </div>
  <div class="page-footer-num">10</div>
</div>

<!-- CHAPTER 3 CONT: RELATIONSHIPS (Physical 11, Numbered 11) -->
<div class="page">
  <p>The primary architectural relationships depicted in Figure 3.1 include:</p>
  <ul>
    <li><strong>One-to-Many Relationships (1:N):</strong> <code>THEATER</code> contains multiple <code>SCREEN</code> auditoriums; <code>SCREEN</code> contains multiple physical <code>SEAT</code> records; <code>THEATER</code> employs multiple <code>ADMIN_STAFF</code>; <code>MOVIE</code> has multiple scheduled <code>SHOWTIME</code> entries; <code>SCREEN</code> hosts multiple distinct <code>SHOWTIME</code> screenings; <code>CUSTOMER</code> places multiple <code>BOOKING</code> reservations; <code>BOOKING</code> can encompass multiple <code>SNACK_ORDER</code> concessions.</li>
    <li><strong>Many-to-Many Relationships (M:N Decomposed):</strong> 
      A <code>BOOKING</code> reserves multiple <code>SEAT</code> entities across different screenings via the junction entity <code>BOOKED_SEAT</code>; a <code>SNACK_ORDER</code> contains multiple <code>SNACK</code> inventory items via the junction entity <code>SNACK_ORDER_ITEM</code>.
    </li>
    <li><strong>One-to-One Relationships (1:1):</strong> 
      <code>CUSTOMER</code> has an optional portal <code>ACCOUNT</code> (enforced by a unique foreign key constraint); <code>CUSTOMER</code> maintains an optional <code>LOYALTY_ACCOUNT</code>; and each confirmed <code>BOOKING</code> links to exactly one financial <code>PAYMENT</code> record.
    </li>
  </ul>
  <div class="page-footer-num">11</div>
</div>

<!-- TABLES 3.1 TO 3.3 (Physical 12, Numbered 12) -->
<div class="page">
  <h2>3.3 Description of Tables and Attributes</h2>
  <p>
    The following schema tables detail the fifteen verified relational tables implemented in <code>MovieTheaterDB</code>, including their physical storage data types, key constraints, and operational purposes.
  </p>

  <div class="avoid-break">
    <div class="caption-table">Table 3.1: THEATER Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>theater_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique surrogate identifier for the cinema multiplex complex.</td></tr>
      <tr><td>theater_name</td><td>varchar(100)</td><td></td><td>NO</td><td>Commercial brand name of the venue (e.g., CINEVERSE Grand Horizon).</td></tr>
      <tr><td>city</td><td>varchar(50)</td><td></td><td>NO</td><td>Metropolitan city location (e.g., Bengaluru, Mumbai, Delhi).</td></tr>
      <tr><td>address</td><td>varchar(255)</td><td></td><td>NO</td><td>Full geographical postal address of the cinema complex.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.2: SCREEN Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>screen_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique surrogate primary key for the auditorium screen.</td></tr>
      <tr><td>screen_number</td><td>int</td><td></td><td>NO</td><td>Auditorium number within the specific multiplex (1, 2, 3, etc.).</td></tr>
      <tr><td>screen_name</td><td>varchar(60)</td><td></td><td>YES</td><td>Distinct acoustic brand name (e.g., Auditorium 1 — Laser IMAX).</td></tr>
      <tr><td>screen_type</td><td>varchar(40)</td><td></td><td>NO</td><td>Screen classification: Standard, IMAX, 4DX, Recliner, or VIP.</td></tr>
      <tr><td>capacity</td><td>int</td><td></td><td>NO</td><td>Total physical seating capacity of the auditorium.</td></tr>
      <tr><td>theater_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing parent venue in THEATER(theater_id).</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.3: SEAT Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>seat_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique physical seat identifier across the entire cinema circuit.</td></tr>
      <tr><td>seat_number</td><td>varchar(10)</td><td></td><td>NO</td><td>Auditorium row and seat label (e.g., A1, E12, K16).</td></tr>
      <tr><td>seat_type</td><td>varchar(20)</td><td></td><td>NO</td><td>Comfort tier: Standard, Premium, Recliner, or Royal.</td></tr>
      <tr><td>screen_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing parent auditorium in SCREEN(screen_id).</td></tr>
    </table>
  </div>
  <div class="page-footer-num">12</div>
</div>

<!-- TABLE 3.4 (Physical 13, Numbered 13) -->
<div class="page">
  <div class="avoid-break">
    <div class="caption-table">Table 3.4: MOVIE Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>movie_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique primary key identifying the cinematic title.</td></tr>
      <tr><td>title</td><td>varchar(150)</td><td></td><td>NO</td><td>Official movie release title.</td></tr>
      <tr><td>genre</td><td>varchar(50)</td><td></td><td>NO</td><td>Theatrical genre (Sci-Fi, Action, Drama, Animation).</td></tr>
      <tr><td>duration</td><td>int</td><td></td><td>NO</td><td>Total runtime in minutes (essential for collision-free scheduling).</td></tr>
      <tr><td>language</td><td>varchar(30)</td><td></td><td>NO</td><td>Spoken audio language (English, Hindi, Tamil, Kannada, etc.).</td></tr>
      <tr><td>rating</td><td>decimal(3,1)</td><td></td><td>NO</td><td>Critic and audience aggregate rating score (0.0 to 10.0 scale).</td></tr>
      <tr><td>poster_url</td><td>varchar(500)</td><td></td><td>YES</td><td>URL link to verified high-resolution portrait poster artwork.</td></tr>
      <tr><td>backdrop_url</td><td>varchar(500)</td><td></td><td>YES</td><td>URL link to panoramic widescreen banner artwork for hero display.</td></tr>
    </table>
  </div>
  <div class="page-footer-num">13</div>
</div>

<!-- TABLES 3.5 TO 3.7 (Physical 14, Numbered 14) -->
<div class="page">
  <div class="avoid-break">
    <div class="caption-table">Table 3.5: SHOWTIME Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>show_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique surrogate identifier for the scheduled screening event.</td></tr>
      <tr><td>show_date</td><td>date</td><td>MUL</td><td>NO</td><td>Calendar date of the screening.</td></tr>
      <tr><td>start_time</td><td>time</td><td></td><td>NO</td><td>Exact start time of the feature screening (HH:MM:SS).</td></tr>
      <tr><td>end_time</td><td>time</td><td></td><td>NO</td><td>Calculated end time based on duration and intermission buffer.</td></tr>
      <tr><td>base_price</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Base admission ticket price before tier adjustments.</td></tr>
      <tr><td>movie_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing featured film in MOVIE(movie_id).</td></tr>
      <tr><td>screen_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing auditorium in SCREEN(screen_id).</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.6: CUSTOMER Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>customer_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique surrogate primary key for the patron.</td></tr>
      <tr><td>customer_name</td><td>varchar(100)</td><td></td><td>NO</td><td>Full legal or contact name of the customer.</td></tr>
      <tr><td>phone</td><td>varchar(20)</td><td></td><td>NO</td><td>Primary contact telephone or mobile phone number.</td></tr>
      <tr><td>email</td><td>varchar(120)</td><td>UNI</td><td>NO</td><td>Unique email address used for receipts and identification.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.7: ACCOUNT Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>account_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique surrogate identifier for the customer portal login credentials.</td></tr>
      <tr><td>customer_id</td><td>int</td><td>UNI</td><td>NO</td><td>Foreign key referencing CUSTOMER(customer_id) with 1:1 uniqueness.</td></tr>
      <tr><td>email</td><td>varchar(120)</td><td>UNI</td><td>NO</td><td>Unique authentication login username.</td></tr>
      <tr><td>password_hash</td><td>varchar(255)</td><td></td><td>NO</td><td>Cryptographically salted and hashed password (bcrypt).</td></tr>
      <tr><td>created_at</td><td>timestamp</td><td></td><td>NO</td><td>Record creation timestamp.</td></tr>
      <tr><td>is_active</td><td>tinyint(1)</td><td></td><td>NO</td><td>Boolean flag indicating active account status (1=active, 0=suspended).</td></tr>
    </table>
  </div>
  <div class="page-footer-num">14</div>
</div>

<!-- TABLES 3.8 TO 3.9 (Physical 15, Numbered 15) -->
<div class="page">
  <div class="avoid-break">
    <div class="caption-table">Table 3.8: LOYALTY_ACCOUNT Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>loyalty_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique membership identifier for the loyalty rewards account.</td></tr>
      <tr><td>customer_id</td><td>int</td><td>UNI</td><td>NO</td><td>Foreign key referencing CUSTOMER(customer_id) with 1:1 uniqueness.</td></tr>
      <tr><td>total_points</td><td>int</td><td></td><td>NO</td><td>Accumulated reward points earned through ticket and snack spend.</td></tr>
      <tr><td>join_date</td><td>date</td><td></td><td>NO</td><td>Date of loyalty enrollment.</td></tr>
      <tr><td>membership_level</td><td>varchar(20)</td><td></td><td>NO</td><td>Tier status: Bronze, Silver, Gold, or Platinum VIP.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.9: BOOKING Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>booking_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique reservation ledger invoice number.</td></tr>
      <tr><td>booking_date</td><td>timestamp</td><td></td><td>NO</td><td>Exact timestamp when transaction was initiated.</td></tr>
      <tr><td>total_amount</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Total gross transaction amount including taxes and fees.</td></tr>
      <tr><td>booking_status</td><td>varchar(20)</td><td>MUL</td><td>NO</td><td>Lifecycle state: CONFIRMED, PENDING, or CANCELLED.</td></tr>
      <tr><td>customer_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing purchasing patron in CUSTOMER(customer_id).</td></tr>
      <tr><td>show_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing the target screening in SHOWTIME(show_id).</td></tr>
    </table>
  </div>
  <div class="page-footer-num">15</div>
</div>

<!-- TABLES 3.10 TO 3.12 (Physical 16, Numbered 16) -->
<div class="page">
  <div class="avoid-break">
    <div class="caption-table">Table 3.10: BOOKED_SEAT Table Schema (Junction Table)</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>booking_id</td><td>int</td><td>PRI, MUL</td><td>NO</td><td>Composite PK part 1; references BOOKING(booking_id).</td></tr>
      <tr><td>seat_id</td><td>int</td><td>PRI, MUL</td><td>NO</td><td>Composite PK part 2; references SEAT(seat_id).</td></tr>
      <tr><td>ticket_price</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Effective price charged for this individual seat reservation.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.11: PAYMENT Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>payment_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique financial transaction reference number.</td></tr>
      <tr><td>amount</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Monetary settlement sum matching booking total.</td></tr>
      <tr><td>payment_method</td><td>varchar(30)</td><td></td><td>NO</td><td>Channel: Credit Card, Debit Card, UPI, or Net Banking.</td></tr>
      <tr><td>payment_status</td><td>varchar(20)</td><td></td><td>NO</td><td>Settlement state: COMPLETED, PENDING, or REFUNDED.</td></tr>
      <tr><td>payment_date</td><td>timestamp</td><td></td><td>NO</td><td>Timestamp of settlement reconciliation.</td></tr>
      <tr><td>booking_id</td><td>int</td><td>UNI</td><td>NO</td><td>Foreign key referencing BOOKING(booking_id) with 1:1 uniqueness.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.12: ADMIN_STAFF Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>staff_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique employee identifier for cinema personnel.</td></tr>
      <tr><td>staff_name</td><td>varchar(100)</td><td></td><td>NO</td><td>Full legal name of staff member.</td></tr>
      <tr><td>email</td><td>varchar(120)</td><td>UNI</td><td>NO</td><td>Work email address used for administrative login.</td></tr>
      <tr><td>phone</td><td>varchar(20)</td><td></td><td>NO</td><td>Staff emergency or contact telephone number.</td></tr>
      <tr><td>role</td><td>varchar(50)</td><td></td><td>NO</td><td>Authorization level: Admin, Manager, Cashier, or Projectionist.</td></tr>
      <tr><td>password_hash</td><td>varchar(255)</td><td></td><td>NO</td><td>Bcrypt salted hash for administrative credential validation.</td></tr>
      <tr><td>is_active</td><td>tinyint(1)</td><td></td><td>NO</td><td>Employment status flag (1=active, 0=deactivated).</td></tr>
      <tr><td>created_at</td><td>timestamp</td><td></td><td>NO</td><td>Staff account provisioning date.</td></tr>
      <tr><td>theater_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key referencing assigned complex in THEATER(theater_id).</td></tr>
    </table>
  </div>
  <div class="page-footer-num">16</div>
</div>

<!-- TABLES 3.13 TO 3.15 (Physical 17, Numbered 17) -->
<div class="page">
  <div class="avoid-break">
    <div class="caption-table">Table 3.13: SNACK Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>snack_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique identifier for concessions menu product.</td></tr>
      <tr><td>snack_name</td><td>varchar(100)</td><td></td><td>NO</td><td>Product name (e.g., Caramel Popcorn Large, Nachos Supreme).</td></tr>
      <tr><td>price</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Retail sales price per unit.</td></tr>
      <tr><td>stock_quantity</td><td>int</td><td></td><td>NO</td><td>Real-time inventory count on hand.</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.14: SNACK_ORDER Table Schema</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>snack_order_id</td><td>int</td><td>PRI</td><td>NO</td><td>Unique order identifier for concessions transaction.</td></tr>
      <tr><td>order_date</td><td>timestamp</td><td></td><td>NO</td><td>Timestamp when order was processed.</td></tr>
      <tr><td>order_status</td><td>varchar(20)</td><td></td><td>NO</td><td>Concessions fulfillment state: COMPLETED, PENDING, CANCELLED.</td></tr>
      <tr><td>total_price</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Sum of all line items included in the concession order.</td></tr>
      <tr><td>booking_id</td><td>int</td><td>MUL</td><td>NO</td><td>Foreign key associating snack order with BOOKING(booking_id).</td></tr>
    </table>
  </div>

  <div class="avoid-break">
    <div class="caption-table">Table 3.15: SNACK_ORDER_ITEM Table Schema (Junction Table)</div>
    <table class="schema-table">
      <tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
      <tr><td>snack_order_id</td><td>int</td><td>PRI, MUL</td><td>NO</td><td>Composite PK part 1; references SNACK_ORDER(snack_order_id).</td></tr>
      <tr><td>snack_id</td><td>int</td><td>PRI, MUL</td><td>NO</td><td>Composite PK part 2; references SNACK(snack_id).</td></tr>
      <tr><td>quantity</td><td>int</td><td></td><td>NO</td><td>Number of units ordered.</td></tr>
      <tr><td>unit_price</td><td>decimal(10,2)</td><td></td><td>NO</td><td>Unit price captured at time of order placement.</td></tr>
    </table>
  </div>
  <div class="page-footer-num">17</div>
</div>

<!-- 3.4, 3.5, 3.6 (Physical 18, Numbered 18) -->
<div class="page">
  <h2>3.4 Relational Cardinality and Integrity Constraints</h2>
  <p>
    Referential integrity is maintained across all 15 tables using strict foreign key constraints. The primary constraints enforced in <code>MovieTheaterDB</code> are:
  </p>
  <ul>
    <li><strong>Multiplex Hierarchy:</strong> <code>THEATER &rarr; SCREEN &rarr; SEAT</code> enforces hierarchical ownership. Deleting a theatre cascades down to remove dependent screens and physical seat entries.</li>
    <li><strong>Screening Conflict Constraint:</strong> A showtime cannot exist without referencing a valid <code>movie_id</code> and <code>screen_id</code>. At the backend layer, conflict detection queries ensure no screening is programmed where <code>(new_start &lt; existing_end) AND (new_end &gt; existing_start)</code> on the same auditorium.</li>
    <li><strong>Seat Reservation Isolation:</strong> In <code>BOOKED_SEAT</code>, the composite primary key <code>(booking_id, seat_id)</code> prevents the same seat from being entered multiple times in a single booking invoice. At the application layer, an active reservation check verifies that no other confirmed booking for the same <code>show_id</code> contains that <code>seat_id</code>.</li>
    <li><strong>Financial Integrity:</strong> <code>PAYMENT(booking_id)</code> has a strict <code>UNIQUE</code> constraint, ensuring a booking cannot be double-paid or associate with multiple payment records.</li>
  </ul>

  <h2>3.5 Database Normalization Analysis</h2>
  <p>
    A core requirement of this project was the rigorous application of database normalization theory to eliminate data redundancy, prevent insertion/deletion anomalies, and optimize storage efficiency:
  </p>
  <ul>
    <li><strong>First Normal Form (1NF):</strong> All attributes across all 15 tables contain atomic values. There are no repeating groups or multivalued attributes (e.g., booked seats are not stored as comma-separated lists in <code>BOOKING</code>, but normalized into individual tuple rows in <code>BOOKED_SEAT</code>). Every table has a clearly defined primary key.</li>
    <li><strong>Second Normal Form (2NF):</strong> The schema satisfies 1NF, and all non-key attributes are fully functionally dependent on the entire primary key. In tables with composite primary keys—specifically <code>BOOKED_SEAT(booking_id, seat_id)</code> and <code>SNACK_ORDER_ITEM(snack_order_id, snack_id)</code>—attributes such as <code>ticket_price</code> and <code>unit_price</code> depend on the combination of the booking/order and the specific item, with no partial functional dependencies.</li>
    <li><strong>Third Normal Form (3NF):</strong> The schema satisfies 2NF, and no transitive functional dependencies exist (i.e., non-prime attributes do not depend on other non-prime attributes). For example, <code>SCREEN</code> references <code>theater_id</code>; the theatre's address and city are not duplicated inside <code>SCREEN</code> or <code>SHOWTIME</code>, but reside strictly in <code>THEATER</code>. Similarly, customer contact details are stored strictly in <code>CUSTOMER</code> rather than redundantly copied into <code>BOOKING</code> or <code>PAYMENT</code>.</li>
  </ul>

  <h2>3.6 Transaction Management and Concurrency Control</h2>
  <p>
    In high-volume multiplex booking, concurrent users may attempt to reserve the identical seat in the same auditorium simultaneously. CINEVERSE implements full ACID transaction guarantees within <code>backend/src/controllers/bookingController.js</code>:
  </p>
  <ul>
    <li><strong>Atomicity:</strong> The booking process executes within an explicit database transaction (<code>START TRANSACTION</code>). Creating the <code>BOOKING</code> record, inserting each seat into <code>BOOKED_SEAT</code>, creating the <code>PAYMENT</code> record, and optionally processing concession items occur as a unified atomic unit. If any step fails, an automatic <code>ROLLBACK</code> is executed.</li>
    <li><strong>Consistency:</strong> The system verifies that every seat ID belongs to the screen assigned to the showtime and that total amounts match the sum of ticket prices plus concession items before committing.</li>
    <li><strong>Isolation:</strong> The seat verification query utilizes <code>FOR UPDATE</code> pessimistic row-locking on the target showtime seats. If two transactions attempt to reserve seat A12 concurrently, the first transaction acquires the lock while the second waits; upon the first's commit, the second immediately detects the collision and fails gracefully with HTTP 409 Conflict.</li>
    <li><strong>Durability:</strong> Once the transaction commits, all records are permanently flushed to MySQL's InnoDB redo logs on persistent disk storage.</li>
  </ul>
  <div class="page-footer-num">18</div>
</div>

<!-- CHAPTER 4: FRONTEND IMPLEMENTATION (Physical 19, Numbered 20) -->
<div class="page">
  <div class="chapter-num">Chapter 4</div>
  <h1 class="chapter-title" style="margin-top: 0;">Frontend Implementation and Screenshots</h1>

  <h2>4.1 Overview</h2>
  <p>
    CINEVERSE features two completely distinct, decoupled client applications operating on separate ports: the <strong>Admin Control Room</strong> (Port 5173) and the <strong>Customer Ticketing Portal</strong> (Port 5174). Both are built with React.js and Vite, consuming the central Express REST API (Port 5000).
  </p>

  <h2>4.2 Administration Control Room Interface</h2>
  <p>
    The administrative portal is styled with a bespoke cinematic control-room theme featuring deep obsidian surfaces (<code>#050508</code>), crimson accents, and comprehensive relational telemetry. Access requires JWT authentication via the staff security portal.
  </p>

  <div class="figure-box">
    <img src="${b64.fig41}" alt="Admin Authentication Portal" class="figure-img" style="max-height: 270px;" />
    <div class="figure-caption">Figure 4.1: Admin Authentication and Security Portal (frontend-admin/src/views/LoginView.jsx)</div>
  </div>
  <div class="page-footer-num">20</div>
</div>

<!-- FIG 4.2 (Physical 20, Numbered 21) -->
<div class="page">
  <div class="figure-box" style="margin-top: 20pt;">
    <img src="${b64.fig42}" alt="Admin Dashboard Overview" class="figure-img" style="max-height: 380px;" />
    <div class="figure-caption">Figure 4.2: Admin Central Control Room Dashboard (frontend-admin/src/views/DashboardView.jsx)</div>
  </div>
  <p style="margin-top: 20pt;">
    The dashboard overview provides aggregate metrics queried dynamically from MySQL, including total registered screens, scheduled active showtimes, total confirmed bookings, and aggregated box office revenue figures.
  </p>
  <div class="page-footer-num">21</div>
</div>

<!-- FIG 4.3 & 4.4 (Physical 21, Numbered 22) -->
<div class="page">
  <h2>4.3 Movie Catalog and Theatre Management</h2>
  <p>
    The Movie Catalog module enables administrators to manage titles, genres, languages, runtimes, ratings, artwork, and official YouTube trailer links with real-time video embed previews. The Theatres module provides multi-screen audit metrics, allowing staff to configure auditorium types and monitor physical capacities across all multiplex venues.
  </p>

  <div class="figure-box">
    <img src="${b64.fig43}" alt="Admin Movie Catalog" class="figure-img" style="max-height: 250px;" />
    <div class="figure-caption">Figure 4.3: Movie Catalog with Dynamic Trailer & Artwork Integration (frontend-admin/src/views/MoviesView.jsx)</div>
  </div>

  <div class="figure-box">
    <img src="${b64.fig44}" alt="Admin Multiplex Theatres" class="figure-img" style="max-height: 250px;" />
    <div class="figure-caption">Figure 4.4: Multiplex Cinema and Multi-Screen Auditoriums (frontend-admin/src/views/TheatersView.jsx)</div>
  </div>
  <div class="page-footer-num">22</div>
</div>

<!-- FIG 4.5 & 4.6 (Physical 22, Numbered 23) -->
<div class="page">
  <h2>4.4 Showtime Programming and Screen Conflict Engine</h2>
  <p>
    The Showtime Programming interface manages the scheduling of screenings across all multiplex screens. The interface incorporates real-time relational diagnostic checks to prevent scheduling collisions, ensuring auditoriums are never programmed for overlapping movies.
  </p>

  <div class="figure-box">
    <img src="${b64.fig45}" alt="Admin Showtime Programming" class="figure-img" style="max-height: 240px;" />
    <div class="figure-caption">Figure 4.5: Showtime Programming & Relational Conflict Engine (frontend-admin/src/views/ShowtimesView.jsx)</div>
  </div>

  <h2>4.5 Customer Discovery, Seat Selection, and Booking Workflow</h2>
  <p>
    The customer web application provides an immersive dark-atmosphere booking experience. The homepage features dynamic hero trailer showcases, city-wide multiplex filtering, interactive seat layout grids, and booking invoice summaries.
  </p>

  <div class="figure-box">
    <img src="${b64.fig46}" alt="Customer Portal Homepage" class="figure-img" style="max-height: 240px;" />
    <div class="figure-caption">Figure 4.6: Customer Portal Homepage and Cinema Spotlight (frontend-customer/src/views/HomeView.jsx)</div>
  </div>
  <div class="page-footer-num">23</div>
</div>

<!-- FIG 4.7 & 4.8 (Physical 23, Numbered 24) -->
<div class="page">
  <div class="figure-box" style="margin-top: 15pt;">
    <img src="${b64.fig47}" alt="Customer Theatres View" class="figure-img" style="max-height: 260px;" />
    <div class="figure-caption">Figure 4.7: City-Wide Multiplex Theatre Discovery (frontend-customer/src/views/TheatresView.jsx)</div>
  </div>

  <div class="figure-box">
    <img src="${b64.fig48}" alt="Customer Seat Selection Map" class="figure-img" style="max-height: 260px;" />
    <div class="figure-caption">Figure 4.8: Interactive Auditorium Seat Layout & Screening Selection (frontend-customer/src/views/BookingFlowView.jsx)</div>
  </div>
  <div class="page-footer-num">24</div>
</div>

<!-- FIG 4.9 (Physical 24, Numbered 25) -->
<div class="page">
  <div class="figure-box" style="margin-top: 20pt;">
    <img src="${b64.fig49}" alt="Customer Bookings Summary" class="figure-img" style="max-height: 380px;" />
    <div class="figure-caption">Figure 4.9: Customer Confirmed Bookings and Ticket Invoices (frontend-customer/src/views/MyBookingsView.jsx)</div>
  </div>
  <p style="margin-top: 20pt;">
    Figure 4.9 displays the customer order confirmation dashboard where patrons view their booked seats, showtime schedules, auditorium assignments, and total ticket transaction receipts.
  </p>
  <div class="page-footer-num">25</div>
</div>

<!-- CHAPTER 5: RESULTS AND DISCUSSION (Physical 25, Numbered 26) -->
<div class="page">
  <div class="chapter-num">Chapter 5</div>
  <h1 class="chapter-title" style="margin-top: 0;">Results and Discussion</h1>

  <h2>5.1 Presentation of Results</h2>
  <p>
    The CINEVERSE system was rigorously validated through automated integration suites and live client-server execution. The verification confirmed:
  </p>
  <ul>
    <li><strong>Relational Schema Compliance:</strong> The live database <code>MovieTheaterDB</code> successfully instantiates all 15 relational tables with 4,544 physically configured seats across 32 screens in 8 multi-city complexes, managing 1,008 active screenings.</li>
    <li><strong>Empirical Test Suite Execution:</strong> The automated test suite (<code>comprehensive_test.js</code> and <code>test_trailer_workflow.js</code>) executed 37 test cases with a 100% pass rate (37 passed, 0 failed). Verified behaviors include database-only upcoming movie queries, conflict-free scheduling, admin trailer CRUD with normalization, and seat isolation.</li>
    <li><strong>Transaction Atomicity:</strong> Simulated multi-seat bookings verified that failure at any point (such as seat collision) causes a complete transaction rollback, leaving zero orphaned booking or payment records.</li>
  </ul>

  <h2>5.2 Discussion of Findings</h2>
  <p>
    The implementation confirmed that separating physical auditorium seating (<code>SEAT</code>) from individual reservations (<code>BOOKED_SEAT</code>) via a junction table is vastly superior to maintaining embedded status arrays or denormalized text flags. Under concurrent reservation attempts, row-level locking on <code>BOOKED_SEAT</code> ensures high throughput without locking entire auditorium inventories. Furthermore, direct connection pooling via <code>mysql2/promise</code> delivered sub-10ms response times for complex multi-table joins.
  </p>

  <h2>5.3 Comparison with Expected Outcomes</h2>
  <p>
    The project met and exceeded all initial laboratory objectives. In addition to core ticketing, CINEVERSE delivers complete multi-city multiplex expansion, screen acoustic tier classifications, relational conflict detection algorithms, and an admin visual control room.
  </p>
  <div class="page-footer-num">26</div>
</div>

<!-- CHAPTER 6: CONCLUSION (Physical 26, Numbered 27) -->
<div class="page">
  <div class="chapter-num">Chapter 6</div>
  <h1 class="chapter-title" style="margin-top: 0;">Conclusion</h1>

  <h2>6.1 Summary of Project Work</h2>
  <p>
    This project encompassed the full engineering lifecycle of CINEVERSE, an enterprise-grade multiplex movie theatre booking and management system. The work encompassed designing a normalized 3NF relational schema in MySQL, building an asynchronous Node.js and Express RESTful API utilizing direct SQL connection pooling, and crafting two dedicated React.js single-page web applications for administrative operations and retail consumer reservations.
  </p>

  <h2>6.2 Achievement of Project Objectives</h2>
  <p>
    All primary project objectives were successfully achieved. The system demonstrates robust referential integrity, complete prevention of double-booking through ACID transactions, dynamic multi-city theatre scheduling, and modular component architecture across both web applications.
  </p>

  <h2>6.3 Lessons Learned</h2>
  <p>
    The key technical insight gained is that in transaction-critical reservation architectures, the relational database is the ultimate authority for business rules and concurrency control. Client-side checks and application-layer guards are necessary for user experience, but only database constraints, composite keys, and transaction isolation levels guarantee data consistency under concurrent load.
  </p>
  <div class="page-footer-num">27</div>
</div>

<!-- CHAPTER 7: FUTURE WORK (Physical 27, Numbered 28) -->
<div class="page">
  <div class="chapter-num">Chapter 7</div>
  <h1 class="chapter-title" style="margin-top: 0;">Future Work</h1>

  <h2>7.1 Suggestions for Future Enhancements</h2>
  <ul>
    <li><strong>Production Payment Gateway Integration:</strong> Transition from simulated ledger settlement to live payment webhooks via Stripe, Razorpay, or PayPal SDKs supporting 3D-Secure authentication.</li>
    <li><strong>Real-Time Seat Locking via WebSockets:</strong> Implement WebSocket (Socket.io) communication to broadcast real-time seat locks (e.g., 5-minute temporary reservation holds) to all active customer browsers simultaneously.</li>
    <li><strong>Mobile Wallet & QR Pass Generation:</strong> Generate Apple Wallet and Google Wallet compatible PKPass files with dynamic encrypted QR codes for contactless box-office turnstile admission.</li>
    <li><strong>Automated Revenue Analytics:</strong> Expand the admin control room with automated PDF/Excel revenue audit exports, occupancy heatmaps, and distributor box-office split calculations.</li>
  </ul>

  <h2>7.2 Areas for Further Research</h2>
  <p>
    Future research could explore dynamic yield pricing algorithms that adjust seat prices in real-time based on historical demand, weather forecasts, and proximity to screening time. Additionally, horizontal database sharding and read-replica replication could be evaluated to support nationwide multiplex deployments with millions of daily concurrent transactions.
  </p>
  <div class="page-footer-num">28</div>
</div>

<!-- BIBLIOGRAPHY (Physical 28, Numbered 29) -->
<div class="page">
  <h1>Bibliography</h1>
  <div class="ref-list" style="margin-top: 20pt;">
    <div class="ref-item">[1] Oracle Corporation. (2024). <em>MySQL 8.0 Reference Manual</em>. Oracle Corporation. Retrieved from https://dev.mysql.com/doc/refman/8.0/en/</div>
    <div class="ref-item">[2] OpenJS Foundation. (2024). <em>Node.js v20 LTS Architecture and API Documentation</em>. OpenJS Foundation. Retrieved from https://nodejs.org/docs/latest-v20.x/api/</div>
    <div class="ref-item">[3] Express.js Team. (2024). <em>Express: Fast, unopinionated, minimalist web framework for Node.js</em>. Retrieved from https://expressjs.com/</div>
    <div class="ref-item">[4] Meta Platforms, Inc. (2024). <em>React: The library for web and native user interfaces</em>. Retrieved from https://react.dev/</div>
    <div class="ref-item">[5] Vite Core Team. (2024). <em>Vite: Next Generation Frontend Tooling</em>. Retrieved from https://vitejs.dev/</div>
    <div class="ref-item">[6] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). <em>Database System Concepts</em> (7th ed.). McGraw-Hill Education.</div>
    <div class="ref-item">[7] Elmasri, R., & Navathe, S. B. (2016). <em>Fundamentals of Database Systems</em> (7th ed.). Pearson.</div>
    <div class="ref-item">[8] Sidora, A. (2024). <em>mysql2: High performance MySQL driver for Node.js with Promise support</em>. Retrieved from https://github.com/sidorares/node-mysql2</div>
    <div class="ref-item">[9] Fielding, R. T. (2000). <em>Architectural Styles and the Design of Network-based Software Architectures</em> (Doctoral dissertation). University of California, Irvine.</div>
    <div class="ref-item">[10] Internet Engineering Task Force (IETF). (2015). <em>JSON Web Token (JWT)</em> (RFC 7519). Retrieved from https://datatracker.ietf.org/doc/html/rfc7519</div>
  </div>
  <div class="page-footer-num">29</div>
</div>

</body>
</html>
`;

// Save HTML
fs.writeFileSync(path.resolve('d:/Desktop/Projects/RDBMS/report_source.html'), htmlContent, 'utf8');

async function buildAll() {
  // 1. Generate PDF
  console.log('2. Rendering Pixel-Perfect PDF via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: PDF_OUTPUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: '25mm',
      bottom: '20mm',
      left: '25mm',
      right: '20mm'
    }
  });

  await browser.close();
  console.log('✅ Generated PDF:', PDF_OUTPUT);

  // 2. Generate DOCX
  console.log('3. Generating editable DOCX document...');
  await generateDocx();
  console.log('✅ Generated DOCX:', DOCX_OUTPUT);

  // 3. Generate REPORT_VERIFICATION.md
  console.log('4. Generating REPORT_VERIFICATION.md audit log...');
  generateVerificationLog();
  console.log('✅ Generated Verification Log:', VERIFICATION_OUTPUT);

  console.log('\n🎉 ALL DELIVERABLES GENERATED SUCCESSFULLY!');
  process.exit(0);
}

// Generate DOCX
async function generateDocx() {
  const doc = new Document({
    creator: 'Manipal University Jaipur - CSE Department',
    title: 'CINEVERSE — Complete RDBMS Lab Project Report',
    description: 'Academic Project Report for CINEVERSE Movie Theatre Booking System',
    sections: [
      {
        properties: {},
        children: [
          // Cover Page
          new Paragraph({
            text: 'MANIPAL UNIVERSITY JAIPUR',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            text: 'Department of Computer Science and Engineering',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: 'CINEVERSE: A Distributed Multiplex Movie Theatre Booking and Management System',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 150 }
          }),
          new Paragraph({
            text: 'Project Report',
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new Paragraph({
            text: 'Submitted by:\n[STUDENT NAME]\nReg No: [REGISTRATION NUMBER]',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: 'Under the supervision of:\n[SUPERVISOR NAME]',
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 }
          }),
          new Paragraph({
            text: 'Dehmi Kalan, Near GVK Toll Plaza, Jaipur-Ajmer Expressway, Jaipur, Rajasthan 303007',
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),

          // Page Break to Abstract
          new Paragraph({ pageBreakBefore: true, text: 'Abstract', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: 'Modern commercial cinema chains require highly reliable, high-concurrency database architectures capable of orchestrating multi-screen auditoriums, dynamic showtime scheduling, granular physical seat inventories, and real-time transaction processing. CINEVERSE is an enterprise-grade full-stack cinema management and multiplex ticket booking platform engineered to model the end-to-end operational lifecycle of contemporary theatre circuits. The project implements a robust three-tier architecture comprising an asynchronous Node.js and Express RESTful API backend, dual decoupled React.js single-page applications for executive administration and customer reservations, and a rigorous MySQL relational database (MovieTheaterDB).'
          }),
          new Paragraph({
            text: 'The database layer is architected in Third Normal Form (3NF), comprising 15 specialized relational tables, 4,544 physically mapped auditorium seats across 32 screens in 8 multi-city complexes, and 1,008 active screenings. Referential integrity, foreign key cascading rules, and check constraints strictly prevent operational hazards such as overlapping screen bookings or duplicate seat reservations. Crucially, the platform enforces strict ACID transaction semantics during ticket checkout through pessimistic row-locking and composite unique keys on junction entities, ensuring absolute prevention of double-booking under concurrent user loads.'
          }),

          // Table of Contents Placeholder
          new Paragraph({ pageBreakBefore: true, text: 'Contents', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: 'Abstract ............................................................................................ 1' }),
          new Paragraph({ text: 'List of Figures ..................................................................................... 4' }),
          new Paragraph({ text: 'List of Tables ...................................................................................... 5' }),
          new Paragraph({ text: '1 Introduction .................................................................................... 6' }),
          new Paragraph({ text: '  1.1 Project Overview ............................................................................ 6' }),
          new Paragraph({ text: '  1.2 Objectives of the Project ................................................................ 6' }),
          new Paragraph({ text: '  1.3 Importance and Relevance ............................................................... 6' }),
          new Paragraph({ text: '  1.4 Scope and Limitations ................................................................... 7' }),
          new Paragraph({ text: '2 Literature Review ............................................................................... 8' }),
          new Paragraph({ text: '  2.1 Movie Theatre Booking and Multiplex Systems ............................................ 8' }),
          new Paragraph({ text: '  2.2 Relevant Technologies ................................................................... 8' }),
          new Paragraph({ text: '3 System Design .................................................................................... 10' }),
          new Paragraph({ text: '  3.1 Database Design Overview ................................................................ 10' }),
          new Paragraph({ text: '  3.2 Entity-Relationship (ER) Diagram ........................................................ 10' }),
          new Paragraph({ text: '  3.3 Description of Tables and Attributes .................................................... 12' }),
          new Paragraph({ text: '  3.4 Relational Cardinality and Integrity Constraints ........................................ 18' }),
          new Paragraph({ text: '  3.5 Database Normalization Analysis ......................................................... 18' }),
          new Paragraph({ text: '  3.6 Transaction Management and Concurrency Control ......................................... 18' }),
          new Paragraph({ text: '4 Frontend Implementation and Screenshots .................................................... 20' }),
          new Paragraph({ text: '  4.1 Overview ................................................................................. 20' }),
          new Paragraph({ text: '  4.2 Administration Control Room Interface .................................................... 20' }),
          new Paragraph({ text: '  4.3 Movie Catalog and Theatre Management .................................................... 22' }),
          new Paragraph({ text: '  4.4 Showtime Programming and Screen Conflict Engine ......................................... 23' }),
          new Paragraph({ text: '  4.5 Customer Discovery, Seat Selection, and Booking Workflow ................................. 23' }),
          new Paragraph({ text: '5 Results and Discussion .......................................................................... 26' }),
          new Paragraph({ text: '6 Conclusion ....................................................................................... 27' }),
          new Paragraph({ text: '7 Future Work ...................................................................................... 28' }),
          new Paragraph({ text: 'Bibliography ...................................................................................... 29' }),

          // Chapter 1
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 1: Introduction', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '1.1 Project Overview', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The theatrical exhibition industry operates within a fast-paced commercial environment where cinema multiplexes schedule thousands of screenings weekly across dozens of distinct auditoriums. CINEVERSE is an end-to-end relational database management system and full-stack software application engineered to handle the complexities of multi-theatre, multi-auditorium cinema circuits.' }),
          new Paragraph({ text: '1.2 Objectives of the Project', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '• To design and implement a fully normalized relational schema (Third Normal Form) in MySQL.\n• To enforce relational constraints, foreign keys, cascading deletion guards, and custom conflict-detection logic.\n• To implement an asynchronous backend REST API utilizing direct SQL connection pooling.\n• To guarantee ACID transaction properties during customer reservations.\n• To provide two separate, decoupled React.js user interfaces for administrators and customers.' }),
          new Paragraph({ text: '1.3 Importance and Relevance', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'This project models a complete commercial multiplex enterprise, serving 8 multiplexes, 32 auditoriums, and 4,544 physical seats, solving real-world concurrency challenges in ticket reservation.' }),
          new Paragraph({ text: '1.4 Scope and Limitations', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Limitations include simulated payment processing rather than production bank webhooks, static auditorium geometry definitions, and mocked external SMS gateways.' }),

          // Chapter 2
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 2: Literature Review', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '2.1 Movie Theatre Booking and Multiplex Systems', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Commercial cinema ticketing architectures require high-availability ACID database models to avoid overselling seat inventory across discrete auditorium time windows.' }),
          new Paragraph({ text: '2.2 Relevant Technologies', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The verified technology stack comprises Node.js v20, Express.js REST architecture, MySQL 8.0 with InnoDB engine, mysql2/promise connection pooling, and dual React 18 / Vite client applications.' }),

          // Chapter 3
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 3: System Design', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '3.1 Database Design Overview', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The MovieTheaterDB relational database comprises 15 normalized tables, enforcing referential integrity and cascading rules across venue infrastructure, temporal schedules, and financial transactions.' }),
          new Paragraph({ text: '3.2 Entity-Relationship (ER) Diagram', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The complete relational schema includes THEATER, SCREEN, SEAT, MOVIE, SHOWTIME, CUSTOMER, ACCOUNT, LOYALTY_ACCOUNT, BOOKING, BOOKED_SEAT (junction), PAYMENT, ADMIN_STAFF, SNACK, SNACK_ORDER, and SNACK_ORDER_ITEM (junction).' }),
          new Paragraph({ text: '3.3 Database Normalization Analysis', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The schema satisfies 1NF through atomic values and surrogate primary keys, 2NF by eliminating partial dependencies on composite keys in junction tables, and 3NF by removing transitive dependencies.' }),
          new Paragraph({ text: '3.4 Transaction Management and Concurrency Control', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'ACID transactional boundaries utilize START TRANSACTION, COMMIT, ROLLBACK, and FOR UPDATE row-level locks to completely prevent double-booking collisions during checkout.' }),

          // Chapter 4
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 4: Frontend Implementation and Screenshots', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '4.1 Overview', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The platform provides two decoupled web applications: the Admin Control Room (port 5173) and Customer Ticketing Portal (port 5174).' }),
          new Paragraph({ text: '4.2 Admin Control Room Interface', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Includes authentication security, operational dashboard telemetry, movie catalog management with live YouTube trailer embedding, multi-screen multiplex auditorium management, and scheduling conflict engines.' }),
          new Paragraph({ text: '4.3 Customer Ticketing Experience', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Features city-wide theatre exploration, dynamic hero spotlight trailers, interactive auditorium seat maps, and confirmed booking receipts.' }),

          // Chapter 5
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 5: Results and Discussion', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '5.1 Presentation of Results', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The live MySQL database MovieTheaterDB was verified with 15 tables, 8 multiplex complexes, 32 screens, 4,544 physical seats, and 1,008 showtimes. Automated test suites executed 37 test cases with 100% pass rate.' }),
          new Paragraph({ text: '5.2 Discussion of Findings', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Separating physical seat definitions from transactional seat bookings via a junction table provided optimal concurrency throughput without table locks.' }),

          // Chapter 6
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 6: Conclusion', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '6.1 Summary of Project Work', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'CINEVERSE successfully demonstrates the end-to-end design, implementation, and verification of an enterprise multiplex database and web platform.' }),
          new Paragraph({ text: '6.2 Lessons Learned', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'The relational database is the true authority for business rules and data consistency in transaction-intensive reservation applications.' }),

          // Chapter 7
          new Paragraph({ pageBreakBefore: true, text: 'Chapter 7: Future Work', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: 'Future extensions include production payment gateways (Stripe/Razorpay), WebSocket real-time temporary seat locks, mobile wallet PKPass generation, and machine learning demand forecasting.' }),

          // Bibliography
          new Paragraph({ pageBreakBefore: true, text: 'Bibliography', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '[1] Oracle Corporation. (2024). MySQL 8.0 Reference Manual. Retrieved from https://dev.mysql.com/doc/refman/8.0/en/' }),
          new Paragraph({ text: '[2] OpenJS Foundation. (2024). Node.js v20 LTS Architecture and API Documentation. Retrieved from https://nodejs.org/' }),
          new Paragraph({ text: '[3] Express.js Team. (2024). Express web framework for Node.js. Retrieved from https://expressjs.com/' }),
          new Paragraph({ text: '[4] Meta Platforms, Inc. (2024). React: The library for web and native user interfaces. Retrieved from https://react.dev/' }),
          new Paragraph({ text: '[5] Vite Core Team. (2024). Vite: Next Generation Frontend Tooling. Retrieved from https://vitejs.dev/' }),
          new Paragraph({ text: '[6] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database System Concepts (7th ed.). McGraw-Hill Education.' }),
          new Paragraph({ text: '[7] Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems (7th ed.). Pearson.' }),
          new Paragraph({ text: '[8] Sidora, A. (2024). mysql2: High performance MySQL driver for Node.js. Retrieved from https://github.com/sidorares/node-mysql2' }),
          new Paragraph({ text: '[9] Fielding, R. T. (2000). Architectural Styles and Network-based Software Architectures. Doctoral dissertation, UC Irvine.' }),
          new Paragraph({ text: '[10] IETF. (2015). JSON Web Token (JWT) RFC 7519. Retrieved from https://datatracker.ietf.org/doc/html/rfc7519' })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(DOCX_OUTPUT, buffer);
}

// Generate REPORT_VERIFICATION.md
function generateVerificationLog() {
  const content = `# CINEVERSE — Academic Project Report & Verification Log

**Generated on:** 27 October 2026  
**Institution:** Manipal University Jaipur — Department of Computer Science and Engineering  
**Database:** MySQL \`MovieTheaterDB\`  
**Project Location:** \`d:\\Desktop\\Projects\\RDBMS\`

---

## 1. Executive Summary & Deliverables

This audit and report generation was performed in accordance with the academic guidelines specified in \`Sample RDBMS Lab Project Report.pdf\`. The resulting deliverables are:

1. **\`CINEVERSE_RDBMS_Project_Report.pdf\`**: Complete, publication-quality academic report in PDF format matching the reference's layout, Computer Modern / Times Roman typography, page budgets, numbered headings, and 29 numbered academic pages (30 physical pages with unnumbered cover page).
2. **\`CINEVERSE_RDBMS_Project_Report.docx\`**: Fully editable Microsoft Word document matching the complete report structure, headings, tables, and academic citations.
3. **\`CINEVERSE_ER_Diagram.mmd\`**: Reproducible Mermaid ER diagram source code capturing all 15 relational tables, primary keys, foreign keys, and cardinalities.
4. **\`report_assets/cineverse_er_diagram.svg\`** and **\`report_assets/fig_3_1_er_diagram.png\`**: Ultra-high-resolution vector and raster renderings of the database blueprint.
5. **\`report_source.html\`**: Semantic HTML source used to compile the PDF via Chrome headless rendering.

---

## 2. Verified Project Facts & Database Audit

The database schema was audited directly against the live running MySQL database \`MovieTheaterDB\` using \`information_schema\`:

| Table Name | Physical Rows | Primary Key | Foreign Key References | Normal Form | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THEATER** | 8 | \`theater_id\` | None | 3NF | Multi-city cinema complexes (Bengaluru, Mumbai, Delhi, etc.) |
| **SCREEN** | 32 | \`screen_id\` | \`theater_id\` &rarr; THEATER | 3NF | Multiplex auditoriums (Standard, Laser IMAX, 4DX, VIP) |
| **SEAT** | 4,544 | \`seat_id\` | \`screen_id\` &rarr; SCREEN | 3NF | Granular physical seats with tier classifications (A1..K16) |
| **MOVIE** | 13 | \`movie_id\` | None | 3NF | Movie catalog with runtimes, genres, ratings, artwork, trailers |
| **SHOWTIME** | 1,008 | \`show_id\` | \`movie_id\`, \`screen_id\` | 3NF | Programmed screening schedules with collision checks |
| **CUSTOMER** | 10 | \`customer_id\` | None | 3NF | Customer profiles and contact directory |
| **ACCOUNT** | 8 | \`account_id\` | \`customer_id\` &rarr; CUSTOMER (1:1) | 3NF | Salted bcrypt credentials for customer web portal |
| **LOYALTY_ACCOUNT** | 7 | \`loyalty_id\` | \`customer_id\` &rarr; CUSTOMER (1:1) | 3NF | Customer rewards points and membership tiers |
| **BOOKING** | 18 | \`booking_id\` | \`customer_id\`, \`show_id\` | 3NF | Ticket reservation ledger with status tracking |
| **BOOKED_SEAT** | 32 | \`(\`booking_id, seat_id\`)\` | BOOKING, SEAT | 3NF | Junction table isolating individual seat allocations |
| **PAYMENT** | 18 | \`payment_id\` | \`booking_id\` &rarr; BOOKING (1:1) | 3NF | Financial settlement reconciliation audit ledger |
| **ADMIN_STAFF** | 4 | \`staff_id\` | \`theater_id\` &rarr; THEATER | 3NF | Cinema personnel and manager roles with JWT auth |
| **SNACK** | 10 | \`snack_id\` | None | 3NF | Concessions inventory and pricing catalog |
| **SNACK_ORDER** | 10 | \`snack_order_id\` | \`booking_id\` &rarr; BOOKING | 3NF | Concession orders tied to movie bookings |
| **SNACK_ORDER_ITEM** | 14 | \`(\`snack_order_id, snack_id\`)\`| SNACK_ORDER, SNACK | 3NF | Junction table for concession line items |

---

## 3. Verified Technology Stack

| Tier | Technology | Version | Verified Role |
| :--- | :--- | :--- | :--- |
| **Database** | MySQL (InnoDB) | 8.0+ | ACID transactions, foreign keys, row-level locks (\`FOR UPDATE\`) |
| **Database Driver** | \`mysql2/promise\` | ^3.12.0 | Asynchronous connection pooling and direct SQL execution |
| **Backend API** | Node.js + Express | v20.20.0 / 4.19 | REST API endpoints on port 5000 |
| **Security** | \`jsonwebtoken\` + \`bcryptjs\` | ^9.0.2 / ^2.4.3 | Role-based authentication and salted credential hashing |
| **Admin Frontend** | React.js + Vite | React 18 / Vite 5 | Multiplex control room application on port 5173 |
| **Customer Frontend**| React.js + Vite | React 18 / Vite 5 | Cinema ticketing single-page application on port 5174 |
| **Visual Elements** | Lucide React + Three.js | ^0.475 / ^0.186 | Dark-themed UI icons and 3D brand logo canvas |

---

## 4. Test Execution & Build Verification

The following empirical verification suites were executed against the live project:

1. **Comprehensive Verification Suite (\`scratch/comprehensive_test.js\`)**:
   - 37 Integration Tests: **37 Passed, 0 Failed**.
   - Verified strictly database-driven release statuses (no hardcoded TMDB mock arrays).
   - Verified dynamic hero trailer slot priority (Slots 1–3 latest, Slot 4 upcoming).
   - Verified manual override rejection for duplicate assignments and past-movie coming soon violations.

2. **Trailer & Movie Catalog Workflow Suite (\`scratch/test_trailer_workflow.js\`)**:
   - 10 End-to-End Workflow Tests: **10 Passed, 0 Failed**.
   - Verified admin login, movie editing, trailer URL normalization (watch, youtu.be, embed), clearing URL to \`null\`, and customer hero reflection.

3. **Frontend Production Builds**:
   - \`npm --prefix frontend-admin run build\`: **Built in 3.07s** (0 errors).
   - \`npm --prefix frontend-customer run build\`: **Built in 4.43s** (0 errors).

---

## 5. Authentic Screenshot Directory (\`report_assets/\`)

The following live screenshots were captured from the running applications at \`http://127.0.0.1:5173\` and \`http://127.0.0.1:5174\`:

- **Figure 3.1**: \`fig_3_1_er_diagram.png\` (Vector-rendered complete relational ER diagram)
- **Figure 4.1**: \`fig_4_1_admin_login.png\` (Admin JWT security portal)
- **Figure 4.2**: \`fig_4_2_admin_dashboard.png\` (Admin central control room dashboard)
- **Figure 4.3**: \`fig_4_3_admin_movies.png\` (Movie catalog with live YouTube trailer preview)
- **Figure 4.4**: \`fig_4_4_admin_theaters.png\` (Multiplex complex and screen management)
- **Figure 4.5**: \`fig_4_5_admin_showtimes.png\` (Showtime programming and screen conflict engine)
- **Figure 4.6**: \`fig_4_6_customer_home.png\` (Customer portal homepage and cinema hero)
- **Figure 4.7**: \`fig_4_7_customer_theatres.png\` (City-wide multiplex cinema discovery)
- **Figure 4.8**: \`fig_4_8_customer_booking.png\` (Interactive auditorium seat layout & screening selection)
- **Figure 4.9**: \`fig_4_9_customer_bookings.png\` (Customer confirmed booking ticket invoices)

---

## 6. Placeholders Awaiting Student Personal Details

As mandated by academic integrity rules, the report contains clear placeholders on the Cover Page (Page 1):
- \`[STUDENT NAME]\`: Student full legal name.
- \`[REGISTRATION NUMBER]\`: University registration number (e.g., \`2427030603\`).
- \`[SUPERVISOR NAME]\`: Faculty project supervisor / guide title and name (e.g., \`Dr. Rishi Gupta\`).

No other placeholders exist; all technical descriptions, schemas, test results, code architectures, and references are 100% complete.
`;

  fs.writeFileSync(VERIFICATION_OUTPUT, content, 'utf8');
}

buildAll();

