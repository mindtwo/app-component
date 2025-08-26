<script setup>
import { inject } from 'vue';

const hooks = inject('hooks');
</script>

<template>
    <div>
        <button @click="() => hooks.emit('externalEvent', 'Button Clicked')">
            Emit External Event
        </button>
    </div>
</template>
