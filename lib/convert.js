'use babel'

const ANSI_REGEX = require('ansi-regex')()

export function convert (line, ruleStack, firstLine, registry) {
  const state = {
    registry,
    tags: [],
    openTags: {},
    colorFG: null,
    colorBG: null
  }

  if (firstLine) {
    open(state, 'ansi')
  } else {
    // apply every open scope from the prev line
    ruleStack.forEach(({ code, scope, codes }) => {
      if (code) {
        processCode(state, code, codes || [])
      } else if (scope) {
        open(state, scope)
      }
    })
  }

  let text = line
  const matches = line.match(ANSI_REGEX) || []
  matches.forEach((match) => {
    const index = text.indexOf(match)
    if (index) {
      // add text up to the control char
      state.tags.push(index)
      text = text.substring(index)
    }

    const len = match.length
    text = text.substring(len)

    // add tags for the control chars
    open(state, 'controlchar')
    state.tags.push(len)
    close(state, 'controlchar')

    if (!match.endsWith('m')) {
      return
    }

    // process all codes
    let codes = match.substring(2, len - 1)
    if (codes.endsWith(';')) {
      codes = codes.slice(0, -1)
    }
    codes = codes.split(';')
    while (codes.length) {
      const code = parseInt(codes.shift() || '0', 10)
      const newCodes = processCode(state, code, codes)
      if (newCodes) {
        codes = newCodes
      }
    }
  })

  // add the rest of the text
  if (text.length) {
    state.tags.push(text.length)
  }

  const newRuleStack = [
    { scope: 'ansi' }
  ]

  // carry all open tags over to the next line via the rule stack
  findOpenTags(state.tags, registry.startIdForScope('ansi'))
    .forEach((tag) => {
      newRuleStack.push(state.openTags[tag])
    })

  // atom already keeps track of the already opened scopes
  // from the previous line, so remove everything that
  // came in via the rule stack
  if (ruleStack) {
    state.tags = state.tags.slice(ruleStack.length)
  }

  return {
    line,
    tags: state.tags,
    ruleStack: newRuleStack
  }
}

const codes = {
  0: (state, code) => {
    // reset = close all existing tags
    findOpenTags(state.tags, state.registry.startIdForScope('ansi'))
      .reverse()
      .forEach((tag) => {
        close(state, state.registry.scopeForId(tag))
      })
  },
  1: (state, code) => {
    openClosable(state, code, 'style.bold')
  },
  2: (state, code) => {
    openClosable(state, code, 'style.faint')
  },
  3: (state, code) => {
    openClosable(state, code, 'style.italic')
  },
  4: (state, code) => {
    openClosable(state, code, 'style.underline')
  },
  5: (state, code) => {
    openClosable(state, code, 'style.blink') // TODO: slow
  },
  6: (state, code) => {
    openClosable(state, code, 'style.blink') // TODO: fast
  },
  7: (state, code) => {
    // TODO: fg = bg and bg = fg
    // colorBG.replace(".fg.", ".bg.")
    // colorFG.replace(".bg.", ".fg.")
  },
  8: (state, code) => {
    openClosable(state, code, 'style.hidden')
  },
  9: (state, code) => {
    openClosable(state, code, 'style.strike')
  },
  10: (state, code) => {
    // TODO: default?
  },

  11: (state, code) => {
    // TODO: different fonts?
  },
  // -19

  20: (state, code) => {
    // TODO: fraktur (Gothic)
  },
  21: (state, code) => {
    safeClose(state, 'style.bold')
    // TODO: double underline?!
  },
  22: (state, code) => {
    safeClose(state, 'style.bold')
    safeClose(state, 'style.faint')
  },
  23: (state, code) => {
    safeClose(state, 'style.italic')
  },
  24: (state, code) => {
    safeClose(state, 'style.underline')
  },
  25: (state, code) => {
    safeClose(state, 'style.blink')
  },
  26: (state, code) => {
    // 'reserved'
  },
  27: (state, code) => {
    // TODO: image positive = opposite of code 7 -> fg = fg and bg = bg
    // only apply if inversed previously!
  },
  28: (state, code) => {
    safeClose(state, 'style.hidden')
  },
  29: (state, code) => {
    safeClose(state, 'style.strike')
  },

  30: (state, code) => {
    openClosable(state, code, 'color-fg-' + (code - 30))
  },
  31: 30,
  32: 30,
  33: 30,
  34: 30,
  35: 30,
  36: 30,
  37: 30,

  38: (state, code, openCodes) => {
    const next = openCodes[0]
    if (next === '5') {
      // extended extended colors
      const openTag = openClosable(state, code, 'color-fg-' + openCodes[1])
      openTag.codes = [next, openCodes[1]] // necessary to revive this code from ruleStack
      return openCodes.slice(2)
    }
    if (next === '2') {
      // extended rgb
      // TODO: how to create custom styles here in atom?
      return openCodes.slice(4)
    }
  },
  39: (state, code) => {
    // reset FG
    if (state.colorFG) {
      safeClose(state, state.colorFG)
    }
  },

  40: (state, code) => {
    openClosable(state, code, 'color-bg-' + (code - 40))
  },
  41: 40,
  42: 40,
  43: 40,
  44: 40,
  45: 40,
  46: 40,
  47: 40,

  48: (state, code, openCodes) => {
    const next = openCodes[0]
    if (next === '5') {
      // extended extended colors
      const openTag = openClosable(state, code, 'color-bg-' + openCodes[1])
      openTag.codes = [next, openCodes[1]] // necessary to revive this code from ruleStack
      return openCodes.slice(2)
    }
    if (next === '2') {
      // extended rgb
      // TODO: how to create custom styles here in atom?
      return openCodes.slice(4)
    }
  },
  49: (state, code) => {
    // reset BG
    if (state.colorBG) {
      safeClose(state, state.colorBG)
    }
  },
  50: (state, code) => {
    // 'reserved'
  },
  51: (state, code) => {
    // TODO: framed
  },
  52: (state, code) => {
    // TODO: encircled
  },
  53: (state, code) => {
    // TODO: overlined
  },
  54: (state, code) => {
    // TODO: not framed or circled
  },
  55: (state, code) => {
    // TODO: not overlined
  },
  56: (state, code) => {
    // 'reserved'
  },
  // -59

  // 60-65: hardly ever supported
  // 60: Ideogram Underline/Right Side Line
  // 61: Ideogram Double Underline/Double Right Side Line
  // 62: Ideogram Overline/Left Side Line
  // 63: Ideogram Double Overline/Double Left Side Line
  // 64: Ideogram Stress Marking
  // 65: No Ideogram Attributes

  // 65-89: nothing

  90: (state, code) => {
    openClosable(state, code, 'color-fg-' + (code - 90 + 8))
  },
  91: 90,
  92: 90,
  93: 90,
  94: 90,
  95: 90,
  96: 90,
  97: 90,
  // 98, 99: nothing
  100: (state, code) => {
    openClosable(state, code, 'color-bg-' + (code - 100 + 8))
  },
  101: 100,
  102: 100,
  103: 100,
  104: 100,
  105: 100,
  106: 100,
  107: 100
}

function processCode (state, code, openCodes) {
  let fn = codes[code]
  if (typeof fn === 'number') {
    fn = codes[fn]
  }
  return fn ? fn(state, code, openCodes) : null
}

function open (state, scope) {
  const tag = state.registry.startIdForScope(scope)
  state.tags.push(tag)
  return tag
}

function openClosable (state, code, scope) {
  // this method is used to open style/color related scopes
  // as they are intended to be closed by other codes like "0"

  if (scope.startsWith('color-fg-')) {
    if (state.colorFG) {
      safeClose(state, state.colorFG)
    }
    state.colorFG = scope
  } else if (scope.startsWith('color-bg-')) {
    if (state.colorBG) {
      safeClose(state, state.colorBG)
    }
    state.colorBG = scope
  }

  const tag = open(state, scope)
  state.openTags[tag] = { scope, code }
  return state.openTags[tag]
}

function close (state, scope) {
  const tag = state.registry.endIdForScope(scope)
  state.tags.push(tag)
  delete state.openTags[state.registry.startIdForScope(scope)]

  if (scope.startsWith('color-fg-')) {
    state.colorFG = null
  } else if (scope.startsWith('color-bg-')) {
    state.colorBG = null
  }
}

let ignoreTagsForClose
function safeClose (state, scope) {
  if (!ignoreTagsForClose) {
    ignoreTagsForClose = [
      state.registry.startIdForScope('ansi'),
      state.registry.startIdForScope('controlchar')
    ]
  }
  const startTag = state.registry.startIdForScope(scope)
  const currentOpenTags = findOpenTags(state.tags, ...ignoreTagsForClose).reverse()
  if (currentOpenTags[0] === startTag) {
    // easy, just close it
    close(state, scope)
  } else {
    // closing somewhere in the middle
    // close all tags up to the one we want to close
    // and open them afterwards again (in correct order of course...)
    const index = currentOpenTags.indexOf(startTag)
    if (index === -1) {
      return // not even in the list, skip it!
    }
    const toCloseAndOpen = currentOpenTags.slice(0, index).map((tag) => state.openTags[tag])
    toCloseAndOpen.forEach((o) => close(state, o.scope))
    close(state, scope)
    toCloseAndOpen.forEach((o) => processCode(state, o.code))
  }
}

function findOpenTags (tags, ...ignore) {
  const openTags = []
  tags.forEach((tag) => {
    if (ignore.indexOf(tag) !== -1) {
      return // ignored
    }
    if (tag % 2 === -1) {
      openTags.push(tag) // open
    } else {
      const index = openTags.indexOf(tag + 1)
      if (index !== -1) {
        openTags.splice(index, 1)
      }
    }
  })
  return openTags
}
