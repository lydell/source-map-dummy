// Copyright 2014, 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var path      = require("path")
var jsTokens  = require("js-tokens")
var cssTokens = require("css-tokens")
var sourceMap = require("source-map")

var blank = /^\s*$/
var newline = /\r\n?|\n/

function createDummySourceMap(tokens, options) {
  options = options || {}

  if (typeof tokens === "string") {
    switch (options.type) {
      case "js":
        tokens = tokens.match(jsTokens)
        break
      case "css":
        tokens = tokens.match(cssTokens)
        break
      default:
        throw new Error("If you pass in a string, you must set `options.type` to either " +
                        "`js` or `css`. Got: " + options.type)
    }
  } else if (!Array.isArray(tokens)) {
    throw new Error("Either an array of tokens, or a string of JavaScript or CSS is required. " +
                    "Got: " + tokens)
  }

  if (!options.source) {
    throw new Error("`options.source` is required. Got: " + options.source)
  }

  var map = new sourceMap.SourceMapGenerator({ file: path.basename(options.source) })

  var line = 1
  var column = 0

  tokens.forEach(function(token) {
    if (!blank.test(token)) {
      map.addMapping({
        generated: {
          line: line,
          column: column
        },
        original: {
          line: line,
          column: column
        },
        source: options.source
      })
    }

    var lines = token.split(newline)
    var lastLine = lines.pop()
    var addedLines = lines.length
    if (addedLines) {
      line += addedLines
      column = lastLine.length
    } else {
      column += lastLine.length
    }
  })

  return map.toJSON()
}

module.exports = createDummySourceMap
