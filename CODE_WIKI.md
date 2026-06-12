# Project Code Wiki

This document summarizes the technical structure of the Vue 3 + FormKit form builder project, including the main architecture, module responsibilities, important state flows, dependencies, and local development commands.

## 1. Project Architecture

This project is a visual form-building tool with a three-column layout: component library, canvas, and property panel.

- **Core stack**: Vue 3 Composition API, Vite, and TypeScript.
- **Form engine**: FormKit is used for schema rendering and form data collection. Drag-and-drop behavior is built with `@formkit/drag-and-drop`.
- **UI system**: The builder UI is based primarily on Naive UI, with utility-first styling from UnoCSS.
- **State management**: The project does not use Pinia or another external state store. Shared state is stored in Vue refs and composables, such as `default-form-elements.ts`.

## 2. Main Modules

Most source code lives under `src/`.

### 2.1 `src/builder`

The builder module is the main UI entry point.

- `BuilderMain.vue`: Main layout container. It assembles the left component library, center canvas, and right property panel.
- `BuilderDropArea.vue`: The center drag-and-drop canvas where form elements are placed.
- `BuilderHeader.vue`: Top action bar with clear, preview, AI prompt, undo/redo, and theme controls.
- `BuilderPreview.vue`: Modal preview component that renders the current schema with FormKit.
- `BuilderProvider.vue`: Configuration provider used to pass global builder options such as the AI API key.

### 2.2 `src/components/sidebar-left`

The left sidebar lists available form components, supports search/filtering, and provides the drag source for the canvas.

### 2.3 `src/components/sidebar-right`

The right sidebar edits the selected form item.

- `edits/`: Editors for basic field properties such as label, placeholder, help text, default value, and options.
- `validations/`: Editors for FormKit validation rules such as `required`, `email`, `url`, `min`, `max`, and date rules.

### 2.4 `src/components/ui`

Reusable UI components used by the builder itself. This includes field wrappers, Naive UI adapters, validation cards, container previews, and theme controls.

### 2.5 `src/composables`

Shared Vue composables.

- `form-fields.ts`: Connects the right property panel to the global form schema and exposes computed field properties.
- `use-config.ts`: Provides and injects global builder configuration.
- `schema-history.ts`: Stores schema history for undo and redo.

## 3. Key State and Functions

- `formSchema` in `src/utils/default-form-elements.ts`: The main `ref<FormKitSchemaFormKit[]>` that stores the current form schema.
- `selectedIndex`, `selectedKey`, and `selectedTarget`: Track the currently selected canvas item or form settings panel.
- `defaultFormElements`: Defines the default schema templates available from the left sidebar.
- `useFormField()`: Used heavily by the right property panel to read and update the selected schema node.
- `updateValidationString()`: Parses and updates FormKit validation strings.
- `createFormattedSchema(fields)`: Cleans and normalizes schema nodes before preview or final rendering.

## 4. Dependencies

Main runtime dependencies are declared in `package.json`.

- **Vue and FormKit**: `vue`, `@formkit/vue`, `@formkit/core`, `@formkit/i18n`, and `@formkit/drag-and-drop`.
- **UI**: `naive-ui`.
- **Styling**: `unocss`, `unocss-tw-animate-css`, `clsx`, and `class-variance-authority`.
- **Utilities**: `@vueuse/core`, `vue-sonner`, and `openai`.
- **Tooling**: Vite, TypeScript, `vue-tsc`, `oxlint`, `oxfmt`, and ESLint.

## 5. Local Development

Use Node.js `^20.19.0` or `>=22.12.0`.

Install dependencies:

```bash
pnpm install
```

Start the development playground:

```bash
pnpm dev
```

This starts Vite, usually at `http://localhost:5173`.

Build the library:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

Run linting and formatting:

```bash
pnpm lint
pnpm format
```
