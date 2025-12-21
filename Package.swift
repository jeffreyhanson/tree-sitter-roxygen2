// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterRoxygen2",
    products: [
        .library(name: "TreeSitterRoxygen2", targets: ["TreeSitterRoxygen2"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterRoxygen2",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterRoxygen2Tests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterRoxygen2",
            ],
            path: "bindings/swift/TreeSitterRoxygen2Tests"
        )
    ],
    cLanguageStandard: .c11
)
