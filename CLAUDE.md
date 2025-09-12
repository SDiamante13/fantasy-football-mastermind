# fantasy-football-mastermind

This app uses Sleeper API. Read the docs in docs/sleeper-api.md.

## Technology

- Firebase
- React Native
- Typescript
- @testing-library/react-native
- @testing-library/react (for web)
- Mock Service Worker (MSW) for API stubbing

## Testing & Quality Methodology

### Core Testing Philosophy
- **Outside-In TDD**: Start with RTL acceptance tests (user behavior), then unit tests for business logic
- **Pragmatic Testing**: Don't over-test; focus on user-facing behavior and business logic
- **Quality Gates**: All tests must pass before commit/push via Husky hooks

### Test Strategy & Organization

#### Test Types & File Structure:
```
src/
├── __mocks__/api/*.json          # MSW stub data (obvious data source)
├── **/*.contract.test.ts         # API contract tests (separate npm command)
├── **/*.test.ts                  # Unit tests (business logic, calculations)
├── **/*.web.test.tsx            # RTL acceptance tests (user behavior)
└── setupTests.web.ts            # RTL + MSW configuration
```

#### TDD Workflow:
1. **Contract Tests First** - For new APIs, establish contract with *.contract.test.ts
2. **RTL Acceptance Tests** - Focus on "what user sees/does", not implementation details
3. **Unit Tests** - Business logic, calculations, shared utilities only
4. **MSW Stubbing** - All API calls stubbed with .json files for clear data sources

#### Pragmatic Testing Guidelines:
- **Test**: User interactions, business logic, shared components, error states
- **Don't Test**: Simple presentational components, obvious getters/setters, trivial code
- **Shared Components**: Test once to reduce redundant tests across features

### Quality Enforcement:
- Pre-commit: `npm run setup` + all tests pass
- Focus on behavior over implementation details
- Use RTL + MSW for realistic user scenarios

## Development Methodology

- Follow the test-driven development process
- Clean up code as you go, code should be expressive (no need for comments, extract small functions)
- Strong type system, NO any or unknowns! Use types and interfaces to make impossible states impossible
- Use small pure functions
- Follow functional core and imperative shell architectural principles
- tests should always be asserting on behaviors not implementation details
- Refactor often, but avoid over-engineering. There's a fine balance
- Prefer stubbed functions passed in, rather than using jest mocks

## Commiting and Pushing

After completing a task do the following:

- `npm run setup` (enables husky hooks)
- add files and commit (short message with high level details), don't include Claude Code or Happy as editor
- `git push` 
