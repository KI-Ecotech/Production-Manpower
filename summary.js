// =====================================================
// GOOGLE SHEET
// =====================================================

const SHEET_ID =
  '1btQ_Zv4lp22r3zs0eM6Ssss8fr84dbO4BWqEneeXmg0';

const OUTSIDE_SHEET =
  'outside';

const ONSIDE_SHEET =
  'onside';

// =====================================================
// STATE
// =====================================================

let outsideJobs = [];

let onsideJobs = [];

let outsideChart = null;

let onsideChart = null;

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

let selectedDate =
  `${yyyy}-${mm}-${dd}`;

document.getElementById(
  'workDate'
).value =
  selectedDate;

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
// DATE CHANGE
// =====================================================

document
  .getElementById(
    'workDate'
  )
  .addEventListener(
    'change',
    async e => {

      selectedDate =
        e.target.value;

      renderSummary();

    }
  );

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

    outsideJobs =
      rows.map(row => ({

        date:
          row.c[0]?.f || '',

        name:
          row.c[1]?.v || '',

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

  }

  catch (err) {

    console.error(
      'loadOutsideData error:',
      err
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

    onsideJobs =
      rows.map(row => ({

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

  }

  catch (err) {

    console.error(
      'loadOnsideData error:',
      err
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
// RENDER SUMMARY
// =====================================================

function renderSummary() {

  const leaveTypes = [

    'ลาป่วย',
    'ลากิจ',
    'ลาพักร้อน'

  ];

  const outsideFiltered =
    filterJobsByDate(
      outsideJobs
    );

  const onsideFiltered =
    filterJobsByDate(
      onsideJobs
    );

  // =====================================================
  // OUTSIDE TOTAL
  // =====================================================

  let outsideTotal = 0;

  outsideFiltered.forEach(job => {

    outsideTotal +=
      job.total;

  });

  // =====================================================
  // ONSIDE TOTAL
  // =====================================================

  let onsideTotal = 0;

  let leaveTotal = 0;

  onsideFiltered.forEach(job => {

    const isLeave =

      leaveTypes.includes(
        job.name
      );

    if (isLeave) {

      leaveTotal +=
        job.total;

    } else {

      onsideTotal +=
        job.total;

    }

  });

  // =====================================================
  // FINAL TOTAL
  // =====================================================

  const total =
    outsideTotal +
    onsideTotal +
    leaveTotal;

  const working =
    outsideTotal +
    onsideTotal;

  const workingPercent =

    total > 0

      ? (
          (
            working /
            total
          ) * 100
        ).toFixed(1)

      : 0;

  // =====================================================
  // UPDATE UI
  // =====================================================

  document.getElementById(
    'sumTotal'
  ).textContent =
    total;

  document.getElementById(
    'sumWorking'
  ).textContent =
    working;

  document.getElementById(
    'sumLeave'
  ).textContent =
    leaveTotal;

  document.getElementById(
    'sumOutside'
  ).textContent =
    outsideTotal;

  document.getElementById(
    'sumOnside'
  ).textContent =
    onsideTotal;

  document.getElementById(
    'workingPercent'
  ).textContent =
    `${workingPercent}%`;

  // =====================================================
  // CHARTS
  // =====================================================

  renderOutsideChart(
    outsideFiltered
  );

  renderOnsideChart(
    onsideFiltered
  );

}

// =====================================================
// OUTSIDE CHART
// =====================================================

function renderOutsideChart(data) {

  const labels =
    data.map(job => job.name);

  const values =
    data.map(job => job.total);

  // DESTROY OLD

  if (outsideChart) {

    outsideChart.destroy();

  }

  // GRADIENT

  const ctx =
    document
      .getElementById(
        'outsideChart'
      )
      .getContext('2d');

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      400
    );

  gradient.addColorStop(
    0,
    '#3b82f6'
  );

  gradient.addColorStop(
    1,
    '#93c5fd'
  );

  // CHART

  outsideChart =
    new Chart(ctx, {

      type: 'bar',

      data: {

        labels,

        datasets: [

          {

            label:
              'Outside',

            data:
              values,

            backgroundColor:
              gradient,

            borderRadius:
              14,

            borderSkipped:
              false,

            hoverBackgroundColor:
              '#2563eb',

            maxBarThickness:
              48

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

          duration: 1200,

          easing:
            'easeOutQuart'

        },

        plugins: {

          legend: {
            display: false
          },

          tooltip: {

            backgroundColor:
              '#0f172a',

            titleColor:
              '#ffffff',

            bodyColor:
              '#ffffff',

            padding: 14,

            cornerRadius: 12,

            displayColors: false

          }

        },

        scales: {

          x: {

            grid: {
              display: false
            },

            ticks: {

              color:
                '#475569',

              font: {

                family:
                  'IBM Plex Sans Thai',

                size: 12,

                weight:
                  '600'

              }

            }

          },

          y: {

            beginAtZero: true,

            grid: {

              color:
                'rgba(148,163,184,0.15)',

              drawBorder:
                false

            },

            ticks: {

              color:
                '#64748b',

              font: {

                family:
                  'IBM Plex Sans Thai'

              }

            }

          }

        }

      }

    });

}

// =====================================================
// ONSIDE CHART
// =====================================================

function renderOnsideChart(data) {

  const labels =
    data.map(job => job.name);

  const values =
    data.map(job => job.total);

  if (onsideChart) {

    onsideChart.destroy();

  }

  // COLORS

  const colors = [

    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#ef4444',
    '#9333ea',
    '#06b6d4',
    '#84cc16',
    '#ec4899',
    '#f97316',
    '#14b8a6'

  ];

  // CHART

  onsideChart =
    new Chart(

      document.getElementById(
        'onsideChart'
      ),

      {

        type: 'doughnut',

        data: {

          labels,

          datasets: [

            {

              data:
                values,

              backgroundColor:
                colors,

              borderWidth:
                0,

              hoverOffset:
                16

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: '68%',

          animation: {

            animateRotate: true,

            duration: 1400,

            easing:
              'easeOutExpo'

          },

          plugins: {

            legend: {

              position:
                'bottom',

              labels: {

                usePointStyle: true,

                pointStyle:
                  'circle',

                padding: 18,

                color:
                  '#334155',

                font: {

                  family:
                    'IBM Plex Sans Thai',

                  size: 12,

                  weight:
                    '600'

                }

              }

            },

            tooltip: {

              backgroundColor:
                '#0f172a',

              titleColor:
                '#ffffff',

              bodyColor:
                '#ffffff',

              padding: 14,

              cornerRadius: 12

            }

          }

        }

      }

    );

}

// =====================================================
// LINE CHART
// =====================================================

function renderTrendChart(
  canvasId,
  labels,
  values,
  color
) {

  const ctx =
    document
      .getElementById(
        canvasId
      )
      .getContext('2d');

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      300
    );

  gradient.addColorStop(
    0,
    color + '55'
  );

  gradient.addColorStop(
    1,
    color + '00'
  );

  return new Chart(ctx, {

    type: 'line',

    data: {

      labels,

      datasets: [

        {

          data:
            values,

          borderColor:
            color,

          backgroundColor:
            gradient,

          fill: true,

          tension: 0.4,

          borderWidth: 3,

          pointRadius: 5,

          pointHoverRadius: 7,

          pointBackgroundColor:
            '#ffffff',

          pointBorderWidth: 3,

          pointBorderColor:
            color

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      animation: {

        duration: 1400,

        easing:
          'easeOutQuart'

      },

      plugins: {

        legend: {
          display: false
        },

        tooltip: {

          backgroundColor:
            '#0f172a',

          padding: 14,

          cornerRadius: 12

        }

      },

      scales: {

        x: {

          grid: {
            display: false
          },

          ticks: {

            color:
              '#64748b'

          }

        },

        y: {

          beginAtZero: true,

          grid: {

            color:
              'rgba(148,163,184,0.12)'

          },

          ticks: {

            color:
              '#64748b'

          }

        }

      }

    }

  });

}

// =====================================================
// INIT
// =====================================================

async function init() {

  await loadOutsideData();

  await loadOnsideData();

  renderSummary();

}

init();

// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(async () => {

  await loadOutsideData();

  await loadOnsideData();

  renderSummary();

}, 10000);