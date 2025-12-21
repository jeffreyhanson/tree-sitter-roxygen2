/**
 * @file roxygen2 grammar for the tree-sitter parsing library
 * @author Jeffrey Owen Hanson <jeffrey.hanson@uqconnect.edu.au>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "roxygen2",

  word: $ => $.identifier,

  rules: {

    document: $ => seq(
      $._begin,
      optional($.description),
      repeat($.tag),
      $._end,
    ),

    description: $ => choice(
      seq(
        choice($._text),
        repeat(choice($._text, $._inline_tag_false_positive)),
      ),
    ),

    tag: $ => choice(
      // tags with single parameter and optional block parameter
      seq(
        alias($.tag_name_with_single_parameter, $.tag_name),
        optional($.identifier),
        optional($.description),
      ),

      // tags with multiple parameters
      seq(
        alias($.tag_name_with_multiple_parameters, $.tag_name),
        optional(repeat($.identifier)),
      ),

      // tags with block parameter
      seq(
        alias($.tag_name_with_block_parameter, $.tag_name),
        optional($.description),
      ),

      // default behavior
      seq(
        $.tag_name,
        optional($.description)
      ),
    ),

    tag_name_with_single_parameter: _ => token(choice(
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

    tag_name_with_multiple_parameters: _ => token(choice(
      "@keywords",
      "@method",
      "@inherit",
      "@inheritSection",
      "@aliases",
    )),

    tag_name_with_block_parameter: _ => token(choice(
      "@description",
      "@examples",
      "@returns",
      "@return",
      "@title",
      "@details",
      "@rawRd",
      "@references",
      "@seealso",
      "@format",
      "@examplesIf",
      "@usage",
      "@source",
      "@evalRd",
      "@eval",
    )),

    tag_name: _ => /@[a-zA-Z_]+/,

    identifier: _ => /[a-zA-Z_$][a-zA-Z_$0-9]*/,

    _text: _ => token(prec(-1, /[^*{}@\s][^*{}\n]*([^*/{}\n][^*{}\n]*\*+)*/)),

    _inline_tag_false_positive: _ => token(prec.left(1, /\{[^@}]+\}?/)),

    _begin: _ => seq("/", repeat("*")),

    _end: _ => "/",

  }
});
