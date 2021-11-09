import { NextRet, Token } from '../types'
import { PrimitiveTokenType } from '../types/tokens'

export function isSubquery(tokens: Token[], evaluatedIndex: number): boolean {
  if (
    tokens[evaluatedIndex].type === PrimitiveTokenType.DelimiterParenthesis &&
    tokens[evaluatedIndex].raw === '('
  ) {
    const nextToken = tokens
      .slice(evaluatedIndex + 1)
      .find(({ type }) => type !== PrimitiveTokenType.White && !type.startsWith('comment'))
    if (!nextToken) {
      throw Error('unexpected end of token')
    }
    if (nextToken.type === PrimitiveTokenType.Keyword && nextToken.raw.toLowerCase() === 'select') {
      return true
    }
  }
  return false
}

export function collectSubquery(
  tokens: Token[],
  startIndex: number,
): NextRet<{
  tokens: Token[]
}> {
  let level = 0
  let currentIndex = startIndex
  while (currentIndex < tokens.length) {
    const { type, raw } = tokens[currentIndex]
    if (type === PrimitiveTokenType.DelimiterParenthesis) {
      // dirty hacks here, since delimiter.parenthesis might be () or )))
      level += Array.from(raw).reduce((acc, cur) => {
        if (cur === '(') {
          return acc + 1
        }
        if (cur === ')') {
          return acc - 1
        }
        return acc
      }, 0)
      if (level === 0) {
        break
      }
    }
    currentIndex++
  }
  if (level !== 0) {
    throw new Error('malformed sql')
  }
  return {
    endIndex: currentIndex + 1,
    tokens: tokens.slice(startIndex + 1, currentIndex),
  }
}
