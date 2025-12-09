import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom stubs
// @ts-ignore
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
