<script setup>
import { inject, ref } from 'vue';

const events = ref([]);

const hooks = inject('hooks');

hooks.on('externalEvent', (event) => {
    events.value.push(`External Event: ${event}`);
});
</script>

<template>
    <div>
        <h2>Isolated Event Component</h2>
        <p>
            This component listens for events and displays them. It can also
            emit an event to the outside.
        </p>

        <button
            @click="
                hooks.emit('customEvent', 'Hello from IsolatedEventComponent')
            "
        >
            Emit Custom Event
        </button>

        <ul>
            <li v-for="(event, index) in events" :key="index">{{ event }}</li>
        </ul>
    </div>
</template>
