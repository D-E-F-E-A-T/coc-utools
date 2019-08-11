import { tokenizer, parseTree, calc } from '../../../src/source/calculate/parser';

test('Tokenizer: invalid math constant => 1 + 22.4 + LN3', () => {
  expect(() => {
    tokenizer('1 + 22.4 + LN3')
  }).toThrow('[Tokenizer]: Unexpected characters: LN3 at 11')
})

test('Tokenizer: invalid symbols => 1 ^ 22.4 + LN3', () => {
  expect(() => {
    tokenizer('1 ^ 22.4 + LN3')
  }).toThrow('[Tokenizer]: Unexpected characters: ^ at 2')
})

test('Tokenizer: valid tokens => (1 + 2) * (3 ** 4) ** 5 * LN2 + max(1 * 2 ** 3 + 4, 1 + 2 * 3 ** 3, (3 + 2) * 4)', () => {
  expect(
    JSON.stringify(
      tokenizer('(1 + 2) * (3 ** 4) ** 5 * LN2 + max(1 * 2 ** 3 + 4, 1 + 2 * 3 ** 3, (3 + 2) * 4)')
    )
  ).toBe('[{"type":"parent","value":"(","offset":{"start":0,"end":1}},{"type":"num","value":"1","offset":{"start":1,"end":2}},{"type":"plus","value":"+","offset":{"start":3,"end":4}},{"type":"num","value":"2","offset":{"start":5,"end":6}},{"type":"parent","value":")","offset":{"start":6,"end":7}},{"type":"mul","value":"*","offset":{"start":8,"end":9}},{"type":"parent","value":"(","offset":{"start":10,"end":11}},{"type":"num","value":"3","offset":{"start":11,"end":12}},{"type":"pow","value":"**","offset":{"start":13,"end":15}},{"type":"num","value":"4","offset":{"start":16,"end":17}},{"type":"parent","value":")","offset":{"start":17,"end":18}},{"type":"pow","value":"**","offset":{"start":19,"end":21}},{"type":"num","value":"5","offset":{"start":22,"end":23}},{"type":"mul","value":"*","offset":{"start":24,"end":25}},{"type":"cons","value":"LN2","offset":{"start":26,"end":29}},{"type":"plus","value":"+","offset":{"start":30,"end":31}},{"type":"method","value":"max","offset":{"start":32,"end":35}},{"type":"parent","value":"(","offset":{"start":35,"end":36}},{"type":"num","value":"1","offset":{"start":36,"end":37}},{"type":"mul","value":"*","offset":{"start":38,"end":39}},{"type":"num","value":"2","offset":{"start":40,"end":41}},{"type":"pow","value":"**","offset":{"start":42,"end":44}},{"type":"num","value":"3","offset":{"start":45,"end":46}},{"type":"plus","value":"+","offset":{"start":47,"end":48}},{"type":"num","value":"4","offset":{"start":49,"end":50}},{"type":"sep","value":",","offset":{"start":50,"end":51}},{"type":"num","value":"1","offset":{"start":52,"end":53}},{"type":"plus","value":"+","offset":{"start":54,"end":55}},{"type":"num","value":"2","offset":{"start":56,"end":57}},{"type":"mul","value":"*","offset":{"start":58,"end":59}},{"type":"num","value":"3","offset":{"start":60,"end":61}},{"type":"pow","value":"**","offset":{"start":62,"end":64}},{"type":"num","value":"3","offset":{"start":65,"end":66}},{"type":"sep","value":",","offset":{"start":66,"end":67}},{"type":"parent","value":"(","offset":{"start":68,"end":69}},{"type":"num","value":"3","offset":{"start":69,"end":70}},{"type":"plus","value":"+","offset":{"start":71,"end":72}},{"type":"num","value":"2","offset":{"start":73,"end":74}},{"type":"parent","value":")","offset":{"start":74,"end":75}},{"type":"mul","value":"*","offset":{"start":76,"end":77}},{"type":"num","value":"4","offset":{"start":78,"end":79}},{"type":"parent","value":")","offset":{"start":79,"end":80}}]')
})

test('ParseTree: 1 + 2', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('1 + 2')
      )
    )
  ).toBe("{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"}],\"type\":\"plus\",\"value\":\"+\"}")
})

test('ParseTree: 1 + 2 * 3', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('1 + 2 * 3')
      )
    )
  ).toBe("{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"mul\",\"value\":\"*\",\"nodes\":[{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}]}],\"type\":\"plus\",\"value\":\"+\"}")
})

test('ParseTree: 1 + 2 * 3 ** 4', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('1 + 2 * 3 ** 4')
      )
    )
  ).toBe("{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"mul\",\"value\":\"*\",\"nodes\":[{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"pow\",\"value\":\"**\",\"nodes\":[{\"type\":\"num\",\"value\":\"3\"},{\"type\":\"num\",\"value\":\"4\"}]}]}],\"type\":\"plus\",\"value\":\"+\"}")
})

test('ParseTree: 1 ** 2 ** 3', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('1 ** 2 ** 3')
      )
    )
  ).toBe("{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"pow\",\"value\":\"**\",\"nodes\":[{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}]}],\"type\":\"pow\",\"value\":\"**\"}")
})

test('ParseTree: (1 ** 2) ** 3', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('(1 ** 2) ** 3')
      )
    )
  ).toBe("{\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"}],\"type\":\"pow\",\"value\":\"**\"},{\"type\":\"num\",\"value\":\"3\"}],\"type\":\"pow\",\"value\":\"**\"}")
})

test('ParseTree: (1 + 2) * 3', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('(1 + 2) * 3')
      )
    )
  ).toBe("{\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"}],\"type\":\"plus\",\"value\":\"+\"},{\"type\":\"num\",\"value\":\"3\"}],\"type\":\"mul\",\"value\":\"*\"}")
})

test('ParseTree: (1 + 2) * 3', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('(1 + 2) * 3')
      )
    )
  ).toBe("{\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"}],\"type\":\"plus\",\"value\":\"+\"},{\"type\":\"num\",\"value\":\"3\"}],\"type\":\"mul\",\"value\":\"*\"}")
})

test('ParseTree: 1 + 2 * 3 + max(1, 2, 3)', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('1 + 2 * 3 + max(1, 2, 3)')
      )
    )
  ).toBe("{\"type\":\"plus\",\"value\":\"+\",\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"mul\",\"value\":\"*\",\"nodes\":[{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}]}],\"type\":\"plus\",\"value\":\"+\"},{\"type\":\"method\",\"value\":\"max\",\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}]}]}")
})

test('ParseTree: max(1 + 2, 2 ** 3 + min(1,2,3), 3)', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('max(1 + 2, 2 ** 3 + min(1,2,3), 3)')
      )
    )
  ).toBe("{\"type\":\"method\",\"value\":\"max\",\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"}],\"type\":\"plus\",\"value\":\"+\"},{\"type\":\"plus\",\"value\":\"+\",\"nodes\":[{\"nodes\":[{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}],\"type\":\"pow\",\"value\":\"**\"},{\"type\":\"method\",\"value\":\"min\",\"nodes\":[{\"type\":\"num\",\"value\":\"1\"},{\"type\":\"num\",\"value\":\"2\"},{\"type\":\"num\",\"value\":\"3\"}]}]},{\"type\":\"num\",\"value\":\"3\"}]}")
})

test('ParseTree: complex expression => (1 + 2) * (3 ** 4) ** 5 * LN2 + max(1 * 2 ** 3 + 4, 1 + 2 * 3 ** 3, (3 + 2) * 4)', () => {
  expect(
    JSON.stringify(
      parseTree(
        tokenizer('(1 + 2) * (3 ** 4) ** 5 * LN2 + max(1 * 2 ** 3 + 4, 1 + 2 * 3 ** 3, (3 + 2) * 4)')
      )
    )
  ).toBe('{"type":"plus","value":"+","nodes":[{"type":"mul","value":"*","nodes":[{"nodes":[{"nodes":[{"type":"num","value":"1"},{"type":"num","value":"2"}],"type":"plus","value":"+"},{"type":"pow","value":"**","nodes":[{"nodes":[{"type":"num","value":"3"},{"type":"num","value":"4"}],"type":"pow","value":"**"},{"type":"num","value":"5"}]}],"type":"mul","value":"*"},{"type":"cons","value":"LN2"}]},{"type":"method","value":"max","nodes":[{"type":"plus","value":"+","nodes":[{"nodes":[{"type":"num","value":"1"},{"type":"pow","value":"**","nodes":[{"type":"num","value":"2"},{"type":"num","value":"3"}]}],"type":"mul","value":"*"},{"type":"num","value":"4"}]},{"nodes":[{"type":"num","value":"1"},{"type":"mul","value":"*","nodes":[{"type":"num","value":"2"},{"type":"pow","value":"**","nodes":[{"type":"num","value":"3"},{"type":"num","value":"3"}]}]}],"type":"plus","value":"+"},{"nodes":[{"nodes":[{"type":"num","value":"3"},{"type":"num","value":"2"}],"type":"plus","value":"+"},{"type":"num","value":"4"}],"type":"mul","value":"*"}]}]}')
})

test('Calc: 1 + 2 = 3', () => {
  expect(
    calc('1 + 2')
  ).toBe('3')
})

test('Calc: 2 * (2 + 3) = 10', () => {
  expect(
    calc('2 * (2 + 3)')
  ).toBe('10')
})

test('Calc: 1 + 2 * 3 = 7', () => {
  expect(
    calc('1 + 2 * 3')
  ).toBe('7')
})

test('Calc: 1 + 2 * 3 ** 4 = 163', () => {
  expect(
    calc('1 + 2 * 3 ** 4')
  ).toBe('163')
})

test('Calc: (1 + 2 * 3) ** 4 = 2401', () => {
  expect(
    calc('(1 + 2 * 3) ** 4')
  ).toBe('2401')
})

test('Calc: pow(2, max(1 + 2, 3 * 2)) = 64', () => {
  expect(
    calc('pow(2, max(1 + 2, 3 * 2))')
  ).toBe('64')
})

test('Calc: 1 * -2 = -2', () => {
  expect(
    calc('1 * -2')
  ).toBe('-2')
})
