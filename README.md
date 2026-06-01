# @mindtwo/app-component

Helper for mounting Vue 3 components into the DOM as custom HTML elements. This utility simplifies embedding Vue components dynamically onto specific DOM elements and facilitates the seamless integration of Vue components into non-SPA environments (e.g. legacy CMS, server-rendered pages, multi-page apps).

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Hooks](#hooks)
- [Attributes](#attributes)
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

### External stylesheet

Provide a stylesheet URL that will be linked into the component root:

```ts
AppComponent.create({
    name: 'my-app-component',
    component: MyComponent,
    style: '/assets/my-component.css',
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
| `style`        | `string`                              | `undefined`              | Stylesheet URL to inject into the component root.                            |
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

## Attributes

The generated custom element forwards HTML attributes as props. The following attribute names are reserved and not forwarded:

- `auto-mount` — reserved, but currently auto-mount is the default behavior.
- Any `data-v-*` Vue scope-id attributes.

All other attributes are converted to kebab-case keys on the Vue `props` object.

## API

### `AppComponent.create(name, component)` / `AppComponent.create(options)`

Registers a custom element and creates the bridge. Returns `Promise<void>`. Auto-mounts on connect.

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

## Packages

This monorepo provides two packages:

- [`@mindtwo/app-component`](./packages/app-component) — the runtime helper described above.
- [`@mindtwo/unplugin-app-component`](./packages/unplugin-app-component) — a bundler plugin (Vite / Rollup / Rolldown) to register app components from source and optionally generate a manifest loader.

## License

This project is licensed under the MIT License.
