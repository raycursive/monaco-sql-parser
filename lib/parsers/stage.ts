import { Context, Stage } from '../types'
import { PrimitiveTokenType } from '../types/tokens'

export function parseComments(ctx: Context): Context {
  const { tokens, currentIndex: startIndex } = ctx
  let currentIndex = startIndex
  const { type } = tokens[currentIndex]
  while (
    currentIndex < tokens.length &&
    (type === PrimitiveTokenType.Comment || type === PrimitiveTokenType.CommentQuote)
  ) {
    currentIndex++
  }
  return {
    ...ctx,
    currentIndex,
  }
}

export function parseStage(ctx: Context): Context {
  const { tokens, currentIndex: startIndex, currentStage: startStage, currentType: startType } = ctx
  let currentIndex = startIndex
  let currentStage = startStage
  let currentType = startType
  const { raw, type } = tokens[currentIndex]
  if (type === PrimitiveTokenType.Keyword) {
    switch (raw.toLowerCase()) {
      case 'select':
        currentStage = Stage.Select
        break
      case 'from':
        currentStage = Stage.From
        break
      case 'where':
        currentStage = Stage.Where
        break
      case 'having':
        currentStage = Stage.Having
        break
      case 'group':
        if (tokens[currentIndex + 1]?.raw.toLowerCase() === 'by') {
          currentIndex += 1
          currentStage = Stage.GroupBy
        }
        break
      case 'order':
        if (tokens[currentIndex + 1]?.raw.toLowerCase() === 'by') {
          currentIndex += 1
          currentStage = Stage.OrderBy
        }
        break
      case 'on':
        currentStage = Stage.On
        break
      default:
        if (raw.toLowerCase().startsWith('with')) {
          if (tokens[currentIndex + 1]?.raw.toLowerCase() === 'recursive') {
            currentIndex += 1
          }
          currentStage = Stage.With
        } else if (raw.toLowerCase().startsWith('join')) {
          currentStage = Stage.Join
          currentType = 'join'
        } else if (raw.toLowerCase().startsWith('union')) {
          currentStage = Stage.Union
          currentType = 'union'
        }
    }
  }
  return {
    ...ctx,
    currentStage,
    currentType,
    currentIndex: currentIndex + 1,
  }
}
