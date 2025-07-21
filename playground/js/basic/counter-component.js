import { AppComponent } from '../../../dist/app-component';
import Counter from './components/Counter.vue';

const count = AppComponent.create({
    name: 'counter-component',
    component: Counter,
});
