import { test as base } from '@playwright/test';

import { prisma } from '@/lib/prisma';
import { user, team } from '../support/helper';
import { LoginPage, SecurityPage } from '../support/fixtures';

type SessionFixture = {
  loginPage: LoginPage;
  securityPage: SecurityPage;
};

const test = base.extend<SessionFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
  securityPage: async ({ page }, use) => {
    const ssoPage = new SecurityPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(ssoPage);
  },
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.credentialLogin(user.email, user.password);
  await loginPage.loggedInCheck(team.slug);
});

test.afterEach(async () => {
  await prisma.session.deleteMany();
});

test('Session is shown in account page ', async ({ securityPage }) => {
  await securityPage.page.goto('/settings/account');
  await securityPage.page.waitForURL('/settings/account');

  await securityPage.checkCurrentSession();
});

test('2 session are shown in account page ', async ({ browser }) => {
  // Create a new incognito browser context.
  const context = await browser.newContext();
  // Create a new incognito browser context.
  const page1 = await context.newPage();
  const loginPage1 = new LoginPage(page1);
  await loginPage1.goto();
  await loginPage1.credentialLogin(user.email, user.password);
  await loginPage1.loggedInCheck(team.slug);

  await page1.goto('/settings/account');
  await page1.waitForURL('/settings/account');

  const securityPage = new SecurityPage(page1);
  await securityPage.isPageVisible();
  await securityPage.checkCurrentSession();
  await securityPage.checkOtherSession();

  await context.close();
});

test('On Remove session user logs out', async ({ browser }) => {
  // Create a new incognito browser context.
  const context = await browser.newContext();
  // Create a new incognito browser context.
  const page1 = await context.newPage();

  const loginPage1 = new LoginPage(page1);
  await loginPage1.goto();
  await loginPage1.credentialLogin(user.email, user.password);
  await loginPage1.loggedInCheck(team.slug);

  await page1.goto('/settings/account');
  await page1.waitForURL('/settings/account');

  const securityPage = new SecurityPage(page1);
  await securityPage.isPageVisible();
  await securityPage.checkCurrentSession();
  await securityPage.checkOtherSession();
  await securityPage.removeCurrentSession();

  await loginPage1.isLoggedOut();

  await context.close();
});
