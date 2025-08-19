import UnpluginExampleComponent from './components/UnpluginExampleComponent.vue';

// Using the defineAppComponent unplugin - this will be transformed by the Vite plugin
defineAppComponent({
    name: 'unplugin-example-component',
    component: UnpluginExampleComponent,
    options: {
        shadow: false,
        autoMount: true,
        hooks: {
            mounting: () => {
                console.log('Unplugin example component is about to mount');
            },
            mounted: () => {
                console.log('Unplugin example component mounted successfully');
            },
        },
    },
});
