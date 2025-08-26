import { AppComponent } from '@mindtwo/app-component';
import BasicEventComponent from './components/BasicEventComponent.vue';

AppComponent.create({
    name: 'basic-event-component',
    component: BasicEventComponent,
});

AppComponent.create({
    name: 'basic-event-component-2',
    elementName: 'basic-event-component-2',
    component: BasicEventComponent,
});
