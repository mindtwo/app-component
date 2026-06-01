# @mindtwo/app-component

Helper for mounting Vue 3 components into the DOM as custom HTML elements. This utility simplifies embedding Vue components dynamically onto specific DOM elements and facilitates the seamless integration of Vue components into non-SPA environments (e.g. legacy CMS, server-rendered pages, multi-page apps).

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Hooks](#hooks)
- [Attributes](#attributes)
- [Composables](#composables)
- [Manifest loader](#manifest-loader)
- [API](#api)
- [Packages](#packages)
- [License](#license)

## Introduction

The `@mindtwo/app-component` package is a utility that allows you to easily mount Vue components onto specific HTML elements through native custom elements. This is particularly useful when integrating Vue into existing applications where Vue isn't controlling the entire page. The package handles the lifecycle of Vue components, including mounting, unmounting, hooks and prop forwarding from HTML attributes.

### Problems Solved

- Embedding Vue components into non-SPA applications.
- Dynamic mounting and unmounting of Vue components on demand.
- Passing props through HTML attributes.
- Lifecycle hooks for integration with surrounding code.
- Optional Shadow DOM isolation per component instance.

## Installation

Install the package from the GitHub npm registry:

```bash
npm install @mindtwo/app-component --registry=https://npm.pkg.github.com/mindtwo
```

Configure your `.npmrc` to use the GitHub npm registry for the `@mindtwo` scope:

```bash
# .npmrc
@mindtwo:registry=https://npm.pkg.github.com/
```

### Peer dependencies

- `vue` `^3.5.17`

## Usage

Register the component once on application startup. `AppComponent.create()` defines a custom HTML element that mounts the Vue component for every matching tag found on the page.

```ts
import { AppComponent } from '@mindtwo/app-component';
import MyComponent from './components/MyComponent.vue';

AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
});
```

In your HTML:

```html
<my-app-component greeting="Hello"></my-app-component>
```

The component is auto-mounted whenever it is connected to the DOM.

### Short syntax

If you don't need any options you can use the shorthand:

```ts
AppComponent.create('my-app-component', MyComponent);
```

### Passing props

All HTML attributes (except a few reserved names — see [Attributes](#attributes)) are forwarded as props to the Vue component. Attribute names are converted to kebab-case:

```html
<my-app-component some-prop="Hello, World!" user-id="42"></my-app-component>
```

```vue
<script setup>
defineProps<{
    someProp: string;
    userId: string;
}>();
</script>
```

### Shadow DOM

Enable Shadow DOM isolation per component:

```ts
AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
    shadowRoot: true,
});
```

### Stylesheets

Provide a stylesheet URL, inline CSS, or any combination of the two. Each entry is rendered into the component root as either a `<link>` or a `<style>` element:

```ts
AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
    // A bare string is treated as a URL.
    style: '/assets/my-component.css',
});

AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
    style: [
        { url: '/assets/base.css' },
        { css: ':host { --primary: #34d399; }' },
    ],
});
```

## Options

`AppComponent.create()` accepts the following options:

| Option         | Type                                  | Default                  | Description                                                                  |
| -------------- | ------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `name`         | `string`                              | _required_               | Component name. Used for PascalCase global registration.                     |
| `component`    | `Component`                           | _required_               | The Vue component to mount.                                                  |
| `elementName`  | `string`                              | kebab-case of `name`     | Custom element tag name.                                                     |
| `hookableName` | `string \| boolean`                   | `undefined`              | Prefix for emitted hook names. If `true`, uses kebab-case of `name`.         |
| `shadowRoot`   | `boolean`                             | `false`                  | If true, the component is mounted inside a Shadow DOM.                       |
| `debug`        | `boolean`                             | `false`                  | Enables verbose logging.                                                     |
| `globalHooks`  | `boolean`                             | `false`                  | If true, the component uses a shared hooks instance across all components.   |
| `style`        | `StyleSpec \| StyleSpec[]`            | `undefined`              | Stylesheet(s) to inject. See [Stylesheets](#stylesheets).                    |
| `hooks`        | `{ [name]: fn \| { callback, once }}` | `undefined`              | Hook callbacks to register at creation time.                                 |

## Hooks

Hooks let you react to the component lifecycle. Register them via the `hooks` option, or via `bridge.on()` from the global bridge object.

Available hook names:

- `init` — fired before the AppComponent is constructed.
- `ready` — fired after the bridge is created.
- `initialized` — fired after the HTML element initializes its DOM.
- `connected` — fired when the element is added to the DOM.
- `disconnected` — fired when the element is removed from the DOM.
- `creating` / `created` — around Vue app creation.
- `mounting` / `mounted` — around Vue app mount.
- `unmounting` / `unmounted` — around Vue app unmount.
- `loaded` — reserved for asynchronous manifest loading (see [Manifest loader](#manifest-loader)).
- `navigate` — reserved for consumer-fired SPA navigation events.

Example:

```ts
AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
    hooks: {
        connected: (el) => {
            console.log('element connected', el);
        },
        mounted: { once: true, callback: (bridge, app) => console.log('mounted', app) },
    },
});
```

You can also use custom hook names. Custom hooks are stored as "external hooks" and cleaned up automatically on `unmount()`.

#### Adding type-safe custom hook names

Extend the `ComponentHookMap` interface via module augmentation to get autocomplete and type-checking for your own hooks:

```ts
declare module '@mindtwo/app-component' {
    interface ComponentHookMap {
        'analytics:track': (event: string) => void;
        'auth:logout': void;
    }
}

bridge.on('analytics:track', (event) => {
    // event is typed as string
});
```

## Attributes

The generated custom element forwards HTML attributes as props. The following attribute names are reserved and not forwarded:

- `auto-mount` — reserved, but currently auto-mount is the default behavior.
- Any `data-v-*` Vue scope-id attributes.
- `data-type-*` — used as type hints for the matching prop (see below).

All other attributes are converted to kebab-case keys on the Vue `props` object.

### Typed attributes (opt-in)

By default every attribute value is forwarded as a string. Add a `data-type-{prop}` hint to coerce the value into a richer type:

```html
<my-app-component
    count="5"          data-type-count="number"
    active=""          data-type-active="boolean"
    config='{"x":1}'   data-type-config="json"
></my-app-component>
```

Supported types: `string` (default), `number`, `boolean`, `json`. Parse failures fall back to the raw string and emit a warning.

## API

### `AppComponent.create(name, component)` / `AppComponent.create(options)`

Registers a custom element and creates the bridge. Returns `Promise<AppComponentBridge>` so you can keep an imperative handle without going through `window`. Auto-mounts on connect.

```ts
const bridge = await AppComponent.create('my-app-component', MyComponent);
bridge.on('mounted', () => console.log('ready'));
```

### Global bridge

For each component, a bridge instance is registered on `window` under the PascalCase name. You can use it to control the component after creation:

```ts
// e.g. for name "my-app-component", PascalCase: "MyAppComponent"
const bridge = window.MyAppComponent;

await bridge.mount({ extraProp: 'value' });
await bridge.unmount();
bridge.recreate();
bridge.on('mounted', () => console.log('mounted'));
bridge.off('mounted', handler);
bridge.emit('custom-event', payload);
```

#### Bridge methods

- `create(): Promise<void>` — create the underlying Vue app.
- `mount(props?): Promise<void>` — mount and optionally merge additional props.
- `unmount(): Promise<void>` — unmount and clean up external hooks.
- `recreate(): void` — rebuild DOM and recreate the Vue app.
- `created(): boolean` — whether the Vue app has been created.
- `getName(): string` — get the PascalCase name.
- `on(name, callback, once?)` / `off(name, callback)` — manage hook callbacks.
- `emit(name, ...args)` / `trigger(name, ...args)` — emit hooks.

## Composables

Inside Vue components mounted via `AppComponent.create()`, the `@mindtwo/app-component-composables` package gives you typed access to the bridge, hooks, and root element:

```ts
import { useHooks, useAppComponent, useAppComponentRoot } from '@mindtwo/app-component-composables';

const hooks = useHooks();                     // ComponentHooks
const { name, bridge, element } = useAppComponent();
const getRoot = useAppComponentRoot();        // () => ShadowRoot | HTMLElement | undefined

hooks.on('mounted', () => {
    getRoot()?.appendChild(myEl);
});
```

All three composables throw a clear error when called outside an app-component context, so misuse fails loudly rather than silently returning `undefined`.

## Manifest loader

`@mindtwo/unplugin-app-component` can emit a manifest-loader script that fetches a Vite-style manifest and injects the entry scripts/styles into the page at runtime. Enable it via the `manifestLoader` option on the bundler plugin.

For environments that need to defer or gate script loading (consent banners, Nuxt apps, CSP-strict pages), provide a `scriptLoader` module specifier. The runtime dynamically imports that module and delegates script injection to its default export.

```ts
// vite.config.ts
import AppComponentPlugin from '@mindtwo/unplugin-app-component/vite';

export default {
    plugins: [
        AppComponentPlugin({
            manifestLoader: true,
            scriptLoader: '@mindtwo/app-component-nuxt-scripts',
        }),
    ],
};
```

The shipped `@mindtwo/app-component-nuxt-scripts` adapter wraps `useScript()` from `nuxt-scripts`. Provide your own module to integrate with a different loader — it must default-export a function matching:

```ts
export type ScriptLoader = (script: { src: string; id?: string }) => Promise<void>;
```

## Packages

This monorepo provides four packages:

- [`@mindtwo/app-component`](./packages/app-component) — the runtime helper described above.
- [`@mindtwo/app-component-composables`](./packages/app-component-composables) — Vue composables for inside-component access to hooks, bridge, and root.
- [`@mindtwo/unplugin-app-component`](./packages/unplugin-app-component) — a bundler plugin (Vite / Rollup / Rolldown) to register app components from source and optionally generate a manifest loader.
- [`@mindtwo/app-component-nuxt-scripts`](./packages/app-component-nuxt-scripts) — `nuxt-scripts` adapter for the manifest loader's `scriptLoader` option.

## License

This project is licensed under the MIT License.
