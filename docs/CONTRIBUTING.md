# Contributing Guide
Dev Stack*: `next js` 15 (pages router), and sqlite

## Tooling
- [npm](https://www.npmjs.com/) for packages
- [Vitest](https://vitest.dev/) - for testing functions and API endpoints (mocking)
- plans for playwright :D

## Commit Convention
No hard rules, just follow the convention `type(scope): message` with those types:
- `feat / feature`: a new features
- `refactor`: any code change that is not a fix nor a feature
- `fix`: bug fix (not for tests)
- `build`: changes regarding the build, configs files, changes to dependencies or adding new ones.
- `perf`: any optimization change that is bearly refactor
  -  you can use `refactor` instead
- `test`: adding new tests, changing/fixing existing ones, or any other change related to the testing environment (utils, configs etc...)
- `style`: code formatting
- `docs`: changing to documentation
- `chore`: any change that does not fit into any of the above

in the body I usualy refer to components with `<[component]>` and functions with `[functionName]()`,
  - `$getItems()`, `<ItemCard>`, etc...

### Scope examples:
- `api endpoints`: test(api/users)
- `component`: feat()
- `pages`:
  - feat(itemform) for edit/add item pages if edit is for both.
  - feat(itempage) specific page
  - feat(item)

## Variables & Functions Naming
just two rules:
- prefix `$` for **server-only functions**, they shouldn't be called from the client code
  - e.g. `$getUsers()`
- prefix components of a specific page with the page name
  - e.g. `<ItemPageCardField>` & `<ItemFormCardField>`

## Testing
for now, I only test API endpoints, by mocking the handler with the function $mockHttp() which implements 'node-mocks-http' and 'form-data' under the hood, there are plans for UI testing
- currently (until drizzle mock driver is working properly), you need to create a sqlite db for testing with `npm run test:migrate`
- then just `npm test`

___
* initially I made it using next js, express js, and postgres, but that was an overkill, so I refactored it into just next js (and sqlite if you count it)