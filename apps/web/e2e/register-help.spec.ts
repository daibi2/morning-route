import { expect, test } from '@playwright/test';

const ISSUE_HELP_TEXT = '注册详细说明，------你需要到百度去查看文档----！！！！';
const ISSUE_HELP_CODEPOINTS = [
  ...'注册详细说明'.split('').map((c) => c.codePointAt(0)),
  0xff0c,
  ...Array<number>(6).fill(0x2d),
  ...'你需要到百度去查看文档'.split('').map((c) => c.codePointAt(0)),
  ...Array<number>(4).fill(0x2d),
  ...Array<number>(4).fill(0xff01),
];

test('register help text sits to the right of the submit button and matches the issue verbatim', async ({
  page,
}) => {
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByTestId('register-help');
  await expect(button).toBeVisible();
  await expect(help).toBeVisible();

  // 1) 文案逐字一致（工单原文，含 6 个半角连字符与 4 个全角感叹号）
  await expect(help).toHaveText(ISSUE_HELP_TEXT);
  const rendered = await help.textContent();
  expect([...(rendered ?? '')].map((c) => c.codePointAt(0))).toEqual(ISSUE_HELP_CODEPOINTS);

  // 2) 视觉位置：文案在按钮右侧（同一行、x 更大、垂直区间有重叠）
  const box = await button.boundingBox();
  const helpBox = await help.boundingBox();
  expect(box).not.toBeNull();
  expect(helpBox).not.toBeNull();
  expect(helpBox!.x).toBeGreaterThan(box!.x + box!.width - 1);
  const overlap =
    Math.min(box!.y + box!.height, helpBox!.y + helpBox!.height) - Math.max(box!.y, helpBox!.y);
  expect(overlap).toBeGreaterThan(0);
});
