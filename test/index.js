// Copyright 2014, 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs        = require("fs")
var assert    = require("assert")
var sourceMap = require("source-map")

var createDummySourceMap = require("../")

function assertMappings(tokens, mappings, type) {
  var map
  if (type) {
    map = createDummySourceMap(tokens.join(""), {source: "test.file", type: type})
  } else {
    map = createDummySourceMap(tokens, {source: "test.file"})
  }

  var index = 0
  new sourceMap.SourceMapConsumer(map).eachMapping(function(mapping) {
    var expectedMapping = mappings[index]
    var line   = expectedMapping[0]
    var column = expectedMapping[1]

    assert.equal( mapping.source,          "test.file" )
    assert.equal( mapping.generatedLine,   line        )
    assert.equal( mapping.generatedColumn, column      )
    assert.equal( mapping.originalLine,    line        )
    assert.equal( mapping.originalColumn,  column      )
    assert.equal( mapping.name,            null        )

    index++
  })
}

function fileSpotCheck(file, type, mappings) {
  var code = fs.readFileSync("test/fixtures/" + file).toString()

  var map = createDummySourceMap(code, {source: file, type: type})
  map = new sourceMap.SourceMapConsumer(map)

  mappings.forEach(function(mapping) {
    var line           = mapping[0]
    var column         = mapping[1]
    var originalColumn = mapping[2]

    var original = map.originalPositionFor({
      line: line,
      column: column
    })

    if (originalColumn === null) {
      assert.equal( original.source, null )
      assert.equal( original.line,   null )
      assert.equal( original.column, null )
      assert.equal( original.name,   null )
    } else {
      assert.equal( original.source, file           )
      assert.equal( original.line,   line           )
      assert.equal( original.column, originalColumn )
      assert.equal( original.name,   null           )
    }
  })
}


describe("createDummySourceMap", function() {

  it("is a function", function() {
    assert.equal(typeof createDummySourceMap, "function")
  })


  it("throws an error if the first argument is missing", function() {
    assert.throws(createDummySourceMap, /array.+string.+required.+undefined/)
  })


  it("throws an error if the source isn’t provided", function() {
    assert.throws(function() {
      createDummySourceMap([])
    }, /source.+required.+undefined/)

    assert.throws(function() {
      createDummySourceMap("", {type: "js"})
    }, /source.+required.+undefined/)
  })


  it("throws an error if a string is passed in, and the type is invalid", function() {
    assert.throws(function() {
      createDummySourceMap("")
    }, /string.+type.+undefined/)

    assert.throws(function() {
      createDummySourceMap("", {type: "html"})
    }, /string.+type.+html/)
  })


  it("sets `file` to the basename of the source", function() {
    var map

    map = createDummySourceMap([], {source: "foo.js"})
    assert.equal(map.file, "foo.js")

    map = createDummySourceMap([], {source: "/path/to/foo.js"})
    assert.equal(map.file, "foo.js")
  })


  it("maps a simple line", function() {
    assertMappings(
      ["a",   "b",   "c"  ],
      [[1,0], [1,1], [1,2]]
    )
  })


  it("ignores blank tokens", function() {
    assertMappings(
      ["Hello", "", ",", " ", "World", "!", "\n"],
      [[1,0],       [1,5],    [1,7],   [1,12]   ]
    )

    assertMappings(
      ["   ", "a"  ],
      [       [1,3]]
    )

    assertMappings(
      ["", "\t", "  \n"],
      [                ]
    )
  })


  it("works with multiline input", function() {
    assertMappings(
      ["a", "\n  ", "b",   "c\rd\r\ne", "f"  ],
      [[1,0],       [2,2], [2,3],       [4,1]]
    )
  })


  it("works with an empty array", function() {
    assertMappings(
      [],
      []
    )
  })


  it("tokenizes JavaScript", function() {
    assertMappings(
      ["var", " ", "foo", "=",   "function", "(",    ")",    "{",
       "\n  ", "return", " ", "0",
       "\n", "}"                                                    ],
      [[1,0],      [1,4], [1,7], [1,8],      [1,16], [1,17], [1,18],
               [2,2],         [2,9],
             [3,0]                                                  ],
      "js"
    )
  })


  it("tokenizes CSS", function() {
    assertMappings(
      ["#foo", "[",   "attr", "=",   "'value'", "]",    "{",
       "\n  ", "margin", ":", " ", "0",
       "\n", "}"                                                     ],
      [[1,0],  [1,4], [1,5],  [1,9], [1,10],    [1,17], [1,18],
               [2,2],    [2,8],    [2,10],
             [3,0]                                                   ],
      "css"
    )
  })


  it("tokenizes a JavaScript file", function() {
    fileSpotCheck("base64.js", "js", [
      [1,0,0],     // First character. Multi-line comment (continues on the next line).
      [2,2,null],  // Mappings are only added at the beginning of tokens, even multi-line ones.
      [6,24,22],   // Inside variable `exports`.
      [10,2,null], // Inside indentation.
      [17,15,14],  // Inside `||` operator.
      [31,13,8],   // Inside `throw`.
      [42,28,26],  // Inside regex.
      [55,37,37],  // At method `fromCharCode`.
      [63,4,4]     // Last character.
    ])
  })


  it("tokenizes a CSS file", function() {
    fileSpotCheck("sample.css", "css", [
      [1,0,0],     // First character. `@`.
      [1,26,15],   // Inside unquoted url.
      [3,2,0],     // Inside multi-line comment (continues on the next line).
      [4,12,null], // Mappings are only added at the beginning of tokens, even multi-line ones.
      [8,1,0],     // Inside namespace prefix.
      [11,31,30],  // Inside `^=` operator.
      [13,9,0],    // Inside name with escape.
      [14,2,0],    // Inside id.
      [15,11,9],   // Inside hex color.
      [18,15,11],  // Inside number with exponent.
      [21,14,2],   // Inside vendor prefixed property name.
      [22,38,11],  // Inside string within string.
      [27,20,20],  // At `%`.
      [35,0,0]     // Last character. `}`.
    ])
  })

})
