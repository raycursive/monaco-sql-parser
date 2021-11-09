import _ from 'lodash'
import { NextRet, Token } from '../types'
import { CompositeTokenType, PrimitiveTokenType } from '../types/tokens'

export function collectIdentifier(
  tokens: Token[],
  startIndex: number,
): NextRet<{
  identifier: Token
  alias?: string
}> {
  let currentIndex = startIndex
  const collection: Token[] = []
  // here should be of the form
  while (currentIndex < tokens.length) {
    const { raw, type } = tokens[currentIndex]
    if (
      (type === PrimitiveTokenType.Delimiter && raw === '.') ||
      type === PrimitiveTokenType.Identifier ||
      type === PrimitiveTokenType.IdentifierQuote ||
      type === PrimitiveTokenType.Transclusion
    ) {
      collection.push(tokens[currentIndex])
    } else {
      break
    }
    currentIndex += 1
  }
  const endIndex = currentIndex
  const { alias, ...identifier } = squeezeIdentifiers(collection)
  return {
    endIndex,
    identifier,
    alias,
  }
}

export function squeezeIdentifiers(tokens: Token[]): Token & {
  alias?: string
} {
  // getting @identifier
  function squeezeSmaller(index: number): NextRet<Token> {
    if (
      _.isEqual(
        _(tokens)
          .slice(index, index + 3)
          .map('type')
          .value(),
        [
          PrimitiveTokenType.IdentifierQuote,
          PrimitiveTokenType.Identifier,
          PrimitiveTokenType.IdentifierQuote,
        ],
      )
    ) {
      return {
        endIndex: index + 3,
        row: tokens[index].row,
        offset: tokens[index + 2].row,
        raw: _(tokens)
          .slice(index, index + 3)
          .map('raw')
          .value()
          .join(''),
        type: PrimitiveTokenType.Identifier,
      }
    } else {
      switch (tokens[index].type) {
        case PrimitiveTokenType.Identifier:
        case PrimitiveTokenType.Transclusion:
        case PrimitiveTokenType.Delimiter:
          if (tokens[index].type !== PrimitiveTokenType.Delimiter || tokens[index].raw === '.') {
            return {
              endIndex: index + 1,
              ...tokens[index],
            }
          }
          throw Error('malformed identifier')
        default:
          throw Error('malformed identifier')
      }
    }
  }
  // what inside collection should be @identifier.@identifier or @identifier
  // where @identifier should be identifier or quote identifier quote
  // first squeeze tokens so that only dot and @identifier are remaining
  // then capture dots
  // finally track if alias exists
  const polishedQueue = []
  let currentIndex = 0
  while (currentIndex < tokens.length) {
    const { endIndex, ...token } = squeezeSmaller(currentIndex)
    polishedQueue.push(token)
    currentIndex = endIndex
  }

  if (polishedQueue.length > 4) {
    throw Error('malformed @identifiers')
  }
  if (polishedQueue.length < 3) {
    const [identifier, alias] = polishedQueue
    return {
      ...identifier,
      offset: alias?.offset ?? identifier.offset,
      alias: alias?.raw,
    }
  }
  const [fst, dot, snd, alias] = polishedQueue
  return {
    row: fst.row,
    offset: alias?.offset ?? snd.offset,
    raw: _([fst, dot, snd]).map('raw').value().join(''),
    type: CompositeTokenType.Identifier,
    alias: alias?.raw,
  }
}
