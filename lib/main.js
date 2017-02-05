'use babel'

import { CompositeDisposable } from 'atom'
import AnsiGrammar from './ansi-grammar'

export default {
  subscriptions: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.grammars.addGrammar(new AnsiGrammar(atom.grammars))
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  serialize () { }
}
