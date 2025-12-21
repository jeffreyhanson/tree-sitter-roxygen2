package tree_sitter_roxygen2_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_roxygen2 "github.com/jeffreyhanson/tree-sitter-roxygen2/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_roxygen2.Language())
	if language == nil {
		t.Errorf("Error loading roxygen2 grammar")
	}
}
