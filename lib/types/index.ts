import Node from './node'
import { Stage } from './stage'
import { WithAlias } from './withAlias'

type Token = {
  row: number
  offset: number
  raw: string
  type: string
}

type NextRet<T> = T & {
  endIndex: number
}

type Context = {
  currentStage: Stage
  currentNode: Node
  currentType: 'union' | 'join' | 'none'
  currentIndex: number
  tokens: Token[]
  downstreams: WithAlias<Node | string>[]
}

type SubParser = (ctx: Context) => Context

export { Token, NextRet, Node, Stage, Context, SubParser, WithAlias }
export * from './node'
