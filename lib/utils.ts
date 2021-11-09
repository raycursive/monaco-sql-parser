import { isBasic, Node } from './types'

export function squeezeNode(curr: Node | string): Node | string {
  if (curr instanceof Node && isBasic(curr)) {
    return squeezeNode(curr.from.val)
  }
  return curr
}
