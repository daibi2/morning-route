import { expect, test } from '@playwright/test';

/**
 * 工单验收点：注册按钮右侧的说明文案。
 *
 * 工单原文（逐字）：注册详细说明，------你需要到百度去查看文档----！！！！
 * 本用例同时守住两件事：
 *   1) 逐字一致 —— 直接比对码点，任何字符（含「，」U+FF0C、「！」U+FF01、连字符 U+002D 数量）被改动都会失败；
 *   2) 位置正确 —— 用 boundingBox 验证文案落在「注册」提交按钮的右侧且同一视觉行，
 *      而不是被 flex 换行挤到按钮下方（历史回归点）。
 */
const REQUIRED_HELP_TEXT = '注册详细说明，------你需要到百度去查看文档----！！！！';

test('register page shows the required help text right of the submit button', async ({ page }) => {
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByTestId('register-help-text');

  await expect(button).toBeVisible();
  await expect(help).toBeVisible();

  // 1) 逐字断言
  const actualText = (await help.textContent())?.trim() ?? '';
  expect(actualText).toBe(REQUIRED_HELP_TEXT);
  expect([...actualText].map((c) => c.codePointAt(0))).toEqual(
    [...REQUIRED_HELP_TEXT].map((c) => c.codePointAt(0)),
  );

  // 2) 几何位置断言：同一视觉行 + 文案左缘在按钮右缘之外
  const buttonBox = await button.boundingBox();
  const helpBox = await help.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(helpBox).not.toBeNull();
  if (!buttonBox || !helpBox) throw new Error('boundingBox 缺失，无法进行位置断言');

  const sameVisualRow =
    helpBox.y < buttonBox.y + buttonBox.height && helpBox.y + helpBox.height > buttonBox.y;
  expect(sameVisualRow).toBe(true);
  expect(helpBox.x).toBeGreaterThan(buttonBox.x + buttonBox.width);

  await page.screenshot({ path: 'test-results/register-help-text.png', fullPage: true });
});
