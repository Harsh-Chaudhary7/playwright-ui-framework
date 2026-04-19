import fs from 'fs';
import path from 'path';

export interface TestReport {
  testID: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  tags: string[];
  annotations: Array<{
    type: string;
    description: string;
  }>;
  error?: string;
  timestamp: string;
}

export class ReportParser {
  /**
   * Reads the JSON test report and parses it into structured format
   * @param reportPath - Path to the JSON report file
   * @returns Array of parsed test reports
   */
  static parseReport(reportPath: string): TestReport[] {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report file not found: ${reportPath}`);
    }

    const rawData = fs.readFileSync(reportPath, 'utf-8');
    const jsonReport = JSON.parse(rawData);

    const reports: TestReport[] = [];

    jsonReport.suites?.forEach((suite: any) => {
      suite.specs?.forEach((spec: any) => {
        const test = spec.tests?.[0];
        if (test) {
          reports.push({
            testID: test.annotations?.find((a: any) => a.type === 'testID')?.description || 'N/A',
            name: spec.title,
            status: test.status,
            duration: test.duration || 0,
            tags: test.tags || [],
            annotations: test.annotations || [],
            error: test.results?.[0]?.error?.message || undefined,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    return reports;
  }

  /**
   * Generates a summary of test results
   * @param reports - Array of parsed test reports
   * @returns Summary object
   */
  static generateSummary(reports: TestReport[]) {
    const total = reports.length;
    const passed = reports.filter(r => r.status === 'passed').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const skipped = reports.filter(r => r.status === 'skipped').length;
    const totalDuration = reports.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: `${((passed / total) * 100).toFixed(2)}%`,
      totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Exports report to custom JSON format
   * @param reports - Array of parsed test reports
   * @param outputPath - Path where to save the custom report
   */
  static exportCustomReport(reports: TestReport[], outputPath: string) {
    const summary = this.generateSummary(reports);
    const customReport = {
      summary,
      tests: reports,
      generatedAt: new Date().toISOString()
    };

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(customReport, null, 2));
    console.log(`Custom report exported to: ${outputPath}`);
  }
}
