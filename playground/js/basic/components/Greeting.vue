<script setup>
defineProps({
    greeted: {
        type: String,
        default: 'Anonymous',
    },
    title: {
        type: String,
        default: 'Hello',
    },
    color: {
        type: String,
        default: 'black',
    },
});
</script>

<template>
    <div class="greeting-component">
        <h3 :style="{ color: color }">{{ title }}, {{ greeted }}!</h3>
        <p>This component received props from HTML attributes.</p>
    </div>
</template>
