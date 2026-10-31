# CLAUDE.md

## Project context
Take-home task for a Senior QA Engineer role: Cypress E2E tests for the **login** and
**laptop purchase** flows of https://www.demoblaze.com. Tight deadline, so coverage
focuses on essential flows. The repo is public and will be reviewed and discussed in an
interview, so every line must be explainable and intentional.

The owner (Artem) is an experienced QA engineer (Playwright, Selenium, Pytest) but new
to Cypress. Explain Cypress-specific decisions briefly when you make them.

## Scope (decided — do not expand without asking)
Core suite (`@smoke`):
1. UI signup of a new user
2. Happy path: user created via API -> UI login -> Laptops -> pick laptop -> add to cart
   -> verify item + price in cart -> place order -> confirmation shows correct amount
3. Login with wrong password
4. Login with non-existent user
5. Signup with an already existing username
6. Place order with empty required fields (Name, Credit card)

Optional extra tests go under the `@extended` tag only.
No standalone API tests — API is used only for test data setup and for waiting
on network calls. This is a deliberate decision documented in the README.

## Tech stack
- Cypress (latest stable), TypeScript, Node LTS
- `@cypress/grep` for tags (`@smoke`, `@extended`)
- ESLint (flat config) with `eslint-plugin-cypress` (recommended rules) + TypeScript support
- GitHub Actions via `cypress-io/github-action`

## Structure
```
cypress/
  e2e/auth.cy.ts
  e2e/purchase.cy.ts
  support/commands.ts      # custom commands + TS declarations
  support/e2e.ts
  support/pages/           # lightweight page objects
  fixtures/
cypress.config.ts
.github/workflows/e2e.yml
```

## Conventions
- Language: everything committed to the repo is in English only: code, identifiers, test
  names, comments, README, commit messages, CI job names.
- NEVER use `cy.wait(<number>)`. Wait on network via `cy.intercept(...).as('x')` + `cy.wait('@x')`,
  or on UI state via assertions (`should('be.visible')` etc.).
- Never assign Cypress commands to variables (`const el = cy.get(...)`). Use chaining,
  `.then()`, or aliases.
- Native alerts: use `cy.stubAlert()` after the page has loaded and right before the
  action; it stubs `window.alert` on the current window as `@alert` (Cypress's own
  override was not applied in Chrome open mode). A new page needs a new call. Assert
  `calledWith` after waiting for the related network call.
- Always pass the HTTP method to `cy.intercept` (e.g. `cy.intercept('POST', '**/login')`):
  the API is cross-origin, so every POST is preceded by a CORS preflight OPTIONS request.
- API errors come back as HTTP 200 with `{"errorMessage": "..."}`. Never treat status 200
  as success; check the body or the UI outcome.
- Test data: unique usernames (timestamp + random suffix). The demo DB is shared and
  public; never rely on pre-existing users or fixed accounts.
- Users are generated per test by a factory function and created via API.
  No credentials are committed anywhere in the repo.
- Fixtures hold static data only (order form data, product name), never user credentials.
- Passwords are sent to the API base64-encoded, exactly as the UI does (see Site facts).
- Do not hardcode product prices: read the price from the product page and assert the
  same value in the cart, the cart total, and the order confirmation.
- Selectors: prefer stable ids (`#loginusername`, `#totalp`, ...); text selectors only
  where no id exists. No long CSS chains, no index-based selectors unless unavoidable.
- Each test is independent (testIsolation on). No test depends on another test's state.
- Keep page objects thin: selectors + small actions. Assertions live in specs.
- Readable test names describing behaviour: `it('shows an error for a wrong password')`.
- Comments only where the code is non-obvious (e.g. why `window.alert` is stubbed, why the
  password is encoded). No comments that restate what the code does.

## Site facts (verified manually in DevTools, 2026-10-30)
API base: `https://api.demoblaze.com`. All calls are POST with a JSON body, except
`GET /entries`.

Auth
- `POST /signup` `{username, password: base64(password)}`. Success: empty body, alert
  `Sign up successful.` Duplicate: `{"errorMessage":"This user already exist."}`, same
  text in the alert.
- `POST /login`, same payload shape. Errors: `Wrong password.` / `User does not exist.`
  (body `errorMessage` + alert). Success: the page reloads and the header shows
  `Welcome <username>`.
- Empty signup/login form: alert `Please fill out Username and Password.` (client-side).
- Session: `POST /check {token}` on every page load. The token is
  base64(username + expiration) and is stored in a cookie.

Catalog
- Home: `GET /entries`. "Laptops" category: `POST /bycat {"cat":"notebook"}`.
- Product page is a full page load (`prod.html?idp_=<id>`): `POST /view {"id"}`.
- Product used in tests: `MacBook Pro`, id 15, listed as `$1100`.

Cart and order
- "Add to cart": `POST /addtocart`, alert `Product added.` Each click adds a separate row.
- Cart page: `POST /viewcart`, then one `POST /view` per item. Rows and the total are
  rendered client-side only after all `/view` responses arrive.
- Place Order with empty Name or Credit card: alert `Please fill out Name and Creditcard.`
- Successful purchase shows a SweetAlert modal (NOT a native alert): `Thank you for your
  purchase!` with `Id`, `Amount: <n> USD`, `Card Number`, `Name`, `Date: d/m/yyyy`.
- The only network call on purchase is `POST /deletecart {"cookie": "<username>"}`. No
  order is sent to the server. After OK the app redirects to `index.html`.

Known defects (document, do not "fix" in tests)
Handling: smoke tests never assert behaviour known to be broken. The confirmation date is
not asserted in the happy path; instead an `it.skip` test tagged `@extended`, with a
`// Known bug: ...` comment, asserts the expected (correct) date. All known defects are
listed in the README "Issues found" section.
- Confirmation date shows the previous month (0-based month).
- An order can be placed with an empty cart (`Amount: 0 USD`).
- Only Name and Credit card are required; the card number is not validated at all
  (letters are accepted).

## Commands
- `npm run cy:open`   — interactive runner
- `npm run test`      — headless, smoke suite
- `npm run test:all`  — headless, all tests
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint`      — ESLint

## README requirements (from the task)
- Written for a reader with NO prior experience setting up the environment or running
  Cypress: step-by-step from installing Node LTS -> clone -> `npm ci` -> run -> where to
  find results.
- Must explain the test approach: what was considered essential to test and why, how the
  tests were designed and why, what was deliberately left out (no standalone API tests).
- Sections: Setup & run, Test approach, Assumptions, Issues found, What I'd test next,
  AI usage (written by the owner).
- Assumptions must state: the task's "create an account before proceeding" was done
  manually (account `Artem_Nekrasov`); tests don't depend on it and create their own users
  via API for isolation and repeatability.

## How to work in this repo
- Work in small steps, one phase per prompt. Do not implement future phases unasked.
- Change only what the current task requires. No refactoring, renaming or "improvements"
  in other files; if you see something worth changing, mention it at the end instead.
- When the prompt asks for plan mode, propose a plan first and write code only after
  the owner confirms it.
- When there is a real design choice (not trivial config), list the options with
  trade-offs in 2–3 lines, then pick the simplest one that fits the conventions.
- Do not add dependencies beyond the stack above without asking.
- Do not edit the "AI usage" section of the README; the owner writes it.
- If site behaviour differs from what is described here, stop and report it instead of
  silently adapting the tests. Unexpected behaviour may be a bug worth documenting.

## Definition of Done (every phase)
1. Only the files needed for the phase were changed.
2. `npm run typecheck` and `npm run lint` pass.
3. The affected specs pass headlessly (`npx cypress run --spec ...`); results reported.
4. No `cy.wait(<number>)`, no hardcoded credentials or prices.
5. A short summary: what was changed and why, and 3–5 bullets on the Cypress concepts used.