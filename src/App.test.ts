// src/App.test.ts
import { render } from '@testing-library/svelte';
import App from './App.svelte';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('renders correctly', () => {
    // Minimal integration test rendering check
    const { container } = render(App);
    expect(container).toBeTruthy();
  });
});
