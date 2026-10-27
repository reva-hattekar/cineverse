const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ASSETS_DIR = path.resolve(__dirname, '../report_assets');
const SVG_OUTPUT = path.join(ASSETS_DIR, 'cineverse_er_diagram.svg');
const PNG_OUTPUT = path.join(ASSETS_DIR, 'fig_3_1_er_diagram.png');

function buildErDiagramSvg() {
  // Canvas: 1400 x 900 (Optimized for A4 Landscape with zero clipping)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 920" width="1440" height="920" style="background-color: #ffffff; font-family: 'Times New Roman', Times, serif;">
  <defs>
    <style>
      .title-main { font-size: 20px; font-weight: bold; fill: #0f172a; text-anchor: middle; font-family: 'Times New Roman', serif; }
      .title-sub { font-size: 13px; fill: #475569; font-style: italic; text-anchor: middle; font-family: 'Times New Roman', serif; }
      
      .entity-box { fill: #ffffff; stroke: #334155; stroke-width: 1.5; rx: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06)); }
      .entity-box-junction { fill: #fffbeb; stroke: #b45309; stroke-width: 1.8; rx: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08)); }
      .entity-box-account { fill: #f8fafc; stroke: #0284c7; stroke-width: 1.5; rx: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06)); }
      
      .header-bg { fill: #1e293b; }
      .header-bg-junction { fill: #78350f; }
      .header-bg-account { fill: #0369a1; }
      
      .header-text { font-size: 13.5px; font-weight: bold; fill: #ffffff; text-anchor: middle; letter-spacing: 0.5px; }
      
      .attr-text { font-size: 11.5px; font-family: 'Consolas', 'Courier New', monospace; }
      .attr-pk { font-weight: bold; fill: #b91c1c; }
      .attr-fk { font-weight: bold; fill: #0284c7; }
      .attr-norm { fill: #1e293b; }
      .attr-type { fill: #64748b; font-size: 10.5px; }
      
      .rel-line { stroke: #475569; stroke-width: 1.6; fill: none; }
      .rel-line-junction { stroke: #b45309; stroke-width: 1.6; stroke-dasharray: 4,2; fill: none; }
      
      .card-badge { fill: #ffffff; stroke: #cbd5e1; stroke-width: 1; rx: 3px; }
      .card-text { font-size: 11px; font-weight: bold; fill: #b91c1c; text-anchor: middle; font-family: sans-serif; }
      .rel-label { font-size: 10.5px; fill: #334155; font-style: italic; text-anchor: middle; background: #fff; }
      
      .legend-box { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 1; rx: 6px; }
      .legend-text { font-size: 11px; fill: #334155; font-family: sans-serif; }
    </style>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- TITLE BLOCK -->
  <text x="720" y="32" class="title-main">CINEVERSE MULTIPLEX — RELATIONAL ENTITY-RELATIONSHIP DIAGRAM</text>
  <text x="720" y="52" class="title-sub">Complete Third Normal Form (3NF) Database Architecture • Engine: MySQL 8.0 (InnoDB) • Database: MovieTheaterDB</text>

  <!-- ========================================================
       CONNECTOR PATHS & CARDINALITY BADGES
       ======================================================== -->

  <!-- THEATER (x:40, y:75, w:190, h:115) to SCREEN (x:40, y:230, w:190, h:155) -->
  <path d="M 135,190 L 135,230" class="rel-line" />
  <rect x="142" y="196" width="22" height="15" class="card-badge" />
  <text x="153" y="208" class="card-text">1</text>
  <rect x="142" y="212" width="22" height="15" class="card-badge" />
  <text x="153" y="224" class="card-text">N</text>

  <!-- THEATER to ADMIN_STAFF (x:40, y:430, w:190, h:175) -->
  <path d="M 40,132 L 20,132 L 20,515 L 40,515" class="rel-line" />
  <rect x="5" y="270" width="20" height="15" class="card-badge" />
  <text x="15" y="282" class="card-text">1</text>
  <rect x="5" y="370" width="20" height="15" class="card-badge" />
  <text x="15" y="382" class="card-text">N</text>

  <!-- SCREEN (x:40, y:230) to SEAT (x:40, y:650, w:190, h:115) -->
  <path d="M 135,385 L 135,650" class="rel-line" />
  <rect x="142" y="440" width="22" height="15" class="card-badge" />
  <text x="153" y="452" class="card-text">1</text>
  <rect x="142" y="590" width="22" height="15" class="card-badge" />
  <text x="153" y="602" class="card-text">N</text>

  <!-- SCREEN to SHOWTIME (x:290, y:230, w:210, h:175) -->
  <path d="M 230,305 L 290,305" class="rel-line" />
  <rect x="238" y="293" width="20" height="15" class="card-badge" />
  <text x="248" y="305" class="card-text">1</text>
  <rect x="264" y="293" width="20" height="15" class="card-badge" />
  <text x="274" y="305" class="card-text">N</text>

  <!-- MOVIE (x:290, y:75, w:210, h:130) to SHOWTIME -->
  <path d="M 395,205 L 395,230" class="rel-line" />
  <rect x="402" y="208" width="20" height="15" class="card-badge" />
  <text x="412" y="220" class="card-text">1</text>
  <rect x="402" y="215" width="20" height="15" class="card-badge" style="display:none;" />

  <!-- SHOWTIME to BOOKING (x:570, y:230, w:210, h:160) -->
  <path d="M 500,305 L 570,305" class="rel-line" />
  <rect x="508" y="293" width="20" height="15" class="card-badge" />
  <text x="518" y="305" class="card-text">1</text>
  <rect x="544" y="293" width="20" height="15" class="card-badge" />
  <text x="554" y="305" class="card-text">N</text>

  <!-- CUSTOMER (x:570, y:75, w:210, h:115) to BOOKING -->
  <path d="M 675,190 L 675,230" class="rel-line" />
  <rect x="682" y="196" width="20" height="15" class="card-badge" />
  <text x="692" y="208" class="card-text">1</text>
  <rect x="682" y="212" width="20" height="15" class="card-badge" />
  <text x="692" y="224" class="card-text">N</text>

  <!-- CUSTOMER to ACCOUNT (x:840, y:75, w:220, h:135) [1:1] -->
  <path d="M 780,120 L 840,120" class="rel-line" />
  <rect x="788" y="112" width="20" height="15" class="card-badge" />
  <text x="798" y="124" class="card-text">1</text>
  <rect x="814" y="112" width="20" height="15" class="card-badge" />
  <text x="824" y="124" class="card-text">1</text>

  <!-- CUSTOMER to LOYALTY_ACCOUNT (x:1120, y:75, w:220, h:125) [1:1] -->
  <path d="M 780,95 L 810,95 L 810,48 L 1230,48 L 1230,75" class="rel-line" />
  <rect x="815" y="40" width="20" height="15" class="card-badge" />
  <text x="825" y="52" class="card-text">1</text>
  <rect x="1195" y="55" width="20" height="15" class="card-badge" />
  <text x="1205" y="67" class="card-text">1</text>

  <!-- BOOKING to BOOKED_SEAT (x:450, y:650, w:210, h:95) [Junction 1:N] -->
  <path d="M 640,390 L 640,650" class="rel-line-junction" />
  <rect x="648" y="440" width="20" height="15" class="card-badge" />
  <text x="658" y="452" class="card-text">1</text>
  <rect x="648" y="620" width="20" height="15" class="card-badge" />
  <text x="658" y="632" class="card-text">N</text>

  <!-- SEAT (x:40, y:650) to BOOKED_SEAT [Junction 1:N] -->
  <path d="M 230,705 L 450,705" class="rel-line-junction" />
  <rect x="250" y="693" width="20" height="15" class="card-badge" />
  <text x="260" y="705" class="card-text">1</text>
  <rect x="415" y="693" width="20" height="15" class="card-badge" />
  <text x="425" y="705" class="card-text">N</text>

  <!-- BOOKING to PAYMENT (x:840, y:230, w:220, h:135) [1:1] -->
  <path d="M 780,295 L 840,295" class="rel-line" />
  <rect x="788" y="287" width="20" height="15" class="card-badge" />
  <text x="798" y="299" class="card-text">1</text>
  <rect x="814" y="287" width="20" height="15" class="card-badge" />
  <text x="824" y="299" class="card-text">1</text>

  <!-- BOOKING to SNACK_ORDER (x:840, y:430, w:220, h:125) [1:N] -->
  <path d="M 720,390 L 720,490 L 840,490" class="rel-line" />
  <rect x="728" y="420" width="20" height="15" class="card-badge" />
  <text x="738" y="432" class="card-text">1</text>
  <rect x="814" y="482" width="20" height="15" class="card-badge" />
  <text x="824" y="494" class="card-text">N</text>

  <!-- SNACK_ORDER to SNACK_ORDER_ITEM (x:840, y:650, w:220, h:115) [Junction 1:N] -->
  <path d="M 950,555 L 950,650" class="rel-line-junction" />
  <rect x="958" y="575" width="20" height="15" class="card-badge" />
  <text x="968" y="587" class="card-text">1</text>
  <rect x="958" y="625" width="20" height="15" class="card-badge" />
  <text x="968" y="637" class="card-text">N</text>

  <!-- SNACK (x:1120, y:650, w:220, h:105) to SNACK_ORDER_ITEM [Junction 1:N] -->
  <path d="M 1120,705 L 1060,705" class="rel-line-junction" />
  <rect x="1090" y="693" width="20" height="15" class="card-badge" />
  <text x="1100" y="705" class="card-text">1</text>
  <rect x="1065" y="693" width="20" height="15" class="card-badge" />
  <text x="1075" y="705" class="card-text">N</text>


  <!-- ========================================================
       ENTITY 1: THEATER
       ======================================================== -->
  <g transform="translate(40, 75)">
    <rect width="190" height="115" class="entity-box" />
    <path d="M 0,0 L 190,0 L 190,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="95" y="18" class="header-text">THEATER</text>
    <text x="12" y="45" class="attr-text attr-pk">PK theater_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">theater_name <tspan class="attr-type">VARCHAR(100)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">city <tspan class="attr-type">VARCHAR(50)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">address <tspan class="attr-type">VARCHAR(255)</tspan></text>
  </g>

  <!-- ENTITY 2: SCREEN -->
  <g transform="translate(40, 230)">
    <rect width="190" height="155" class="entity-box" />
    <path d="M 0,0 L 190,0 L 190,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="95" y="18" class="header-text">SCREEN</text>
    <text x="12" y="45" class="attr-text attr-pk">PK screen_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">screen_number <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">screen_name <tspan class="attr-type">VARCHAR(60)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">screen_type <tspan class="attr-type">VARCHAR(40)</tspan></text>
    <text x="12" y="125" class="attr-text attr-norm">capacity <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="145" class="attr-text attr-fk">FK theater_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 3: ADMIN_STAFF -->
  <g transform="translate(40, 430)">
    <rect width="190" height="175" class="entity-box" />
    <path d="M 0,0 L 190,0 L 190,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="95" y="18" class="header-text">ADMIN_STAFF</text>
    <text x="12" y="45" class="attr-text attr-pk">PK staff_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">staff_name <tspan class="attr-type">VARCHAR(100)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">email <tspan class="attr-type">VARCHAR(120) UK</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">phone <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="125" class="attr-text attr-norm">role <tspan class="attr-type">VARCHAR(50)</tspan></text>
    <text x="12" y="145" class="attr-text attr-norm">password_hash <tspan class="attr-type">VARCHAR</tspan></text>
    <text x="12" y="165" class="attr-text attr-fk">FK theater_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 4: SEAT -->
  <g transform="translate(40, 650)">
    <rect width="190" height="115" class="entity-box" />
    <path d="M 0,0 L 190,0 L 190,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="95" y="18" class="header-text">SEAT</text>
    <text x="12" y="45" class="attr-text attr-pk">PK seat_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">seat_number <tspan class="attr-type">VARCHAR(10)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">seat_type <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="105" class="attr-text attr-fk">FK screen_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 5: MOVIE -->
  <g transform="translate(290, 75)">
    <rect width="210" height="130" class="entity-box" />
    <path d="M 0,0 L 210,0 L 210,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="105" y="18" class="header-text">MOVIE</text>
    <text x="12" y="45" class="attr-text attr-pk">PK movie_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">title <tspan class="attr-type">VARCHAR(150)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">genre <tspan class="attr-type">VARCHAR(50)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">duration <tspan class="attr-type">INT (Minutes)</tspan></text>
    <text x="12" y="122" class="attr-text attr-norm">rating <tspan class="attr-type">DECIMAL(3,1)</tspan></text>
  </g>

  <!-- ENTITY 6: SHOWTIME -->
  <g transform="translate(290, 230)">
    <rect width="210" height="175" class="entity-box" />
    <path d="M 0,0 L 210,0 L 210,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="105" y="18" class="header-text">SHOWTIME</text>
    <text x="12" y="45" class="attr-text attr-pk">PK show_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">show_date <tspan class="attr-type">DATE</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">start_time <tspan class="attr-type">TIME</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">end_time <tspan class="attr-type">TIME</tspan></text>
    <text x="12" y="125" class="attr-text attr-norm">base_price <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
    <text x="12" y="145" class="attr-text attr-fk">FK movie_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="165" class="attr-text attr-fk">FK screen_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 7: BOOKING -->
  <g transform="translate(570, 230)">
    <rect width="210" height="160" class="entity-box" />
    <path d="M 0,0 L 210,0 L 210,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="105" y="18" class="header-text">BOOKING</text>
    <text x="12" y="45" class="attr-text attr-pk">PK booking_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">booking_date <tspan class="attr-type">TIMESTAMP</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">total_amount <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">booking_status <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="125" class="attr-text attr-fk">FK customer_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="145" class="attr-text attr-fk">FK show_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 8: BOOKED_SEAT (JUNCTION) -->
  <g transform="translate(450, 650)">
    <rect width="210" height="95" class="entity-box-junction" />
    <path d="M 0,0 L 210,0 L 210,26 L 0,26 Z" class="header-bg-junction" rx="6" />
    <text x="105" y="18" class="header-text">BOOKED_SEAT (Junction)</text>
    <text x="12" y="45" class="attr-text attr-pk">PK,FK booking_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-pk">PK,FK seat_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">ticket_price <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
  </g>

  <!-- ENTITY 9: CUSTOMER -->
  <g transform="translate(570, 75)">
    <rect width="210" height="115" class="entity-box" />
    <path d="M 0,0 L 210,0 L 210,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="105" y="18" class="header-text">CUSTOMER</text>
    <text x="12" y="45" class="attr-text attr-pk">PK customer_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">customer_name <tspan class="attr-type">VARCHAR(100)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">phone <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">email <tspan class="attr-type">VARCHAR(120) UK</tspan></text>
  </g>

  <!-- ENTITY 10: ACCOUNT (1:1) -->
  <g transform="translate(840, 75)">
    <rect width="220" height="135" class="entity-box-account" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg-account" rx="6" />
    <text x="110" y="18" class="header-text">ACCOUNT (Portal Login)</text>
    <text x="12" y="45" class="attr-text attr-pk">PK account_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-fk">FK customer_id <tspan class="attr-type">INT (1:1 UK)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">email <tspan class="attr-type">VARCHAR(120) UK</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">password_hash <tspan class="attr-type">VARCHAR(255)</tspan></text>
    <text x="12" y="125" class="attr-text attr-norm">is_active <tspan class="attr-type">TINYINT(1)</tspan></text>
  </g>

  <!-- ENTITY 11: LOYALTY_ACCOUNT (1:1) -->
  <g transform="translate(1120, 75)">
    <rect width="220" height="125" class="entity-box-account" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg-account" rx="6" />
    <text x="110" y="18" class="header-text">LOYALTY_ACCOUNT (Rewards)</text>
    <text x="12" y="45" class="attr-text attr-pk">PK loyalty_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-fk">FK customer_id <tspan class="attr-type">INT (1:1 UK)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">total_points <tspan class="attr-type">INT (chk >= 0)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">join_date <tspan class="attr-type">DATE</tspan></text>
    <text x="12" y="120" class="attr-text attr-norm">membership_level <tspan class="attr-type">VARCHAR(20)</tspan></text>
  </g>

  <!-- ENTITY 12: PAYMENT (1:1 with Booking) -->
  <g transform="translate(840, 230)">
    <rect width="220" height="145" class="entity-box" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="110" y="18" class="header-text">PAYMENT</text>
    <text x="12" y="45" class="attr-text attr-pk">PK payment_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">amount <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">payment_method <tspan class="attr-type">VARCHAR(30)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">payment_status <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="125" class="attr-text attr-norm">payment_date <tspan class="attr-type">TIMESTAMP</tspan></text>
    <text x="12" y="140" class="attr-text attr-fk">FK booking_id <tspan class="attr-type">INT (1:1 UK)</tspan></text>
  </g>

  <!-- ENTITY 13: SNACK_ORDER -->
  <g transform="translate(840, 430)">
    <rect width="220" height="125" class="entity-box" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="110" y="18" class="header-text">SNACK_ORDER</text>
    <text x="12" y="45" class="attr-text attr-pk">PK snack_order_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">order_date <tspan class="attr-type">TIMESTAMP</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">order_status <tspan class="attr-type">VARCHAR(20)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">total_price <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
    <text x="12" y="120" class="attr-text attr-fk">FK booking_id <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ENTITY 14: SNACK_ORDER_ITEM (JUNCTION) -->
  <g transform="translate(840, 650)">
    <rect width="220" height="115" class="entity-box-junction" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg-junction" rx="6" />
    <text x="110" y="18" class="header-text">SNACK_ORDER_ITEM (Junction)</text>
    <text x="12" y="45" class="attr-text attr-pk">PK,FK snack_order_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-pk">PK,FK snack_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">quantity <tspan class="attr-type">INT (chk > 0)</tspan></text>
    <text x="12" y="105" class="attr-text attr-norm">unit_price <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
  </g>

  <!-- ENTITY 15: SNACK -->
  <g transform="translate(1120, 650)">
    <rect width="220" height="105" class="entity-box" />
    <path d="M 0,0 L 220,0 L 220,26 L 0,26 Z" class="header-bg" rx="6" />
    <text x="110" y="18" class="header-text">SNACK (Concession)</text>
    <text x="12" y="45" class="attr-text attr-pk">PK snack_id <tspan class="attr-type">INT</tspan></text>
    <text x="12" y="65" class="attr-text attr-norm">snack_name <tspan class="attr-type">VARCHAR(100)</tspan></text>
    <text x="12" y="85" class="attr-text attr-norm">price <tspan class="attr-type">DECIMAL(10,2)</tspan></text>
    <text x="12" y="100" class="attr-text attr-norm">stock_quantity <tspan class="attr-type">INT</tspan></text>
  </g>

  <!-- ========================================================
       LEGEND BLOCK (BOTTOM CENTER)
       ======================================================== -->
  <g transform="translate(260, 810)">
    <rect width="920" height="75" class="legend-box" />
    <text x="460" y="22" style="font-size: 12px; font-weight: bold; fill: #0f172a; text-anchor: middle;">LEGEND &amp; RELATIONAL NOTATION</text>
    
    <text x="25" y="45" class="legend-text"><tspan font-weight="bold" fill="#b91c1c">[PK]</tspan> Primary Key</text>
    <text x="145" y="45" class="legend-text"><tspan font-weight="bold" fill="#0284c7">[FK]</tspan> Foreign Key</text>
    <text x="265" y="45" class="legend-text"><tspan font-weight="bold" fill="#0f172a">[UK]</tspan> Unique Key</text>
    <text x="390" y="45" class="legend-text"><tspan font-weight="bold">1 — N</tspan> One-to-Many Cardinality</text>
    <text x="565" y="45" class="legend-text"><tspan font-weight="bold">1 — 1</tspan> One-to-One Cardinality</text>
    
    <rect x="735" y="32" width="16" height="16" fill="#fffbeb" stroke="#b45309" stroke-width="1.2" rx="2" />
    <text x="760" y="45" class="legend-text">Associative Junction Table (M:N Decomposed)</text>

    <text x="460" y="64" style="font-size: 10.5px; fill: #64748b; text-anchor: middle;">All 15 base tables audited against live MySQL database MovieTheaterDB • Complies with 3NF standards</text>
  </g>

</svg>`;
}

async function run() {
  console.log('1. Generating clean, high-resolution SVG...');
  const svg = buildErDiagramSvg();
  fs.writeFileSync(SVG_OUTPUT, svg, 'utf8');
  console.log('✅ Wrote SVG:', SVG_OUTPUT);

  console.log('2. Rasterizing 2x high-resolution PNG via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // Set high resolution viewport (2880 x 1840 for ultra-crisp print quality)
  await page.setViewport({ width: 2880, height: 1840, deviceScaleFactor: 2 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;">${svg}</body></html>`);
  
  const element = await page.$('svg');
  await element.screenshot({ path: PNG_OUTPUT, omitBackground: false });
  await browser.close();
  console.log('✅ Wrote 2x high-res PNG:', PNG_OUTPUT);
}

run().catch(console.error);

