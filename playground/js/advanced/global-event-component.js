import { AppComponent } from '../../../dist/app-component';
import GlobalEventEmitterComponent from './components/GlobalEventEmitterComponent.vue';
import GlobalEventReceiverComponent from './components/GlobalEventReceiverComponent.vue';

AppComponent.create({
    name: 'global-event-emitter',
    component: GlobalEventEmitterComponent,
    globalHooks: true,
});

AppComponent.create({
    name: 'global-event-receiver',
    component: GlobalEventReceiverComponent,
    globalHooks: true,
});
