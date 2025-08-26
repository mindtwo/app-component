<script setup>
import { ref } from 'vue';

const count = ref(0);

const increment = () => {
    count.value++;
};

const decrement = () => {
    count.value--;
};
</script>

<template>
    <div class="counter-component">
        <h3>Counter Component</h3>
        <p>Current Count: {{ count }}</p>
        <button @click="increment">Increment</button>
        <button @click="decrement">Decrement</button>
        <p>This component manages its own state and does not receive props.</p>
    </div>
</template>
