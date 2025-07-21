import { AppComponent } from '../../../dist/app-component';
import Greeting from './components/Greeting.vue';

const greetingComponent = AppComponent.create({
    name: 'greeting-component',
    component: Greeting,
    // debug: true,
});
