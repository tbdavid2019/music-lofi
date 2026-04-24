import { writable } from 'svelte/store';

// Store for background image URL
export const bgUrl = writable<string>('');
