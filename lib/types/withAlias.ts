import Node from './node'

export class WithAlias<T extends Node | string> {
  val: T

  alias?: string

  blockId?: string

  constructor(val: T, alias?: string, blockId?: string) {
    this.val = val
    this.alias = alias
    this.blockId = blockId
  }

  static of<T extends Node | string>(val: T, alias?: string, blockId?: string): WithAlias<T> {
    return new WithAlias(val, alias, blockId)
  }

  toJson() {
    return {
      val: this.val,
      alias: this.alias,
      blockId: this.blockId,
    }
  }
}
