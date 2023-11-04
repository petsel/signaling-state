import { describe, expect, test } from '@jest/globals';

// import createDeepObservableModelState from '../src/_recent-development';
import { create as createDeepObservableModelState } from '../src';

/* eslint-disable spaced-comment */
describe('regarding the features of any observable state ...', () => {
  const initialState = {
    foo: 'FOO',
    bar: 'BAR',
    baz: {
      biz: 'BIZ',
      buzz: 'BUZZ',
      booz: {
        bonk: 'BONK',
        bunck: 'BUNCK',
        bunckaloonga: {},
      },
      boozaaaka: {},
    },
    bazooka: {},
  };
  /*
  const initialState = {
    foo: 'FOO',
    bar: 'BAR',
  };*/
  const observableState = createDeepObservableModelState(initialState);

  test('... it can be created from any data-structure ...', () => {
    expect(observableState).not.toBeNull();
  });
  test('... one can assign a new value to an existing property ...', () => {
    observableState.baz.booz.bunck = 'BUNCKKKKK';

    expect(observableState.baz.booz.bunck).toStrictEqual('BUNCKKKKK');
  });
  test('... one can successfully delete an existing property ...', () => {
    expect(delete observableState.baz.booz.bunck).toStrictEqual(true);
  });
  test.skip('... deleting a non existing property returns the correct value ...', () => {
    expect(delete observableState.baz.booz.bunck).toStrictEqual(false);
  });
});

/*
observableState.baz = {
  li: 'LI',
  la: {
    lau: 'LAU',
    ne: 'NE',
  },
};*/
