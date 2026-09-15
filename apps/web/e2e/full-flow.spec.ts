import { expect, test } from '@playwright/test';

function todayLocalDate(): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

test('register, create habit, check in, see streak and stats', async ({ page }) => {
  const email = `flow-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('password1');
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL('/');

  await page.getByRole('link', { name: '习惯' }).click();
  await expect(page).toHaveURL('/habits');
  await page.getByLabel('新习惯名称').fill('晨间拉伸');
  await page.getByRole('button', { name: '添加' }).click();
  await expect(page.getByText('晨间拉伸')).toBeVisible();

  await page.getByRole('link', { name: '今日' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('checkbox', { name: '打卡 晨间拉伸' }).click();
  await expect(page.getByText('连续 1 天')).toBeVisible();
  await expect(page.getByText(todayLocalDate())).toBeVisible();

  await page.getByRole('link', { name: '统计' }).click();
  await expect(page).toHaveURL('/stats');
  await expect(page.getByText(/今日完成 1\/1/)).toBeVisible();
  await expect(page.getByText('近 7 日完成数')).toBeVisible();
});
