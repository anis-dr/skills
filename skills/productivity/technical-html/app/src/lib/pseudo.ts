// TextMate grammar for ```pseudo fences: keywords, constants, calls, strings, numbers, comments and operators get the
// standard scopes the Pierre themes colour; every other word stays plain text. Registered in pierre.ts.
import type { LanguageRegistration } from "shiki";

const words = (list: string) => `\\b(?:${list.split(" ").join("|")})\\b`;
const keywords = "if else elif then for each in while until return break continue on when await async try catch finally throw and or not is new emit call let set match case end";

const pseudo: LanguageRegistration = {
  name: "pseudo",
  scopeName: "source.pseudo",
  repository: {},
  patterns: [
    { name: "comment.line.pseudo", match: /(?:#|\/\/).*$/.source },
    { name: "string.quoted.double.pseudo", match: /"(?:[^"\\]|\\.)*"/.source },
    { name: "string.quoted.single.pseudo", match: /'(?:[^'\\]|\\.)*'/.source },
    { name: "keyword.control.pseudo", match: words(keywords) },
    { name: "constant.language.pseudo", match: words("true false null none nil") },
    { name: "constant.numeric.pseudo", match: /\b\d+(?:\.\d+)?\b/.source },
    { name: "entity.name.function.pseudo", match: /\b[A-Za-z_][\w.]*(?=\()/.source },
    { name: "keyword.operator.arrow.pseudo", match: /->|=>/.source },
    { name: "keyword.operator.comparison.pseudo", match: /==|!=|<=|>=|<|>/.source },
    { name: "keyword.operator.assignment.pseudo", match: /=/.source },
    { name: "keyword.operator.arithmetic.pseudo", match: /[+-]/.source },
  ],
};

export default [pseudo];
