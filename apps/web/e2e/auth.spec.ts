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

test('register page shows 增加叶宇皓的测试 to the right of the submit button', async ({ page }) => {
  await page.goto('/register');
  const button = page.getByRole('button', { name: '注册' });
  const note = page.getByText('增加叶宇皓的测试');
  await expect(note).toBeVisible();

  const buttonBox = await button.boundingBox();
  const noteBox = await note.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(noteBox).not.toBeNull();
  if (!buttonBox || !noteBox) {
    throw new Error('按钮或文案的 boundingBox 为空，无法验证相对位置');
  }
  // 水平方向：文案左边缘在按钮右边缘之后 → 视觉上「在注册按钮右侧」
  expect(noteBox.x).toBeGreaterThanOrEqual(buttonBox.x + buttonBox.width);
  // 垂直方向：与按钮同一行（纵向区间有重叠），排除换行到下一行的情况
  expect(noteBox.y).toBeLessThan(buttonBox.y + buttonBox.height);
  expect(noteBox.y + noteBox.height).toBeGreaterThan(buttonBox.y);
});
