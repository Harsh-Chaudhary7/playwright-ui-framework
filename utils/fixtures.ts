import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixtures with standard test hooks
 * Provides expect and automatic cleanup after each test
 */
export const test = base;

// Re-export expect for convenience
export { expect };
