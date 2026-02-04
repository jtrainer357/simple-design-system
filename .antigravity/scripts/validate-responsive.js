// Responsive Validation Script
// Used by QualityValidator agent

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BREAKPOINTS = [
  { name: 'mobile-sm', width: 375, height: 667 },
  { name: 'mobile-lg', width: 428, height: 926 },
  { name: 'tablet-sm', width: 768, height: 1024 },
  { name: 'tablet-lg', width: 1024, height: 768 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'desktop-lg', width: 1440, height: 900 },
  { name: 'desktop-xl', width: 1920, height: 1080 }
];

async function validateResponsive(url, outputDir) {
  const browser = await puppeteer.launch({ headless: true });
  const results = {
    passed: true,
    breakpoints: []
  };

  for (const breakpoint of BREAKPOINTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: breakpoint.width,
      height: breakpoint.height
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Check text sizes
    const hasReadableText = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div, a');
      let minSize = Infinity;

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize > 0) {
          minSize = Math.min(minSize, fontSize);
        }
      });

      return minSize >= 16; // Minimum 16px for body text
    });

    // Check touch target sizes (mobile/tablet only)
    let hasSafeTouchTargets = true;
    if (breakpoint.width <= 1024) {
      hasSafeTouchTargets = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input, select, textarea');

        for (const el of interactive) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              return false;
            }
          }
        }

        return true;
      });
    }

    // Take screenshot
    const screenshotPath = path.join(
      outputDir,
      `screenshot-${breakpoint.name}-${breakpoint.width}px.png`
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    const breakpointResult = {
      name: breakpoint.name,
      width: breakpoint.width,
      passed: !hasHorizontalScroll && hasReadableText && hasSafeTouchTargets,
      issues: {
        horizontal_scroll: hasHorizontalScroll,
        unreadable_text: !hasReadableText,
        small_touch_targets: !hasSafeTouchTargets
      },
      screenshot: screenshotPath
    };

    results.breakpoints.push(breakpointResult);

    if (!breakpointResult.passed) {
      results.passed = false;
    }

    await page.close();
  }

  await browser.close();

  // Save results
  fs.writeFileSync(
    path.join(outputDir, 'responsive-validation.json'),
    JSON.stringify(results, null, 2)
  );

  return results;
}

// CLI usage
if (require.main === module) {
  const [,, url, outputDir] = process.argv;

  if (!url || !outputDir) {
    console.error('Usage: node validate-responsive.js <url> <output_dir>');
    process.exit(1);
  }

  validateResponsive(url, outputDir)
    .then(results => {
      console.log('Responsive Validation Results:');
      console.log(JSON.stringify(results, null, 2));
      process.exit(results.passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Validation failed:', err);
      process.exit(1);
    });
}

module.exports = { validateResponsive };
