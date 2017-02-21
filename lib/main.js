'use babel'

import { CompositeDisposable } from 'atom'
import AnsiStylesGrammar from './ansi-styles-grammar'

export default {
  subscriptions: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.grammars.addGrammar(new AnsiStylesGrammar(atom.grammars))
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  serialize () { }
}
