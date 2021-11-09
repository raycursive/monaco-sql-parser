import test, { ExecutionContext } from 'ava'
import './testutils/init-tokenizer'
import { tokenize } from '../lib'
import { collectIdentifier } from '../lib/parsers/identifier'

function testIdentifier(
  t: ExecutionContext<unknown>,
  raw: string,
  expectedLength: number,
  expectedIdentifier: string,
  expectedAlias?: string,
) {
  const tokens = tokenize(raw, 'sql', false)
  t.is(tokens.length, expectedLength)
  const { identifier, alias } = collectIdentifier(tokens, 0)
  t.is(identifier.raw, expectedIdentifier)
  t.is(alias, expectedAlias)
}

test('collect identifier & alias', (t) => {
  testIdentifier(t, 'order_x', 1, 'order_x')
  testIdentifier(t, 'order_x a', 2, 'order_x', 'a')

  testIdentifier(t, '`order_x`', 3, '`order_x`')
  testIdentifier(t, '`order_x` b', 4, '`order_x`', 'b')

  testIdentifier(t, 'test.order_x', 3, 'test.order_x')
  testIdentifier(t, 'test.order_x c', 4, 'test.order_x', 'c')

  testIdentifier(t, 'test.`order_x`', 5, 'test.`order_x`')
  testIdentifier(t, 'test.`order_x` d', 6, 'test.`order_x`', 'd')
})

test('collect transclusion & alias', (t) => {
  testIdentifier(t, '{{AwFazvbp7HO4HmDvPnZb1}}', 1, '{{AwFazvbp7HO4HmDvPnZb1}}')
  testIdentifier(t, '{{AwFazvbp7HO4HmDvPnZb1}} t', 2, '{{AwFazvbp7HO4HmDvPnZb1}}', 't')
})
