/**
 * Stand-ins for the app's own modules, for one test.
 *
 * The page's scripts are ES modules: each holds the others by import,
 * not as globals, so a test cannot swap a whole module for a fake.
 * It replaces what it needs on the real one instead - a method, or a
 * field such as panel.sim - and this puts everything back after the
 * test, so no test sees another's stand-ins.
 */

/**
 * Replaces properties of an object until the test ends.
 * @param {!Object} t The test context, from node:test.
 * @param {!Object} target The object, such as the panel or CPU8080.
 * @param {!Object} props The properties to set on it, by name.
 * @return {!Object} The target.
 */
export function stub(t, target, props) {
    const saved = [];
    for (const key of Object.keys(props)) {
        saved.push([key, Object.getOwnPropertyDescriptor(target, key)]);
        Object.defineProperty(target, key, {value: props[key], writable: true,
                                            configurable: true, enumerable: true});
    }
    t.after(() => {
        for (const [key, descriptor] of saved.reverse()) {
            if (descriptor) {
                Object.defineProperty(target, key, descriptor);
            } else {
                delete target[key];
            }
        }
    });
    return target;
}
