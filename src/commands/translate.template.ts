import * as Handlebars from 'handlebars';


const template = `
  forget everything before,
    
  starting after [CONTENT], can you replace every [TRANSLATED_LINE] with the {{language}} translation of the line before it, apply the following rules:
  * Remove emojis from the translated sentence
  * Keep the original sentence with their (whitespaces, grammars, emojis)
  * Respond only with updated CONTENT
  * Ignore the CONTENT marker in your response
  
  [CONTENT]

  {{content}}

`;

export const translateCommandTemplate = Handlebars.compile(template, {noEscape: true});
