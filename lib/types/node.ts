import _ from 'lodash'
import { WithAlias } from './withAlias'

export default class Node {
  // column: WithAlias<string>[] | '*'
  // where: Operation[]
  // groupby: (string | number)[]
  // orderBy: (string | number)[]
  // direction: 'ASC' | 'DESC'
  ctes: Map<string, Node>
  static type: string
  blockId?: string

  constructor(ctes?: Map<string, Node>) {
    this.ctes = ctes ?? new Map()
  }

  getType(): string {
    return 'untyped'
  }

  toBasic(from: WithAlias<Node | string>): BasicNode {
    return new BasicNode({
      from,
      ...this,
    })
  }

  toUnion(unions: WithAlias<Node | string>[], all?: boolean): UnionNode {
    return new UnionNode({
      unions,
      all,
      ...this,
    })
  }

  toJoin(joins: WithAlias<Node | string>[], joinType?: string): JoinNode {
    return new JoinNode({
      joins,
      joinType,
      ...this,
    })
  }

  addCTE(name: string, node: Node): void {
    this.ctes.set(name, node)
  }

  toJSON() {
    return {
      type: this.getType(),
      ..._.omit(this, 'cte'),
    }
  }

  toString(): string {
    return this.toJSON().toString()
  }
}

export class BasicNode extends Node {
  static type = 'basic'

  from: WithAlias<Node | string>

  constructor(opts: { from: WithAlias<Node | string> } & Node) {
    const { from, ctes } = opts
    super(ctes)
    this.from = from
  }

  getType() {
    return BasicNode.type
  }

  override toString() {
    return `Basic: ${this.from}`
  }
}

export class UnionNode extends Node {
  static type = 'union'

  all: boolean

  unions: WithAlias<Node | string>[]

  constructor(opts: { unions: WithAlias<Node | string>[]; all?: boolean } & Node) {
    const { unions, all = false, ctes } = opts
    super(ctes)
    this.all = all
    this.unions = unions
  }

  getType() {
    return UnionNode.type
  }

  override toString() {
    return `Union: ${this.unions.map((i) => i.toString()).join(', ')}`
  }
}

export class JoinNode extends Node {
  static type = 'join'

  joinType: string

  joins: WithAlias<Node | string>[]

  constructor(opts: { joins: WithAlias<Node | string>[]; joinType?: string } & Node) {
    const { joins, joinType = 'inner', ctes } = opts
    super(ctes)
    this.joinType = joinType
    this.joins = joins
  }

  getType() {
    return JoinNode.type
  }

  override toString() {
    return `Join: ${this.joins.map((i) => i.toString()).join(', ')}`
  }
}

export function isBasic(t: Node): t is BasicNode {
  return t.getType() === BasicNode.type
}

export function isJoin(t: Node): t is JoinNode {
  return t.getType() === JoinNode.type
}

export function isUnion(t: Node): t is UnionNode {
  return t.getType() === UnionNode.type
}
