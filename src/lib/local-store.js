export class LocalStore {
    constructor(storageKey) {
        return new Proxy(this, {
            set(object, key, value) {
                if (object[key] === value) return true;

                object[key] = value;
                localStorage.setItem(storageKey, JSON.stringify(object));

                return true;
            },
            get(object, key) {
                if (!object?.[key]) {
                    object = JSON.parse(localStorage.getItem(storageKey));
                }

                return object[key];
            },
        });
    }
}
