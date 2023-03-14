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
  await inputCategory.selectOption('Household'); 

  // Commit inputs
  await page.keyboard.press('Enter');

  // Get last list item
  let lastItem = await page.locator('ul li').last();
  // Get expense name for last item
  let lastExpenseName = await lastItem.locator('.expense-name').textContent();
  
  // Expect the last expense to equal 'Coffee'.
  await expect(lastExpenseName).toEqual('Coffee');
});

test ('ensure cost sliders sync', async ({page}) => {
  await page.goto('http://localhost:5174/');

  // Get slider values
  let minSliderValue = await page.locator('#minimumSlider');
  let maxSliderValue = await page.locator('#maximumSlider');

  // Set maximum slider value, and then minimum slider value
  await maxSliderValue.fill("50");
  await minSliderValue.fill("100");

  // Ensure maximum slider value was set to minimum value (since 100 > 50)
  await expect(await maxSliderValue.inputValue()).toEqual('100');
});

test ('ensure edit expense', async ({page}) => {
  await page.goto('http://localhost:5174/');

  // Get input fields.
  let inputName = await page.locator('#input-name-field');
  let inputAmount = await page.locator('#input-amount-field');
  let inputCategory = await page.locator('#input-category-select');
  
  // Fill input fields.
  await inputName.fill('Coffee'); 
  await inputAmount.fill('30');
  await inputCategory.selectOption('Household'); 

  // Commit inputs
  await page.keyboard.press('Enter');

  // Get last list item
  let lastItem = await page.locator('ul li').last();

  // Click edit button
  await lastItem.locator('.edit-button').click();

  // Get and fill input field for edit mode
  await lastItem.locator('.expense-label').fill('edited coffee');

   // Commit edit
   await page.keyboard.press('Enter');

   // Get expense name for last item
  let lastExpenseName = await lastItem.locator('.expense-name').textContent();
    
  // Expect the last expense to equal 'Edited coffee' (we have a capitalize-function).
  await expect(lastExpenseName).toEqual('Edited coffee');
});
