/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // text
  TEXT: { ASSOC: prec, RANK: -100},
  CODE: { ASSOC: prec, RANK: -1},
  // symbols
  BACK_TICK: { ASSOC: prec, RANK: 0},
  BRACE: { ASSOC: prec, RANK: 0},
  BRACKET: { ASSOC: prec, RANK: 0},
  PARENTHESIS: { ASSOC: prec, RANK: 0},
  // code chunk elements
  CODE_CHUNK_ELEMENT: { ASSOC: prec, RANK: 10},
  // description elements
  MARKDOWN: { ASSOC: prec, RANK: 100},
  PUNCTUATION: { ASSOC: prec, RANK: 110},
  CODE_CHUNK: { ASSOC: prec, RANK: 120},
  MACRO: { ASSOC: prec, RANK: 130},
  LINK: { ASSOC: prec, RANK: 140},
  // tag elements
  DESCRIPTION: { ASSOC: prec, RANK: 210},
  PARAMETER: { ASSOC: prec, RANK: 220},
  TAG_NAME: { ASSOC: prec, RANK: 230},
  // tags
  TAG: { ASSOC: prec, RANK: 300},
  // comments
  COMMENT: { ASSOC: prec, RANK: 400},
}

export default grammar({
  name: "roxygen2",

  extras: $ => [
    $.comment,
    /\s/, // whitespace
  ],

  word: $ => $._text,

  rules: {

    program: $ => seq(
      optional($.description),
      repeat($.tag),
    ),

    description: $ => withPrec(PREC.DESCRIPTION, repeat1(choice(
      $.link,
      $.code_chunk,
      $.macro,
      $.markdown,
    ))),

    markdown: $ => withPrec(PREC.MARKDOWN, choice(
      $._text,
      $.punctuation,
    )),

    link: $ => withPrec(PREC.LINK, choice(
      $._link_element,
      $._formatted_link_element,
      // $._external_link_element,
    )),

    code_chunk: $ => withPrec(PREC.CODE_CHUNK, choice(
      $._inline_code_chunk,
      $._fenced_code_chunk,
    )),

    punctuation: $ => withPrec(PREC.PUNCTUATION, choice(
      $._open_brace,
      $._close_brace,
      $._open_bracket,
      $._close_bracket,
      $._open_parenthesis,
      $._close_parenthesis,
      $._back_tick,
    )),

    // roxygen2 tags
    tag: $ => withPrec(PREC.TAG, choice(
      $._generic_tag_with_single_parameter,
      $._generic_tag_with_multiple_parameters,
      $._generic_tag_with_no_parameters,
      $._section_tag,
      $._examples_tag,
      $._default_tag,
    )),

    _generic_tag_with_single_parameter: $ => seq(
      alias($._tag_name_with_single_parameter, $.tag_name),
      optional($.parameter),
      optional($.description),
    ),

    _tag_name_with_single_parameter: _ => token(choice(
      "@param",
      "@slot",
      "@field",
      "@describeIn",
      "@templateVar",
      "@inheritDotParams",
      "@concept",
      "@family",
      "@example",
      "@inheritParams",
      "@order",
      "@rdname",
      "@includeRmd",
      "@template",
      "@backref",
    )),

    _generic_tag_with_multiple_parameters: $ => seq(
      alias($._tag_name_with_multiple_parameters, $.tag_name),
      optional(repeat1($.parameter)),
    ),

    _tag_name_with_multiple_parameters: _ => token(choice(
      "@keywords",
      "@method",
      "@inherit",
      "@inheritSection",
      "@aliases",
      "@include",
    )),

    _generic_tag_with_no_parameters: $ => seq(
      alias($._tag_name_with_no_parameters, $.tag_name),
      optional($.description),
    ),

    _tag_name_with_no_parameters: _ => token(choice(
      "@description",
      "@returns",
      "@return",
      "@title",
      "@details",
      "@rawRd",
      "@references",
      "@seealso",
      "@format",
      "@usage",
      "@source",
      "@evalRd",
      "@eval",
      "@md",
      "@noMd",
    )),

    _section_tag: $ => seq(
      alias($._section_tag_name, $.tag_name),
      repeat($.parameter),
      optional(":"),
      optional($.description),
    ),

    _section_tag_name: _ => token("@section"),

    _examples_tag: $ => seq(
      alias($._examples_tag_name, $.tag_name),
      optional($._example_code_chunk),
    ),

    _examples_tag_name: _ => token(choice(
      "@examples",
      "@examplesIf",
    )),

    _default_tag: $ => seq(
      $.tag_name,
      optional($.description)
    ),

    // Brackets
    _link_element: $ => seq(
      field("open", "["),
      optional(alias($._link_code, $.code)),
      optional(field("close", token.immediate("]"))),
    ),

    _formatted_link_element: $ => seq(
      field("open", "[`"),
      optional(alias($._link_code, $.code)),
      optional(field("close", token.immediate("`]"))),
    ),

    // _external_link_element: $ => seq(
    //   field("open", "["),
    //   alias($._text, $.markdown),
    //   field("close", token.immediate("]")),
    //   field("open", "("),
    //   optional(alias($._text, $.url)),
    //   optional(field("close", token.immediate(")"))),
    // ),

    // R code chunks
    _inline_code_chunk: $ => withPrec(PREC.CODE_CHUNK_ELEMENT, seq(
      field("open", "`"),
      optional(alias($._inline_code, $.code)),
      optional(field("close", token.immediate("`"))),
    )),

    _fenced_code_chunk: $ => withPrec(PREC.CODE_CHUNK_ELEMENT, seq(
      field("open", "```"),
      optional(repeat1(alias($._fenced_code, $.code))),
      field("close", "```"),
    )),

    _example_code_chunk: $ => withPrec(PREC.CODE_CHUNK_ELEMENT, repeat1(
      $._example_code
    )),

    _example_code: $ => choice(
      seq($.macro, alias($._open_brace, $.punctuation)),
      alias($._block_code, $.code),
      alias($._close_brace, $.punctuation),
    ),

    // basic tokens
    _text: _ => token(withPrec(PREC.TEXT, /[^\[\]\{\}\(\)\s\n\r]*/)),
    _text_no_braces: _ => token(withPrec(PREC.TEXT, /[^\[\]\(\)\s\n\r]*/)),
    _text_no_parentheses: _ => token(withPrec(PREC.TEXT, /[^\[\]\(\)\s\n\r]*/)),
    _text_no_brackets: _ => token(withPrec(PREC.TEXT, /[^\{\}\(\)\s\n\r]*/)),
    comment: _ => token(withPrec(PREC.COMMENT, choice("#'", "//'"))),

    // identifier tokens
    tag_name: _ => withPrec(PREC.TAG_NAME, /@[a-zA-Z_]+/),
    parameter: _ => token(withPrec(PREC.PARAMETER, /[a-zA-Z\.\$\_0-9]+/)),
    macro: _ => token(withPrec(PREC.MACRO, /\\[a-zA-Z]+/)),

     // code tokens
    _inline_code: _ => token.immediate(/[^\`\n\r]+/),
    _link_code: _ => token.immediate(/[^\]\`\n\r]+/),
    _fenced_code: _ => token(/[^\n\r]+/),
    _block_code: _ => token(withPrec(PREC.CODE, /[^\n\r]+/)),

    // bracket symbols
    _open_brace: _ => token(withPrec(PREC.BRACE, "{")),
    _close_brace: _ => token(withPrec(PREC.BRACE, "}")),
    _open_bracket: _ => token(withPrec(PREC.BRACKET, "[")),
    _close_bracket: _ => token(withPrec(PREC.BRACKET, "]")),
    _open_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, "(")),
    _close_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, ")")),
    _back_tick: _ => token(withPrec(PREC.BACK_TICK, "`")),

  }
})

function withPrec(prec, rule) {
  return prec.ASSOC(prec.RANK, rule)
}
