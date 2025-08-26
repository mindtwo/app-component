# App Component Playground

This playground provides interactive examples and demonstrations of the `@mindtwo/app-component` library. Use these examples to understand how to integrate Vue components into any web application as custom elements.

## Getting Started

1. **Build the library first:**
   ```bash
   npm run build
   ```

2. **Start the development server:**
   ```bash
   npm run playground
   ```

3. **Or serve manually:**
   ```bash
   npm run dev
   ```

The playground will be available at `http://localhost:3333`

## Examples

### Basic Examples (`examples/basic.html`)
- Simple counter component
- Greeting component with props
- Manual mount/unmount controls  
- Dynamic property updates

### Vue Components (`examples/vue-components.html`)
- Todo List component
- User Card component
- Multiple component instances
- Real-time property updates

### Advanced Examples (`examples/advanced.html`)
- Event handling and lifecycle monitoring
- Component-to-component communication
- Shared data store integration
- Dynamic component loading

## Project Structure

The playground now follows a modular structure with proper separation of concerns:

```
playground/
├── index.html                  # Main playground homepage
├── examples/
│   ├── basic.html             # Basic component examples
│   ├── vue-components.html    # Vue component examples
│   └── advanced.html          # Advanced usage examples
├── js/
│   ├── components/            # Reusable component definitions
│   │   ├── counter.js         # Counter component
│   │   ├── greeting.js        # Greeting component
│   │   ├── manual.js          # Manual mount component
│   │   ├── dynamic.js         # Dynamic component
│   │   ├── todo-list.js       # Todo list component
│   │   └── user-card.js       # User card component
│   ├── advanced/              # Advanced example components
│   │   ├── event-components.js # Event handling components
│   │   └── counter-components.js # Counter with store components
│   └── utils/                 # Utility classes
│       ├── event-bus.js       # Event bus implementation
│       └── data-store.js      # Simple data store
├── css/
│   ├── layout.css             # Common layout styles
│   ├── components.css         # Component-specific styles
│   └── advanced.css           # Advanced component styles
├── components/                # Original Vue SFC components
│   ├── TodoList.vue           # Todo list Vue component
│   └── UserCard.vue           # User card Vue component
├── assets/                    # Static assets (if needed)
└── README.md                  # This file
```

## Component Architecture

### Custom Elements
All components are registered as custom elements that can be used in HTML:

```html
<counter-component auto-mount></counter-component>
<todo-list-component auto-mount title="My Tasks"></todo-list-component>
<user-card-component auto-mount name="John Doe" email="john@example.com"></user-card-component>
```

### Modular JavaScript
Components are defined in separate JavaScript modules for better organization:

```javascript
// js/components/counter.js
export const CounterComponent = {
    template: `<div>{{ count }}</div>`,
    data() { return { count: 0 }; }
};
```

### Shared Utilities
Common functionality is extracted into utility modules:

```javascript
// js/utils/event-bus.js
export class EventBus {
    constructor() { this.events = {}; }
    on(event, callback) { /* ... */ }
    emit(event, data) { /* ... */ }
}
```

## Usage Patterns

### 1. Auto-mounting Components
```html
<my-component auto-mount prop-name="value"></my-component>
```

### 2. Manual Component Control
```javascript
const component = AppComponent.create('my-component', MyComponent);
component.setProps({ someProp: 'value' });
component.mount();
```

### 3. Custom Element Registration
```javascript
import { AppComponentElement } from '@mindtwo/app-component';
import { MyComponent } from './js/components/my-component.js';

customElements.define('my-component', new AppComponentElement('my-component', MyComponent));
```

### 4. Component Communication
```javascript
// Using event bus
window.eventBus.emit('message', { text: 'Hello' });
window.eventBus.on('message', (data) => console.log(data));

// Using shared store
window.dataStore.setState({ count: 5 });
window.dataStore.subscribe((state) => console.log(state));
```

## Development

To add new examples:

1. Create component definitions in `js/components/`
2. Add any shared utilities to `js/utils/`
3. Create or update styles in `css/`
4. Create a new HTML file in `examples/` that imports the modules
5. Register components as custom elements
6. Add the example to the main `index.html` navigation

### Adding a New Component

1. **Create the component module:**
   ```javascript
   // js/components/my-component.js
   export const MyComponent = {
       template: `<div>{{ message }}</div>`,
       props: { message: String },
       data() { return {}; }
   };
   ```

2. **Add styles if needed:**
   ```css
   /* css/components.css */
   .my-component {
       padding: 20px;
       border: 1px solid #ddd;
   }
   ```

3. **Use in HTML:**
   ```html
   <script type="module">
       import { AppComponentElement } from '../dist/app-component.js';
       import { MyComponent } from '../js/components/my-component.js';
       
       customElements.define('my-component', new AppComponentElement('my-component', MyComponent));
   </script>
   
   <my-component auto-mount message="Hello World"></my-component>
   ```

## Building for Production

The playground examples reference the built library from `/dist/`. Make sure to run `npm run build` before testing examples to ensure you're using the latest version of the library.

## Key Features Demonstrated

- **Easy Integration**: Mount Vue components into any existing application
- **Dynamic Props**: Pass data via HTML attributes or JavaScript properties
- **Lifecycle Management**: Automatic mounting/unmounting with full lifecycle events
- **Custom Elements**: Use Vue components as standard HTML custom elements
- **Framework Agnostic**: Integrate into any web application or framework
- **Component Communication**: Event bus and shared store patterns
- **Dynamic Loading**: Load and register components at runtime

## Tips

- Always build the library (`npm run build`) before testing examples
- Use browser developer tools to inspect component lifecycle events
- Check the console for any errors or warnings
- Modify examples to experiment with different configurations
- The examples use ES modules, so they need to be served from a web server
- Import paths use `.js` extension to work with the built library