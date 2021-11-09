import { NextRet, Token } from '../types'
import { PrimitiveTokenType } from '../types/tokens'

export function captureAlias(
  tokens: Token[],
  startIndex: number,
): NextRet<{
  alias?: string
}> {
  // avoid overflow
  if (!tokens[startIndex]) {
    return {
      endIndex: startIndex,
    }
  }
  // skipping `as`
  let currentIndex =
    tokens[startIndex].type === PrimitiveTokenType.Keyword &&
    tokens[startIndex].raw.toLowerCase() === 'as'
      ? startIndex + 1
      : startIndex
  if (currentIndex !== tokens.length) {
    if (tokens[currentIndex].type === PrimitiveTokenType.Identifier) {
      return {
        endIndex: currentIndex + 1,
        alias: tokens[currentIndex].raw,
      }
    }
    if (tokens[currentIndex].type === PrimitiveTokenType.IdentifierQuote) {
      return {
        // skipping two quotes
        endIndex: currentIndex + 3,
        alias: tokens[currentIndex + 1].raw,
      }
    }
  }
  return {
    endIndex: currentIndex,
  }
}

// only for cte usage
export function captureFrontAlias(
  tokens: Token[],
  startIndex: number,
): NextRet<{
  alias: string
}> {
  let nextIndex: number
  let alias: string
  if (tokens[startIndex].type === PrimitiveTokenType.Identifier) {
    alias = tokens[startIndex].raw
    nextIndex = startIndex + 1
  } else if (tokens[startIndex].type === PrimitiveTokenType.IdentifierQuote) {
    alias = tokens[startIndex].raw
    // skipping two quotes
    nextIndex = startIndex + 3
  } else {
    throw new Error('malformed CTE alias')
  }
  // check the form
  if (tokens[nextIndex].type === PrimitiveTokenType.Keyword && tokens[nextIndex].raw === 'as') {
    return {
      endIndex: nextIndex + 1,
      alias,
    }
  }
  throw new Error('malformed CTE alias')
}
