import { expect, test } from '@playwright/test';

test('register hint copy and help icon sit to the right of the submit button on desktop', async ({
  page,
}) => {
  // 显式固定桌面视口（≥ Tailwind sm=640px），否则新增移动端 project 时本用例会静静失效
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const hint = page.getByText('注册详细说明请参考');
  const icon = page.getByRole('button', { name: '查看填写说明' });
  const tooltip = page.getByRole('tooltip');

  // 名称含「注册」的按钮必须唯一（图标无障碍名称刻意不含「注册」，否则子串匹配会命中两个元素）
  await expect(page.getByRole('button', { name: /注册/ })).toHaveCount(1);

  // jsdom 无排版引擎，左右关系只能在这里用 boundingBox 断言
  const btnBox = (await button.boundingBox())!;
  const hintBox = (await hint.boundingBox())!;
  const iconBox = (await icon.boundingBox())!;
  expect(hintBox.x).toBeGreaterThanOrEqual(btnBox.x + btnBox.width - 1);
  expect(iconBox.x).toBeGreaterThanOrEqual(hintBox.x + hintBox.width - 1);
  expect(Math.abs(hintBox.y + hintBox.height / 2 - (btnBox.y + btnBox.height / 2))).toBeLessThan(8);

  // 明细默认隐藏；悬停「?」图标后展示
  await expect(tooltip).toBeHidden();
  await icon.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText('密码至少 8 位');

  // 键盘聚焦路径同样能读出明细（先把鼠标移开，避免 :hover 持续生效）
  await page.mouse.move(0, 0);
  await expect(tooltip).toBeHidden();
  await icon.focus();
  await expect(tooltip).toBeVisible();

  // 帮助图标是 type="button"，点击它不得提交注册表单。
  // 不能只靠 toHaveURL：提交是异步的，断言首次求值时 URL 仍为 /register 就会立即通过，
  // 因此改为直接断言「没有发出 /api/auth/register 请求」，并用唯一邮箱避免复用库 409 干扰。
  let registerRequested = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/auth/register')) registerRequested = true;
  });
  await page.getByLabel('邮箱').fill(`hint-${Date.now()}@example.com`);
  await page.getByLabel('密码').fill('password1');
  await icon.click();
  await page.waitForLoadState('networkidle');
  expect(registerRequested).toBe(false);
  await expect(page).toHaveURL(/\/register$/);
});

test('register hint stacks below the submit button on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/register');

  const btnBox = (await page.getByRole('button', { name: '注册' }).boundingBox())!;
  const hintBox = (await page.getByText('注册详细说明请参考').boundingBox())!;
  expect(hintBox.y).toBeGreaterThanOrEqual(btnBox.y + btnBox.height - 1);
});
