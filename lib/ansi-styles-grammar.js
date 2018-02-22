'use babel'

import { convert } from './convert'

export default class AnsiStylesGrammar {
  constructor (registry) {
    this.scopeName = 'text.ansi'
    this.name = 'Ansi Styles'
    this.fileTypes = ['log', 'ansi']
    this.registry = registry
    this.maxLineLength = 10000
    this.maxTokensPerLine = 1000
  }

  grammarUpdated () {}

  dispose () {
  }

  onDidUpdate (callback) {
    return { dispose () { } }
  }

  scopeForId (id) {
    return this.registry.textmateRegistry.scopeForId(id)
  }
  startIdForScope (scope) {
    return this.registry.textmateRegistry.startIdForScope(scope)
  }
  endIdForScope (scope) {
    return this.registry.textmateRegistry.endIdForScope(scope)
  }

  scopesFromStack (stack, rule, endPatternMatch) {
    console.log('scopesFromStack', ...arguments)
  }

  tokenizeLines (text) {
    const lines = text.split('\n')
    const scopes = []
    let ruleStack, tags
    return lines.map((line, i) => {
      ({ tags, ruleStack } = this.tokenizeLine(line, ruleStack, i === 0))
      return this.registry.textmateRegistry.decodeTokens(line, tags, scopes)
    })
  }

  tokenizeLine (line, ruleStack, firstLine) {
    return convert(
      line,
      ruleStack,
      firstLine,
      this.registry.textmateRegistry,
      atom.config.get('language-ansi-styles.hideEscapeSequences')
    )
  }
}
