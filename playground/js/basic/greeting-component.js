import { AppComponent } from '../../../dist/app-component';
import Greeting from './components/Greeting.vue';

AppComponent.create({
    name: 'greeting-component',
    component: Greeting,
});
