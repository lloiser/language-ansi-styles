'use babel'

import { convert } from './convert'

export default class AnsiGrammar {
  constructor (registry) {
    this.scopeName = 'text.ansi'
    this.name = 'Ansi'
    this.fileTypes = []
    this.registry = registry
  }

  grammarUpdated () {}

  dispose () {
  }

  onDidUpdate (callback) {
    return { dispose () { } }
  }

  scopeForId (id) {
    return this.registry.scopeForId(id)
  }
  startIdForScope (scope) {
    return this.registry.startIdForScope(scope)
  }
  endIdForScope (scope) {
    return this.registry.endIdForScope(scope)
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
      return this.registry.decodeTokens(line, tags, scopes)
    })
  }

  tokenizeLine (line, ruleStack, firstLine) {
    return convert(line, ruleStack, firstLine, this.registry)
  }
}
