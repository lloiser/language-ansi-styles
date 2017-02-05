'use babel'

import { Colors } from './consts'

const controlChar = String.fromCharCode(27) + '['
const controlEndChar = 'm'

// TODO: open tags from previous line?
export function convert (line, ruleStack, firstLine, registry) {
  let tags = []
  const openTags = {}
  const newRuleStack = []
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
    const tag = open(scope)
    openTags[tag] = { scope, code }
  }
  function openColorFG (code, bright) {
    if (colorFG) {
      close(colorFG)
    }
    colorFG = 'color.fg.' + (bright ? 'bright.' + Colors[code - 90] : Colors[code - 30])
    openClosable(code, colorFG)
  }
  function openColorBG (code, bright) {
    if (colorBG) {
      close(colorBG)
    }
    colorBG = 'color.bg.' + (bright ? 'bright.' + Colors[code - 100] : Colors[code - 40])
    openClosable(code, colorBG)
  }

  function close (scope) {
    const tag = registry.endIdForScope(scope)
    tags.push(tag)
    delete openTags[registry.startIdForScope(scope)]
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
      colorFG = null
      colorBG = null
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
      // blink ...
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
      // bold off
      close(code, 'style.bold')
    }
    if (code === 24) {
      close(code, 'style.underline')
    }
    if (code === 23) {
      close(code, 'style.italic')
    }
    if (code === 25) {
      // blink ...
    }
    if (code === 26) {
      // 'reserved'
    }
    if (code === 27) {
      // image positive = opposite of code 7 -> fg = fg and bg = bg
    }
    if (code === 28) {
      close(code, 'style.hidden')
    }
    if (code === 29) {
      close(code, 'style.strike')
    }
    if (code > 29 && code < 38) {
      openColorFG(code, false)
    }
    if (code === 38) {
      // extended FG color (rgb)
    }
    if (code === 39) {
      // reset FG
      if (colorFG) {
        close(colorFG)
      }
      colorFG = null
    }
    if (code > 39 && code < 48) {
      openColorBG(code, false)
    }
    if (code === 48) {
      // extended BG color (rgb)
    }
    if (code === 49) {
      // reset BG
      if (colorBG) {
        close(colorBG)
      }
      colorBG = null
    }
    if (code > 89 && code < 98) {
      openColorFG(code, true)
    }
    if (code > 99 && code < 108) {
      openColorBG(code, true)
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
    codes.split(';').forEach((v) => {
      processCode(parseInt(v || '0', 10))
    })

    text = text.substring(endIndex + 1)
  }

  // add the rest of the text
  if (text.length) {
    tags.push(text.length)
  }

  newRuleStack.push({ scope: 'ansi' })

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
