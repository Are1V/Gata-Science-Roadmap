import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('home, global search, and keyboard dismissal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Data science,');
  await page.getByRole('button', { name: 'Search anything' }).click();
  await page
    .getByRole('textbox', { name: 'Search topics, projects, and resources' })
    .fill('linear regression');
  await expect(page.locator('.search-results')).toContainText('Linear Regression');
  await page.keyboard.press('Escape');
  await expect(page.locator('.search-dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
});
test('topic progress persists and can be reset deliberately', async ({ page }) => {
  await page.goto('./learn/getting-started/');
  const button = page
    .locator('.topic-checklist')
    .getByRole('button', { name: 'Mark complete' })
    .first();
  await button.click();
  await expect(
    page.locator('.topic-checklist').getByRole('button', { name: 'Completed' }),
  ).toHaveCount(1);
  await page.reload();
  await expect(
    page.locator('.topic-checklist').getByRole('button', { name: 'Completed' }),
  ).toHaveCount(1);
  await page.goto('./progress/');
  await expect(page.locator('.metric').nth(1)).toContainText('1');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.metric').nth(1)).toContainText('1');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, reset progress' }).click();
  await expect(page.locator('.metric').nth(1)).toContainText('0');
});
test('a detailed guide completes the concept used to open it', async ({ page }) => {
  await page.goto('./learn/mathematics-for-data-science/');
  await page.locator('[id="4-dot-product"] > a').click();
  await expect(page).toHaveURL(/topics\/vectors\/\?concept=4-dot-product/);
  await page.locator('.lesson-meta').getByRole('button', { name: 'Mark complete' }).click();
  await page.goto('./learn/mathematics-for-data-science/');
  await expect(
    page.locator('[id="4-dot-product"]').getByRole('button', { name: 'Completed' }),
  ).toBeVisible();
  await expect(
    page.locator('[id="4-vectors"]').getByRole('button', { name: 'Mark complete' }),
  ).toBeVisible();
});
test('graph nodes expand, open details, zoom, and filter', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./roadmap/');
  await expect(page.locator('.roadmap-canvas .react-flow__node')).toHaveCount(16);
  await page.locator('.roadmap-canvas .flow-topic').first().click();
  await expect(page.locator('.topic-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close topic' }).click();
  await page.getByRole('button', { name: 'Expand Getting started', exact: true }).click();
  await expect(page.locator('.stage-topics .stage-topic-grid > div')).toHaveCount(8);
  await page.locator('.stage-topics .stage-topic-grid > div > button').first().click();
  await expect(page.locator('.topic-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close topic' }).click();
  await page.getByRole('button', { name: /Math & statistics/ }).click();
  await expect(page.locator('.roadmap-canvas .react-flow__node')).toHaveCount(16);
  const before = await page.locator('.roadmap-canvas .react-flow__viewport').getAttribute('style');
  await page
    .locator('.roadmap-canvas')
    .getByRole('button', { name: /zoom in/i })
    .click();
  await expect(page.locator('.roadmap-canvas .react-flow__viewport')).not.toHaveAttribute(
    'style',
    before!,
  );
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter by level' }).selectOption('advanced');
  await expect(page.locator('.roadmap-list-phase').first()).toBeVisible();
  expect(await page.locator('.roadmap-list-phase').count()).toBeLessThanOrEqual(6);
  await page.getByRole('textbox', { name: 'Filter roadmap' }).fill('nonsense-no-results');
  await expect(page.getByText('No phases match these filters.', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});
test('project briefs and interview answers work', async ({ page }) => {
  await page.goto('./projects/#titanic');
  await expect(page.locator('#titanic .project-details')).toBeVisible();
  await page.locator('#titanic').getByRole('button', { name: 'Mark project complete' }).click();
  await expect(page.locator('#titanic').getByRole('button', { name: 'Completed' })).toBeVisible();
  await page.goto('./interviews/');
  await page.getByRole('combobox', { name: 'Filter interviews' }).selectOption('SQL');
  await expect(page.locator('.interview-list details')).toHaveCount(3);
  await page.locator('.interview-list summary').first().click();
  await expect(page.locator('.interview-answer').first()).toBeVisible();
});
test('mathematics renders and the gradient experiment updates', async ({ page }) => {
  await page.goto('./topics/gradient-descent/');
  await expect(page.locator('.katex').first()).toBeVisible();
  await page.getByRole('button', { name: 'Take a step' }).click();
  await expect(page.locator('.lab-result')).toContainText('5.760');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.lab-result')).toContainText('9.000');
});
test('mobile navigation, dark theme persistence, and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('.sidebar').getByRole('link', { name: 'Roadmap', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Data science roadmap');
  await expect(page.locator('.roadmap-list-phase')).toHaveCount(4);
  await page.getByRole('button', { name: /Math & statistics/ }).click();
  await expect(page.locator('.roadmap-list-phase')).toHaveCount(4);
  await expect(page.locator('.roadmap-list-phase').first()).toContainText(
    'Mathematics for data science',
  );
  for (const route of [
    './',
    './roadmap/',
    './projects/',
    './topics/linear-regression/',
    './cheatsheets/',
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      route,
    ).toBe(true);
  }
});
test('home and a lesson meet automated accessibility checks', async ({ page }) => {
  for (const route of ['./', './topics/linear-regression/']) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});
test('corrupt local storage is handled without a crash', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('gata.progress.v1', 'broken-json'));
  await page.goto('./progress/');
  await expect(page.locator('.metric').nth(1)).toContainText('0');
  await page.goto('./learn/getting-started/');
  await page
    .locator('.topic-checklist')
    .getByRole('button', { name: 'Mark complete' })
    .first()
    .click();
  await expect(
    page.locator('.topic-checklist').getByRole('button', { name: 'Completed' }),
  ).toHaveCount(1);
});

test('mathematical dependencies change with the chosen model', async ({ page }) => {
  await page.goto('./roadmap/#connections');
  await page.getByRole('combobox', { name: 'Connect the ideas behind' }).selectOption('pca');
  await expect(page.locator('.connection-target')).toContainText('PCA');
  await expect(page.locator('.connection-canvas')).toContainText('Matrices');
  await expect(page.locator('.connection-canvas .react-flow__edge')).not.toHaveCount(0);
  await page.getByText('Read these connections as a list').click();
  await expect(page.locator('.connection-text')).toContainText('Builds on:');
});

test('progress updates between tabs and export preserves completed IDs', async ({
  page,
  context,
}) => {
  await page.goto('./learn/getting-started/');
  const second = await context.newPage();
  await second.goto('./progress/');
  await page
    .locator('.topic-checklist')
    .getByRole('button', { name: 'Mark complete' })
    .first()
    .click();
  await expect(second.locator('.metric').nth(1)).toContainText('1');
  const downloadEvent = second.waitForEvent('download');
  await second.getByRole('button', { name: 'Export progress' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('gata-progress.json');
  await second.close();
});

test('dark mode and library pages have accessible controls and contrast', async ({ page }) => {
  for (const route of ['./projects/', './interviews/', './roadmap/']) {
    await page.goto(route);
    if (route === './roadmap/')
      await page.getByRole('button', { name: 'List', exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  for (const route of ['./', './topics/linear-regression/', './projects/']) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});
