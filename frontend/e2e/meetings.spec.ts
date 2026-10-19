import { Page, expect, test } from '@playwright/test';
import { FakeApi, isoDay, mockApi } from './fake-api';

let api: FakeApi;

async function signInAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/meetings$/);
}

test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
});

test('L2-032/3, L2-033/2: signing in as admin stores the token and shows the meetings page with the account avatar', async ({ page }) => {
  await signInAsAdmin(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Meetings' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Account menu/ })).toBeVisible();
  // The token is persisted when the page unloads, so a reload keeps the session.
  await page.reload();
  await expect(page.getByRole('button', { name: /Account menu/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('theDebateApp'))).toContain('e2e-token');
});

test('L2-023/1, L2-023/2: the meetings page lists every meeting with name, abstract and Edit, View and Delete', async ({ page }) => {
  await signInAsAdmin(page);
  const items = page.locator('li.meeting');
  await expect(items).toHaveCount(2);
  const upcoming = page.locator('section[aria-labelledby="upcoming-h"] li.meeting');
  await expect(upcoming.locator('h2')).toHaveText('Should cities ban cars from downtown?');
  await expect(upcoming.locator('.meeting__excerpt')).toHaveText('This house would ban private cars from city centres.');
  await expect(upcoming.getByRole('link', { name: /^Edit / })).toBeVisible();
  await expect(upcoming.getByRole('link', { name: /^View / })).toBeVisible();
  await expect(upcoming.getByRole('button', { name: /^Delete / })).toBeAttached();
  await expect(page.locator('section[aria-labelledby="past-h"] li.meeting h2')).toHaveText('Introduction');
});

test('L2-023/3, L2-031/1, L2-031/4: View opens the read-only meeting page with its tabs', async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole('link', { name: 'View Introduction' }).first().click();
  await expect(page).toHaveURL(/\/meeting\/1$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Introduction' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Minutes' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Fourteen members attended.')).toBeVisible();
  await page.getByRole('tab', { name: 'Agenda' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Agenda' })).toContainText('Introduction');
});

test('L2-024/1, L2-024/6, L2-030/4, L2-031/3: creating a meeting posts it, announces it and returns to the list', async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole('link', { name: 'New meeting' }).first().click();
  await expect(page).toHaveURL(/\/meeting\/create$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Create Meeting' })).toBeVisible();

  await page.getByLabel('Name', { exact: true }).fill('AI in classrooms');
  await page.getByLabel('Date', { exact: true }).fill(isoDay(14));
  await page.getByLabel('Start', { exact: true }).fill('19:00');
  await page.getByLabel('End', { exact: true }).fill('20:30');
  await page.getByRole('textbox', { name: 'Abstract' }).click();
  await page.keyboard.type('Help or harm?');
  await page.getByRole('button', { name: 'Create meeting' }).click();

  await expect(page).toHaveURL(/\/meetings$/);
  await expect(page.locator('.toast--success')).toContainText('Meeting saved');
  await expect(page.locator('li.meeting h2', { hasText: 'AI in classrooms' })).toBeVisible();
  expect(api.saved).toHaveLength(1);
  expect(api.saved[0]).toMatchObject({ name: 'AI in classrooms', date: isoDay(14), start: '19:00', end: '20:30' });
  expect('id' in api.saved[0]).toBe(false);
  expect(String(api.saved[0]['abstract'])).toContain('Help or harm?');
});

test('L2-034/1, L2-034/2: a missing name or an End before Start sends nothing and shows the invalid state', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/meeting/create');
  await page.getByLabel('Start', { exact: true }).fill('20:30');
  await page.getByLabel('End', { exact: true }).fill('19:00');
  await page.getByRole('button', { name: 'Create meeting' }).click();
  await expect(page.locator('.form-summary')).toContainText('Fix 2 things to create the meeting');
  await expect(page.getByText('Enter a name.')).toBeVisible();
  await expect(page.getByText('End must be after start.')).toBeVisible();
  expect(api.saved).toHaveLength(0);
});

test('L2-024/2, L2-024/6, L2-031/2, L2-031/4: Edit loads the meeting into the form and Save updates it', async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole('link', { name: 'Edit Should cities ban cars from downtown?' }).first().click();
  await expect(page).toHaveURL(/\/meeting\/2\/edit$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Edit Meeting' })).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Should cities ban cars from downtown?');
  await expect(page.getByLabel('Date', { exact: true })).toHaveValue(isoDay(7));
  await expect(page.getByLabel('Start', { exact: true })).toHaveValue('19:00');
  await expect(page.getByLabel('End', { exact: true })).toHaveValue('20:30');

  await page.getByLabel('Name', { exact: true }).fill('Should cities ban cars?');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL(/\/meetings$/);
  await expect(page.locator('li.meeting h2', { hasText: 'Should cities ban cars?' })).toBeVisible();
  expect(api.saved[0]).toMatchObject({ id: 2, name: 'Should cities ban cars?' });
});

test('L2-034/3: leaving a form with unsaved changes asks first; Keep editing stays and Discard leaves', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/meeting/2/edit');
  await page.getByLabel('Name', { exact: true }).fill('Changed my mind');
  await page.getByRole('link', { name: 'Meetings' }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Leave without saving?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Keep editing' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Keep editing' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/meeting\/2\/edit$/);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Changed my mind');

  await page.getByRole('link', { name: 'Meetings' }).first().click();
  await dialog.getByRole('button', { name: 'Discard' }).click();
  await expect(page).toHaveURL(/\/meetings$/);
  expect(api.saved).toHaveLength(0);
});

test('L2-023/4, L2-004: deleting from the list asks for confirmation, then removes the row without reloading', async ({ page }) => {
  await signInAsAdmin(page);
  const listCalls = api.listCalls();
  await page.getByRole('button', { name: 'Delete Introduction' }).click({ force: true });
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Delete “Introduction”?' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('li.meeting')).toHaveCount(2);

  await page.getByRole('button', { name: 'Delete Introduction' }).click({ force: true });
  await page.getByRole('dialog').getByRole('button', { name: 'Delete meeting' }).click();
  await expect(page.locator('li.meeting')).toHaveCount(1);
  await expect(page.locator('.toast--success')).toContainText('Meeting deleted');
  expect(api.removed).toEqual([1]);
  expect(api.listCalls()).toBe(listCalls);
});

test('L2-024/7, L2-030/5: deleting from the edit form returns to the list without the discard prompt', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/meeting/1/edit');
  await page.getByLabel('Name', { exact: true }).fill('Edited first');
  await page.getByRole('button', { name: 'Delete meeting' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete meeting' }).click();
  await expect(page).toHaveURL(/\/meetings$/);
  await expect(page.locator('li.meeting')).toHaveCount(1);
  expect(api.removed).toEqual([1]);
});

test('L2-019/6, L2-019/7, L2-031/5: unknown meeting paths render the not-found page', async ({ page }) => {
  await signInAsAdmin(page);
  for (const path of ['/meeting/1/updateminutes', '/meeting/abc', '/meeting/abc/edit']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: "We can't find that page" })).toBeVisible();
  }
});

test('L2-003/3, L2-031: a meeting that no longer exists shows the could-not-open state with a way back', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/meeting/99');
  await expect(page.getByRole('heading', { name: "We couldn't open this meeting" })).toBeVisible();
  await page.getByRole('link', { name: 'Back to meetings' }).click();
  await expect(page).toHaveURL(/\/meetings$/);
});
