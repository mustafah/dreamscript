tokenizer: {
      root: [
        [/[\u0600-\u06FF]+/, 'arabic-text'], // Regex for Arabic character range
        [/\/\/.*/, "comment"],
        [/\b\d+(\.\d+)?\b/, "number"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
        [/~/, "specialTilde"], // Changed token type for the ~ character
        [/C\s*\[.*\]/, "combination"],
        [/[\[]/, "array.open", "@array"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\"/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],
      variableAssignment: [[/=/, "variable", "@pop"]],
      array: [
        [/\]/, "array.close", "@pop"],
        [/"/, "string", "@string"],
        [/,/, "array.comma"],
        [/[^\],"]+/, "array.inner"],
      ]