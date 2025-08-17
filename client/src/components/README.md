# UI Components

This folder contains small, stateless/presentation React components used by the main `App`.

Each component is intentionally prop-driven so they are easy to unit test and reuse.

## Files and props

### `Header.jsx`
- Props: none
- Purpose: site title + feature badges. Keep stateless and small.

### `UploadPanel.jsx`
- Props:
  - `file` (File|null) — selected file
  - `dragging` (boolean) — drag state
  - `lastUploadId` (string|null) — ID returned by upload endpoint
  - `uploading` (boolean) — upload in progress
  - `apiStatus` ("loading"|"ok"|"error") — ping health
  - `error` (string|null) — error message
  - `onFileChange` (function) — handler for file input change
  - `onDrop` (function) — drop handler
  - `onDragOver` (function) — drag over handler
  - `onDragLeave` (function) — drag leave handler
  - `onUpload` (function) — upload action
  - `onReset` (function) — reset action
- Purpose: File selection and upload orchestration UI.

### `QueryPanel.jsx`
- Props:
  - `query` (string)
  - `setQuery` (function)
  - `onAsk` (function)
  - `onClear` (function)
  - `disabled` (boolean)
  - `isLoading` (boolean)
- Purpose: Accepts a question and triggers the agent run.

### `ResultsPanel.jsx`
- Props:
  - `answer` (string)
  - `isLoading` (boolean)
- Purpose: Displays the agent's textual answer or a placeholder when empty.

### `StepsViewer.jsx`
- Props:
  - `steps` (array)
  - `isLoading` (boolean)
  - `collapsed` (boolean)
- Purpose: Renders intermediate agent steps in a readable format.

## Notes on sustainability
- Components are intentionally small and stateless where possible.
- Keep visual-only components here; move business logic to `App` or hooks.
- If a component grows, extract it to its own folder with a test file and local CSS module.

## Suggested next improvements
- Add unit tests (Jest + React Testing Library) for each component.
- Convert styles to CSS modules per component to avoid global collisions.
- Add Storybook for visual regression + interactive QA.
