import XCTest
import SwiftTreeSitter
import TreeSitterRoxygen2

final class TreeSitterRoxygen2Tests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_roxygen2())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading roxygen2 grammar")
    }
}
