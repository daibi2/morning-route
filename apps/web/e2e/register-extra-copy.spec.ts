import { expect, test } from '@playwright/test';

// 工单 41a855f4: 注册按钮右侧必须展示「增加叶宇皓的测试」。
// 单测（apps/web/src/pages/RegisterPage.test.tsx）只能校验 DOM 顺序（jsdom 无布局引擎），
// 视觉上的「与按钮同一行且位于其右侧」需要真实布局环境，这里用 bounding box 兜底：
// 文案须与「注册」按钮处于同一视觉行，且左缘在按钮右缘之外。
const ISSUE_EXTRA_COPY = '增加叶宇皓的测试';

test('register extra copy sits to the right of the submit button on the same visual row', async ({
  page,
}) => {
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const extra = page.getByText(ISSUE_EXTRA_COPY, { exact: true });
  await expect(button).toBeVisible();
  await expect(extra).toBeVisible();

  // 1) 文案逐字一致，且只渲染一次
  await expect(extra).toHaveText(ISSUE_EXTRA_COPY);
  await expect(extra).toHaveCount(1);

  // 2) 视觉位置：文案在按钮右侧（同一视觉行、x 更大、垂直区间有重叠）
  const buttonBox = await button.boundingBox();
  const extraBox = await extra.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(extraBox).not.toBeNull();
  expect(extraBox!.x).toBeGreaterThan(buttonBox!.x + buttonBox!.width - 1);
  const overlap =
    Math.min(buttonBox!.y + buttonBox!.height, extraBox!.y + extraBox!.height) -
    Math.max(buttonBox!.y, extraBox!.y);
  expect(overlap).toBeGreaterThan(0);

  await page.locator('form').screenshot({ path: 'test-results/register-extra-copy.png' });
});
