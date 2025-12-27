/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // text
  TEXT: { ASSOC: prec, RANK: -100},
  // symbols
  BRACE: { ASSOC: prec, RANK: -4},
  BRACKET: { ASSOC: prec, RANK: -3},
  PARENTHESIS: { ASSOC: prec, RANK: -2},
  PUNCTUATION: { ASSOC: prec, RANK: -1},
  // comments
  COMMENT: { ASSOC: prec, RANK: 1},
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

    description: $ => repeat1(choice(
      $._link_code_chunk,
      $._inline_code_chunk,
      $._fenced_code_chunk,
      $.macro,
      $.markdown,
    )),

    markdown: $=> choice(
      $._text,
      $.punctuation,
    ),

    punctuation: $ => withPrec(PREC.PUNCTUATION, choice(
      $._open_brace,
      $._close_brace,
      $._open_bracket,
      $._close_bracket,
      $._open_parenthesis,
      $._close_parenthesis,
    )),

    // roxygen2 tags
    tag: $ => choice(
      $._generic_tag_with_single_parameter,
      $._generic_tag_with_multiple_parameters,
      $._generic_tag_with_no_parameters,
      $._section_tag,
      $._examples_tag,
      $._default_tag,
    ),

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
      alias($._tag_name_with_multiple_parameters, $.ggg_tag_name),
      optional(repeat1($.parameter)),
    ),

    _tag_name_with_multiple_parameters: _ => token(choice(
      "@keywords",
      "@method",
      "@inherit",
      "@inheritSection",
      "@aliases",
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
      optional($._block_code_chunk),
    ),

    _examples_tag_name: _ => token(choice(
      "@examples",
      "@examplesIf",
    )),

    _default_tag: $ => seq(
      $.tag_name,
      optional($.description)
    ),

    // R code chunks
    _link_code_chunk: $ => seq(
      field("open", "["),
      optional(alias($._link_code, $.code)),
      optional(field("close", token.immediate("]"))),
    ),

    _inline_code_chunk: $ => seq(
      field("open", "`"),
      optional(alias($._inline_code, $.code)),
      optional(field("close", token.immediate("`"))),
    ),

    _fenced_code_chunk: $ => seq(
      field("open", "```"),
      optional($._block_code_chunk),
      optional(field("close", token.immediate("```"))),
    ),

    _block_code_chunk: $ => repeat1(
      alias($._block_code, $.code),
    ),

    // basic tokens
    _text: $ => token(withPrec(PREC.TEXT, /[^\[\]\{\}\(\)\s\n\r]*/)),
    comment: $ => token(withPrec(PREC.COMMENT, choice("#'", "//'"))),

    // identifier tokens
    tag_name: $ => /@[a-zA-Z_]+/,
    parameter: $ => /[a-zA-Z\.\$\_0-9]+/,
    macro: $ => /\\[a-zA-Z]+/,

     // code tokens
    _inline_code: $ => token.immediate(/[^\`\n\r]+/),
    _link_code: $ => token.immediate(/[^\]\n\r]+/),
    _block_code: $ => token(withPrec(PREC.TEXT, /[^\n\r]*/)),

    // bracket symbols
    _open_brace: _ => token(withPrec(PREC.BRACE, "{")),
    _close_brace: _ => token(withPrec(PREC.BRACE, "}")),
    _open_bracket: _ => token(withPrec(PREC.BRACKET, "[")),
    _close_bracket: _ => token(withPrec(PREC.BRACKET, "]")),
    _open_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, "(")),
    _close_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, ")")),

  }
})

function withPrec(prec, rule) {
  return prec.ASSOC(prec.RANK, rule)
}
