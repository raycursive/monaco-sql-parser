import test from 'ava'
import './testutils/init-tokenizer'
import { tokenize, parse } from '../lib'
import { BasicNode, JoinNode } from '../lib/types/node'
import { inspect } from 'util'

test('sql parse', (t) => {
  const sql = `WITH EsaZ as (select id, t from \`t\`.a), TTz as (select id, d from b) select y.t, y.b from (select p.t, q.d from EsaZ p join TTz q on p.id = q.id) y`
  const tokens = tokenize(sql, 'sql', false)
  t.is(tokens.length, 60)

  const node = parse(tokens)

  // evaluating cte capture
  t.is(node.ctes.size, 2)
  t.true(node.ctes.has('EsaZ'))
  t.true(node.ctes.has('TTz'))

  t.is((node.ctes.get('EsaZ') as BasicNode)?.from?.val, '`t`.a')

  // evaluating query type capture
  t.true(node instanceof BasicNode)

  // evaluating alias capture
  t.is((node as BasicNode).from.alias, 'y')

  // evalutating subquery
  t.true((node as BasicNode).from.val instanceof JoinNode)

  const inner = (node as BasicNode).from.val as JoinNode
  t.true(inner instanceof JoinNode)
  t.is(inner.joins.length, 2)
})
