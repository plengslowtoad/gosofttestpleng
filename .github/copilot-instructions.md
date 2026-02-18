# GitHub Copilot Instructions — React Redux Simple Website Builder

## Project Overview

This is a **React 18 + Redux (Redux Toolkit)** WYSIWYG-style website builder application bootstrapped with Create React App. Users can pick HTML components (headers, paragraphs, links, images, iframes) from a picker widget, fill in attributes via forms, and preview the resulting page in real time.

### Tech Stack

- **React 18** with functional components and hooks
- **Redux Toolkit** (`@reduxjs/toolkit`) for state management
- **react-redux** for React bindings (`useSelector`, `useDispatch`)
- **immer** (v9) — available as a direct dependency; use it freely inside reducers
- **classnames** for conditional CSS class composition
- **prop-types** for runtime prop validation
- **Testing**: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, Jest (via react-scripts)

---

## ⚠️ Critical Rules

### 1. Tests Are Sacred — Never Modify Tests or Snapshots

- **All test files under `src/tests/**` are read-only.** Do not edit, rename, delete, or add test files.
- **Snapshot files under `src/tests/__snapshots__/*.js.snap` are read-only.** Never update snapshots. If a snapshot test fails, fix the **implementation** (production code) to match the snapshot expectations — not the other way around.
- When writing or modifying implementation code, always check the corresponding test expectations (inline snapshots in test files and file-based snapshots) and ensure your code produces output that matches exactly.

### 2. Read-Only Files — Do Not Modify

The following files must **never** be edited:

- `src/setupTests.js`
- `src/index.js`
- `src/App.js`
- `src/index.css`
- `src/tests/**` (all test files)
- `src/tests/__snapshots__/*.js.snap` (all snapshot files)
- `package.json`

### 3. Immer Is Available for Reducer Logic

`immer` (v9) is explicitly listed as a dependency. Redux Toolkit's `createSlice` already uses Immer internally, so you can write "mutative" logic directly in reducer case functions. You may also import `produce` from `immer` if needed elsewhere.

---

## Architecture & File Structure

```
src/
├── App.js                          # Root component (read-only)
├── AppProviders.js                 # Redux Provider wrapper, creates store via getStore()
├── index.js                        # Entry point (read-only)
├── index.css                       # Global styles (read-only)
├── setupTests.js                   # Jest setup (read-only)
├── store/
│   ├── index.js                    # Redux store configuration (configureStore)
│   └── components.js               # componentsSlice: state, reducers, actions
├── components/
│   ├── Components/                 # Presentational components for HTML elements
│   │   ├── index.js                # AvailableComponents registry
│   │   ├── H1.js … H6.js          # Header components
│   │   ├── P.js                    # Paragraph component
│   │   ├── A.js                    # Link component (needs implementation)
│   │   ├── Img.js                  # Image component (needs implementation)
│   │   └── Iframe.js               # Iframe component
│   ├── ComponentForms/             # Form components for editing each element type
│   │   ├── index.js                # AvailableComponentForms registry
│   │   ├── TextForm.js             # Form for header text
│   │   ├── TextAreaForm.js         # Form for paragraph text
│   │   ├── LinkForm.js             # Form for link (label + href)
│   │   ├── ImageForm.js            # Form for image (alt + src)
│   │   ├── IframeForm.js           # Form for iframe
│   │   └── Actions.js              # Apply/Remove buttons
│   ├── ComponentsPicker/           # Widget to pick a component to add
│   │   ├── components-picker.js    # Picker component (needs lockedPicker prop)
│   │   └── components-picker.css   # Picker styles (includes --disabled class)
│   ├── ComponentsPreview/          # Live preview of added components
│   │   ├── components-preview.js
│   │   └── components-preview.css
│   ├── ComponentsWrapper/          # Wrapper around each previewed component
│   │   ├── components-wrapper.js
│   │   └── components-wrapper.css
│   ├── EditedComponent/            # Renders the active edit form
│   │   └── edited-component.js
│   ├── Layout/                     # Main layout orchestrating all sections
│   │   └── layout.js
│   └── Navbar/                     # Top navigation bar
│       ├── navbar.js
│       └── navbar.css
├── utils/
│   └── uuid.js                     # UUID v4 generator
└── tests/                          # All tests (read-only)
    ├── A.test.js
    ├── Img.test.js
    ├── reducer.test.js
    ├── store.test.js
    ├── lockedPicker.test.js
    ├── Forms.test.js
    ├── Preview.test.js
    └── __snapshots__/
        └── Preview.test.js.snap
```

---

## Redux State Shape

The global Redux state has the following shape:

```js
{
  components: {
    currentlyEdited: null | { id, layout, values },
    items: [
      { id, layout, values },
      ...
    ]
  }
}
```

- The slice **must** be registered under the `components` key in the store (tests assert `store.getState().components`).
- `currentlyEdited` holds the component currently being edited, or `null` when no editing is active.
- `items` is the ordered array of all components on the page.

---

## Implementation Tasks & Specifications

### Task 1: Fix the Redux Store Configuration (`src/store/index.js`)

Register `componentsReducer` in the store under the `components` key:

```js
export const getStore = () => configureStore({
  reducer: {
    components: componentsReducer,
  }
})
```

The store tests (`store.test.js`) assert that `store.getState()` returns an object with a `components` key.

### Task 2: Implement Reducer Actions (`src/store/components.js`)

All four reducers in `componentsSlice` need implementation. Since `createSlice` uses Immer, you can mutate `state` directly.

- **`addComponent(state, action)`**
  - `action.payload` is `{ id, layout }`.
  - Create a new component object: `{ id, layout, values: {} }`.
  - Push it to `state.items`.
  - Set `state.currentlyEdited` to the same new component object.

- **`updateComponent(state, action)`**
  - `action.payload` is `{ id, data: { values } }`.
  - Find the item in `state.items` by `id`.
  - If found, update its `values` with `action.payload.data.values`.
  - Set `state.currentlyEdited = null`.
  - If the item is **not** found, do **not** modify `state.items`.

- **`removeComponent(state, action)`**
  - `action.payload` is `{ id }`.
  - Remove the item with matching `id` from `state.items`.
  - Set `state.currentlyEdited = null`.

- **`setEditedComponent(state, action)`**
  - `action.payload` is `{ component }`.
  - Set `state.currentlyEdited = action.payload.component`.

### Task 3: Implement the `<A>` Component (`src/components/Components/A.js`)

- Receives a `values` prop with `{ href, label }`.
- Renders: `<a href={values.href} target="_blank" rel="noopener noreferrer">{values.label}</a>`
- `target="_blank"` opens a new tab.
- `rel="noopener noreferrer"` prevents the new tab from accessing `window.opener` and suppresses referrer info.
- Must match this exact inline snapshot from the test:
  ```html
  <a href="http://www.google.com" rel="noopener noreferrer" target="_blank">Click me!</a>
  ```

### Task 4: Implement the `<Img>` Component (`src/components/Components/Img.js`)

- Receives a `values` prop with `{ alt, src }`.
- Renders: `<img alt={values.alt} src={values.src} />`
- Must match this exact inline snapshot from the test:
  ```html
  <img alt="Cool image" src="https://via.placeholder.com/400x200" />
  ```

### Task 5: Update `ComponentsPicker` (`src/components/ComponentsPicker/components-picker.js`)

- Accept a **`lockedPicker`** boolean prop (required via PropTypes).
- When `lockedPicker` is `true`:
  - Add the CSS class `components-picker__component--disabled` to each picker item `<div>`.
  - Disable click handlers (do not call `onComponentClick`).
- When `lockedPicker` is `false`:
  - Items have only the `components-picker__component` class.
  - Click handlers work normally.
- Use the `classnames` library for conditional class application.
- The `lockedPicker` value should be derived from whether `currentlyEdited` is non-null in the Redux state. Pass it from `Layout` or derive it inside `ComponentsPicker` using `useSelector`.

The `lockedPicker.test.js` tests assert:
1. All picker children have class `components-picker__component`.
2. By default, none have `components-picker__component--disabled`.
3. After clicking to add a component, all have `components-picker__component--disabled`.

---

## Coding Conventions

- Use **functional components** with hooks (`useState`, `useSelector`, `useDispatch`).
- Use **PropTypes** for prop validation on all components (follow existing patterns like `H1.js`, `P.js`).
- Use **`classnames`** library for conditional CSS classes.
- Export components as **named exports** (no default exports).
- Keep components small and focused — presentational components should only render markup.
- Follow the existing code style: 2-space indentation, single quotes for imports, semicolons.

## Testing

- Run tests with: `npm test`
- Run tests in watch mode: `npm run test:watch`
- All tests use `@testing-library/react` with `render`, `fireEvent`, and queries.
- Tests use **inline snapshots** (`toMatchInlineSnapshot`) and **file-based snapshots** (`toMatchSnapshot`).
- Never update or regenerate snapshots. Fix implementation code to match existing snapshots.

## Dependencies You Can Use

- `@reduxjs/toolkit` — `createSlice`, `configureStore`
- `immer` — `produce` (also built into createSlice)
- `classnames` — conditional CSS class strings
- `prop-types` — runtime prop type checking
- `react-redux` — `Provider`, `useSelector`, `useDispatch`

## Common Pitfalls

1. **Store key mismatch**: The slice MUST be under the `components` key in `configureStore({ reducer: { components: ... } })`. Tests check `store.getState().components`.
2. **Snapshot attribute order matters**: HTML attributes in rendered output must match snapshot order exactly (e.g., `href` before `rel` before `target` for `<a>` tags — React handles this, just ensure all attributes are present).
3. **`addComponent` must initialize `values: {}`**: The test expects new components to have an empty `values` object.
4. **`updateComponent` must not mutate items if ID not found**: Only update if the item exists in the array.
5. **`lockedPicker` must be a required prop**: Use `PropTypes.bool.isRequired`.
6. **Disabled picker items must not be clickable**: When locked, clicking should have no effect (don't dispatch `addComponent`).
