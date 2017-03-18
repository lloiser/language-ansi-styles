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
    [
      'simple',
      [
        'colors: \x1b[30mblack\x1b[33myellow',
        'hello "Mr. \x1b[32mGreen\x1b[m" how are you?'
      ],
      [
        [
          scopes('colors: ',   'ansi'),
          scopes('\x1b[30m',   'ansi', 'controlchar'),
          scopes('black',      'ansi', 'color-fg-0'),
          scopes('\x1b[33m',   'ansi', 'color-fg-0', 'controlchar'),
          scopes('yellow\r',   'ansi', 'color-fg-3')
        ],
        [
          scopes('hello "Mr. ',    'ansi', 'color-fg-3'),
          scopes('\x1b[32m',       'ansi', 'color-fg-3', 'controlchar'),
          scopes('Green',          'ansi', 'color-fg-2'),
          scopes('\x1b[m',         'ansi', 'color-fg-2', 'controlchar'),
          scopes('" how are you?', 'ansi')
        ]
      ]
    ],

    [
      'resets multiple on multiple lines',
      [
        'one default \x1b[35m magenta \x1b[91m red',
        'two red \x1b[0m default',
        'three default \x1b[0m default',
        'four default \x1b[35m magenta \x1b[90m bright black',
        'five bright black \x1b[32;1m green bold \x1b[0;m default'
      ],
      [
        [
          scopes('one default ', 'ansi'),
          scopes('\x1b[35m',     'ansi', 'controlchar'),
          scopes(' magenta ',    'ansi', 'color-fg-5'),
          scopes('\x1b[91m',     'ansi', 'color-fg-5', 'controlchar'),
          scopes(' red\r',       'ansi', 'color-fg-9')
        ],
        [
          scopes('two red ',     'ansi', 'color-fg-9'),
          scopes('\x1b[0m',      'ansi', 'color-fg-9', 'controlchar'),
          scopes(' default\r',   'ansi')
        ],
        [
          scopes('three default ', 'ansi'),
          scopes('\x1b[0m',        'ansi', 'controlchar'),
          scopes(' default\r',     'ansi')
        ],
        [
          scopes('four default ',   'ansi'),
          scopes('\x1b[35m',        'ansi', 'controlchar'),
          scopes(' magenta ',       'ansi', 'color-fg-5'),
          scopes('\x1b[90m',        'ansi', 'color-fg-5', 'controlchar'),
          scopes(' bright black\r', 'ansi', 'color-fg-8')
        ],
        [
          scopes('five bright black ', 'ansi', 'color-fg-8'),
          scopes('\x1b[32;1m',         'ansi', 'color-fg-8', 'controlchar'),
          scopes(' green bold ',       'ansi', 'color-fg-2', 'style.bold'),
          scopes('\x1b[0;m',           'ansi', 'color-fg-2', 'style.bold', 'controlchar'),
          scopes(' default',           'ansi')
        ]
      ]
    ],

    [
      'does not modify the simple text',
      'some text',
      [scopes('some text', 'ansi')]
    ],

    [
      'renders foreground colors',
      'colors: \x1b[30mblack\x1b[37mwhite',
      [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[30m', 'ansi', 'controlchar'),
        scopes('black',    'ansi', 'color-fg-0'),
        scopes('\x1b[37m', 'ansi', 'color-fg-0', 'controlchar'),
        scopes('white',    'ansi', 'color-fg-7')
      ]
    ],
    [
      'renders bright foreground colors',
      'colors: \x1b[90mblack\x1b[97mwhite',
      [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[90m', 'ansi', 'controlchar'),
        scopes('black',    'ansi', 'color-fg-8'),
        scopes('\x1b[97m', 'ansi', 'color-fg-8', 'controlchar'),
        scopes('white',    'ansi', 'color-fg-15')
      ]
    ],
    [
      'renders background colors',
      'colors: \x1b[40mblack\x1b[47mwhite',
      [
        scopes('colors: ', 'ansi'),
        scopes('\x1b[40m', 'ansi', 'controlchar'),
        scopes('black',    'ansi', 'color-bg-0'),
        scopes('\x1b[47m', 'ansi', 'color-bg-0', 'controlchar'),
        scopes('white',    'ansi', 'color-bg-7')
      ]
    ],
    [
      'renders bright background colors',
      'colors: \x1b[100mblack\x1b[107mwhite',
      [
        scopes('colors: ',  'ansi'),
        scopes('\x1b[100m', 'ansi', 'controlchar'),
        scopes('black',     'ansi', 'color-bg-8'),
        scopes('\x1b[107m', 'ansi', 'color-bg-8', 'controlchar'),
        scopes('white',     'ansi', 'color-bg-15')
      ]
    ],

    [
      'renders extended fg colors',
      'colors: \x1b[38;5;196mextended fg red\x1b[0mdefault',
      [
        scopes('colors: ',        'ansi'),
        scopes('\x1b[38;5;196m',  'ansi', 'controlchar'),
        scopes('extended fg red', 'ansi', 'color-fg-196'),
        scopes('\x1b[0m',         'ansi', 'color-fg-196', 'controlchar'),
        scopes('default',         'ansi')
      ]
    ],
    [
      'renders extended bg colors',
      'colors: \x1b[48;5;196mextended bg red\x1b[0mdefault',
      [
        scopes('colors: ',        'ansi'),
        scopes('\x1b[48;5;196m',  'ansi', 'controlchar'),
        scopes('extended bg red', 'ansi', 'color-bg-196'),
        scopes('\x1b[0m',         'ansi', 'color-bg-196', 'controlchar'),
        scopes('default',         'ansi')
      ]
    ],
    [
      'renders extended fg colors over multiple lines',
      [
        'colors: \x1b[38;5;196mextended fg red',
        'still fg red\x1b[0mdefault'
      ],
      [
        [
          scopes('colors: ',        'ansi'),
          scopes('\x1b[38;5;196m',  'ansi', 'controlchar'),
          scopes('extended fg red\r', 'ansi', 'color-fg-196')
        ],
        [
          scopes('still fg red',    'ansi', 'color-fg-196'),
          scopes('\x1b[0m',         'ansi', 'color-fg-196', 'controlchar'),
          scopes('default',         'ansi')
        ]
      ]
    ],
    [
      'renders extended bg colors over multiple lines',
      [
        'colors: \x1b[48;5;196mextended bg red',
        'still bg red\x1b[0mdefault'
      ],
      [
        [
          scopes('colors: ',        'ansi'),
          scopes('\x1b[48;5;196m',  'ansi', 'controlchar'),
          scopes('extended bg red\r', 'ansi', 'color-bg-196')
        ],
        [
          scopes('still bg red',    'ansi', 'color-bg-196'),
          scopes('\x1b[0m',         'ansi', 'color-bg-196', 'controlchar'),
          scopes('default',         'ansi')
        ]
      ]
    ],

    [
      'renders faint',
      'faint: \x1b[2mthat\x1b[22m, default',
      [
        scopes('faint: ',  'ansi'),
        scopes('\x1b[2m',   'ansi', 'controlchar'),
        scopes('that',      'ansi', 'style.faint'),
        scopes('\x1b[22m',  'ansi', 'style.faint', 'controlchar'),
        scopes(', default', 'ansi')
      ]
    ],
    [
      'renders strikethrough',
      'strike: \x1b[9mthat\x1b[29m, default',
      [
        scopes('strike: ',  'ansi'),
        scopes('\x1b[9m',   'ansi', 'controlchar'),
        scopes('that',      'ansi', 'style.strike'),
        scopes('\x1b[29m',  'ansi', 'style.strike', 'controlchar'),
        scopes(', default', 'ansi')
      ]
    ],
    [
      'renders blink',
      'blink: \x1b[5mis so old school...\x1b[25m, default',
      [
        scopes('blink: ',             'ansi'),
        scopes('\x1b[5m',             'ansi', 'controlchar'),
        scopes('is so old school...', 'ansi', 'style.blink'),
        scopes('\x1b[25m',            'ansi', 'style.blink', 'controlchar'),
        scopes(', default',           'ansi')
      ]
    ],
    [
      'renders underline',
      'underline: \x1b[4mme\x1b[24m, default',
      [
        scopes('underline: ', 'ansi'),
        scopes('\x1b[4m',     'ansi', 'controlchar'),
        scopes('me',          'ansi', 'style.underline'),
        scopes('\x1b[24m',    'ansi', 'style.underline', 'controlchar'),
        scopes(', default',   'ansi')
      ]
    ],
    [
      'renders bold and resets it',
      'bold: \x1b[1mhero\x1b[21m, default',
      [
        scopes('bold: ',    'ansi'),
        scopes('\x1b[1m',   'ansi', 'controlchar'),
        scopes('hero',      'ansi', 'style.bold'),
        scopes('\x1b[21m',  'ansi', 'style.bold', 'controlchar'),
        scopes(', default', 'ansi')
      ]
    ],
    [
      'renders italic',
      'italic: \x1b[3mfood\x1b[23m, default',
      [
        scopes('italic: ',  'ansi'),
        scopes('\x1b[3m',   'ansi', 'controlchar'),
        scopes('food',      'ansi', 'style.italic'),
        scopes('\x1b[23m',  'ansi', 'style.italic', 'controlchar'),
        scopes(', default', 'ansi')
      ]
    ],
    [
      'hides text',
      'hidden: \x1b[8msecret\x1b[28m, default',
      [
        scopes('hidden: ', 'ansi'),
        scopes('\x1b[8m',  'ansi', 'controlchar'),
        scopes('secret',   'ansi', 'style.hidden'),
        scopes('\x1b[28m',     'ansi', 'style.hidden', 'controlchar'),
        scopes(', default',     'ansi')
      ]
    ],

    [
      'handles a reset',
      '\x1b[1mthis is bold\x1b[0m, but this isn\'t',
      [
        scopes('\x1b[1m',           'ansi', 'controlchar'),
        scopes('this is bold',      'ansi', 'style.bold'),
        scopes('\x1b[0m',           'ansi', 'style.bold', 'controlchar'),
        scopes(', but this isn\'t', 'ansi')
      ]
    ],
    [
      'handles a reset with implicit 0',
      '\x1b[1mthis is bold\x1b[m, but this isn\'t',
      [
        scopes('\x1b[1m',           'ansi', 'controlchar'),
        scopes('this is bold',      'ansi', 'style.bold'),
        scopes('\x1b[m',            'ansi', 'style.bold', 'controlchar'),
        scopes(', but this isn\'t', 'ansi')
      ]
    ],

    [
      'handles multiple styles, fg and bg color',
      'normal, \x1b[1mbold, \x1b[4munderline, \x1b[3mitalic, \x1b[31mred fg, \x1b[44mblue bg\x1b[0m, normal',
      [
        scopes('normal, ',    'ansi'),
        scopes('\x1b[1m',     'ansi', 'controlchar'),
        scopes('bold, ',      'ansi', 'style.bold'),
        scopes('\x1b[4m',     'ansi', 'style.bold', 'controlchar'),
        scopes('underline, ', 'ansi', 'style.bold', 'style.underline'),
        scopes('\x1b[3m',     'ansi', 'style.bold', 'style.underline', 'controlchar'),
        scopes('italic, ',    'ansi', 'style.bold', 'style.underline', 'style.italic'),
        scopes('\x1b[31m',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'controlchar'),
        scopes('red fg, ',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1'),
        scopes('\x1b[44m',    'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'controlchar'),
        scopes('blue bg',     'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[0m',     'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'controlchar'),
        scopes(', normal',    'ansi')
      ]
    ],

    [
      'renders multi-attribute sequences',
      'normal, \x1b[1;4;3;31;44mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      [
        scopes('normal, ', 'ansi'),
        scopes('\x1b[1;4;3;31;44m', 'ansi', 'controlchar'),
        scopes(
          'bold, underline, italic, red fg and blue bg',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'
        ),
        scopes('\x1b[0m', 'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'controlchar'),
        scopes(', normal', 'ansi')
      ]
    ],
    [
      'renders multi-attribute sequences ending with a semi colon',
      'normal, \x1b[1;4;3;31;44;mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      [
        scopes('normal, ', 'ansi'),
        scopes('\x1b[1;4;3;31;44;m', 'ansi', 'controlchar'),
        scopes(
          'bold, underline, italic, red fg and blue bg',
          'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4'
        ),
        scopes('\x1b[0m', 'ansi', 'style.bold', 'style.underline', 'style.italic', 'color-fg-1', 'color-bg-4', 'controlchar'),
        scopes(', normal', 'ansi')
      ]
    ],
    [
      'renders multi-attribute sequences and reverts it immediately',
      'normal, \x1b[1;4;3;31;44;0mbold, underline, italic, red fg and blue bg\x1b[0m, normal',
      [
        scopes('normal, ',                                    'ansi'),
        scopes('\x1b[1;4;3;31;44;0m',                         'ansi', 'controlchar'),
        scopes('bold, underline, italic, red fg and blue bg', 'ansi'),
        scopes('\x1b[0m',                                     'ansi', 'controlchar'),
        scopes(', normal',                                    'ansi')
      ]
    ],

    [
      'reset fg color',
      '\x1b[30mblack\x1b[39mdefault',
      [
        scopes('\x1b[30m', 'ansi', 'controlchar'),
        scopes('black',    'ansi', 'color-fg-0'),
        scopes('\x1b[39m', 'ansi', 'color-fg-0', 'controlchar'),
        scopes('default',    'ansi')
      ]
    ],
    [
      'reset bg color',
      '\x1b[40mblack\x1b[49mdefault',
      [
        scopes('\x1b[40m', 'ansi', 'controlchar'),
        scopes('black',    'ansi', 'color-bg-0'),
        scopes('\x1b[49m', 'ansi', 'color-bg-0', 'controlchar'),
        scopes('default',    'ansi')
      ]
    ],
    [
      'resets bg and fg color in order',
      '\x1b[31;44mred fg & blue bg\x1b[49mred fg\x1b[39mdefault',
      [
        scopes('\x1b[31;44m',      'ansi', 'controlchar'),
        scopes('red fg & blue bg', 'ansi', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[49m',         'ansi', 'color-fg-1', 'color-bg-4', 'controlchar'),
        scopes('red fg',           'ansi', 'color-fg-1'),
        scopes('\x1b[39m',         'ansi', 'color-fg-1', 'controlchar'),
        scopes('default',          'ansi')
      ]
    ],
    [
      'resets bg and fg color in wrong order',
      '\x1b[31;44mred fg & blue bg\x1b[39mblue bg\x1b[49mdefault',
      [
        scopes('\x1b[31;44m',      'ansi', 'controlchar'),
        scopes('red fg & blue bg', 'ansi', 'color-fg-1', 'color-bg-4'),
        scopes('\x1b[39m',         'ansi', 'color-fg-1', 'color-bg-4', 'controlchar'),
        scopes('blue bg',          'ansi', 'color-bg-4'),
        scopes('\x1b[49m',         'ansi', 'color-bg-4', 'controlchar'),
        scopes('default',          'ansi')
      ]
    ],

    [
      'skips reset underline if not underlined',
      'not \x1b[24munderline',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[24m',  'ansi', 'controlchar'),
        scopes('underline', 'ansi')
      ]
    ],
    [
      'skips reset bold if not bold',
      'not \x1b[21mbold',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[21m',  'ansi', 'controlchar'),
        scopes('bold', 'ansi')
      ]
    ],
    [
      'skips reset italic if not italic',
      'not \x1b[23mitalic',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[23m',  'ansi', 'controlchar'),
        scopes('italic', 'ansi')
      ]
    ],
    [
      'skips reset strike if not strike',
      'not \x1b[29mstrike',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[29m',  'ansi', 'controlchar'),
        scopes('strike', 'ansi')
      ]
    ],
    [
      'skips reset blink if not blink',
      'not \x1b[25mblink',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[25m',  'ansi', 'controlchar'),
        scopes('blink', 'ansi')
      ]
    ],
    [
      'skips reset hidden if not hidden',
      'not \x1b[28mhidden',
      [
        scopes('not ',      'ansi'),
        scopes('\x1b[28m',  'ansi', 'controlchar'),
        scopes('hidden', 'ansi')
      ]
    ],

    [
      'ignores other escape sequences',
      'hello \x1b[Kworld',
      [
        scopes('hello ', 'ansi'),
        scopes('\x1b[K', 'ansi', 'controlchar'),
        scopes('world',  'ansi')
      ]
    ],
    [
      'ignores other escape sequences with 0 parameter',
      'hello \x1b[0Kworld',
      [
        scopes('hello ', 'ansi'),
        scopes('\x1b[0K', 'ansi', 'controlchar'),
        scopes('world',  'ansi')
      ]
    ],
    [
      'ignores other escape sequences with 1 parameter',
      'hello \x1b[1Kworld',
      [
        scopes('hello ', 'ansi'),
        scopes('\x1b[1K', 'ansi', 'controlchar'),
        scopes('world',  'ansi')
      ]
    ],
    [
      'ignores other escape sequences with 2 parameter',
      'hello \x1b[2Kworld',
      [
        scopes('hello ', 'ansi'),
        scopes('\x1b[2K', 'ansi', 'controlchar'),
        scopes('world',  'ansi')
      ]
    ],

    [
      'safe close color',
      '[40m[2J[0;34mblue [1;32mbold green[A',
      [
        scopes('\x1b[40m',   'ansi', 'controlchar'),
        scopes('\x1b[2J',    'ansi', 'color-bg-0', 'controlchar'),
        scopes('\x1b[0;34m', 'ansi', 'color-bg-0', 'controlchar'),
        scopes('blue ',      'ansi', 'color-fg-4'),
        scopes('\x1b[1;32m', 'ansi', 'color-fg-4', 'controlchar'),
        scopes('bold green', 'ansi', 'style.bold', 'color-fg-2'),
        scopes('\x1b[A',     'ansi', 'style.bold', 'color-fg-2', 'controlchar')
      ]
    ]
  ]

  describe('tokenizeLines', () => {
    testCases.forEach(([title, lines, expected]) => {
      it(title, () => {
        const oneLiner = !Array.isArray(lines)
        const text = oneLiner ? lines : lines.join(os.EOL)
        expect(grammar.tokenizeLines(text)).toEqual(oneLiner ? [expected] : expected)
      })
    })
  })
})
