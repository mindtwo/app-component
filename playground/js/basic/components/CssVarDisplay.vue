<script setup>
import { onMounted, ref } from 'vue';

const el = ref(null);

const cssVarValue = ref('');

const props = defineProps({
    cssVarName: {
        type: String,
        default: 'primary-color',
    },
});

function getEffectiveRoot(el) {
    if (!el) return document.documentElement;

    // If it's a shadow host and has an attached shadow root
    if (el.shadowRoot) return el.shadowRoot;

    // If it's inside a shadow DOM, find its root node
    const root = el.getRootNode?.();
    if (root instanceof ShadowRoot) return root;

    return root;
}

onMounted(() => {
    if (el.value) {
        const cssVar = getComputedStyle(el.value).getPropertyValue(`--${props.cssVarName}`);

        cssVarValue.value = cssVar ? cssVar.trim() : '';
    }
});
</script>

<template>
    <div ref="el">
        <div v-if="cssVarValue" class="css-var-display-component">
            <h3>CSS Variable Display</h3>
            <p>
                <strong>{{ cssVarName }}:</strong>
                <span class="primary">{{ cssVarValue }}</span>
            </p>
            <div
                class="color-box"
                :style="{
                    backgroundColor: `var(--${cssVarName})`,
                    width: '100px',
                    height: '100px',
                }"
            ></div>
        </div>
    </div>
</template>
