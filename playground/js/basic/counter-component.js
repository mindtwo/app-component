import { AppComponent } from '../../../dist/app-component';
import Counter from './components/Counter.vue';

AppComponent.create({
    name: 'counter-component',
    component: Counter,
});
