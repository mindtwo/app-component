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
        <h2>Global Event Component</h2>
        <p>
            This component listens for events dispatched from global event
            emitter and displays them.
        </p>

        <ul>
            <li v-for="(event, index) in events" :key="index">{{ event }}</li>
        </ul>
    </div>
</template>
