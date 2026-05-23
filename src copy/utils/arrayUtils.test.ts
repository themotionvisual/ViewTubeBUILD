import { expect, test } from 'vitest';
import { chunkArray } from './arrayUtils';

test('splits array into chunks of size 2', () => {
  expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
});
