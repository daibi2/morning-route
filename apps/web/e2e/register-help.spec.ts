import { expect, test } from '@playwright/test';

// 工单 7e1debe7: 注册按钮右侧必须展示「----去上面查看怎么用-----」。
// 单测只能校验 DOM 顺序（jsdom 无布局引擎），视觉上的「右侧」需要真实布局环境，
// 这里用 bounding box 兜底：文案须与「注册」按钮处于同一视觉行且在按钮右缘之外。
const ISSUE_HELP_TEXT = '----去上面查看怎么用-----';
const ISSUE_HELP_CODEPOINTS = [
  ...Array<number>(4).fill(0x2d),
  ...'去上面查看怎么用'.split('').map((c) => c.codePointAt(0)),
  ...Array<number>(5).fill(0x2d),
];

test('register help text sits to the right of the submit button and matches the issue verbatim', async ({
  page,
}) => {
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByText(ISSUE_HELP_TEXT, { exact: true });
  await expect(button).toBeVisible();
  await expect(help).toBeVisible();

  // 1) 文案逐字一致（4 个半角连字符 U+002D + 8 个汉字 + 5 个半角连字符）
  await expect(help).toHaveText(ISSUE_HELP_TEXT);
  const rendered = await help.textContent();
  expect([...(rendered ?? '')].map((c) => c.codePointAt(0))).toEqual(ISSUE_HELP_CODEPOINTS);

  // 2) 视觉位置：文案在按钮右侧（同一视觉行、x 更大、垂直区间有重叠）
  const buttonBox = await button.boundingBox();
  const helpBox = await help.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(helpBox).not.toBeNull();
  expect(helpBox!.x).toBeGreaterThan(buttonBox!.x + buttonBox!.width - 1);
  const overlap =
    Math.min(buttonBox!.y + buttonBox!.height, helpBox!.y + helpBox!.height) -
    Math.max(buttonBox!.y, helpBox!.y);
  expect(overlap).toBeGreaterThan(0);

  await page.locator('form').screenshot({ path: 'test-results/register-help-text.png' });
});
