import { expect, test } from '@playwright/test';

// 工单 7e1debe7: 注册按钮右侧必须展示「----去上面查看怎么用-----」。
// 单测只能校验 DOM 顺序（jsdom 无布局引擎），视觉上的「右侧」需要真实布局环境，本 spec 分两层兜底：
//   A. bounding box（布局层）：文案须与「注册」按钮处于同一视觉行且在按钮右缘之外；
//   B. 落地像素（绘制层）：boundingBox 只反映 layout box，裁剪/transform/出屏这类"布局占位但画不出来"
//      的回归不会改变它，故再对文案自身区域做一次「文字是否真的画到像素上」的验证。
const ISSUE_HELP_TEXT = '----去上面查看怎么用-----';
const ISSUE_HELP_CODEPOINTS = [
  ...Array<number>(4).fill(0x2d),
  ...'去上面查看怎么用'.split('').map((c) => c.codePointAt(0)),
  ...Array<number>(5).fill(0x2d),
];

test('register help text sits to the right of the submit button and matches the issue verbatim', async ({
  page,
}) => {
  // 「同一行 / 在按钮右侧」是响应式属性，固定视口让断言可复现
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/register');

  const button = page.getByRole('button', { name: '注册' });
  const help = page.getByText(ISSUE_HELP_TEXT, { exact: true });
  await expect(button).toBeVisible();
  await expect(help).toBeVisible();

  // 1) 文案逐字一致（4 个半角连字符 U+002D + 8 个汉字 + 5 个半角连字符）
  //    注意：toHaveText 会折叠空白，真正逐字兜底的是下面的码点比对。
  await expect(help).toHaveText(ISSUE_HELP_TEXT);
  const rendered = await help.textContent();
  expect([...(rendered ?? '')].map((c) => c.codePointAt(0))).toEqual(ISSUE_HELP_CODEPOINTS);

  // 2) 视觉位置：文案在按钮右侧（同一视觉行、x 在按钮右缘之外、垂直区间有重叠）
  const buttonBox = await button.boundingBox();
  const helpBox = await help.boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(helpBox).not.toBeNull();
  expect(helpBox!.x).toBeGreaterThanOrEqual(buttonBox!.x + buttonBox!.width);
  const overlap =
    Math.min(buttonBox!.y + buttonBox!.height, helpBox!.y + helpBox!.height) -
    Math.max(buttonBox!.y, helpBox!.y);
  expect(overlap).toBeGreaterThan(0);

  // 3) 绘制层兜底：文案 bounding box 落在视口内、未被裁剪（scrollWidth 未超容器），
  //    且区域内确有文字墨迹（非全空白）。这三条正是 bounding box 断言抓不到的盲区。
  const helpCenter = {
    x: helpBox!.x + helpBox!.width / 2,
    y: helpBox!.y + helpBox!.height / 2,
  };
  const paint = await help.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display,
      clipped: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
      fullyInViewport:
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth,
    };
  });
  expect(paint.display).not.toBe('none');
  expect(paint.visibility).toBe('visible');
  expect(Number(paint.opacity)).toBeGreaterThan(0.05);
  expect(paint.clipped).toBe(false);
  expect(paint.fullyInViewport).toBe(true);

  // 文案中心点应是它自己（被遮挡 / 裁剪成 0 面积时命中元素会变成别人或 null）
  const hitIsHelp = await help.evaluate((el, point) => {
    const hit = document.elementFromPoint(point.x, point.y);
    return hit !== null && (hit === el || el.contains(hit));
  }, helpCenter);
  expect(hitIsHelp).toBe(true);

  // 在截图上统计文案区域的暗像素占比，确认文字真的被绘制（阈值 0.05 为实测标定：
  // 正常渲染约 0.12；opacity-0 / 被裁剪成 2px 宽时降到 0.00 / 0.03，均会失败）。
  const shot = await page.screenshot({ clip: helpBox! });
  const inkRatio = await page.evaluate(async (pngBase64) => {
    const blob = await (await fetch(`data:image/png;base64,${pngBase64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return -1;
    }
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance < 128) {
        ink += 1;
      }
    }
    return ink / (canvas.width * canvas.height);
  }, shot.toString('base64'));
  expect(inkRatio).toBeGreaterThan(0.05);

  await page.locator('form').screenshot({ path: 'test-results/register-help-text.png' });
});
