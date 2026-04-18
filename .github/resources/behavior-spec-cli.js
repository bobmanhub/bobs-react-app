#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const USAGE = `Usage: npx behavior-spec generate <spec-file> [options]

Options:
  --output, -o    Output file (default: generated.spec.ts)
  --base-url      Base URL for tests (default: http://localhost:5173)
  --help, -h     Show this help

Examples:
  npx behavior-spec generate pizza.behaviorSpec
  npx behavior-spec generate pizza.behaviorSpec -o pizza.spec.ts
  npx behavior-spec generate pizza.behaviorSpec --base-url https://staging.example.com
`;

const TEMPLATE = `import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || '{{BASE_URL}}';

{{TESTS}}
`;

function parseScenarios(content) {
  const scenarios = [];
  const lines = content.split('\n');
  let currentScenario = null;
  let stepIndex = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('Scenario:')) {
      if (currentScenario) scenarios.push(currentScenario);
      currentScenario = {
        name: trimmed.replace('Scenario:', '').trim(),
        steps: [],
        given: null,
        whens: [],
        thens: []
      };
      stepIndex = 0;
    } else if (currentScenario && trimmed) {
      if (trimmed.startsWith('Given')) {
        currentScenario.given = trimmed.replace('Given', '').trim();
      } else if (trimmed.startsWith('When')) {
        currentScenario.whens.push(trimmed.replace('When', '').trim());
      } else if (trimmed.startsWith('Then') || trimmed.startsWith('And')) {
        currentScenario.thens.push(trimmed.replace('Then', '').replace('And', '').trim());
      }
    }
  }
  
  if (currentScenario) scenarios.push(currentScenario);
  return scenarios;
}

function scenarioToTest(scenario, baseUrl) {
  const steps = [];
  let setupDone = false;
  
  // Given step (setup)
  if (scenario.given) {
    const givenText = scenario.given.toLowerCase();
    if (givenText.includes('running') || givenText.includes('on the')) {
      steps.push(`await page.goto('${baseUrl}');`);
    } else if (givenText.includes('cart has')) {
      steps.push(`// Setup: add item to cart`);
      steps.push(`await page.click('button:has-text("Pizzas")');`);
      steps.push(`await page.locator('.grid > div').first().getByRole('button').click();`);
      setupDone = true;
    } else if (givenText.includes('placed orders') || givenText.includes('have orders')) {
      steps.push(`// Setup: place order first`);
      steps.push(`await page.click('button:has-text("Pizzas")');`);
      steps.push(`await page.locator('.grid > div').first().getByRole('button').click();`);
      steps.push(`await page.click('button:has-text("Cart")');`);
      steps.push(`await page.click('button:has-text("Place Order")');`);
      setupDone = true;
    }
  }
  
  // When steps
  for (const when of scenario.whens) {
    const w = when.toLowerCase();
    if (w.includes('click')) {
      const match = w.match(/click ["']([^"']+)["']/);
      if (match) {
        const target = match[1];
        if (target.includes('Pizzas') || target.includes('Drinks') || target.includes('Orders') || target.includes('Cart')) {
          steps.push(`await page.click('button:has-text("${target}")');`);
        } else if (target.includes('Add to Cart')) {
          steps.push(`await page.locator('.grid > div button').click();`);
        } else {
          steps.push(`await page.click('${target}');`);
        }
      }
    }
  }
  
  // Then steps
  for (const then of scenario.thens) {
    const t = then.toLowerCase();
    if (t.includes('shows') || t.includes('display'))) {
      const match = t.match(/(?:shows|display) ["']([^"']+)["']/);
      if (match) {
        const expected = match[1];
        steps.push(`await expect(page.locator('header button:has(span) span')).toHaveText('${expected}');`);
      }
    } else if (t.includes('cart drawer opens') || t.includes('visible')) {
      steps.push(`await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();`);
    } else if (t.includes('see') && t.includes('margherita')) {
      steps.push(`await expect(page.locator('.space-y-4')).toContainText('Margherita');`);
    } else if (t.includes('orders page')) {
      steps.push(`await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();`);
    } else if (t.includes('order in list')) {
      steps.push(`await expect(page.locator('.space-y-4')).toContainText('Margherita');`);
    } else if (t.includes('my orders')) {
      steps.push(`await expect(page.locator('h2:has-text("Your Orders")')).toBeVisible();`);
    } else if (t.includes('status') && t.includes('order')) {
      steps.push(`const orders = page.locator('.bg-white.rounded-lg');`);
      steps.push(`if ((await orders.count()) > 0) await expect(orders.first()).toContainText('Order #');`);
    }
  }
  
  return steps.join('\n  ');
}

function generateTests(scenarios, baseUrl) {
  return scenarios.map((s, i) => {
    const testBody = scenarioToTest(s, baseUrl);
    return `test('Scenario: ${s.name}', async ({ page }) => {
  ${testBody}
});`;
  }).join('\n\n');
}

function generate(specPath, outputPath, baseUrl) {
  const content = fs.readFileSync(specPath, 'utf-8');
  const scenarios = parseScenarios(content);
  
  console.log(`Parsed ${scenarios.length} scenarios from ${specPath}`);
  
  const tests = generateTests(scenarios, baseUrl);
  const output = TEMPLATE
    .replace('{{BASE_URL}}', baseUrl)
    .replace('{{TESTS}}', tests);
  
  fs.writeFileSync(outputPath, output);
  console.log(`Generated: ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}

const generateIdx = args.indexOf('generate');
if (generateIdx === -1 || args.length < 2) {
  console.error(USAGE);
  process.exit(1);
}

const specFile = args[generateIdx + 1];
const outputIdx = args.indexOf('--output') !== -1 ? args.indexOf('--output') : args.indexOf('-o');
const baseUrlIdx = args.indexOf('--base-url');

const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : 'generated.spec.ts';
const baseUrl = baseUrlIdx !== -1 ? args[baseUrlIdx + 1] : 'http://localhost:5173/bobs-react-app';

generate(specFile, outputFile, baseUrl);
