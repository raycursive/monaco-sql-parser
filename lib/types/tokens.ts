export enum PrimitiveTokenType {
  Transclusion = 'transclusion',
  White = 'white',
  Operator = 'operator',
  Builtin = 'predefined',
  Number = 'number',
  String = 'string',
  Comment = 'comment',
  CommentQuote = 'comment.quote',
  Identifier = 'identifier',
  IdentifierQuote = 'identifier.quote',
  Delimiter = 'delimiter',
  DelimiterParenthesis = 'delimiter.parenthesis',
  DelimiterSquare = 'delimiter.square',
  Keyword = 'keyword',
  KeywordBlock = 'keyword.block',
  KeywordChoice = 'keyword.choice',
}

export enum CompositeTokenType {
  IdentifierList = '@identifierList',
  Identifier = '@identifier',
  Comment = '@comment',
  Delimiter = '@delimiter',
  Function = '@function',
  Literal = '@literal',
  CaseBlock = '@case',
  SubQuery = '@subquery',
}

export type TokenType = CompositeTokenType | PrimitiveTokenType
