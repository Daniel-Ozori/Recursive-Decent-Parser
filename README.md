# Recursive-Decent-Parser
This repo is an a example of a parser which uses a recursive decent parsing to read a language.

It has two main programs, the lexer (scanner), and the parser.

The lexer scans the given data file and responds with a json list of tokens which contains a tag along with a corresponding lexeme for each token it recognized.

The parser takes each token and stuctures it into a simple nested json list.

The grammar for the ifdef language:

source
: (TEXT | ifdef)*
;
ifdef
: (IFDEF | IFNDEF) SYM
source
(ELIF SYM source)*
(ELSE source)?
ENDIF
;

<h1>usage</h1>

To use the parser, run 'node parser.mjs parse data.txt'

To use the lexer, run 'node parser.mjs scan data.txt'
