/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100, // Wrap lines at 100 characters
  tabWidth: 4, // Use 4 spaces for indentation
  useTabs: false, // Use spaces instead of tabs
  semi: true, // Add semicolons at the ends of statements
  singleQuote: true, // Use single quotes instead of double quotes
  quoteProps: "as-needed", // Only quote object properties when necessary
  jsxSingleQuote: false, // Use double quotes in JSX attributes
  trailingComma: "all", // Add trailing commas wherever possible (ES5+)
  bracketSpacing: true, // Print spaces between brackets in object literals
  bracketSameLine: false, // Put the `>` of a multi-line JSX element on the next line
  arrowParens: "always", // Always include parentheses around arrow function parameters
  proseWrap: "preserve", // Don’t wrap markdown text
  endOfLine: "lf", // Use line-feed only (\n) for line endings
  embeddedLanguageFormatting: "auto", // Format embedded code (like in markdown/code blocks)

  // JSX-specific formatting
  jsxSingleQuote: false, // Use double quotes in JSX attributes
  bracketSameLine: false, // Put the `>` of a multi-line JSX element on the next line
};
