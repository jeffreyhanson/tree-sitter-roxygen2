/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // text
  TEXT: { ASSOC: prec, RANK: -100},
  TEXT_BLOCK: { ASSOC: prec, RANK: -99},
  CODE: { ASSOC: prec, RANK: -98},
  CODE_BLOCK: { ASSOC: prec, RANK: -97},
  // symbols
  BACK_TICK: { ASSOC: prec, RANK: -5},
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
      $._link_element,
      $._formatted_link_element,
      // $._external_link_element,
      $._inline_code_chunk,
      $._fenced_code_chunk,
      $.macro,
      $.markdown,
      $.punctuation,
    )),

    markdown: $ => choice(
      // $._block_text,
      $._text,
      // $.punctuation,
    ),


    punctuation: $ => withPrec(PREC.PUNCTUATION, choice(
      $._open_brace,
      $._close_brace,
      $._open_bracket,
      $._close_bracket,
      $._open_parenthesis,
      $._close_parenthesis,
      // $._back_tick,
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
      alias($._tag_name_with_multiple_parameters, $.tag_name),
      optional(repeat1($.parameter)),
      // Note that the following is a hack to ensure that we get correct
      // formatting when there is multiple roxygen2 blocks in a file
      // and the last line of one block is a generic tag with multiple
      // parameters and the first line of the subsequent block is
      // a description.
      optional($.comment),
      optional($.description),
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

    // Brackets
    _link_element: $ => seq(
      alias(field("open", "["), $.punctuation),
      optional(alias($._link_code, $.code)),
      optional(alias(field("close", token.immediate("]")), $.punctuation)),
    ),

    _formatted_link_element: $ => seq(
      alias(field("open", "[`"), $.punctuation),
      optional(alias($._link_code, $.code)),
      optional(alias(field("close", token.immediate("`]")), $.punctuation)),
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
    _inline_code_chunk: $ => seq(
      alias(field("open", "`"), $.punctuation),
      optional(alias($._inline_code, $.code)),
      optional(alias(field("close", token.immediate("`")), $.punctuation)),
    ),

    // Note that prec.left() is needed here to avoid memory leaks in Zed,
    // and these memory leaks do not appear in the tree sitter playground
    _fenced_code_chunk: $ => prec.left(seq(
      alias(field("open", "```"), $.markdown),
      $.comment,
      repeat(alias($._block_code, $.code)),
      alias(field("close", "```"), $.markdown),
    )),

    _block_code_chunk: $ => repeat1(
      choice(
        seq($.macro, $.punctuation),
        alias($._block_code, $.code),
        $.punctuation
      )
    ),

    // basic tokens
    _block_text: $ => prec.left(PREC.TEXT_BLOCK.RANK, repeat1($._text)),
    _text: _ => token(withPrec(PREC.TEXT, /[^\[\]\{\}\(\)\s\n\r]*/)),
    comment: _ => token(withPrec(PREC.COMMENT, choice("#'", "//'"))),

    // identifier tokens
    tag_name: $ => /@[a-zA-Z_]+/,
    parameter: $ => token(/[a-zA-Z\.\$\_0-9]+/),
    macro: $ => token(/\\[a-zA-Z]+/),

     // code tokens
    _inline_code: $ => withPrec(PREC.CODE, token.immediate(/[^\`\n\r]+/)),
    _link_code: $ => withPrec(PREC.CODE, token.immediate(/[^\]\`\n\r]+/)),
    _block_code: $ => token(withPrec(PREC.CODE, /[^\n\r]*/)),

    // bracket symbols
    _open_brace: _ => token(withPrec(PREC.BRACE, "{")),
    _close_brace: _ => token(withPrec(PREC.BRACE, "}")),
    _open_bracket: _ => token(withPrec(PREC.BRACKET, "[")),
    _close_bracket: _ => token(withPrec(PREC.BRACKET, "]")),
    _open_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, "(")),
    _close_parenthesis: _ => token(withPrec(PREC.PARENTHESIS, ")")),
    // _back_tick: _ => token(withPrec(PREC.BACK_TICK, "`")),

  }
})

function withPrec(prec, rule) {
  return prec.ASSOC(prec.RANK, rule)
}
