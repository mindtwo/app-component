import { AppComponent } from '../../../dist/app-component';
import CssVarDisplay from './components/CssVarDisplay.vue';

AppComponent.create({
    name: 'shadow-root-component',
    component: CssVarDisplay,
    shadowRoot: true,
    hooks: {
        connected: (el) => {
            const styleEl = document.createElement('style');
            styleEl.textContent = `
:host {
    --primary-color: #34d399;
}

.primary {
    color: var(--primary-color);
}
`;
            el.root().appendChild(styleEl);
        },
    },
});
