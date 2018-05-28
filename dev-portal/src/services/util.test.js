import {arrayToObject} from './util'

test('should maintain correct array to object mapping', () => {
  let result = arrayToObject([{k: 'a', v: 'b'}, {k: 'e', v: 'f'}], k => k.k, v => v.v);
  expect(result).toEqual({a: 'b', e: 'f'});
});
