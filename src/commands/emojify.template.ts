import * as Handlebars from 'handlebars';

const template = `
  forget everything before,
    
  starting after [CONTENT], can you suggest an expressive emoji (or emojis) to put beofre each lines, apply the following rules:

  * keep lines starting with ~ or // as is
  * Respond only with updated CONTENT
  * Ignore the CONTENT marker in your response
  
  [CONTENT]

  {{content}}

`;

export const emojifyCommandTemplate = Handlebars.compile(template, {noEscape: true});
