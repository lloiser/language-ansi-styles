'use babel'

import { Colors } from './consts'

const controlChar = String.fromCharCode(27) + '['
const controlEndChar = 'm'

export function convert (line, ruleStack, firstLine, registry) {
  let tags = []
  const openTags = {}
  let colorFG
  let colorBG

  function open (scope) {
    const tag = registry.startIdForScope(scope)
    tags.push(tag)
    return tag
  }
  function openClosable (code, scope) {
    // this method is used to open style/color related scopes
    // as they are intended to be closed by other codes like "0"

    if (scope.startsWith('color.fg.')) {
      if (colorFG) {
        close(colorFG)
      }
      colorFG = scope
    } else if (scope.startsWith('color.bg.')) {
      if (colorBG) {
        close(colorBG)
      }
      colorBG = scope
    }

    const tag = open(scope)
    openTags[tag] = { scope, code }
  }

  const ignoreTagsForClose = [
    registry.startIdForScope('ansi'),
    registry.startIdForScope('controlchar')
  ]
  function close (scope) {
    const tag = registry.endIdForScope(scope)
    tags.push(tag)
    delete openTags[registry.startIdForScope(scope)]

    if (scope.startsWith('color.fg.')) {
      colorFG = null
    } else if (scope.startsWith('color.bg.')) {
      colorBG = null
    }
  }
  function safeClose (scope) {
    const startTag = registry.startIdForScope(scope)
    const currentOpenTags = findOpenTags(tags, ...ignoreTagsForClose).reverse()
    if (currentOpenTags[0] === startTag) {
      // easy, just close it
      close(scope)
    } else {
      // closing somewhere in the middle
      // close all tags up to the one we want to close
      // and open them afterwards again (in correct order of course...)
      const index = currentOpenTags.indexOf(startTag)
      if (index === -1) {
        return // not even in the list, skip it!
      }
      const toCloseAndOpen = currentOpenTags.slice(0, index).map((tag) => openTags[tag])
      toCloseAndOpen.forEach((o) => close(o.scope))
      close(scope)
      toCloseAndOpen.forEach((o) => processCode(o.code))
    }
  }

  // TODO: refactor to a simple object with codes?
  function processCode (code) {
    if (code === 0) {
      // reset = close all existing tags
      // tags.filter((tag) => openTags[tag])
      findOpenTags(tags, registry.startIdForScope('ansi'))
        .reverse()
        .forEach((tag) => {
          close(registry.scopeForId(tag))
        })
    }
    if (code === 1) {
      openClosable(code, 'style.bold')
    }
    if (code === 2) {
      // TODO?
    }
    if (code === 3) {
      openClosable(code, 'style.italic')
    }
    if (code === 4) {
      openClosable(code, 'style.underline')
    }
    if ((code > 4 && code < 7)) {
      openClosable(code, 'style.blink')
    }
    if (code === 7) {
      // TODO: fg = bg and bg = fg
      // colorBG.replace(".fg.", ".bg.")
      // colorFG.replace(".bg.", ".fg.")
    }
    if (code === 8) {
      // conceal - hide...
      openClosable(code, 'style.hidden')
    }
    if (code === 9) {
      openClosable(code, 'style.strike')
    }
    if (code === 10) {
      // TODO: default?
    }
    if (code > 10 && code < 20) {
      // TODO: different fonts?
    }
    if (code === 20) {
      // TODO: fraktur ???
    }
    if (code === 21) {
      safeClose('style.bold')
    }
    if (code === 24) {
      safeClose('style.underline')
    }
    if (code === 23) {
      safeClose('style.italic')
    }
    if (code === 25) {
      safeClose('style.blink')
    }
    if (code === 26) {
      // 'reserved'
    }
    if (code === 27) {
      // image positive = opposite of code 7 -> fg = fg and bg = bg
    }
    if (code === 28) {
      safeClose('style.hidden')
    }
    if (code === 29) {
      safeClose('style.strike')
    }
    if (code > 29 && code < 38) {
      openClosable(code, 'color.fg.' + Colors[code - 30])
    }
    if (code === 38) {
      // TODO: extended FG color (rgb)
    }
    if (code === 39) {
      // reset FG
      if (colorFG) {
        safeClose(colorFG)
      }
      colorFG = null
    }
    if (code > 39 && code < 48) {
      openClosable(code, 'color.bg.' + Colors[code - 40])
    }
    if (code === 48) {
      // TODO: extended BG color (rgb)
    }
    if (code === 49) {
      // reset BG
      if (colorBG) {
        safeClose(colorBG)
      }
      colorBG = null
    }
    if (code > 89 && code < 98) {
      openClosable(code, 'color.fg.bright.' + Colors[code - 90])
    }
    if (code > 99 && code < 108) {
      openClosable(code, 'color.bg.bright.' + Colors[code - 100])
    }
  }

  if (firstLine) {
    open('ansi')
  } else {
    // apply every open scope from the prev line
    ruleStack.forEach(({ code, scope }) => {
      if (code) {
        processCode(code)
      } else if (scope) {
        open(scope)
      }
    })
  }

  let text = line
  while (text.length > 0) {
    const index = text.indexOf(controlChar)
    if (index === -1) {
      break
    }

    if (index) {
      // add text up to the control char
      tags.push(index)
    }

    text = text.substring(index)

    // find the end of control
    // TODO: make sure to capture K and other control chars too but ignore them
    const endIndex = text.indexOf(controlEndChar)
    if (endIndex === -1) {
      break
    }

    let codes = text.substring(0, endIndex + 1)

    // add tags for the control chars
    open('controlchar')
    tags.push(codes.length)
    close('controlchar')

    // process all codes
    codes = codes.substring(2, codes.length - 1)
    if (codes.endsWith(';')) {
      codes = codes.slice(0, -1)
    }
    codes.split(';').forEach((v) => {
      processCode(parseInt(v || '0', 10))
    })

    text = text.substring(endIndex + 1)
  }

  // add the rest of the text
  if (text.length) {
    tags.push(text.length)
  }

  const newRuleStack = [
    { scope: 'ansi' }
  ]

  // carry all open tags over to the next line via the rule stack
  // tags.filter((tag) => openTags[tag])
  findOpenTags(tags, registry.startIdForScope('ansi'))
    .forEach((tag) => {
      newRuleStack.push(openTags[tag])
    })

  // atom already keeps track of the already opened scopes
  // from the previous line, so remove everything that
  // came in via the rule stack
  if (ruleStack) {
    tags = tags.slice(ruleStack.length)
  }

  return {
    line,
    tags,
    ruleStack: newRuleStack
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
