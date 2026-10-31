# Demoblaze E2E tests

[![E2E](https://github.com/Nekrasov-AA/demoblaze-e2e/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/Nekrasov-AA/demoblaze-e2e/actions/workflows/e2e.yml)

End-to-end tests for the login and laptop purchase flows of
[demoblaze.com](https://www.demoblaze.com), written in Cypress and TypeScript.

## Setup & run

The steps are the same on macOS and Windows unless a step says otherwise.

### 1. Install Node.js

Download the **LTS** version from [nodejs.org](https://nodejs.org) and run the installer.

- macOS: run the `.pkg` installer.
- Windows: run the `.msi` installer and keep the default options.

npm (the Node package manager) is installed together with Node.

### 2. Install Git

- macOS: open Terminal and run `git --version`. If Git is missing, macOS offers to install
  it.
- Windows: install it from [git-scm.com](https://git-scm.com) with the default options.

Without Git, you can download the repository as a ZIP instead (green **Code** button on
GitHub, then **Download ZIP**) and unpack it.

### 3. Open a terminal

- macOS: **Terminal** (Applications > Utilities).
- Windows: **PowerShell** (Start menu, type "PowerShell").

Check that Node is installed:

```sh
node -v
```

It should print a version number such as `v24.x.x`.

### 4. Get the code and install dependencies

```sh
git clone https://github.com/Nekrasov-AA/demoblaze-e2e.git
cd demoblaze-e2e
npm ci
```

`npm ci` installs the exact dependency versions from `package-lock.json`, including the
Cypress app. The first run downloads about 200 MB and takes a few minutes.

### 5. Run the tests

| Command | What it does |
|---|---|
| `npm test` | Runs the smoke suite (`@smoke` tests) headlessly, without opening a browser window. |
| `npm run test:all` | Runs every test, including `@extended`. |
| `npm run cy:open` | Opens the interactive Cypress app. |
| `npm run typecheck` | Checks the TypeScript types. |
| `npm run lint` | Runs ESLint. |

To use the interactive app: run `npm run cy:open`, choose **E2E Testing**, pick a browser,
click **Start E2E Testing in <browser>**, then click a spec file (`auth.cy.ts` or `purchase.cy.ts`).
You can watch each step and hover over a command in the left panel to see the page at that
moment.

### 6. Find the results

- **Terminal:** at the end of a headless run, Cypress prints a table with passed, failed
  and pending tests per spec file.
- **Screenshots:** when a test fails, Cypress saves a screenshot of the failed state in
  `cypress/screenshots/`. The folder exists only after a failure.
- **CI:** every push and pull request to `main` runs type check, lint and the smoke suite
  on GitHub Actions (badge above). Open the **Actions** tab to see the runs. A failed run
  has a `cypress-screenshots` artifact to download. The workflow can also be started by
  hand with **Run workflow**.

### Troubleshooting

- **"Cypress failed to start" with `bad option: --no-sandbox` in the VS Code terminal.**
  VS Code sets the variable `ELECTRON_RUN_AS_NODE`, which breaks the Cypress app. Use a
  terminal outside VS Code, or clear the variable first:
  - macOS: `unset ELECTRON_RUN_AS_NODE`
  - Windows (PowerShell): `Remove-Item Env:ELECTRON_RUN_AS_NODE`
- **Windows: "running scripts is disabled on this system" when running `npm`.**
  PowerShell blocks npm's script by default on some machines. Run
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use Command Prompt
  instead.
- **Slow runs.** The tests run against the live, shared demo site, and its API is
  sometimes slow. A run that usually takes 30 seconds can take a few minutes. Headless runs
  retry a failed test once.
- **Passing options to Cypress.** Cypress 16 uses `--expose` where older guides use
  `--env`. For example, to run only the `@extended` tests:

  ```sh
  npx cypress run --expose grepTags=@extended
  ```

## Test approach

### What I considered essential

The task names two flows: login and laptop purchase. For each one I test the happy path and
the failures a real user is most likely to hit. Signup is included because login depends on
having an account.

| Test | File | Tag |
|---|---|---|
| Signs up a new user who can then log in | `auth.cy.ts` | `@smoke` |
| Shows an error for a wrong password | `auth.cy.ts` | `@smoke` |
| Shows an error for a non-existent user | `auth.cy.ts` | `@smoke` |
| Shows an error when signing up with an existing username | `auth.cy.ts` | `@smoke` |
| Buys a laptop and shows the paid amount in the confirmation | `purchase.cy.ts` | `@smoke` |
| Requires name and credit card to place an order | `purchase.cy.ts` | `@smoke` |
| Shows today's date in the purchase confirmation (skipped, known bug) | `purchase.cy.ts` | `@extended` |

The purchase test covers the whole flow: log in, open Laptops, open MacBook Pro, read the
price, add to cart, check the cart row and total, place the order, check the amount in the
confirmation, and check that the cart is empty afterwards.

### How the tests are designed

- **UI tests against the real backend.** I use the API only to create test users, which is
  faster and more reliable than signing up through the UI in every test. I use
  `cy.intercept` only to wait for network calls, never to fake responses, so every test
  goes through the real server.
- **A new user per test.** The demo database is public and shared, so I never rely on
  existing accounts. Each test generates a unique username (timestamp plus random suffix)
  and creates it through the API. Tests don't depend on each other and can run in any
  order, any number of times.
- **No hardcoded prices.** The test reads the price from the product page and checks the
  same value in the cart row, the cart total and the confirmation.
- **No fixed waits.** Tests wait for network calls or for visible UI states, never for a
  number of milliseconds.
- **Native alerts.** The site reports most results with browser alerts. I replace
  `window.alert` with a stub on the current page right before the action, and check the
  exact text after the related network call.
- **Thin page objects.** `cypress/support/pages/` holds selectors and small actions.
  Assertions stay in the spec files, so each test reads as a list of checks.
- **Tags.** `@smoke` is the core suite that runs in CI. `@extended` is for extra tests,
  currently one skipped test documenting a known bug.

### What I left out on purpose

- **Standalone API tests.** The task is about UI flows. The API is a means to set up data,
  not a subject of testing here.
- **Cross-browser runs.** CI runs the suite in Chrome only. Locally, `npm test` uses
  Cypress's built-in Electron browser, so it works without Chrome installed. To reproduce
  a CI run exactly, use `npm test -- --browser chrome`.
- **Other parts of the site:** other categories and products, pagination, removing items
  from the cart, logout, and the Contact and About us dialogs. They are outside the two
  requested flows.
- **Visual, accessibility and performance testing.**

## Assumptions

- The task asks to create an account before proceeding. I created the account
  `Artem_Nekrasov` manually and used it to explore the site by hand. The tests don't use
  it. They create their own users through the API, so they stay isolated and repeatable.
- The tests run against the live public site. There is no local or staging copy.

## Issues found

### Functional

- **The confirmation date shows the previous month.** The page builds the date with
  JavaScript's `getMonth()`, which counts months from 0. On 30 October the confirmation
  shows `30/9/2026`. The skipped `@extended` test asserts the correct date and fails
  against the current site.
- **An order can be placed with an empty cart.** The confirmation shows `Amount: 0 USD`.
- **The card number is not validated.** Only Name and Credit card are required, and the
  card field accepts any text, including letters.
- **The order is never sent to the server.** The only network call on purchase is
  `deletecart`. The confirmation, including its order Id, is created in the browser.
- Minor: the duplicate-signup message reads "This user already exist."
- Minor: the three category links (Phones, Laptops, Monitors) share the same id `itemc`.
  Ids should be unique.

### Security

I found these by reading network traffic and the site's JavaScript. I did not try to
exploit them against the live site.

- **Login reveals which usernames exist.** It answers "Wrong password." for an existing
  user and "User does not exist." otherwise.
- **The password is only base64-encoded before sending.** Base64 is an encoding, not
  encryption. Anyone who sees the request body can decode it. Only HTTPS protects it.
- **The session token is not signed.** It is base64 of the username and an expiration
  time. If the server accepts any well-formed token, a token for any user could be created
  by hand. Not verified against the server.
- **The session cookie is readable by page scripts.** The page sets it with
  `document.cookie`, so it can't be HttpOnly. Any script injected into the page could
  steal the session.
- **The cart is cleared by username alone.** `deletecart` takes a username, not a session
  token. If the server doesn't check ownership, anyone could empty another user's cart.
  Not verified against the server.
- **Visitors without cookies share one cart (privacy).** For anonymous visitors the cart is
  keyed by the whole cookie string. Only the home page creates the `user` cookie, so a
  visitor who opens a product or cart link directly has no cookies and gets the cart with
  the empty key, shared by everyone in the same situation. I observed it holding more than
  2,500 items from other visitors, and growing. Anyone can see what others put there. An
  anonymous purchase clears the cart by the same key, so it would likely empty the shared
  cart for everyone. I did not try that.

## Flakiness found and fixed

The first two showed up as intermittent failures. I found the cause from failure
screenshots and the site's JavaScript, then confirmed each fix with repeated runs with
retries turned off. The third appeared only in one browser mode.

- **Bootstrap modal focus lost keystrokes.** When a Bootstrap modal finishes its fade-in,
  it moves focus to the modal itself. Cypress types faster than a person, so part of the
  password could go to the modal instead of the field. The site then showed its "Please
  fill out Username and Password." alert and sent no request. The fix: the login, signup
  and order page objects wait until the modal has focus before typing.
- **SweetAlert ignored an early OK click.** The purchase confirmation becomes clickable
  500 ms after it opens. An earlier click on OK closes the dialog without running the
  redirect. The fix: wait for the dialog's `visible` class before clicking OK.
- **Native alerts were not captured in Chrome open mode.** In `cypress open` with Chrome,
  the site's alerts appeared as real dialogs and the tests failed. A diagnostic showed that
  Cypress's own alert override was not applied to the page; I did not find out why. Headless
  runs and Electron were not affected. The fix: stub `window.alert` on the current page
  right before each action that triggers an alert, which works in every browser and mode.

Headless runs still retry a failed test once. That is a safety net for the shared demo
site, not a way to hide these problems.

## What I'd test next

- Known-bug tests for the card-number validation and the empty-cart order, as `@extended`
  skipped tests like the date test.
- Cart: several products and the total, the same product added twice, deleting a row.
- Logout, staying logged in after a reload, and an expired session.
- An anonymous cart followed by logging in.
- A browser matrix in CI (add Firefox and Edge next to Chrome).
- API contract tests for signup, login and cart.
- The unverified security issues above, in an environment where that testing is allowed.
- Basic accessibility checks on the login, signup and order dialogs.

## AI usage

I used AI tools throughout this task and want to be specific about how.

- **What I did myself:** explored the site manually in DevTools before writing any code
  (API endpoints, password encoding, error responses, most of the issues listed above);
  decided the scope, what is essential to test and why, and the test strategy (API only
  for test data, a unique user per test, intercepts only for waiting); reviewed and
  approved each implementation plan before coding, then reviewed every generated change
  before keeping it; ran the tests and checked them in the interactive runner.
- **Claude Code (in VS Code)** implemented the approved plans: the test code, the CI
  workflow and this README. It proposed implementation details such as the page-object
  shape and how alerts are captured, and it traced the two flaky failures to their root
  causes using failure screenshots and the site's JavaScript.
- **Claude (chat)** helped me plan the phases, write the prompts, and review and explain
  the generated code and Cypress concepts.
- **ChatGPT** gave second-opinion reviews of the plans; I adopted some suggestions and
  rejected others.
- [`CLAUDE.md`](CLAUDE.md) contains the instructions and conventions I gave the coding
  agent.
