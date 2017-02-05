'use babel'

/* eslint-env jasmine */
/* eslint no-multi-spaces: 0 */

import * as os from 'os'
import AnsiGrammar from '../lib/ansi-grammar.js'

describe('LanguageAnsiCodes', () => {
  let grammar = null

  beforeEach(() => {
    grammar = new AnsiGrammar(atom.grammars)
  })

  function scopes (value, ...scopes) {
    return { value, scopes }
  }

  describe('tokenizeLines', () => {
    it('1', () => {
      const text = [
        'colors: \u001b[30mblack\u001b[33myellow',
        'hello "Mr. \u001b[32mGreen\u001b[m" how are you?'
      ].join(os.EOL)

      const expected = [
        [
          scopes('colors: ',   'ansi'),
          scopes('\u001b[30m', 'ansi', 'controlchar'),
          scopes('black',      'ansi', 'color.fg.black'),
          scopes('\u001b[33m', 'ansi', 'color.fg.black', 'controlchar'),
          scopes('yellow\r',   'ansi', 'color.fg.yellow')
        ],
        [
          scopes('hello "Mr. ',    'ansi', 'color.fg.yellow'),
          scopes('\u001b[32m',     'ansi', 'color.fg.yellow', 'controlchar'),
          scopes('Green',          'ansi', 'color.fg.green'),
          scopes('\u001b[m',       'ansi', 'color.fg.green', 'controlchar'),
          scopes('" how are you?', 'ansi')
        ]
      ]

      expect(grammar.tokenizeLines(text)).toEqual(expected)
    })

    it('2', () => {
      const text = [
        'one default \u001b[35m magenta \u001b[91m red',
        'two red \u001b[0m default',
        'three default \u001b[0m default',
        'four default \u001b[35m magenta \u001b[90m bright black',
        'five bright black \u001b[32;1m green bold \u001b[0;m default'
      ].join(os.EOL)

      const expected = [
        [
          scopes('one default ', 'ansi'),
          scopes('\u001b[35m',   'ansi', 'controlchar'),
          scopes(' magenta ',    'ansi', 'color.fg.magenta'),
          scopes('\u001b[91m',   'ansi', 'color.fg.magenta', 'controlchar'),
          scopes(' red\r',       'ansi', 'color.fg.bright.red')
        ],
        [
          scopes('two red ',     'ansi', 'color.fg.bright.red'),
          scopes('\u001b[0m',    'ansi', 'color.fg.bright.red', 'controlchar'),
          scopes(' default\r',   'ansi')
        ],
        [
          scopes('three default ', 'ansi'),
          scopes('\u001b[0m',      'ansi', 'controlchar'),
          scopes(' default\r',     'ansi')
        ],
        [
          scopes('four default ',   'ansi'),
          scopes('\u001b[35m',      'ansi', 'controlchar'),
          scopes(' magenta ',       'ansi', 'color.fg.magenta'),
          scopes('\u001b[90m',      'ansi', 'color.fg.magenta', 'controlchar'),
          scopes(' bright black\r', 'ansi', 'color.fg.bright.black')
        ],
        [
          scopes('five bright black ', 'ansi', 'color.fg.bright.black'),
          scopes('\u001b[32;1m',       'ansi', 'color.fg.bright.black', 'controlchar'),
          scopes(' green bold ',       'ansi', 'color.fg.green', 'style.bold'),
          scopes('\u001b[0;m',         'ansi', 'color.fg.green', 'style.bold', 'controlchar'),
          scopes(' default',         'ansi')
        ]
      ]

      expect(grammar.tokenizeLines(text)).toEqual(expected)
    })

    // TODO add way more tests!
    // * bg color
    // * multiple open and closes of the same color and style
  })
})
