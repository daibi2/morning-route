import { expect, test } from '@playwright/test';

// 工单 51170f66: 注册按钮右侧必须展示「注册详细说明，去百度查看----！！！！」。
// 单测只能校验 DOM 顺序，视觉上的「右侧」需要真实布局环境，这里用 bounding box 兜底。
test('registration help text sits to the right of the submit button', async ({ page }) => {
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByText('注册详细说明，去百度查看----！！！！');
  await expect(button).toBeVisible();
  await expect(help).toBeVisible();

  const buttonBox = await button.boundingBox();
  const helpBox = await help.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(helpBox).not.toBeNull();

  // 在按钮右缘之外（右侧），且与按钮处于同一视觉行（垂直方向重叠）
  expect(helpBox!.x).toBeGreaterThanOrEqual(buttonBox!.x + buttonBox!.width);
  expect(helpBox!.y).toBeLessThan(buttonBox!.y + buttonBox!.height);
  expect(helpBox!.y + helpBox!.height).toBeGreaterThan(buttonBox!.y);

  await page.locator('form').screenshot({ path: 'test-results/register-help-text.png' });
});
