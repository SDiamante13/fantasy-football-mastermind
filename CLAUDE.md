# fantasy-football-mastermind

This app uses Sleeper API. Read the docs in docs/sleeper-api.md.

## Technology

- Firebase
- React Native
- Typescript
- @testing-library/react-native

## Methodology

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
