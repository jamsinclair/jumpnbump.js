export function memset (array, value, size) {
    for (let i = 0; i < size; i++) {
        array[i] = value;
    }
}

export function rnd(max_value) {
    return Math.floor(Math.random() * max_value);
}

export function assert(assertion) {
    if (!assertion) {
        throw new Error("Assertion failed");
    }
}