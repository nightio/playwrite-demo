import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('https://mubi.pl/kalkulator-ubezpieczenia-mieszkania-i-domu/');
    await page.getByRole('button', { name: 'Zezwól na wszystkie' }).click();
    await page.locator('label').filter({ hasText: 'Dom' }).click();
    await page.locator('label').filter({ hasText: 'Tak' }).click();
    await page.getByLabel('Czy budynek ma dach oraz').locator('label').filter({ hasText: 'Tak' }).click();
    await page.locator('input[name="buildingArea"]').click();
    await page.locator('input[name="buildingArea"]').fill('33');
    await page.getByRole('textbox', { name: 'Wpisz rok budowy' }).click();
    await page.getByRole('textbox', { name: 'Wpisz rok budowy' }).fill('2026');
    await page.getByRole('button', { name: 'Przejdź dalej' }).click();
});
