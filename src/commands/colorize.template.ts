import * as Handlebars from 'handlebars';

const template = `

  forget everything before,
  
  respond with json where is the key is the lowercase hexadecimal color and their values its nearest known color name, please extract hexadecimal colors from the [CONTENT] below

  * Respond only with JSON with no other text before or after
  * Ignore the CONTENT marker in your response
  * Make sure you only respond with valid JSON
  * values should be titleized and with proper spaces

  [CONTENT]

  {{content}}

`;

export const colorizeCommandTemplate = Handlebars.compile(template, {noEscape: true});
