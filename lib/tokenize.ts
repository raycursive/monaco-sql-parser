import _ from 'lodash'
import { tokenize as monacoTokenize } from 'monaco-tokenizer'
import { Token } from './types'
import { PrimitiveTokenType } from './types/tokens'

export function tokenize(content: string, languageId: string, withWhite = true): Token[] {
  const tokens = monacoTokenize(content, languageId)
  const rawContentByRow = content.split('\n')
  const typeOffset = languageId.length + 1
  return _(tokens)
    .flatMap((row, rowIndex) => {
      return _(row)
        .map(({ offset, type }, currIndex) => {
          const nextOffset = row[currIndex + 1]?.offset
          const betterType = type.substring(0, type.length - typeOffset)
          const raw = rawContentByRow[rowIndex].substring(offset, nextOffset)
          return {
            row: rowIndex,
            offset: offset,
            type: betterType,
            raw: raw,
          }
        })
        .value()
    })
    .filter(withWhite ? _.identity : ({ type }) => type !== PrimitiveTokenType.White)
    .value()
}
