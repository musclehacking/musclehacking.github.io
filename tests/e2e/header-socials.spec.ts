import { expect, test } from '@playwright/test';

const legacySocialLinks = [
  ['Muscle Hacking on Twitter', 'https://twitter.com/musclehacking'],
  ['Muscle Hacking on Instagram', 'https://www.instagram.com/musclehacking/'],
  ['Muscle Hacking on Reddit', 'https://www.reddit.com/user/musclehacking/'],
  ['Muscle Hacking on Substack', 'https://musclehacking.substack.com/'],
] as const;

test('shared header restores the legacy desktop social controls without exposing them on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const socialControls = page.getByRole('group', { name: 'Social media' });
  await expect(socialControls).toBeVisible();

  const links = socialControls.getByRole('link');
  await expect(links).toHaveCount(legacySocialLinks.length);

  for (const [index, [label, href]] of legacySocialLinks.entries()) {
    const link = links.nth(index);
    await expect(link).toHaveAccessibleName(label);
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link.locator('svg')).toBeVisible();
  }

  const desktopBounds = await socialControls.boundingBox();
  expect(desktopBounds).not.toBeNull();
  expect(desktopBounds!.x).toBeGreaterThan(1000);

  await page.setViewportSize({ width: 560, height: 900 });
  await expect(socialControls).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});
