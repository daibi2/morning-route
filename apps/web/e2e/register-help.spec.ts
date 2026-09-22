import { expect, test } from '@playwright/test';

/**
 * 工单验收点：注册按钮右侧的说明文案。
 *
 * 工单原文（逐字）：注册详细说明，------你需要到百度去查看文档----！！！！
 * 本用例同时守住三件事：
 *   1) 逐字一致 —— 任何字符（含「，」U+FF0C、「！」U+FF01、连字符 U+002D 数量）被改动都会失败；
 *   2) 位置正确 —— 用 boundingBox 验证文案落在「注册」提交按钮右侧、且与按钮处于同一视觉行
 *      （历史回归点：容器被改成 flex-wrap / column 时文案会被挤到按钮下方）；
 *   3) 在任何视口下都成立 —— 覆盖桌面 / 平板 / 手机宽度，防止响应式改造只在桌面宽度下「看起来正确」，
 *      同时断言文案完整落在视口内（防止 nowrap + overflow:hidden 把文案裁掉却仍然「存在」）。
 */
const REQUIRED_HELP_TEXT = '注册详细说明，------你需要到百度去查看文档----！！！！';

/** 覆盖桌面 / 平板 / 小屏手机；文案必须在所有宽度下都位于按钮右侧同一行且完整可见。 */
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 800, height: 600 },
  { name: 'mobile', width: 390, height: 844 },
];

test('register page shows the required help text right of the submit button', async ({ page }) => {
  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByTestId('register-help-text');

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/register');

    await expect(button, `[${viewport.name}] 提交按钮应可见`).toBeVisible();
    await expect(help, `[${viewport.name}] 说明文案应可见`).toBeVisible();

    // 1) 逐字断言（不做 trim：前导/尾随空白同样属于验收原文）
    const actualText = (await help.textContent()) ?? '';
    expect(actualText, `[${viewport.name}] 文案须逐字等于工单原文`).toBe(REQUIRED_HELP_TEXT);

    // 2) 几何位置断言：与按钮同一视觉行 + 文案左缘在按钮右缘之外
    const buttonBox = await button.boundingBox();
    const helpBox = await help.boundingBox();
    if (!buttonBox || !helpBox)
      throw new Error(`[${viewport.name}] boundingBox 缺失，无法进行位置断言`);

    // 同一视觉行：要求垂直方向有实质性重叠（按钮高度的一半以上），而不是 1px 擦边
    const overlap =
      Math.min(helpBox.y + helpBox.height, buttonBox.y + buttonBox.height) -
      Math.max(helpBox.y, buttonBox.y);
    expect(overlap, `[${viewport.name}] 文案应与按钮处于同一视觉行`).toBeGreaterThanOrEqual(
      buttonBox.height / 2,
    );
    expect(helpBox.x, `[${viewport.name}] 文案左缘应在按钮右缘之外`).toBeGreaterThan(
      buttonBox.x + buttonBox.width,
    );

    // 3) 文案必须完整可见：不超出视口（防止被 overflow/nowrap 裁切后仍然「存在」）
    expect(
      helpBox.x + helpBox.width,
      `[${viewport.name}] 文案右缘不应超出视口`,
    ).toBeLessThanOrEqual(viewport.width);
    expect(helpBox.y + helpBox.height).toBeLessThanOrEqual(viewport.height);

    await page.screenshot({
      path: `test-results/register-help-text-${viewport.name}.png`,
      fullPage: true,
    });
  }
});
