Overview [![Build Status](https://travis-ci.org/lydell/source-map-dummy.svg?branch=master)](https://travis-ci.org/lydell/source-map-dummy)
========

Creates “dummy” source maps.

```js
var createDummySourceMap = require("source-map-dummy")

createDummySourceMap(
  ["Hello", ",", " ", "World", "!"],
  {source: "path/to/helloWorld.txt"}
)
// {
//   file: "helloWorld.txt",
//   version: 3,
//   mappings: "...",
//   sources: ["path/to/helloWorld.txt"],
//   names: []
// }

createDummySourceMap(
  "var foo = bar;",
  {source: "path/to/foo.js", type: "js"}
)
// {
//   file: "foo.js",
//   version: 3,
//   mappings: "...",
//   sources: ["path/to/foo.js"],
//   names: []
// }
```


Installation
============

`npm install source-map-dummy`

```js
var createDummySourceMap = require("source-map-dummy")
```


Usage
=====

### `createDummySourceMap(tokens, options)` ###

Creates a “dummy” source map for `tokens`, which is an array of strings. One
mapping will be added per token, except blank ones. Each mapping maps back to
itself.

First tokenize your source code into an array. Then pass that array to
`createDummySourceMap`. This way it works with any type of source code.

In reality, source maps are only used for JavaScript and CSS. Therefore you may
also pass a string of either JavaScript or CSS, that will be tokenized for you.

`options`:

- `source`: Required. The path to the file containing `code`. All mappings will
  point to this source.
- `type`: Required if `tokens` is a string. Set it to `js` if `tokens` is a
  string of JavaScript, and to `css` if it is CSS.


License
=======

[The X11 (“MIT”) License](LICENSE).
