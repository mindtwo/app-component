<template>
    <div class="unplugin-example">
        <h3>Unplugin Example Component</h3>
        <p>This component was created using the defineAppComponent unplugin!</p>
        <div class="counter-display">
            <span>Counter: {{ count }}</span>
            <button @click="increment">Increment</button>
            <button @click="decrement">Decrement</button>
        </div>
        <div class="status">
            <small>Component ID: {{ componentId }}</small>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const count = ref(0);
const componentId = ref('');

const increment = () => {
    count.value++;
};

const decrement = () => {
    count.value--;
};

onMounted(() => {
    componentId.value = Math.random().toString(36).substr(2, 9);
});
</script>

<style scoped>
.unplugin-example {
    padding: 1rem;
    border: 2px solid #42b883;
    border-radius: 8px;
    background-color: #f0f9f0;
    margin: 1rem 0;
}

.counter-display {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.counter-display button {
    padding: 0.5rem 1rem;
    border: 1px solid #42b883;
    background: #42b883;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

.counter-display button:hover {
    background: #369970;
}

.status {
    margin-top: 1rem;
    color: #666;
}
</style>
