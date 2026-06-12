// =====================================================
// GOOGLE SHEET CONFIGURATION
// =====================================================
const SHEET_ID = '1btQ_Zv4lp22r3zs0eM6Ssss8fr84dbO4BWqEneeXmg0';
const OUTSIDE_SHEET = 'outside';
const ONSIDE_SHEET = 'onside';
const EMPLOYEE_SHEET = 'employees';

let outsideJobs = [];
let onsideJobs = [];
let employeeDatabase = {}; 

// ตัวแปรสำหรับนับจำนวนพนักงานทั้งหมดในบริษัท แยกตามประเภทจากชีต employees โดยตรง
let totalThaiInCompany = 0;
let totalThaiSubInCompany = 0;
let totalMyanmarInCompany = 0;
let totalManagementInCompany = 0;
let isDatabaseLoaded = false; 

// Chart Global Instances
let ioDonutChart = null;
let outsideAreaChart = null;
let manpowerTypeChart = null;
let leaveTopChart = null;

// =====================================================
// DATE & DISPLAY INITIALIZATION
// =====================================================
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
let selectedDate = `${yyyy}-${mm}-${dd}`;

document.getElementById('workDate').value = selectedDate;

function updateDateTime() {
  const dateDisplay = document.getElementById('dateDisplay');
  if (!dateDisplay) return;
  const now = new Date();
  const dateText = now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  dateDisplay.textContent = `Data Date : ${dateText} ${hours}.${minutes} น.`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

document.getElementById('workDate').addEventListener('change', async (e) => {
  selectedDate = e.target.value;
  await loadEmployeeDatabase();
  await loadOutsideData();
  await loadOnsideData();
  renderSummary();
});

// =====================================================
// LOAD EMPLOYEE DATABASE (ปรับปรุงให้อ่านค่าจาก Col E และนับยอดรวมทุกประเภท)
// =====================================================
async function loadEmployeeDatabase() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${EMPLOYEE_SHEET}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    employeeDatabase = {}; 
    // รีเซ็ตยอดนับใหม่ทุกครั้งที่มีการดึงข้อมูลรอบใหม่
    totalThaiInCompany = 0;
    totalThaiSubInCompany = 0;
    totalMyanmarInCompany = 0;
    totalManagementInCompany = 0;

    rows.forEach((row, index) => {
      if (index === 0) return; // ข้ามหัวตาราง
      if (!row || !row.c) return;

      const engName = row.c[1]?.v?.toString().trim();
      const empType = row.c[5]?.v?.toString().trim(); 

      if (engName) {
        const typeLower = (empType || '').toLowerCase();
        let standardType = 'Thai';

        // ตรวจสอบเงื่อนไขจากคอลัมน์ E พร้อมแปลงเป็นตัวพิมพ์เล็กเพื่อความแม่นยำ
        if (typeLower === 'management') {
          standardType = 'Management';
          totalManagementInCompany++;
        } else if (typeLower === 'thai sub' || typeLower === 'thaisub') {
          standardType = 'Thai Sub';
          totalThaiSubInCompany++;
        } else if (typeLower === 'myanmar') {
          standardType = 'Myanmar';
          totalMyanmarInCompany++;
        } else {
          standardType = 'Thai';
          totalThaiInCompany++;
        }
        
        // บันทึกค่ามาตรฐานลงแรมเพื่อใช้แมปปิ้งในชีต Onside / Outside
        employeeDatabase[engName] = standardType;
      }
    });

    isDatabaseLoaded = true; 
    console.log("จำนวนพนักงานทั้งหมดที่นับได้จากชีต employees (Col E):", {
      Thai: totalThaiInCompany,
      ThaiSub: totalThaiSubInCompany,
      Myanmar: totalMyanmarInCompany,
      Management: totalManagementInCompany
    });
  } catch (err) {
    console.error('loadEmployeeDatabase error:', err);
  }
}

// =====================================================
// DATA FETCHING & MAPPING
// =====================================================
async function loadOutsideData() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${OUTSIDE_SHEET}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    outsideJobs = rows.map(row => {
      const namesList = [
        row.c[4]?.v, row.c[5]?.v, row.c[6]?.v, row.c[7]?.v, 
        row.c[8]?.v, row.c[9]?.v, row.c[10]?.v, row.c[11]?.v
      ].map(v => String(v || '').trim()).filter(Boolean);

      return {
        date: row.c[0]?.f || '',
        name: row.c[1]?.v || '',
        people: namesList,
        total: namesList.length
      };
    });
  } catch (err) {
    console.error('loadOutsideData error:', err);
  }
}

async function loadOnsideData() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ONSIDE_SHEET}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    onsideJobs = rows.map(row => {
      const namesList = [
        row.c[2]?.v, row.c[3]?.v, row.c[4]?.v, row.c[5]?.v, row.c[6]?.v, 
        row.c[7]?.v, row.c[8]?.v, row.c[9]?.v, row.c[10]?.v, row.c[11]?.v, 
        row.c[12]?.v, row.c[13]?.v, row.c[14]?.v, row.c[15]?.v
      ].map(v => String(v || '').trim()).filter(Boolean);

      return {
        date: row.c[0]?.f || '',
        name: row.c[1]?.v || '',
        people: namesList,
        total: namesList.length
      };
    });
  } catch (err) {
    console.error('loadOnsideData error:', err);
  }
}

function filterJobsByDate(data) {
  return data.filter(job => {
    if (!job.date) return false;
    const parts = job.date.toString().trim().split('/');
    if (parts.length !== 3) return false;
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}` === selectedDate;
  });
}

// =====================================================
// MAIN CORE SUMMARY RENDERER
// =====================================================
function renderSummary() {
  if (!isDatabaseLoaded) return; 

  const leaveTypes = ['ลาป่วย', 'ลากิจ', 'ลาพักร้อน'];
  const outsideFiltered = filterJobsByDate(outsideJobs);
  const onsideFiltered = filterJobsByDate(onsideJobs);

  // โครงสร้างแรมนับจำนวนคนงานประจำวันเพื่อใช้ทำ Chart และคำนวณการทำงานจริง
  let counts = {
    thai: { onside: 0, outside: 0 },
    thaiSub: { onside: 0, outside: 0 },
    myanmar: { onside: 0, outside: 0 },
    management: { onside: totalManagementInCompany, outside: 0 },
    leave: 0
  };

  let areaSummary = {};
  let managementLeaveCount = 0; 

  // 1. Outside Processing
  outsideFiltered.forEach(job => {
    if (!areaSummary[job.name]) {
      areaSummary[job.name] = { thai: 0, sub: 0, total: 0 };
    }

    job.people.forEach(personName => {
      const empType = employeeDatabase[personName] || 'Thai';

      if (empType === 'Thai Sub') {
        counts.thaiSub.outside++;
        areaSummary[job.name].sub++;
      } else if (empType === 'Myanmar') {
        counts.myanmar.outside++;
      } else if (empType === 'Management') {
        counts.management.outside++;
      } else {
        counts.thai.outside++;
        areaSummary[job.name].thai++;
      }
      areaSummary[job.name].total++;
    });
  });

  // 2. Onside & Leave Processing
  let onsideTotalRealRows = 0;
  let leaveTotal = 0;

  onsideFiltered.forEach(job => {
    const isLeaveJob = leaveTypes.includes(job.name);
    
    if (isLeaveJob) {
      leaveTotal += job.total;
      counts.leave += job.total;

      job.people.forEach(personName => {
        const empType = employeeDatabase[personName];
        if (empType === 'Management') {
          managementLeaveCount++;
        }
      });
    } else {
      onsideTotalRealRows += job.total;
      
      job.people.forEach(personName => {
        const empType = employeeDatabase[personName] || 'Thai';

        if (empType === 'Management') {
          // ข้ามเนื่องจากล็อกฐานตั้งต้นผู้บริหารไว้แล้ว
        } else if (empType === 'Thai Sub') {
          counts.thaiSub.onside++;
        } else if (empType === 'Myanmar') {
          counts.myanmar.onside++;
        } else {
          counts.thai.onside++;
        }
      });
    }
  });

  // สถิติ Management ในโรงงาน (Onside)
  counts.management.onside = totalManagementInCompany - counts.management.outside - managementLeaveCount;
  if (counts.management.onside < 0) counts.management.onside = 0;

  // [เปลี่ยนจุดนี้] ดึงยอดรวมพนักงานทั้งบริษัท 100% จากชีต employees Col E โดยตรงตามที่ต้องการ
  const finalTotalThai = totalThaiInCompany;
  const finalTotalSub = totalThaiSubInCompany;
  const finalTotalMyanmar = totalMyanmarInCompany;
  const finalTotalManage = totalManagementInCompany; 

  // จำนวนพนักงานที่เข้ามาทำงานจริง ณ วันนั้นๆ
  const finalOnsideTotal = counts.thai.onside + counts.thaiSub.onside + counts.myanmar.onside + counts.management.onside;
  const finalOutsideTotal = counts.thai.outside + counts.thaiSub.outside + counts.myanmar.outside + counts.management.outside;

  // กำหนดฐานยอดรวมอิงจากพนักงานทั้งหมดในบริษัท เพื่อการคำนวณสัดส่วน % ที่ถูกต้อง
  const totalManpower = finalTotalThai + finalTotalSub + finalTotalMyanmar + finalTotalManage;
  const totalWorking = finalOutsideTotal + finalOnsideTotal;

  // คำนวณสัดส่วนค่าร้อยละสะท้อนไปยัง UI
  const getPer = (val) => totalManpower > 0 ? ((val / totalManpower) * 100).toFixed(1) : 0;
  const workPercent = totalManpower > 0 ? ((totalWorking / totalManpower) * 100).toFixed(1) : 0;
  const leavePercent = totalManpower > 0 ? ((leaveTotal / totalManpower) * 100).toFixed(1) : 0;
  const outsideRatio = totalManpower > 0 ? ((finalOutsideTotal / totalManpower) * 100).toFixed(1) : 0;
  const onsideRatio = totalManpower > 0 ? ((finalOnsideTotal / totalManpower) * 100).toFixed(1) : 0;

  // สั่งเขียนค่าลงบล็อกแสดงผล HTML DOM Elements (ยอดรวมจริงจากชีต Employees 100%)
  document.getElementById('sumTotal').textContent = totalManpower;
  document.getElementById('sumThai').textContent = finalTotalThai;
  document.getElementById('perThai').textContent = `คน (${getPer(finalTotalThai)}%)`;
  document.getElementById('sumThaiSub').textContent = finalTotalSub;
  document.getElementById('perThaiSub').textContent = `คน (${getPer(finalTotalSub)}%)`;
  document.getElementById('sumMyanmar').textContent = finalTotalMyanmar;
  document.getElementById('perMyanmar').textContent = `คน (${getPer(finalTotalMyanmar)}%)`;
  document.getElementById('sumManagement').textContent = finalTotalManage;
  document.getElementById('perManagement').textContent = `คน (${getPer(finalTotalManage)}%)`;
  
  // สรุปยอดสถานะประจำวัน
  document.getElementById('sumWorking').textContent = totalWorking;
  document.getElementById('perWorking').textContent = `คน (${workPercent}%)`;
  document.getElementById('sumLeave').textContent = leaveTotal;
  document.getElementById('perLeave').textContent = `คน (${leavePercent}%)`;

  document.getElementById('targetLeaveVal').textContent = `${leavePercent}%`;
  document.getElementById('targetOutsideVal').textContent = `${outsideRatio}%`;
  document.getElementById('targetOnsideVal').textContent = `${onsideRatio}%`;

  // วาดโครงข่าย Chart.js ใหม่
  drawIOChart(finalOnsideTotal, finalOutsideTotal);
  drawOutsideAreaChart(areaSummary);
  drawManpowerTypeChart(counts);
  drawLeaveTopChart(onsideFiltered.filter(j => leaveTypes.includes(j.name)));
}

// =====================================================
// CHART RENDERING OPERATIONS
// =====================================================
function drawIOChart(onsideVal, outsideVal) {
  if (ioDonutChart) ioDonutChart.destroy();
  const ctx = document.getElementById('ioDonutChart').getContext('2d');
  ioDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Onside', 'Outside'],
      datasets: [{
        data: [onsideVal, outsideVal],
        backgroundColor: ['#00b050', '#ff0000'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
      }
    }
  });
}

function drawOutsideAreaChart(areaSummary) {
  if (outsideAreaChart) outsideAreaChart.destroy();
  
  const labels = Object.keys(areaSummary);
  const dataThai = labels.map(k => areaSummary[k].thai);
  const dataSub = labels.map(k => areaSummary[k].sub);

  const finalLabels = labels.length > 0 ? labels : ['Atsumi', 'Auto Metal', 'Minamida', 'Msat Phase 9', 'Ricoh On nut'];
  const finalThai = labels.length > 0 ? dataThai : [0, 0, 0, 0, 0];
  const finalSub = labels.length > 0 ? dataSub : [0, 0, 0, 0, 0];

  const ctx = document.getElementById('outsideAreaChart').getContext('2d');
  outsideAreaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: finalLabels,
      datasets: [
        { label: 'Thai', data: finalThai, backgroundColor: '#0070c0' },
        { label: 'Thai Sub', data: finalSub, backgroundColor: '#ff00c0' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
      plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
    }
  });
}

function drawManpowerTypeChart(counts) {
  if (manpowerTypeChart) manpowerTypeChart.destroy();
  const ctx = document.getElementById('manpowerTypeChart').getContext('2d');
  
  manpowerTypeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Thai', 'Thai Sub', 'Myanmar', 'Management'],
      datasets: [
        { label: 'Onside', data: [counts.thai.onside, counts.thaiSub.onside, counts.myanmar.onside, counts.management.onside], backgroundColor: '#00b050' },
        { label: 'Outside', data: [counts.thai.outside, counts.thaiSub.outside, counts.myanmar.outside, counts.management.outside], backgroundColor: '#ff0000' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { position: 'top', alignment: 'end' } }
    }
  });
}

function drawLeaveTopChart(leaveJobs) {
  if (leaveTopChart) leaveTopChart.destroy();
  
  let leaveMap = {};
  leaveJobs.forEach(job => {
    job.people.forEach(p => {
      leaveMap[p] = (leaveMap[p] || 0) + 1;
    });
  });

  let labels = Object.keys(leaveMap).sort((a,b) => leaveMap[b] - leaveMap[a]).slice(0, 5);
  let data = labels.map(l => leaveMap[l]);

  if (labels.length === 0) {
    labels = ['ไม่มีข้อมูลการลาวันนี้'];
    data = [0];
  }

  const ctx = document.getElementById('leaveTopChart').getContext('2d');
  leaveTopChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Leave Amount',
        data: data,
        backgroundColor: '#ff0000',
        barThickness: 16
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false } }
    }
  });
}

// =====================================================
// SYSTEM LIFECYCLE INITIALIZER
// =====================================================
async function init() {
  await loadEmployeeDatabase(); 
  await loadOutsideData();
  await loadOnsideData();
  renderSummary();
}
init();

setInterval(async () => {
  await loadEmployeeDatabase();
  await loadOutsideData();
  await loadOnsideData();
  renderSummary();
}, 10000);