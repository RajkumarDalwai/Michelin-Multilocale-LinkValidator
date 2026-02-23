const fs = require('fs');
const path = require('path');
const insightGenerator = require('../../ai/insightGenerator');

const REPORTS_DIR = path.join(__dirname, '../../cypress/reports');

// Get report for specific locale
exports.getReportByLocale = async (req, res) => {
  try {
    const { locale } = req.params;
    const reportPath = path.join(REPORTS_DIR, `${locale}.json`);

    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: `No report found for locale: ${locale}` });
    }

    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    res.json(reportData);
  } catch (error) {
    console.error('Error reading report:', error);
    res.status(500).json({ error: 'Failed to read report' });
  }
};

// Get summary across all locales
exports.getSummary = async (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return res.json({ message: 'No reports found', locales: [] });
    }

    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json'));
    const summary = {
      totalLocales: files.length,
      locales: [],
      totalBrokenLinks: 0,
      totalSuccessful: 0,
      averageSuccessRate: 0,
    };

    files.forEach(file => {
      const reportData = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, file), 'utf-8'));
      const successRate = reportData.totalLinks > 0 ? (reportData.successCount / reportData.totalLinks) * 100 : 0;

      summary.locales.push({
        locale: reportData.locale,
        successRate: successRate.toFixed(2),
        brokenLinks: reportData.brokenLinks.length,
        successCount: reportData.successCount,
      });

      summary.totalBrokenLinks += reportData.brokenLinks.length;
      summary.totalSuccessful += reportData.successCount;
    });

    if (summary.locales.length > 0) {
      summary.averageSuccessRate = (
        summary.locales.reduce((acc, l) => acc + parseFloat(l.successRate), 0) / summary.locales.length
      ).toFixed(2);
    }

    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

// Compare multiple locales
exports.compareLocales = async (req, res) => {
  try {
    const { locales } = req.params;
    const localeList = locales.split(',').map(l => l.trim());
    const comparison = {
      localesCompared: localeList,
      reports: [],
    };

    localeList.forEach(locale => {
      const reportPath = path.join(REPORTS_DIR, `${locale}.json`);
      if (fs.existsSync(reportPath)) {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        comparison.reports.push(reportData);
      }
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing locales:', error);
    res.status(500).json({ error: 'Failed to compare locales' });
  }
};
