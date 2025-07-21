import { AppComponent } from '../../../dist/app-component';
import GlobalEventEmitterComponent from './components/GlobalEventEmitterComponent.vue';
import GlobalEventReceiverComponent from './components/GlobalEventReceiverComponent.vue';

const globalEmitter = AppComponent.create({
    name: 'global-event-emitter',
    component: GlobalEventEmitterComponent,
    // debug: true,
    globalHooks: true,
});

const globalReceiver = AppComponent.create({
    name: 'global-event-receiver',
    component: GlobalEventReceiverComponent,
    // debug: true,
    globalHooks: true,
});
