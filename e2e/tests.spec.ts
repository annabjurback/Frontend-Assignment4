import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Finns det ett bättre sätt? funkar inte rakt av med liveserver
  await page.goto('http://localhost:5174/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Budget/);
});


test('ensure expense name input', async ({ page }) => {
  await page.goto('http://localhost:5174/');

  // Get input fields.
  let inputName = await page.locator('#input-name-field');
  let inputAmount = await page.locator('#input-amount-field');
  let inputCategory = await page.locator('#input-category-select');
  
  // Fill input fields.
  await inputName.fill('Coffee'); 
  await inputAmount.fill('30');
  // går det att välja via value på selecten?
  await inputCategory.selectOption('Household'); 
  // Commit inputs
  await page.keyboard.press('Enter');

  // Get last list item
  let lastItem = await page.locator('ul li').last();
  // Get expense name for last item
  let lastExpenseName = await lastItem.locator('.expense-name').textContent();
  
  // Expect the last expense to contain coffee.
  await expect(lastExpenseName).toEqual('Coffee');
});

test ('ensure cost sliders sync', async ({page}) => {
  await page.goto('http://localhost:5174/');

  // Get slider values
  let minSliderValue = await page.locator
});
