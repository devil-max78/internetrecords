import { describe, it, expect } from 'vitest';
import { populateTemplate, validateUserData } from './template-populator';

describe('Basic Import Test', () => {
  it('should import functions', () => {
    expect(populateTemplate).toBeDefined();
    expect(validateUserData).toBeDefined();
  });
});
