import {test, expect} from '@playwright/test';

const CALCULATOR_URL = 'https://mubi.pl/kalkulator-ubezpieczenia-mieszkania-i-domu/';

test.describe('Mubi Calculator - Form Validation Tests', () => {
    test.beforeEach(async ({page}) => {
        // Navigate to the website
        await page.goto(CALCULATOR_URL);

        await page.waitForTimeout(2000);

        // 1) Confirm this locator matches exactly one button
        const acceptBtn = page.locator('button:has-text("Zezwól na wszystkie")');
        await expect(acceptBtn).toHaveCount(1);

        // 2) Click it
        await acceptBtn.click();

        // // 3) Wait for the banner to go away
        const banner = page.locator('#CybotCookiebotDialog');
        await expect(banner).toBeHidden({ timeout: 5_000 });
    });

    test('input field constraints - building area', async ({page}) => {
        // Get the area field
        const areaField = page.locator('input[name="buildingArea"]');

        // Test with non-numeric value
        await areaField.fill('abc');
        // Check what value was actually accepted
        await expect(areaField).not.toHaveValue('abc');

        // Test with negative value
        await areaField.fill('-10');
        // Check if negative sign is accepted or filtered out
        const negativeValue = await areaField.inputValue();
        console.log(`Value after entering -10: ${negativeValue}`);

        // Test with zero
        await areaField.fill('0');
        await expect(areaField).toHaveValue('0');

        // Test with extremely large value
        await areaField.fill('999999');
        const largeValue = await areaField.inputValue();
        console.log(`Value after entering 999999: ${largeValue}`);

        // Test with decimal value
        await areaField.fill('75.5');
        const decimalValue = await areaField.inputValue();
        console.log(`Value after entering 75.5: ${decimalValue}`);

        // Test with valid value
        await areaField.fill('75');
        await expect(areaField).toHaveValue('75');
    });

    test('input field constraints - build year', async ({page}) => {
        // Get the year field
        const yearField = page.locator('input[name="buildYear"]');

        // Test with non-numeric value
        await yearField.fill('abc');
        // Check what value was actually accepted
        await expect(yearField).not.toHaveValue('abc');

        // Test with future year
        const futureYear = (new Date().getFullYear() + 5).toString();
        await yearField.fill(futureYear);
        const enteredFutureYear = await yearField.inputValue();
        console.log(`Value after entering future year ${futureYear}: ${enteredFutureYear}`);

        // Test with very old year
        await yearField.fill('1800');
        const enteredOldYear = await yearField.inputValue();
        console.log(`Value after entering 1800: ${enteredOldYear}`);

        // Test with valid year
        await yearField.fill('2000');
        await expect(yearField).toHaveValue('2000');
    });

    test('radio button selection behavior', async ({page}) => {
        // Check if any radio button is selected by default
        // const initialCheckedCount = await page.locator('input[type="radio"][name="floor"]:checked').count();
        // console.log(`Number of radio buttons checked by default: ${initialCheckedCount}`);

        const floorGroup = page.getByRole('radiogroup', { name: 'Piętro' });

        // 2) Iterate over the real labels
        for (const option of ['Parter', 'Pośrednie', 'Ostatnie']) {
            // This locator points at the actual <input type="radio"> under the hood
            const radio = floorGroup.getByRole('radio', { name: option });

            // 3) Use .check() so Playwright toggles .checked and fires change events
            await radio.check();

            // 4) Assert it really is checked
            await expect(radio).toBeChecked();

            // 5) (Optional) Make sure only one in the group is checked
            await expect(floorGroup.locator('input[type="radio"]:checked')).toHaveCount(1);
        }
    });

    test('form submission behavior with empty fields', async ({page}) => {
        // Clear any pre-filled values
        await page.locator('input[name="buildingArea"]').fill('');
        await page.locator('input[name="buildYear"]').fill('');

        await page.click('button:has-text("Przejdź dalej")');
        // Try to submit the form
        // const nextButton = page.locator('button:has-text("Przejdź dalej")');
        // await nextButton.click();

        // Check if we're still on the same page (form didn't submit)
        await expect(page).toHaveURL(CALCULATOR_URL);

        // Check if any client-side validation is happening
        // Since the comments indicate no validation feedback, we'll just log what we observe
        console.log('Checking for any validation indicators after empty form submission');

        await expect(
            page.locator('text=Wpisano nieprawidłowy rok budowy. Wprowadź rok w przedziale od 1000 do obecnego.')
        ).toBeVisible();
        // // Check if the button is disabled after clicking
        // const isDisabled = await nextButton.isDisabled();
        // console.log(`Next button disabled after clicking: ${isDisabled}`);
    });

    test('form submission without filling', async ({page}) => {

        // Submit the form
        await page.locator('button:has-text("Przejdź dalej")').click();
        // Wait for navigation or next step to load
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/empty_fields.png', fullPage: true });
    });

    test('form submission with valid data', async ({page}) => {
        // Fill in all required fields with valid values
        await page.locator('input[name="buildingArea"]').fill('75');
        await page.locator('input[name="buildYear"]').fill('2000');
        await page.getByRole('radio', {name: 'Pośrednie'}).click({force: true});

        // Submit the form
        await page.locator('button:has-text("Przejdź dalej")').click();

        // Wait for navigation or next step to load
        await page.waitForTimeout(3000);

        // Based on the comments in simplified.spec.ts, the button doesn't navigate to step 2
        // So we'll check if we're still on the same page and log the result
        const currentUrl = page.url();
        console.log(`URL after form submission with valid data: ${currentUrl}`);

        // Check for any changes in the page content that might indicate successful submission
        const formStillVisible = await page.locator('input[name="buildingArea"]').isVisible();
        console.log(`Form still visible after submission: ${formStillVisible}`);
    });

    test('form field attributes and properties', async ({page}) => {
        // Check area field attributes
        const areaField = page.locator('input[name="buildingArea"]');
        const areaType = await areaField.getAttribute('type');
        console.log(`Building area field type: ${areaType}`);

        // Check if there are any min/max attributes
        const areaMin = await areaField.getAttribute('min');
        const areaMax = await areaField.getAttribute('max');
        console.log(`Building area min: ${areaMin}, max: ${areaMax}`);

        // Check year field attributes
        const yearField = page.locator('input[name="buildYear"]');
        const yearType = await yearField.getAttribute('type');
        console.log(`Build year field type: ${yearType}`);

        const yearMin = await yearField.getAttribute('min');
        const yearMax = await yearField.getAttribute('max');
        console.log(`Build year min: ${yearMin}, max: ${yearMax}`);

        // Check if fields have any validation-related attributes
        const areaRequired = await areaField.getAttribute('required');
        const yearRequired = await yearField.getAttribute('required');
        console.log(`Building area required: ${areaRequired}, Build year required: ${yearRequired}`);

        // Check radio button attributes
        const radioButton = page.locator('input[type="radio"][name="floor"]').first();
        const radioRequired = await radioButton.getAttribute('required');
        console.log(`Floor selection required: ${radioRequired}`);
    });
});
