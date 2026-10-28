import { writable } from "svelte/store";

export const isRainingStore = writable<boolean>(false);
export const isLightningFlashingStore = writable<boolean>(false);
