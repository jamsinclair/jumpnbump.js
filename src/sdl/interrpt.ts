const keyb = {};

export function key_pressed(key: string) {
	return 0;
}

export function addkey (key: string) {
    return keyb[key] = true;
}

export function intr_sysupdate(): number {
    return 1;
}
