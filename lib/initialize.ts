import { register, setMonarchTokensProvider, IMonarchLanguage } from 'monaco-tokenizer'

export function initializeTokenizer(tokenizerName: string, spec: IMonarchLanguage): void {
  register({ id: tokenizerName })
  setMonarchTokensProvider(tokenizerName, spec)
}
