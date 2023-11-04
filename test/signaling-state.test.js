import { describe, expect, test } from '@jest/globals';
import { create as createSignalingState } from '../src';

describe('regarding the features of any observable state ...', () => {
  // const target = { foo: 'FOO', bar: 'BAR' };
  const target = {
    li: 'LI',
    la: {
      lau: 'LAU',
      ne: 'NE',
    },
  };
  const state = createSignalingState(target);

  test('... it can be created from any data-structure ...', () => {
    expect(state).not.toBeNull();
  });
  test('... one can assign a new value to an existing property ...', () => {
    state.li = 'LI_LI_LI';
    expect(state.li).toStrictEqual('LI_LI_LI');

    state.la.lau = 'LAUU';
    expect(state.la.lau).toStrictEqual('LAUU');

    state.la.ne = { foo: 'FOO' };
    expect(state.la.ne.getDataRaw()).toStrictEqual({ foo: 'FOO' });

    // touch case
    state.la = { lau: 'LAUU', ne: { foo: 'FOO' } };
    expect(state.la.getDataRaw()).toStrictEqual({
      lau: 'LAUU',
      ne: { foo: 'FOO' },
    });

    // patch and delete case
    state.la = { ne: 'NEEEE' };
    expect(state.la.getDataRaw()).toStrictEqual({
      ne: 'NEEEE',
    });
  });

  test.skip('... one can successfully delete an existing property ...', () => {
    expect(delete state.la.ne).toStrictEqual(true);
  });
  test.skip('... deleting a non existing property returns the correct value ...', () => {
    expect(delete state.la.ne).toStrictEqual(false);
  });
});
