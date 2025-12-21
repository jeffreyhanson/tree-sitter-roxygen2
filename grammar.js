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
      optional($.description),
      repeat($.tag),
    ),

    extras: _ => [
      token(choice(
        // Skip over "#' " or "//' " at the beginnings of lines
        seq(/\n/, /[ \t]*/, choice("#'", "//'")),
        /\s/,
      )),
    ],

    externals: _ => [
      $._begin,
      $._end,
      $._newline,
      $._raw_string_literal,
      $._external_open_parenthesis,
      $._external_close_parenthesis,
      $._external_open_brace,
      $._external_close_brace,
      $._external_open_bracket,
      $._external_close_bracket,
      $._external_open_bracket2,
      $._external_close_bracket2,
      $._error_sentinel
    ],

    description: $ => repeat($._text),

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
        optional(repeat1($.identifier)),
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

    identifier: $ => /[a-zA-Z_$][a-zA-Z_$0-9]*/,

    tag_name: _ => /@[a-zA-Z_]+/,

    _text: _ => token(prec(-1, /[^*{}@\s][^*{}\n]*([^*/{}\n][^*{}\n]*\*+)*/)),

  }
});
