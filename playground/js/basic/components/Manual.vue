<script setup>
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
    // This component is manually mounted, so we can perform any setup here
    console.log('Manual component mounted');
});

onUnmounted(() => {
    // Cleanup if necessary when the component is unmounted
    console.log('Manual component unmounted');
});
</script>

<template>
    <div class="manual-component">
        <h3>Manual Component</h3>

        <p>This component is manually mounted and unmounted.</p>
    </div>
</template>
