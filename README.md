# @mindtwo/app-component
Helper for mounting Vue components into the DOM within a Vue app. This utility simplifies mounting Vue components dynamically onto specific DOM elements and facilitates the seamless integration of Vue components into non-SPA (Single Page Application) environments.
## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [Attributes](#attributes)
- [License](#license)
## Introduction
The `@mindtwo/app-component` package is a utility that allows you to easily mount Vue components onto specific HTML elements dynamically. This is particularly useful when integrating Vue into existing applications where Vue isn't controlling the entire page. The package handles the lifecycle of Vue components, including mounting, unmounting, and managing their state.
### Problems Solved:
- Simplifies the process of embedding Vue components into non-SPA applications.
- Allows dynamic mounting and unmounting of Vue components on demand.
- Manages Vue component state and event handling across different parts of an application.
## Installation
To install the package from the GitHub npm registry, you can use the following command:
```bash
npm install @mindtwo/app-component --registry=https://npm.pkg.github.com/mindtwo
```
Make sure you have configured your `.npmrc` to use the GitHub npm registry:
```bash
# .npmrc
@mindtwo:registry=https://npm.pkg.github.com/
```
## Usage
First, ensure you import the necessary functions and classes from the `@mindtwo/app-component` package in your JavaScript or TypeScript files.
```ts
import { AppComponentElement, AppComponent } from '@mindtwo/app-component';
import MyComponent from './components/MyComponent.vue';
// Create a new custom element and mount it to the DOM
customElements.define('my-app-component', new AppComponentElement('my-app-component', MyComponent));
```
In your HTML file, you can then use the custom element as follows:
```html
<my-app-component auto-mount></my-app-component>
```
This will automatically mount the `MyComponent` Vue component into the DOM.
### Dynamic Mounting Example
You can programmatically control when components are mounted and unmounted:
```ts
const appComponent = AppComponent.create('my-app-component', MyComponent);
// Pass props dynamically and mount the component
appComponent.setProps({ someProp: 'value' });
appComponent.mount();
// Later, you can unmount the component
appComponent.unmount();
```
## Examples
### Basic Example
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App Component Example</title>
  </head>
  <body>
    <my-app-component></my-app-component>
    <script type="module">
      import { AppComponentElement } from '@mindtwo/app-component';
      import MyComponent from './MyComponent.vue';
      customElements.define('my-app-component', new AppComponentElement('my-app-component', MyComponent));
    </script>
  </body>
</html>
```
### Component with Props
```html
<my-app-component some-prop="Hello, World!"></my-app-component>
```
Here, `some-prop` will be passed as a prop to the `MyComponent` Vue component.
## API
### `AppComponent`
The `AppComponent` class is responsible for managing the Vue application instance.
- `AppComponent.create(name: string, component: Component): AppComponent`: Creates a new `AppComponent` instance and registers it on the global `window` object.
- `mount(props: { [key: string]: any }): void`: Mounts the Vue component to the DOM with optional props.
- `unmount(): void`: Unmounts the Vue component and clears the DOM wrapper.
- `registerComponent(name: string, component: Component): this`: Registers additional components to the app.
- `registerPlugin(plugin: Plugin, options: any[]): this`: Registers Vue plugins with options.
- `setProps(props: { [key: string]: any }): void`: Sets the props for the component before mounting.
- `addEventListener(event: EventType, callback: Function): this`: Adds an event listener for component lifecycle events.
### `AppComponentElement`
The `AppComponentElement` class is a custom element that extends `HTMLElement`. It wraps the Vue component's mounting and unmounting logic and is automatically mounted when added to the DOM.
- `constructor(name: string, component: Component)`: Initializes the custom element with the given Vue component.
- `connectedCallback()`: Lifecycle method, called when the element is added to the DOM.
- `disconnectedCallback()`: Lifecycle method, called when the element is removed from the DOM.
- `getAttributes()`: Returns the props and attributes for the Vue component.
- `isAutoMount`: Checks whether the component should automatically mount upon connection.
## Attributes
The custom element supports passing attributes as props to the Vue component. Here's a list of supported attributes:
- `auto-mount`: Automatically mounts the component when added to the DOM.
- All standard HTML attributes (like `id`, `class`, etc.) are passed as props to the Vue component.
## License
This project is licensed under the MIT License.
