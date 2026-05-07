# Module 8 – Restful Booker API Tests & UI Tests

This repository contains API test automation for the Restful Booker service using **SuperTest** and **Jest**, and simple UI tests using **Playwright**.

## API Tests

### How to run API tests

```bash
npm install
npm run test:api
```

### API Test Scenarios

- Create authentication token
- Create booking
- Get booking by ID
- Update booking
- Delete booking

## UI Tests

UI tests live in the `ui-tests` folder and use **Playwright**.

### How to run UI tests

```bash
cd ui-tests
npm install
npx playwright install
npm run test:ui
```

### UI Test Scenarios

- Example page opens (https://example.com)

## Jenkins Pipeline

- **API Job**: `npm run test:api` (project root)
- **UI Job**: `cd ui-tests && npm install`, `cd ui-tests && npx playwright install`, `cd ui-tests && npm run test:ui`
