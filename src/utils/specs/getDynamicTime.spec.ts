import { getDynamicTime } from '../getDynamicTime';

describe('#dynamicTime', () => {
  it('returns correct value', () => {
    Date.now = jest.fn(() => new Date(Date.UTC(2023, 1, 14)).valueOf());
    expect(getDynamicTime(1612971343)).toEqual('about 2 years ago');
  });
});
