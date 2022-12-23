export class EventDispatcher {
    static dispatch(eventName, componentName) {
        window.dispatchEvent(
            new CustomEvent(eventName, {
                detail: {
                    componentName,
                },
            })
        );
    }
}
