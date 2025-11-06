/**
 * Pattern Detection for Whistleblowing Reports
 * Identifies suspicious patterns that may indicate systemic issues
 */

export interface Report {
  id: string;
  title: string;
  tracking_id: string;
  encrypted_content?: string;
  created_at: string;
  tags?: string[];
  category?: string;
  status: string;
  ai_risk_score?: number;
  ai_risk_level?: string;
}

export interface NamePattern {
  name: string;
  count: number;
  reportIds: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface CategorySpike {
  category: string;
  count: number;
  recentCount: number;
  percentageIncrease: number;
  reportIds: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface TimeCluster {
  startDate: string;
  endDate: string;
  count: number;
  reportIds: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface PatternDetectionResult {
  repeatedNames: NamePattern[];
  categorySpikes: CategorySpike[];
  timeClusters: TimeCluster[];
  totalPatterns: number;
  highSeverityCount: number;
}

/**
 * Extract potential names from text
 * Looks for capitalized words that might be names
 */
const extractPotentialNames = (text: string): string[] => {
  if (!text) return [];

  // Remove common titles
  const cleanedText = text.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sir|Madam)\.?\s+/gi, '');

  // Match capitalized words (2-4 words for full names)
  // This is a simple heuristic - real NER would be better but adds complexity
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g;
  const matches = cleanedText.match(namePattern) || [];

  // Filter out common false positives
  const commonWords = new Set(['The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'What', 'Why', 'How', 'Who', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

  return matches.filter(name => {
    const words = name.split(' ');
    // Must have at least 2 words and not be in common words list
    return words.length >= 2 && !words.some(word => commonWords.has(word));
  });
};

/**
 * Detect repeated mentions of the same person across reports
 */
export const detectRepeatedNames = (reports: Report[], decryptedContents: Map<string, string>): NamePattern[] => {
  const nameCounts = new Map<string, { count: number; reportIds: string[] }>();

  reports.forEach(report => {
    const titleText = report.title || '';
    const contentText = decryptedContents.get(report.id) || '';
    const fullText = `${titleText} ${contentText}`;

    const names = extractPotentialNames(fullText);

    // Track each unique name
    const uniqueNames = new Set(names);
    uniqueNames.forEach(name => {
      if (!nameCounts.has(name)) {
        nameCounts.set(name, { count: 0, reportIds: [] });
      }
      const existing = nameCounts.get(name)!;
      existing.count++;
      existing.reportIds.push(report.id);
    });
  });

  // Convert to array and filter for 3+ mentions
  const patterns: NamePattern[] = [];
  nameCounts.forEach((data, name) => {
    if (data.count >= 3) {
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (data.count >= 5) severity = 'high';
      else if (data.count >= 4) severity = 'medium';

      patterns.push({
        name,
        count: data.count,
        reportIds: data.reportIds,
        severity
      });
    }
  });

  // Sort by count descending
  return patterns.sort((a, b) => b.count - a.count);
};

/**
 * Detect unusual spikes in specific categories
 */
export const detectCategorySpikes = (reports: Report[]): CategorySpike[] => {
  if (reports.length < 5) return []; // Need minimum data for patterns

  // Split reports into recent (last 30 days) and historical
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentReports = reports.filter(r => new Date(r.created_at) >= thirtyDaysAgo);
  const olderReports = reports.filter(r => new Date(r.created_at) < thirtyDaysAgo);

  if (recentReports.length < 3 || olderReports.length < 3) return [];

  // Count categories in both periods
  const recentCategoryCounts = new Map<string, { count: number; reportIds: string[] }>();
  const olderCategoryCounts = new Map<string, number>();

  recentReports.forEach(report => {
    const category = extractMainCategory(report);
    if (category) {
      if (!recentCategoryCounts.has(category)) {
        recentCategoryCounts.set(category, { count: 0, reportIds: [] });
      }
      const data = recentCategoryCounts.get(category)!;
      data.count++;
      data.reportIds.push(report.id);
    }
  });

  olderReports.forEach(report => {
    const category = extractMainCategory(report);
    if (category) {
      olderCategoryCounts.set(category, (olderCategoryCounts.get(category) || 0) + 1);
    }
  });

  // Calculate spikes
  const spikes: CategorySpike[] = [];
  recentCategoryCounts.forEach((recentData, category) => {
    const olderCount = olderCategoryCounts.get(category) || 0;

    // Normalize by time period
    const recentRate = recentData.count / recentReports.length;
    const olderRate = olderCount / olderReports.length;

    if (olderRate === 0 && recentData.count >= 3) {
      // New category with multiple reports
      spikes.push({
        category,
        count: recentData.count,
        recentCount: recentData.count,
        percentageIncrease: 100,
        reportIds: recentData.reportIds,
        severity: recentData.count >= 5 ? 'high' : 'medium'
      });
    } else if (olderRate > 0) {
      const percentageIncrease = ((recentRate - olderRate) / olderRate) * 100;

      // Flag if 50%+ increase and at least 3 recent reports
      if (percentageIncrease >= 50 && recentData.count >= 3) {
        let severity: 'high' | 'medium' | 'low' = 'low';
        if (percentageIncrease >= 100 || recentData.count >= 5) severity = 'high';
        else if (percentageIncrease >= 75) severity = 'medium';

        spikes.push({
          category,
          count: recentData.count + olderCount,
          recentCount: recentData.count,
          percentageIncrease: Math.round(percentageIncrease),
          reportIds: recentData.reportIds,
          severity
        });
      }
    }
  });

  return spikes.sort((a, b) => b.percentageIncrease - a.percentageIncrease);
};

/**
 * Detect clusters of reports in short time periods
 */
export const detectTimeClusters = (reports: Report[]): TimeCluster[] => {
  if (reports.length < 3) return [];

  // Sort by date
  const sorted = [...reports].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const clusters: TimeCluster[] = [];
  const windowDays = 7; // Look for 3+ reports within 7 days

  for (let i = 0; i < sorted.length - 2; i++) {
    const startDate = new Date(sorted[i].created_at);
    const reportsInWindow: Report[] = [sorted[i]];

    for (let j = i + 1; j < sorted.length; j++) {
      const currentDate = new Date(sorted[j].created_at);
      const daysDiff = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= windowDays) {
        reportsInWindow.push(sorted[j]);
      } else {
        break;
      }
    }

    if (reportsInWindow.length >= 3) {
      const endDate = new Date(reportsInWindow[reportsInWindow.length - 1].created_at);

      let severity: 'high' | 'medium' | 'low' = 'low';
      if (reportsInWindow.length >= 5) severity = 'high';
      else if (reportsInWindow.length >= 4) severity = 'medium';

      clusters.push({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        count: reportsInWindow.length,
        reportIds: reportsInWindow.map(r => r.id),
        severity
      });

      // Skip ahead to avoid overlapping clusters
      i += reportsInWindow.length - 1;
    }
  }

  return clusters;
};

/**
 * Extract main category from report
 */
const extractMainCategory = (report: Report): string | null => {
  if (report.tags && report.tags.length > 0) {
    // Extract main category from tag (e.g., "Financial Misconduct - Fraud" -> "Financial Misconduct")
    const mainCategory = report.tags[0].split(' - ')[0];
    return mainCategory;
  }
  return null;
};

/**
 * Run all pattern detection algorithms
 */
export const detectAllPatterns = async (
  reports: Report[],
  decryptedContents: Map<string, string>
): Promise<PatternDetectionResult> => {
  const repeatedNames = detectRepeatedNames(reports, decryptedContents);
  const categorySpikes = detectCategorySpikes(reports);
  const timeClusters = detectTimeClusters(reports);

  const totalPatterns = repeatedNames.length + categorySpikes.length + timeClusters.length;
  const highSeverityCount =
    repeatedNames.filter(p => p.severity === 'high').length +
    categorySpikes.filter(p => p.severity === 'high').length +
    timeClusters.filter(p => p.severity === 'high').length;

  return {
    repeatedNames,
    categorySpikes,
    timeClusters,
    totalPatterns,
    highSeverityCount
  };
};
