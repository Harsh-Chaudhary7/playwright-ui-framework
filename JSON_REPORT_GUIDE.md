# JSON Report Configuration & Structure

## Files Added/Modified

### 1. **playwright.config.ts** (Modified)
**What was added:**
- JSON reporter configuration
- Output path: `test-results/results.json`

```typescript
reporter: [
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }]
]
```

**Why:** Generates a machine-readable JSON report alongside the HTML report for programmatic access, CI/CD integration, and custom reporting tools.

---

### 2. **tests/e2e.spec.ts** (Modified)
**What was added:**
- Test suite wrapping with `test.describe()`
- Test annotations (testID, severity, author)
- Tags for test categorization (@e2e, @smoke, @critical)

```typescript
test(
  'Test Name',
  {
    tag: ['@e2e', '@smoke', '@critical'],
    annotation: [
      { type: 'testID', description: 'E2E_001' },
      { type: 'severity', description: 'critical' },
      { type: 'author', description: 'QA Team' }
    ]
  },
  async ({ page }) => { ... }
)
```

**Why:** Adds metadata to tests for:
- **testID**: Unique identifier for tracking
- **tags**: Filter tests by type (@e2e, @smoke, @regression, etc.)
- **severity**: Prioritize failures (critical, high, medium, low)
- **author**: Track test ownership

---

### 3. **utils/reportParser.ts** (New)
**What was added:**
A utility class to parse and process JSON reports with these methods:

| Method | Purpose |
|--------|---------|
| `parseReport()` | Reads raw JSON report and structures it into TestReport objects |
| `generateSummary()` | Creates summary stats (pass rate, duration, counts) |
| `exportCustomReport()` | Exports parsed data as custom JSON with summary |

**Example Usage:**
```typescript
import { ReportParser } from '@utils/reportParser';

const reports = ReportParser.parseReport('test-results/results.json');
ReportParser.exportCustomReport(reports, 'test-results/summary.json');
```

---

## JSON Report Structure

### **Raw Playwright JSON Output** (`results.json`)
```json
{
  "config": { ... },
  "suites": [
    {
      "title": "E2E Tests - Complete User Flow",
      "specs": [
        {
          "title": "E2E: Login → Add to Cart → Checkout",
          "tests": [
            {
              "testId": "...",
              "tags": ["@e2e", "@smoke", "@critical"],
              "annotations": [
                { "type": "testID", "description": "E2E_001" },
                { "type": "severity", "description": "critical" },
                { "type": "author", "description": "QA Team" }
              ],
              "status": "passed",
              "duration": 5234,
              "results": [ ... ]
            }
          ]
        }
      ]
    }
  ]
}
```

### **Custom Parsed Report** (`summary.json`)
```json
{
  "summary": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "skipped": 0,
    "passRate": "100.00%",
    "totalDuration": "5.23s",
    "timestamp": "2026-04-19T..."
  },
  "tests": [
    {
      "testID": "E2E_001",
      "name": "E2E: Login → Add to Cart → Checkout",
      "status": "passed",
      "duration": 5234,
      "tags": ["@e2e", "@smoke", "@critical"],
      "annotations": [
        { "type": "testID", "description": "E2E_001" },
        { "type": "severity", "description": "critical" },
        { "type": "author", "description": "QA Team" }
      ],
      "timestamp": "2026-04-19T..."
    }
  ],
  "generatedAt": "2026-04-19T..."
}
```

---

## How to Use

### Run Tests and Generate Reports
```bash
npx playwright test
```

Reports will be generated in:
- `playwright-report/` - HTML report
- `test-results/results.json` - Raw JSON report

### Parse and Export Custom Report
```typescript
import { ReportParser } from '@utils/reportParser';

const reports = ReportParser.parseReport('test-results/results.json');
ReportParser.exportCustomReport(reports, 'test-results/summary.json');
```

### Filter Tests by Tag
```bash
npx playwright test --grep @critical  # Run only critical tests
npx playwright test --grep @smoke     # Run smoke tests
```

---

## Benefits

✅ **Structured Metadata** - testID, severity, author for better test management
✅ **Machine Readable** - JSON format for CI/CD integration
✅ **Parseable** - Utility class to extract and process data
✅ **Categorization** - Tags for filtering and grouping tests
✅ **Traceability** - Each test has unique ID for defect linking
