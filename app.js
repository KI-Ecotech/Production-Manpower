// =====================================================
// GOOGLE SHEET
// =====================================================

const SHEET_ID =
  '1btQ_Zv4lp22r3zs0eM6Ssss8fr84dbO4BWqEneeXmg0';

const OUTSIDE_SHEET =
  'outside';

const ONSIDE_SHEET =
  'onside';

const EMPLOYEE_SHEET =
  'employees';



// =====================================================
// STATE
// =====================================================

let jobs = [];

let employees = {};

let selectedDate = '';



// =====================================================
// PAGE MODE
// =====================================================

const isOnsidePage =
  document.getElementById(
    'onsideBoard'
  );

const isOutsidePage =
  document.getElementById(
    'outsideBoard'
  );



// =====================================================
// TODAY
// =====================================================

const today =
  new Date();

const yyyy =
  today.getFullYear();

const mm =
  String(today.getMonth() + 1)
    .padStart(2, '0');

const dd =
  String(today.getDate())
    .padStart(2, '0');

selectedDate =
  `${yyyy}-${mm}-${dd}`;

document.getElementById(
  'workDate'
).value =
  selectedDate;



// =====================================================
// DATE CHANGE
// =====================================================

document
  .getElementById('workDate')
  .addEventListener('change', async e => {

    selectedDate =
      e.target.value;

    if (isOutsidePage) {

      await loadOutsideData();

    }

    if (isOnsidePage) {

      await loadOnsideData();

    }

  });



// =====================================================
// LOAD EMPLOYEES
// =====================================================

// =====================================================
// LOAD EMPLOYEES
// =====================================================

async function loadEmployees() {

  try {

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${EMPLOYEE_SHEET}`;

    const response =
      await fetch(url);

    const text =
      await response.text();

    const json =
      JSON.parse(
        text.substring(47).slice(0, -2)
      );

    const rows =
      json.table.rows;

    employees = {};

    rows.forEach(row => {

      const engName =
        row.c[1]?.v
          ?.toString()
          .trim();

      const thaiName =
        row.c[2]?.v
          ?.toString()
          .trim();

      // =====================================================
      // COL D = IMAGE URL
      // =====================================================

      const avatar =
        row.c[3]?.v
          ?.toString()
          .trim();

      if (!engName)
        return;

      employees[engName] = {

        thai:
          thaiName || '',

        avatar:
          avatar || ''

      };

    });

  }

  catch (err) {

    console.error(
      'loadEmployees error:',
      err
    );

  }

}


// =====================================================
// LOAD OUTSIDE
// =====================================================

async function loadOutsideData() {

  try {

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${OUTSIDE_SHEET}`;

    const response =
      await fetch(url);

    const text =
      await response.text();

    const json =
      JSON.parse(
        text.substring(47).slice(0, -2)
      );

    const rows =
      json.table.rows;



    jobs = rows.map(row => ({

      date:
        row.c[0]?.f || '',

      name:
        row.c[1]?.v || '',

      time:
        row.c[2]?.v || '',

      color:
        row.c[3]?.v || '#3b82f6',

      driver:
        row.c[4]?.v || '',

      helpers: [

        row.c[5]?.v || '',
        row.c[6]?.v || '',
        row.c[7]?.v || '',
        row.c[8]?.v || '',
        row.c[9]?.v || '',
        row.c[10]?.v || '',
        row.c[11]?.v || ''

      ].filter(Boolean),

      total:
        Number(row.c[12]?.v || 0)

    }));



    renderOutsideBoard();

  }

  catch (err) {

    console.error(
      'loadOutsideData error:',
      err
    );

    showToast(
      'โหลด Outside ไม่สำเร็จ'
    );

  }

}



// =====================================================
// LOAD ONSIDE
// =====================================================

async function loadOnsideData() {

  try {

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ONSIDE_SHEET}`;

    const response =
      await fetch(url);

    const text =
      await response.text();

    const json =
      JSON.parse(
        text.substring(47).slice(0, -2)
      );

    const rows =
      json.table.rows;



    jobs = rows.map(row => ({

      date:
        row.c[0]?.f || '',

      name:
        row.c[1]?.v || '',

      employees: [

        row.c[2]?.v || '',
        row.c[3]?.v || '',
        row.c[4]?.v || '',
        row.c[5]?.v || '',
        row.c[6]?.v || '',
        row.c[7]?.v || '',
        row.c[8]?.v || '',
        row.c[9]?.v || '',
        row.c[10]?.v || '',
        row.c[11]?.v || '',
        row.c[12]?.v || '',
        row.c[13]?.v || '',
        row.c[14]?.v || '',
        row.c[15]?.v || ''

      ].filter(Boolean),

      total:
        Number(row.c[16]?.v || 0)

    }));



    renderOnsideBoard();

  }

  catch (err) {

    console.error(
      'loadOnsideData error:',
      err
    );

    showToast(
      'โหลด Onside ไม่สำเร็จ'
    );

  }

}



// =====================================================
// FILTER DATE
// =====================================================

function filterJobsByDate(data) {

  return data.filter(job => {

    if (!job.date)
      return false;

    const parts =
      job.date
        .toString()
        .trim()
        .split('/');

    if (parts.length !== 3)
      return false;

    const day =
      parts[0]
        .padStart(2, '0');

    const month =
      parts[1]
        .padStart(2, '0');

    const year =
      parts[2];

    const sheetDate =
      `${year}-${month}-${day}`;

    return (
      sheetDate === selectedDate
    );

  });

}



// =====================================================
// RENDER OUTSIDE
// =====================================================

// =====================================================
// RENDER OUTSIDE
// =====================================================

function renderOutsideBoard() {

  const board =
    document.getElementById(
      'outsideBoard'
    );

  if (!board)
    return;

  board.innerHTML = `

    <div class="outside-header board-header">

      <div class="board-header-cell">
        Area
      </div>

      <div class="board-header-cell">
        Driver
      </div>

      <div class="board-header-cell">
        H1
      </div>

      <div class="board-header-cell">
        H2
      </div>

      <div class="board-header-cell">
        H3
      </div>

      <div class="board-header-cell">
        H4
      </div>

      <div class="board-header-cell">
        H5
      </div>

      <div class="board-header-cell">
        H6
      </div>

      <div class="board-header-cell">
        Total
      </div>

    </div>

  `;

  const filteredJobs =
    filterJobsByDate(jobs);

  let totalDrivers = 0;
  let totalHelpers = 0;

  if (filteredJobs.length === 0) {

    renderEmpty(board);

    return;

  }

  filteredJobs.forEach(job => {

    if (job.driver)
      totalDrivers++;

    totalHelpers +=
      job.helpers.length;

    const row =
      document.createElement('div');

    row.className =
      'outside-row';

    // AREA

    const area =
      document.createElement('div');

    area.className =
      'area-cell';

    area.innerHTML = `

      <span
        class="area-color"
        style="
          background:
          ${job.color};
        "
      ></span>

      <div class="staff-info">

        <div class="area-name">
          ${job.name}
        </div>

        <div class="area-time">
          ${job.time}
        </div>

      </div>

    `;

    row.appendChild(area);

    // DRIVER

    row.appendChild(
      createCard(
        job.driver,
        'D'
      )
    );

    // HELPERS

    for (let i = 0; i < 6; i++) {

      row.appendChild(

        createCard(
          job.helpers[i] || '',
          'H'
        )

      );

    }

    // TOTAL

    const total =
      document.createElement('div');

    total.className =
      'total-cell';

    total.innerHTML = `

      <div class="total-number">
        ${job.total}
      </div>

    `;

    row.appendChild(total);

    board.appendChild(row);

  });

  document.getElementById(
    'sumDrivers'
  ).textContent =
    totalDrivers;

  document.getElementById(
    'sumHelpers'
  ).textContent =
    totalHelpers;

  document.getElementById(
    'sumTotal'
  ).textContent =
    totalDrivers + totalHelpers;

}

// =====================================================
// RENDER ONSIDE
// =====================================================

function renderOnsideBoard() {

  const board =
    document.getElementById(
      'onsideBoard'
    );

  if (!board)
    return;

  board.innerHTML = `

    <div class="onside-header board-header">

      <div class="board-header-cell">
        Department
      </div>

      <div class="board-header-cell">
        Employees
      </div>

      <div class="board-header-cell">
        Total
      </div>

    </div>

  `;

  const filteredJobs =
    filterJobsByDate(jobs);

  let totalWorking = 0;
  let totalLeave = 0;

  const leaveTypes = [
    'ลาป่วย',
    'ลากิจ',
    'ลาพักร้อน'
  ];

  if (filteredJobs.length === 0) {

    renderEmpty(board);

    return;

  }

  filteredJobs.forEach(job => {

    if (
      leaveTypes.includes(
        job.name
      )
    ) {

      totalLeave +=
        job.employees.length;

    } else {

      totalWorking +=
        job.employees.length;

    }

    let areaColor =
      '#22c55e';

    if (
      leaveTypes.includes(
        job.name
      )
    ) {

      areaColor =
        '#ef4444';

    }

    const row =
      document.createElement('div');

    row.className =
      'onside-row';

    // AREA

    const area =
      document.createElement('div');

    area.className =
      'area-cell';

    area.innerHTML = `

      <span
        class="area-color"
        style="
          background:
          ${areaColor};
        "
      ></span>

      <div class="staff-info">

        <div class="area-name">
          ${job.name}
        </div>

        <div class="area-time">
          ONSIDE
        </div>

      </div>

    `;

    row.appendChild(area);

    // EMPLOYEE GRID

    const empGrid =
      document.createElement('div');

    empGrid.className =
      'employee-grid';

    empGrid.style.display =
      'grid';

    empGrid.style.gridTemplateColumns =
      'repeat(7, minmax(0, 1fr))';

    empGrid.style.gap =
      '6px';

    const totalSlots =
      job.employees.length > 7
        ? 14
        : 7;

    empGrid.style.gridTemplateRows =
      job.employees.length > 7
        ? 'repeat(2, auto)'
        : 'repeat(1, auto)';

    for (
      let i = 0;
      i < totalSlots;
      i++
    ) {

      empGrid.appendChild(

        createCard(
          job.employees[i] || '',
          'H'
        )

      );

    }

    row.appendChild(empGrid);

    // TOTAL

    const total =
      document.createElement('div');

    total.className =
      'total-cell';

    total.innerHTML = `

      <div class="total-number">
        ${job.total}
      </div>

    `;

    row.appendChild(total);

    board.appendChild(row);

  });

  document.getElementById(
    'sumDrivers'
  ).textContent =
    totalWorking;

  document.getElementById(
    'sumHelpers'
  ).textContent =
    totalLeave;

  const sumTotal =
    document.getElementById(
      'sumTotal'
    );

  if (sumTotal) {

    sumTotal.textContent =
      totalWorking + totalLeave;

  }

}


// =====================================================
// RENDER ONSIDE
// =====================================================

function renderOnsideBoard() {

  const board =
    document.getElementById(
      'onsideBoard'
    );

  if (!board)
    return;

  // =====================================================
  // RESET + HEADER
  // =====================================================

  board.innerHTML = `

    <div class="onside-header board-header">

      <div class="board-header-cell">
        Department
      </div>

      <div class="board-header-cell">
        Employees
      </div>

      <div class="board-header-cell">
        Total
      </div>

    </div>

  `;

  const filteredJobs =
    filterJobsByDate(jobs);

  // =====================================================
  // SUMMARY
  // =====================================================

  let totalWorking = 0;
  let totalLeave = 0;

  const leaveTypes = [
    'ลาป่วย',
    'ลากิจ',
    'ลาพักร้อน'
  ];

  // =====================================================
  // EMPTY
  // =====================================================

  if (filteredJobs.length === 0) {

    renderEmpty(board);

    return;

  }

  // =====================================================
  // LOOP JOBS
  // =====================================================

  filteredJobs.forEach(job => {

    // =====================================================
    // COUNT SUMMARY
    // =====================================================

    const isLeave =

      leaveTypes.includes(
        job.name
      );

    if (isLeave) {

      totalLeave +=
        job.employees.length;

    } else {

      totalWorking +=
        job.employees.length;

    }

    // =====================================================
    // AREA COLOR
    // =====================================================

    let areaColor =
      '#22c55e';

    if (isLeave) {

      areaColor =
        '#ef4444';

    }

    // =====================================================
    // ROW
    // =====================================================

    const row =
      document.createElement('div');

    row.className =
      'onside-row';

    // =====================================================
    // AREA CELL
    // =====================================================

    const area =
      document.createElement('div');

    area.className =
      'area-cell';

    area.style.background =
      '#ffffff';

    area.innerHTML = `

      <span
        class="area-color"
        style="
          background:
          ${areaColor};
        "
      ></span>

      <div class="staff-info">

        <div class="area-name">
          ${job.name}
        </div>

        <div class="area-time">
          ONSIDE
        </div>

      </div>

    `;

    row.appendChild(area);

    // =====================================================
    // EMPLOYEE GRID
    // =====================================================

    const empGrid =
      document.createElement('div');

    empGrid.className =
      'employee-grid';

    empGrid.style.display =
      'grid';

    empGrid.style.gridTemplateColumns =
      'repeat(7, minmax(0, 1fr))';

    empGrid.style.gap =
      '6px';

    // =====================================================
    // AUTO ROWS
    // =====================================================

    const totalSlots =

      job.employees.length > 7
        ? 14
        : 7;

    empGrid.style.gridTemplateRows =

      job.employees.length > 7
        ? 'repeat(2, auto)'
        : 'repeat(1, auto)';

    // =====================================================
    // CARDS
    // =====================================================

    for (
      let i = 0;
      i < totalSlots;
      i++
    ) {

      empGrid.appendChild(

        createCard(
          job.employees[i] || '',
          'H',
          isLeave
        )

      );

    }

    row.appendChild(empGrid);

    // =====================================================
    // TOTAL
    // =====================================================

    const total =
      document.createElement('div');

    total.className =
      'total-cell';

    total.innerHTML = `

      <div class="total-number">
        ${job.total}
      </div>

    `;

    row.appendChild(total);

    // =====================================================
    // APPEND ROW
    // =====================================================

    board.appendChild(row);

  });

  // =====================================================
  // UPDATE SUMMARY
  // =====================================================

  document.getElementById(
    'sumDrivers'
  ).textContent =
    totalWorking;

  document.getElementById(
    'sumHelpers'
  ).textContent =
    totalLeave;

  const sumTotal =
    document.getElementById(
      'sumTotal'
    );

  if (sumTotal) {

    sumTotal.textContent =
      totalWorking + totalLeave;

  }

}

// =====================================================
// CARD
// =====================================================

function createCard(
  name,
  type,
  isLeave = false
) {

  const cell =
    document.createElement('div');

  cell.className =
    'staff-cell';

  // =========================
  // EMPTY
  // =========================

  if (!name) {

    cell.innerHTML = `

      <div class="empty-slot">
        ว่าง
      </div>

    `;

    return cell;

  }

  // =========================
  // BADGE
  // =========================

  let badgeText =
    type;

  let badgeClass =
    type === 'D'
      ? 'badge-driver'
      : 'badge-helper';

  // ลางาน

  if (isLeave) {

    badgeText = 'L';

    badgeClass =
      'badge-leave';

  }

  // =========================
  // INITIALS
  // =========================

  const initials =
    name
      .replace('Mr.', '')
      .replace('Miss', '')
      .trim()
      .substring(0, 2)
      .toUpperCase();

  // =========================
  // EMPLOYEE DATA
  // =========================

  const thaiName =
    employees[name]?.thai || '';

  const avatar =
    employees[name]?.avatar || '';

  // =========================
  // AVATAR HTML
  // =========================

  let avatarHTML = '';

  // มีรูป

  if (avatar) {

    avatarHTML = `

      <img
        src="${avatar}"
        alt="${name}"
        class="staff-avatar-image"
      />

    `;

  }

  // ไม่มีรูป

  else {

    avatarHTML = `

      <div class="staff-avatar">
        ${initials}
      </div>

    `;

  }

  // =========================
  // CARD
  // =========================

  cell.innerHTML = `

    <div class="staff-card">

      <div class="staff-avatar-wrap">

        ${avatarHTML}

        <div
          class="
            staff-status
            ${badgeClass}
          "
        >
          ${badgeText}
        </div>

      </div>

      <div class="staff-info">

        <div class="staff-name">
          ${name}
        </div>

        <div class="staff-name-th">
          ${thaiName}
        </div>

      </div>

    </div>

  `;

  return cell;

}
// =====================================================
// EMPTY
// =====================================================

function renderEmpty(board) {

  board.innerHTML = `

    <div class="empty-state">

      <div class="empty-icon">
        📭
      </div>

      <div class="empty-title">
        ไม่พบข้อมูล
      </div>

      <div class="empty-desc">
        ไม่มีข้อมูลสำหรับวันที่เลือก
      </div>

    </div>

  `;

}



// =====================================================
// TOAST
// =====================================================

function showToast(message) {

  const toast =
    document.getElementById(
      'toast'
    );

  if (!toast)
    return;

  toast.textContent =
    message;

  toast.classList.add(
    'show'
  );

  setTimeout(() => {

    toast.classList.remove(
      'show'
    );

  }, 2500);

}



// =====================================================
// DATE DISPLAY
// =====================================================

const dateDisplay =
  document.getElementById(
    'dateDisplay'
  );

function updateDateTime() {

  if (!dateDisplay)
    return;

  const now =
    new Date();

  // =====================================================
  // DATE
  // =====================================================

  const dateText =
    now.toLocaleDateString(
      'th-TH',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );

  // =====================================================
  // TIME
  // =====================================================

  const hours =
    String(
      now.getHours()
    ).padStart(2, '0');

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, '0');

  // =====================================================
  // FINAL
  // =====================================================

  dateDisplay.textContent =

    `${dateText}  ${hours}.${minutes} น.`;

}

// =====================================================
// INIT
// =====================================================

updateDateTime();

// =====================================================
// AUTO UPDATE EVERY 1 SEC
// =====================================================

setInterval(
  updateDateTime,
  1000
);



// =====================================================
// INIT
// =====================================================

async function init() {

  await loadEmployees();

  if (isOutsidePage) {

    await loadOutsideData();

  }

  if (isOnsidePage) {

    await loadOnsideData();

  }

}

init();



// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(async () => {

  if (isOutsidePage) {

    await loadOutsideData();

  }

  if (isOnsidePage) {

    await loadOnsideData();

  }

}, 10000);