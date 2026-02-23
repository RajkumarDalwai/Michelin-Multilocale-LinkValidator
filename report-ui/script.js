const API_BASE = '/api/reports';
let statusChart, localeChart;

/**
 * Load report for specific locale
 */
async function loadReport() {
  const locale = document.getElementById('localeInput').value.trim();
  if (!locale) {
    alert('Please enter a locale');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/${locale}`);
    if (!response.ok) throw new Error('Report not found');

    const report = await response.json();
    displayReport(report);
  } catch (error) {
    alert(`Error loading report: ${error.message}`);
  }
}

/**
 * Load summary across all locales
 */
async function loadSummary() {
  try {
    const response = await fetch(API_BASE);
    const summary = await response.json();
    displaySummary(summary);
  } catch (error) {
    alert(`Error loading summary: ${error.message}`);
  }
}

/**
 * Display report data
 */
function displayReport(report) {
  // Update summary metrics
  document.getElementById('totalLinks').textContent = report.totalLinks;
  document.getElementById('successCount').textContent = report.successCount;
  
  const broken404 = report.brokenLinks.filter(l => l.status === 404).length;
  const broken5xx = report.brokenLinks.filter(l => l.status >= 500).length;
  
  document.getElementById('brokenCount').textContent = broken404;
  document.getElementById('serverErrorCount').textContent = broken5xx;
  document.getElementById('lastUpdated').textContent = new Date(report.timestamp).toLocaleString();

  // Update charts
  updateStatusChart(report);
  
  // Display AI insights
  displayAIInsights(report);

  // Display broken links table
  displayBrokenLinks(report.brokenLinks);
}

/**
 * Display summary data
 */
function displaySummary(summary) {
  if (summary.locales.length === 0) {
    alert('No reports available');
    return;
  }

  // Update metrics with aggregate data
  const totalSuccessful = summary.locales.reduce((sum, l) => sum + l.successCount, 0);
  const totalBroken = summary.totalBrokenLinks;

  document.getElementById('totalLinks').textContent = (totalSuccessful + totalBroken).toLocaleString();
  document.getElementById('successCount').textContent = totalSuccessful.toLocaleString();
  document.getElementById('brokenCount').textContent = totalBroken.toLocaleString();

  // Update locale comparison chart
  updateLocaleChart(summary.locales);
}

/**
 * Update status pie chart
 */
function updateStatusChart(report) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  
  const successful = report.successCount;
  const broken404 = report.brokenLinks.filter(l => l.status === 404).length;
  const broken5xx = report.brokenLinks.filter(l => l.status >= 500).length;
  const skipped = report.skipped;

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['✅ Successful', '❌ 404 Not Found', '❌ 5xx Errors', '⏭️ Skipped'],
      datasets: [{
        data: [successful, broken404, broken5xx, skipped],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#6c757d'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });
}

/**
 * Update locale comparison chart
 */
function updateLocaleChart(locales) {
  const ctx = document.getElementById('localeChart').getContext('2d');
  
  if (localeChart) localeChart.destroy();

  localeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: locales.map(l => l.locale),
      datasets: [{
        label: 'Success Rate (%)',
        data: locales.map(l => parseFloat(l.successRate)),
        backgroundColor: '#0066cc',
        borderColor: '#0052a3',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Success Rate (%)' },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
}

/**
 * Display AI insights
 */
function displayAIInsights(report) {
  const aiContent = document.getElementById('aiContent');

  // Fallback calculation if no AI insights available
  const successRate = report.totalLinks > 0 ? (report.successCount / report.totalLinks) * 100 : 0;
  let severity = 'Low';
  if (successRate < 50) severity = 'Critical';
  else if (successRate < 80) severity = 'High';
  else if (successRate < 95) severity = 'Medium';

  const brokenCount = report.brokenLinks.length;

  aiContent.innerHTML = `
    <div style="margin-bottom: 15px;">
      <strong>🎯 Severity: <span style="color: #fff; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">${severity}</span></strong>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>📊 Success Rate:</strong> ${successRate.toFixed(2)}%
    </div>
    <div style="margin-bottom: 15px;">
      <strong>🔴 Issues Found:</strong> ${brokenCount} broken links across ${report.pagesScanned} pages
    </div>
    <div>
      <strong>✅ Recommendations:</strong>
      <ul style="margin-top: 8px;">
        <li>Review and fix broken links</li>
        <li>Test cross-locale redirects</li>
        <li>Monitor server health for 5xx errors</li>
      </ul>
    </div>
  `;
}

/**
 * Display broken links table
 */
function displayBrokenLinks(brokenLinks) {
  const tbody = document.getElementById('brokenLinksBody');
  
  if (brokenLinks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="placeholder">✅ No broken links found!</td></tr>';
    return;
  }

  tbody.innerHTML = brokenLinks
    .slice(0, 50) // Show first 50
    .map(link => `
      <tr>
        <td>${link.page || '-'}</td>
        <td><code>${link.url}</code></td>
        <td><strong>${link.status}</strong></td>
        <td>${link.responseTime || '-'}</td>
      </tr>
    `)
    .join('');
}

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Dashboard ready. Load a report to begin.');
});
