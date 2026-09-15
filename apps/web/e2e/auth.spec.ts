import { expect, test } from '@playwright/test';

test('register lands on home, logout blocks home again', async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('password1');
  await page.getByRole('button', { name: '注册' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: '今日' })).toBeVisible();
  await expect(page.getByText(`你好，${email}`)).toBeVisible();
  await page.getByRole('button', { name: '登出' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});
