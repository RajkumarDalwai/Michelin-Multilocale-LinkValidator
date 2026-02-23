let client = null;

try {
  const { OpenAI } = require('openai');
  // Initialize OpenAI client only if API key is available
  if (process.env.OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('⚠️ OpenAI package not installed. AI insights will be disabled.');
}

/**
 * Generate AI-driven insights from link validation report
 * @param {Object} reportData - Cypress link validation report
 * @returns {Promise<Object>} - AI insights
 */
async function generateInsights(reportData) {
  try {
    if (!client || !process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI not configured. Using default insights.');
      return extractDefaultInsights(reportData);
    }

    const prompt = buildPrompt(reportData);

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert QA analyst specializing in link validation and web performance.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const insights = parseInsights(response.choices[0].message.content, reportData);
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return extractDefaultInsights(reportData);
  }
}

/**
 * Build structured prompt for AI
 */
function buildPrompt(reportData) {
  return `
Analyze this link validation report and provide actionable insights:

Locale: ${reportData.locale}
Environment: ${reportData.environment}
Pages Scanned: ${reportData.pagesScanned}
Total Links: ${reportData.totalLinks}
Successful: ${reportData.successCount}
Broken (404): ${reportData.brokenLinks.filter(l => l.status === 404).length}
Server Errors (5xx): ${reportData.brokenLinks.filter(l => l.status >= 500).length}
Skipped: ${reportData.skipped}

Top broken links:
${reportData.brokenLinks.slice(0, 5).map(l => `- ${l.url} (${l.status})`).join('\n')}

Provide in JSON format:
{
  "severity": "Critical|High|Medium|Low",
  "mostAffectedPages": ["page1", "page2"],
  "commonPatterns": ["pattern1", "pattern2"],
  "rootCauseAnalysis": "brief explanation",
  "recommendedActions": ["action1", "action2"],
  "summary": "one-line summary"
}
`;
}

/**
 * Parse AI response into structured format
 */
function parseInsights(aiResponse, reportData) {
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : extractDefaultInsights(reportData);
    
    return {
      enabled: true,
      timestamp: new Date().toISOString(),
      ...insights,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return extractDefaultInsights(reportData);
  }
}

/**
 * Fallback insights if AI parsing fails
 */
function extractDefaultInsights(reportData) {
  const brokenCount = reportData.brokenLinks.length;
  const successRate = reportData.totalLinks > 0 ? (reportData.successCount / reportData.totalLinks) * 100 : 0;

  let severity = 'Low';
  if (successRate < 50) severity = 'Critical';
  else if (successRate < 80) severity = 'High';
  else if (successRate < 95) severity = 'Medium';

  return {
    enabled: true,
    severity,
    successRate: successRate.toFixed(2),
    brokenLinksCount: brokenCount,
    recommendedActions: [
      'Review broken links and update navigation',
      'Test cross-locale redirects',
      'Monitor server health for 5xx errors',
    ],
    summary: `${brokenCount} broken links detected across ${reportData.pagesScanned} pages (${successRate.toFixed(2)}% success rate)`,
  };
}

module.exports = {
  generateInsights,
};
