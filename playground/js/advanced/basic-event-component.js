import { AppComponent } from '../../../dist/app-component';
import BasicEventComponent from './components/BasicEventComponent.vue';

const eventComponent = AppComponent.create({
    name: 'basic-event-component',
    component: BasicEventComponent,
    // debug: true,
});

const eventComponent2 = AppComponent.create({
    name: 'basic-event-component-2',
    elementName: 'basic-event-component-2',
    component: BasicEventComponent,
    // debug: true,
});
