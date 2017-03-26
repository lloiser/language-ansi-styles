'use babel'

/* eslint-env jasmine */
/* eslint no-multi-spaces: 0 */

import * as os from 'os'
import AnsiStylesGrammar from '../lib/ansi-styles-grammar'

describe('LanguageAnsiCodes', () => {
  let grammar = null

  beforeEach(() => {
    grammar = new AnsiStylesGrammar(atom.grammars)
  })

  function scopes (value, ...scopes) {
    return { value, scopes }
  }

  const testCases = [
    {
      title: 'simple',
      lines: [
        'colors: \x1b[30mblack\x1b[33myellow',
        'hello "Mr. \x1b[32mGreen\x1b[m" how are you?'
      ],
      expected: [
        [
          scopes('colors: ',   'ansi'),
          scopes('\x1b[30m',   'ansi', 'codes'),
          scopes('black',      'ansi', 'color-fg-0'),
          scopes('\x1b[33m',   'ansi', 'color-fg-0', 'codes'),
          scopes('yellow\r',   'ansi', 'color-fg-3')
        ],
        [
          scopes('hello "Mr. ',    'ansi', 'color-fg-3'),
          scopes('\x1b[32m',       'ansi', 'color-fg-3', 'codes'),
          scopes('Green',          'ansi', 'color-fg-2'),
          scopes('\x1b[m',         'ansi', 'color-fg-2', 'codes'),
          scopes('" how are you?', 'ansi')
        ]
      ]
    },

    {
      title: 'resets multiple on multiple lines',
      lines: [
        'one default \x1b[35m magenta \x1b[91m red',
        'two red \x1b[0m default',
        'three default \x1b[0m default',
        'four default \x1b[35m magenta \x1b[90m bright black',
        'five bright black \x1b[32;1m green bold \x1b[0;m default'
      ],
      expected: [
        [
          scopes('one default ', 'ansi'),
          scopes('\x1b[35m',     'ansi', 'codes'),
          scopes(' magenta ',    'ansi', 'color-fg-5'),
          scopes('\x1b[91m',     'ansi', 'color-fg-5', 'codes'),
          scopes(' red\r',       'ansi', 'color-fg-9')
        ],
        [
          scopes('two red ',     'ansi', 'color-fg-9'),
          scopes('\x1b[0m',      'ansi', 'color-fg-9', 'codes'),
          scopes(' default\r',   'ansi')
        ],
        [
          scopes('three default ', 'ansi'),
          scopes('\x1b[0m',        'ansi', 'codes'),
          scopes(' default\r',     'ansi')
        ],
        [
          scopes('four default ',   'ansi'),
          scopes('\x1b[35m',        'ansi', 'codes'),
          scopes(' magenta ',       'ansi', 'color-fg-5'),
          scopes('\x1b[90m',        'ansi', 'color-fg-5', 'codes'),
          scopes(' bright black\r', 'ansi', 'color-fg-8')
        ],
        [
          scopes('five bright black ', 'ansi', 'color-fg-8'),
          scopes('\x1b[32;1m',         'ansi', 'color-fg-8', 'codes'),
          scopes(' green bold ',       'ansi', 'color-fg-2', 'style.bold'),
          scopes('\x1b[0;m',           'ansi', 'color-fg-2', 'style.bold', 'codes'),
          scopes(' default',           'ansi')
        ]
      ]
    },

    {
      title: 'does not modify the simple text',
      lines: 'some text',
      expected: [scopes('some text', 'ansi')]
    },

    {
      title: 'renders foreground colors',
      lines: 'colors: \x1b[30mblack\x1b[37mwhite',
      expected: [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[30m', 'ansi', 'codes'),
        scopes('black',    'ansi', 'color-fg-0'),
        scopes('\x1b[37m', 'ansi', 'color-fg-0', 'codes'),
        scopes('white',    'ansi', 'color-fg-7')
      ]
    },
    {
      title: 'renders bright foreground colors',
      lines: 'colors: \x1b[90mblack\x1b[97mwhite',
      expected: [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[90m', 'ansi', 'codes'),
        scopes('black',    'ansi', 'color-fg-8'),
        scopes('\x1b[97m', 'ansi', 'color-fg-8', 'codes'),
        scopes('white',    'ansi', 'color-fg-15')
      ]
    },
    {
      title: 'renders background colors',
      lines: 'colors: \x1b[40mblack\x1b[47mwhite',
      expected: [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[40m', 'ansi', 'codes'),
        scopes('black',    'ansi', 'color-bg-0'),
        scopes('\x1b[47m', 'ansi', 'color-bg-0', 'codes'),
        scopes('white',    'ansi', 'color-bg-7')
      ]
    },
    {
      title: 'renders bright background colors',
      lines: 'colors: \x1b[100mblack\x1b[107mwhite',
      expected: [
        scopes('colors: ',  'ansi'),
        scopes('\x1b[100m', 'ansi', 'codes'),
        scopes('black',     'ansi', 'color-bg-8'),
        scopes('\x1b[107m', 'ansi', 'color-bg-8', 'codes'),
        scopes('white',     'ansi', 'color-bg-15')
      ]
    },

    {
      title: 'renders extended fg colors',
      lines: 'colors: \x1b[38;5;196mextended fg red\x1b[0mdefault',
      expected: [
        scopes('colors: ',        'ansi'),
        scopes('\x1b[38;5;196m',  'ansi', 'codes'),
        scopes('extended fg red', 'ansi', 'color-fg-196'),
        scopes('\x1b[0m',         'ansi', 'color-fg-196', 'codes'),
        scopes('default',         'ansi')
      ]
    },
    {
      title: 'renders extended bg colors',
      lines: 'colors: \x1b[48;5;196mextended bg red\x1b[0mdefault',
      expected: [
        scopes('colors: ',        'ansi'),
        scopes('\x1b[48;5;196m',  'ansi', 'codes'),
        scopes('extended bg red', 'ansi', 'color-bg-196'),
        scopes('\x1b[0m',         'ansi', 'color-bg-196', 'codes'),
        scopes('default',         'ansi')
      ]
    },
    {
      title: 'renders extended fg colors over multiple lines',
      lines: [
        'colors: \x1b[38;5;196mextended fg red',
        'still fg red\x1b[0mdefault'
      ],
      expected: [
        [
          scopes('colors: ',          'ansi'),
          scopes('\x1b[38;5;196m',    'ansi', 'codes'),
          scopes('extended fg red\r', 'ansi', 'color-fg-196')
        ],
        [
          scopes('still fg red',      'ansi', 'color-fg-196'),
          scopes('\x1b[0m',           'ansi', 'color-fg-196', 'codes'),
          scopes('default',           'ansi')
        ]
      ]
    },
    {
      title: 'renders extended bg colors over multiple lines',
      lines: [
        'colors: \x1b[48;5;196mextended bg red',
        'still bg red\x1b[0mdefault'
      ],
      expected: [
        [
          scopes('colors: ',          'ansi'),
          scopes('\x1b[48;5;196m',    'ansi', 'codes'),
          scopes('extended bg red\r', 'ansi', 'color-bg-196')
        ],
        [
          scopes('still bg red',    'ansi', 'color-bg-196'),
          scopes('\x1b[0m',         'ansi', 'color-bg-196', 'codes'),
          scopes('default',         'ansi')
        ]
      ]
    },

    {
      title: 'renders faint',
      lines: 'faint: \x1b[2mthat\x1b[22m, default',
      expected: [
        scopes('faint: ',   'ansi'),
        scopes('\x1b[2m',   'ansi', 'codes'),
        scopes('that',      'ansi', 'style.faint'),
        scopes('\x1b[22m',  'ansi', 'style.faint', 'codes'),
        scopes(', default', 'ansi')
      ]
    },
    {
      title: 'renders strikethrough',
      lines: 'strike: \x1b[9mthat\x1b[29m, default',
      expected: [
        scopes('strike: ',  'ansi'),
        scopes('\x1b[9m',   'ansi', 'codes'),
        scopes('that',      'ansi', 'style.strike'),
        scopes('\x1b[29m',  'ansi', 'style.strike', 'codes'),
        scopes(', default', 'ansi')
      ]
    },
    {
      title: 'renders blink',
      lines: 'blink: \x1b[5mis so old school...\x1b[25m, default',
      expected: [
        scopes('blink: ',             'ansi'),
        scopes('\x1b[5m',             'ansi', 'codes'),
        scopes('is so old school...', 'ansi', 'style.blink'),
        scopes('\x1b[25m',            'ansi', 'style.blink', 'codes'),
        scopes(', default',           'ansi')
      ]
    },
    {
      title: 'renders underline',
      lines: 'underline: \x1b[4mme\x1b[24m, default',
      expected: [
        scopes('underline: ', 'ansi'),
        scopes('\x1b[4m',     'ansi', 'codes'),
        scopes('me',          'ansi', 'style.underline'),
        scopes('\x1b[24m',    'ansi', 'style.underline', 'codes'),
        scopes(', default',   'ansi')
      ]
    },
    {
      title: 'renders bold and resets it',
      lines: 'bold: \x1b[1mhero\x1b[21m, default',
      expected: [
        scopes('bold: ',    'ansi'),
        scopes('\x1b[1m',   'ansi', 'codes'),
        scopes('hero',      'ansi', 'style.bold'),
        scopes('\x1b[21m',  'ansi', 'style.bold', 'codes'),
        scopes(', default', 'ansi')
      ]
    },
    {
      title: 'renders italic',
      lines: 'italic: \x1b[3mfood\x1b[23m, default',
      expected: [
        scopes('italic: ',  'ansi'),
        scopes('\x1b[3m',   'ansi', 'codes'),
        scopes('food',      'ansi', 'style.italic'),
        scopes('\x1b[23m',  'ansi', 'style.italic', 'codes'),
        scopes(', default', 'ansi')
      ]
    },
    {
      title: 'hides text',
      lines: 'hidden: \x1b[8msecret\x1b[28m, default',
      expected: [
        scopes('hidden: ',  'ansi'),
        scopes('\x1b[8m',   'ansi', 'codes'),
        scopes('secret',    'ansi', 'style.hidden'),
        scopes('\x1b[28m',  'ansi', 'style.hidden', 'codes'),
        scopes(', default', 'ansi')
      ]
    },

    {
      title: 'handles a reset',
      lines: '\x1b[1mthis is bold\x1b[0m, but this isn\'t',
      expected: [
        scopes('\x1b[1m',           'ansi', 'codes'),
        scopes('this is bold',      'ansi', 'style.bold'),
        scopes('\x1b[0m',           'ansi', 'style.bold', 'codes'),
        scopes(', but this isn\'t', 'ansi')
      ]
    },
    {
      title: 'handles a reset with implicit 0',
      lines: '\x1b[1mthis is bold\x1b[m, but this isn\'t',
      expected: [
        scopes('\x1b[1m',           'ansi', 'codes'),
        scopes('this is bold',      'ansi', 'style.bold'),
        scopes('\x1b[m',            'ansi', 'style.bold', 'codes'),
        scopes(', but this isn\'t', 'ansi')
      ]
    },

    {
      title: 'handles multiple styles, fg and bg color',
      lines: 'normal, \x1b[1mbold, \x1b[4munderline, \x1b[3mitalic, \x1b[31mred fg, \x1b[44mblue bg\x1b[0m, normal',
      expected: [
        scopes('normal, ',    'ansi'),
        scopes('\x1b[1m',     'ansi', 'codes'),
        scopes('bold, ',      'ansi', 'style.bold'),
        scopes('\x1b[4m',     'ansi', 'style.bold', 'codes'),
        scopes('underline, ', 'ansi', 'style.bold', 'style.underline'),
        scopes('\x1b[3m',     'ansi', 'style.bold', 'style.underline', 'codes'),
        scopes('italic, ',    'ansi', 'style.bold', 'style.underline', 'style.italic'),
        scopes('\x1b[31m',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'codes'),
        scopes('red fg, ',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1'),
        scopes('\x1b[44m',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'codes'),
        scopes('blue bg',     'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[0m',     'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'codes'),
        scopes(', normal',    'ansi')
      ]
    },

    {
      title: 'renders multi-attribute sequences',
      lines: 'normal, \x1b[1;4;3;31;44mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      expected: [
        scopes('normal, ', 'ansi'),
        scopes('\x1b[1;4;3;31;44m', 'ansi', 'codes'),
        scopes(
          'bold, underline, italic, red fg and blue bg',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'
        ),
        scopes(
          '\x1b[0m',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'codes'
        ),
        scopes(', normal', 'ansi')
      ]
    },
    {
      title: 'renders multi-attribute sequences ending with a semi colon',
      lines: 'normal, \x1b[1;4;3;31;44;mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      expected: [
        scopes('normal, ', 'ansi'),
        scopes('\x1b[1;4;3;31;44;m', 'ansi', 'codes'),
        scopes(
          'bold, underline, italic, red fg and blue bg',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'
        ),
        scopes(
          '\x1b[0m',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'codes'
        ),
        scopes(', normal', 'ansi')
      ]
    },
    {
      title: 'renders multi-attribute sequences and reverts it immediately',
      lines: 'normal, \x1b[1;4;3;31;44;0mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      expected: [
        scopes('normal, ',                                    'ansi'),
        scopes('\x1b[1;4;3;31;44;0m',                         'ansi', 'codes'),
        scopes('bold, underline, italic, red fg and blue bg', 'ansi'),
        scopes('\x1b[0m',                                     'ansi', 'codes'),
        scopes(', normal',                                    'ansi')
      ]
    },

    {
      title: 'reset fg color',
      lines: '\x1b[30mblack\x1b[39mdefault',
      expected: [
        scopes('\x1b[30m', 'ansi', 'codes'),
        scopes('black',    'ansi', 'color-fg-0'),
        scopes('\x1b[39m', 'ansi', 'color-fg-0', 'codes'),
        scopes('default',  'ansi')
      ]
    },
    {
      title: 'reset bg color',
      lines: '\x1b[40mblack\x1b[49mdefault',
      expected: [
        scopes('\x1b[40m', 'ansi', 'codes'),
        scopes('black',    'ansi', 'color-bg-0'),
        scopes('\x1b[49m', 'ansi', 'color-bg-0', 'codes'),
        scopes('default',  'ansi')
      ]
    },
    {
      title: 'resets bg and fg color in order',
      lines: '\x1b[31;44mred fg & blue bg\x1b[49mred fg\x1b[39mdefault',
      expected: [
        scopes('\x1b[31;44m',      'ansi', 'codes'),
        scopes('red fg & blue bg', 'ansi', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[49m',         'ansi', 'color-fg-1', 'color-bg-4', 'codes'),
        scopes('red fg',           'ansi', 'color-fg-1'),
        scopes('\x1b[39m',         'ansi', 'color-fg-1', 'codes'),
        scopes('default',          'ansi')
      ]
    },
    {
      title: 'resets bg and fg color in wrong order',
      lines: '\x1b[31;44mred fg & blue bg\x1b[39mblue bg\x1b[49mdefault',
      expected: [
        scopes('\x1b[31;44m',      'ansi', 'codes'),
        scopes('red fg & blue bg', 'ansi', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[39m',         'ansi', 'color-fg-1', 'color-bg-4', 'codes'),
        scopes('blue bg',          'ansi', 'color-bg-4'),
        scopes('\x1b[49m',         'ansi', 'color-bg-4', 'codes'),
        scopes('default',          'ansi')
      ]
    },

    {
      title: 'skips reset underline if not underlined',
      lines: 'not \x1b[24munderline',
      expected: [
        scopes('not ',      'ansi'),
        scopes('\x1b[24m',  'ansi', 'codes'),
        scopes('underline', 'ansi')
      ]
    },
    {
      title: 'skips reset bold if not bold',
      lines: 'not \x1b[21mbold',
      expected: [
        scopes('not ',     'ansi'),
        scopes('\x1b[21m', 'ansi', 'codes'),
        scopes('bold',     'ansi')
      ]
    },
    {
      title: 'skips reset italic if not italic',
      lines: 'not \x1b[23mitalic',
      expected: [
        scopes('not ',     'ansi'),
        scopes('\x1b[23m', 'ansi', 'codes'),
        scopes('italic',   'ansi')
      ]
    },
    {
      title: 'skips reset strike if not strike',
      lines: 'not \x1b[29mstrike',
      expected: [
        scopes('not ',     'ansi'),
        scopes('\x1b[29m', 'ansi', 'codes'),
        scopes('strike',   'ansi')
      ]
    },
    {
      title: 'skips reset blink if not blink',
      lines: 'not \x1b[25mblink',
      expected: [
        scopes('not ',     'ansi'),
        scopes('\x1b[25m', 'ansi', 'codes'),
        scopes('blink',    'ansi')
      ]
    },
    {
      title: 'skips reset hidden if not hidden',
      lines: 'not \x1b[28mhidden',
      expected: [
        scopes('not ',     'ansi'),
        scopes('\x1b[28m', 'ansi', 'codes'),
        scopes('hidden',   'ansi')
      ]
    },

    {
      title: 'ignores other escape sequences',
      lines: 'hello \x1b[Kworld',
      expected: [
        scopes('hello ', 'ansi'),
        scopes('\x1b[K', 'ansi', 'codes'),
        scopes('world',  'ansi')
      ]
    },
    {
      title: 'ignores other escape sequences with 0 parameter',
      lines: 'hello \x1b[0Kworld',
      expected: [
        scopes('hello ',  'ansi'),
        scopes('\x1b[0K', 'ansi', 'codes'),
        scopes('world',   'ansi')
      ]
    },
    {
      title: 'ignores other escape sequences with 1 parameter',
      lines: 'hello \x1b[1Kworld',
      expected: [
        scopes('hello ',  'ansi'),
        scopes('\x1b[1K', 'ansi', 'codes'),
        scopes('world',   'ansi')
      ]
    },
    {
      title: 'ignores other escape sequences with 2 parameter',
      lines: 'hello \x1b[2Kworld',
      expected: [
        scopes('hello ',  'ansi'),
        scopes('\x1b[2K', 'ansi', 'codes'),
        scopes('world',   'ansi')
      ]
    },
    {
      title: 'ignores more escape sequences',
      lines: '\x1b[40m\x1b[2J\x1b[0;34mblue \x1b[1;32mbold green\x1b[A',
      expected: [
        scopes('\x1b[40m',   'ansi', 'codes'),
        scopes('\x1b[2J',    'ansi', 'color-bg-0', 'codes'),
        scopes('\x1b[0;34m', 'ansi', 'color-bg-0', 'codes'),
        scopes('blue ',      'ansi', 'color-fg-4'),
        scopes('\x1b[1;32m', 'ansi', 'color-fg-4', 'codes'),
        scopes('bold green', 'ansi', 'style.bold', 'color-fg-2'),
        scopes('\x1b[A',     'ansi', 'style.bold', 'color-fg-2', 'codes')
      ]
    },

    {
      title: 'hides escape sequences',
      lines: '\x1b[40m\x1b[2J\x1b[0;34mblue \x1b[1;32mbold green\x1b[A\x1b[mdefault',
      hideEscapeSequences: true,
      expected: [
        scopes('\x1b[40m',   'ansi', 'codes.hidden'),
        scopes('\x1b[2J',    'ansi', 'color-bg-0', 'codes.hidden'),
        scopes('\x1b[0;34m', 'ansi', 'color-bg-0', 'codes.hidden'),
        scopes('blue ',      'ansi', 'color-fg-4'),
        scopes('\x1b[1;32m', 'ansi', 'color-fg-4', 'codes.hidden'),
        scopes('bold green', 'ansi', 'style.bold', 'color-fg-2'),
        scopes('\x1b[A',     'ansi', 'style.bold', 'color-fg-2', 'codes.hidden'),
        scopes('\x1b[m',     'ansi', 'style.bold', 'color-fg-2', 'codes.hidden'),
        scopes('default',    'ansi')
      ]
    }
  ]

  describe('tokenizeLines', () => {
    afterEach(() => {
      atom.config.set('language-ansi-styles.hideEscapeSequences', false)
    })

    testCases.forEach(({ title, lines, expected, hideEscapeSequences }) => {
      it(title, () => {
        atom.config.set('language-ansi-styles.hideEscapeSequences', !!hideEscapeSequences)
        const oneLiner = !Array.isArray(lines)
        const text = oneLiner ? lines : lines.join(os.EOL)
        expect(grammar.tokenizeLines(text)).toEqual(oneLiner ? [expected] : expected)
      })
    })
  })
})
