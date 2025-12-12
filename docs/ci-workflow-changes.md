# PROPOSED CI WORKFLOW CHANGES

Claude Code cannot modify workflow files due to GitHub App permissions.
Please manually apply these changes to `.github/workflows/ci.yml`

## Changes needed in the "e2e-tests" job:

### 1. Update "Run Playwright tests" step to include environment variables:

```yaml
- name: Run Playwright tests
  run: pnpm run test:e2e
  continue-on-error: true
  env:
      CI: true
      TESTOMATIO: ${{ secrets.TESTOMATIO }}
```

### 2. Update "Upload test results to Mergify" step to use correct path:

```yaml
- name: Upload test results to Mergify
  if: success() || failure()
  uses: mergifyio/gha-mergify-ci@v8
  with:
      token: ${{ secrets.MERGIFY_TOKEN }}
      test-results: test-results/junit.xml
```

### 3. Add new artifact upload steps after Mergify upload:

```yaml
- name: Upload test artifacts
  if: success() || failure()
  uses: actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5.0.0
  with:
      name: playwright-results
      path: |
          test-results/
          playwright-report/
      retention-days: 7
      if-no-files-found: ignore

- name: Upload screenshots
  if: success() || failure()
  uses: actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5.0.0
  with:
      name: playwright-screenshots
      path: test-results/screenshots/
      retention-days: 7
      if-no-files-found: ignore

- name: Upload videos
  if: failure()
  uses: actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5.0.0
  with:
      name: playwright-videos
      path: test-results/videos/
      retention-days: 7
      if-no-files-found: ignore

- name: Upload HTML report
  if: success() || failure()
  uses: actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5.0.0
  with:
      name: playwright-html-report
      path: test-results/html-report/
      retention-days: 7
      if-no-files-found: ignore
```

## Why These Changes?

1. **Environment variables**: Enable TestOmat.io integration and ensure proper CI mode
2. **JUnit XML path**: Corrects path from `junit.xml` to `test-results/junit.xml` for Mergify
3. **Artifact uploads**: Preserve test results, screenshots, videos, and HTML reports for 7 days for debugging
