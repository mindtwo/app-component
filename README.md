# @mindtwo/app-component

`@mindtwo/app-component` is an NPM package that allows you to wrap Vue applications into custom web components. This makes it easy to integrate Vue-based apps as standalone, reusable components in any web project.

## Installation

To install the package, you can use npm or yarn:

```bash
npm install @mindtwo/app-component
```

or

```bash
yarn add @mindtwo/app-component
```

## Usage

This package provides two main exports: `AppComponent` and `AppComponentElement`. You can use these to create web components that encapsulate Vue apps.

### Example

Here's an example of how to create a custom web component using the `AppComponentElement` from the package.

```js
import MyRootComponent from './MyRootComponent.vue';
import { AppComponentElement } from '@mindtwo/app-component';

class MyAppElement extends AppComponentElement {
    constructor() {
        super('my-app', MyRootComponent);

        // register vue plugins and provides by using
    }
}

if (!customElements.get('my-app-element')) {
    customElements.define(
        'my-app-element',
        MyAppElement
    );
}
```

### Explanation:

- **`AppComponentElement`**: Extends the web component class with Vue App using `MyRootComponent` as root.
- **Custom Element Definition**: The `MyAppElement` web component is defined if it has not already been registered with the `customElements` API.

This approach encapsulates the Vue application and plugins inside a custom HTML element that can be used like any other native web component.

## API

### `AppComponentElement`
This class extends `AppComponent` and is used to define a custom element that wraps a Vue app. Via the linked `AppComponent` instance you can control the App.

On the custom element we can define attributes and properties. They are accessible inside the instance. `AppComponentElement` is the class you want to extend and register on the DOM.

### `AppComponent`
This is the base class used to control our Vue.js Apps via a global Browser instance.

### `mount(props?: { [key: string]: any })`

The `mount` method is responsible for manually mounting the Vue app wrapped by the `AppComponent`. It initializes the app, registers any plugins and components, and mounts the app to the specified DOM element, referred to as the "wrapper."

#### Parameters:

- **`props`** (optional): An object containing the initial properties (`props`) to pass to the root Vue component during the mount process. These `props` can be used to customize the behavior of the component when it's being rendered.

#### Usage Example:

```js
const appComponent = new AppComponent('my-component', MyVueComponent);

// Manually mount the app with some initial props
appComponent.mount({
    title: 'Welcome to My Vue App',
    isVisible: true,
});
```

In this example, the Vue component `MyVueComponent` is manually mounted to the DOM, passing in the initial props (`title` and `isVisible`). If a wrapper element with the correct `wrapperId` is found, the component will be rendered into that element, and any components, plugins, or provides registered with the `AppComponent` will be applied.

### `AppComponent` Static Methods

The `AppComponent` class provides static methods to help create and manage Vue-based web components. Below are the static methods available in `AppComponent`.

#### `AppComponent.create(name: string, component: Component): AppComponent`

This static method creates a new instance of `AppComponent` and registers it globally under the `window` object.

**Parameters:**

- `name` (string): The name of the web component you want to create. This name will be converted into `PascalCase` and used as the key under the `window` object.
- `component` (Component): The Vue component that you want to wrap inside the `AppComponent`.

**Returns:**

- An instance of `AppComponent`.

**Usage Example:**

```js
import MyRootComponent from './MyRootComponent.vue';
import { AppComponent } from '@mindtwo/app-component';

// Create a new AppComponent and register it globally
const appComponent = AppComponent.create('my-app-element', MyRootComponent);
```

**Details:**
- This method creates a new `AppComponent` instance with the provided `name` and `component`.
- It also registers the instance globally in the `window` object, making it accessible throughout the application using the `PascalCase` version of the `name`.

For example, if the `name` is `'my-app-element'`, the component can be accessed globally as `window.MyAppElement`.

Here’s a detailed explanation of the methods in `AppComponent` that register events, plugins, provides, and components, as well as how they interact with Vue.

---

### Event Registration

The `AppComponent` class allows for the registration of event listeners for specific lifecycle events and custom events.

#### `addEventListener(event: EventType, callback: Function): this`

This method registers an event listener for a specific event type. It uses an internal `EventHelper` to manage the event listeners.

**Parameters:**

- `event` (EventType): The type of event to listen for. The available event types are:
  - `'beforemount'`: Triggered before the Vue component is mounted.
  - `'initialized'`: Triggered when the component is initialized.
  - `'init'`: Alias for `initialized`.
  - `'mounted'`: Triggered when the component is mounted to the DOM.
  - `'navigate'`: Can be used to capture navigation-related events.
  - `'unmounting'`: Triggered before the component is unmounted.
  - `'unmounted'`: Triggered after the component has been unmounted.

- `callback` (Function): The function to execute when the event is triggered.

**Returns:**

- The `AppComponent` instance for chaining.

**Usage Example:**

```js
appComponent.addEventListener('mounted', () => {
    console.log('Component has been mounted!');
});
```

#### `on(event: EventType, callback: Function): this`

This is an alias for `addEventListener` and behaves in the same way.

```js
appComponent.on('unmounted', () => {
    console.log('Component has been unmounted!');
});
```

---

### Plugin Registration

The `AppComponent` allows you to register Vue plugins, enabling you to extend the functionality of the Vue app with external plugins.

#### `registerPlugin(plugin: Plugin, options: any[]): this`

This method registers a Vue plugin within the `AppComponent` instance.

**Parameters:**

- `plugin` (Plugin): The Vue plugin to register.
- `options` (any[]): An array of options to pass to the plugin during registration.

**Returns:**

- The `AppComponent` instance for chaining.

**Usage Example:**

```js
import { createPinia } from 'pinia';

appComponent.registerPlugin(createPinia(), []);
```

#### `plugin(plugin: Plugin, options: any[]): this`

This method is an alias for `registerPlugin`, making it easier to chain plugin registrations.

```js
import { i18n } from './i18n';

appComponent.plugin(i18n, []);
```

#### `registerPlugins(plugins: { plugin: Plugin, options: any[] }[]): this`

This method registers multiple Vue plugins at once.

**Parameters:**

- `plugins` (Array): An array of objects, each containing a `plugin` and associated `options`.

**Usage Example:**

```js
appComponent.registerPlugins([
    { plugin: createPinia(), options: [] },
    { plugin: i18n, options: [] }
]);
```

---

### Provide Registration

Vue's `provide/inject` feature allows you to pass data down through the component tree without explicitly passing props. `AppComponent` supports this pattern by allowing you to register global provides.

#### `registerProvide(key: string, value: any): this`

This method registers a global value that can be injected into child components.

**Parameters:**

- `key` (string): The key that identifies the provided value.
- `value` (any): The value to provide.

**Returns:**

- The `AppComponent` instance for chaining.

**Usage Example:**

```js
appComponent.registerProvide('myGlobalKey', myGlobalValue);
```

#### `provide(key: string, value: any): this`

This is an alias for `registerProvide`.

```js
appComponent.provide('myGlobalKey', myGlobalValue);
```

---

### Component Registration

`AppComponent` allows you to register additional Vue components globally within the app.

#### `registerComponent(name: string, component: Component): this`

This method registers a single Vue component globally.

**Parameters:**

- `name` (string): The name of the component.
- `component` (Component): The Vue component to register.

**Returns:**

- The `AppComponent` instance for chaining.

**Usage Example:**

```js
import MyCustomComponent from './MyCustomComponent.vue';

appComponent.registerComponent('MyCustomComponent', MyCustomComponent);
```

#### `registerComponents(components: Map<string, Component>): this`

This method registers multiple Vue components at once using a map where the keys are the component names and the values are the component definitions.

**Parameters:**

- `components` (Map): A `Map` of component names and component instances.

**Usage Example:**

```js
const components = new Map();
components.set('MyCustomComponent', MyCustomComponent);
components.set('AnotherComponent', AnotherComponent);

appComponent.registerComponents(components);
```
