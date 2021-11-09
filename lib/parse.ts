import { captureAlias, captureFrontAlias } from './parsers/alias'
import { collectIdentifier } from './parsers/identifier'
import { parseComments, parseStage } from './parsers/stage'
import { collectSubquery, isSubquery } from './parsers/subquery'
import { Context, Node, Stage, Token, WithAlias } from './types'
import { PrimitiveTokenType } from './types/tokens'

function getCurrentToken(ctx: Context): Token {
  return ctx.tokens[ctx.currentIndex]
}

// Note that only tokens without white will be accepted!
// TODO: rewrite handlers
export function parse(tokensInput: Token[]): Node {
  const tokens = tokensInput.filter(
    (i) =>
      i.type !== PrimitiveTokenType.White &&
      i.type !== PrimitiveTokenType.Comment &&
      i.type !== PrimitiveTokenType.CommentQuote,
  )
  let ctx: Context = {
    currentNode: new Node(),
    downstreams: [],
    currentStage: Stage.Select,
    currentType: 'none',
    tokens: tokens,
    currentIndex: 0,
  }

  while (ctx.currentIndex < tokens.length) {
    // in the beginning it might be comments / keyword
    ctx = parseComments(ctx)
    if (getCurrentToken(ctx).type === PrimitiveTokenType.Keyword) {
      ctx = parseStage(ctx)
      continue
    }
    if (
      ctx.currentStage === Stage.With &&
      [PrimitiveTokenType.Identifier, PrimitiveTokenType.IdentifierQuote].includes(
        getCurrentToken(ctx).type as PrimitiveTokenType,
      )
    ) {
      const { endIndex: aliasEndIndex, alias } = captureFrontAlias(tokens, ctx.currentIndex)
      const { endIndex, tokens: subqueryTokens } = collectSubquery(tokens, aliasEndIndex)
      ctx.currentNode.addCTE(alias, parse(subqueryTokens))
      // skipping delimiter
      ctx.currentIndex = tokens[endIndex].raw === ',' ? endIndex + 1 : endIndex
      continue
    } else if (
      ctx.currentStage === Stage.From ||
      ctx.currentStage === Stage.Join ||
      ctx.currentStage === Stage.Union
    ) {
      // for subquery, recursively handle it and add its node into tables
      if (isSubquery(tokens, ctx.currentIndex)) {
        const { endIndex: nextIndex, tokens: subqueryTokens } = collectSubquery(
          tokens,
          ctx.currentIndex,
        )
        const { endIndex, alias } = captureAlias(tokens, nextIndex)
        const newNode = parse(subqueryTokens)
        ctx.downstreams.push(WithAlias.of(newNode, alias))
        ctx.currentIndex = endIndex
        continue
        // else, take identifiers of the table out
      } else if (
        [
          PrimitiveTokenType.Transclusion,
          PrimitiveTokenType.Identifier,
          PrimitiveTokenType.IdentifierQuote,
        ].includes(getCurrentToken(ctx).type as PrimitiveTokenType)
      ) {
        // take the identifier inside
        const { endIndex, identifier, alias } = collectIdentifier(tokens, ctx.currentIndex)
        ctx.downstreams.push(WithAlias.of(identifier.raw, alias))
        ctx.currentIndex = endIndex
        continue
      }
    }
    ctx.currentIndex += 1
  }
  if (ctx.downstreams.length === 1) {
    return ctx.currentNode.toBasic(ctx.downstreams[0])
  }
  if (ctx.currentType === 'join') {
    return ctx.currentNode.toJoin(ctx.downstreams)
  } else if (ctx.currentType === 'union') {
    return ctx.currentNode.toUnion(ctx.downstreams)
  }
  // console.error('currentNode:', inspect(ctx.currentNode, false, null, true))
  // console.error('finalType:', ctx.currentType)
  // console.error('finalDownstreams:', inspect(ctx.downstreams, false, null, true))
  throw Error(`unexcepted sql structure`)
}
