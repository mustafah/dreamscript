import * as Handlebars from 'handlebars';

const template2 = `
  forget everything before,
    
  starting after [CONTENT], can you suggest an expressive emoji (or emojis) to put beofre each lines, apply the following rules:

  * keep lines starting with ~ or // as is
  * Respond only with updated CONTENT
  * Ignore the CONTENT marker in your response
  
  [CONTENT]

  {{content}}

`;

const template = `
  forget everything before,
  
  in the following JSON after [CONTENT] there are keys and empty values, fill inside values expressive emojis (up to three emojis) represengint its keys

  * Respond only with updated CONTENT
  * Ignore the CONTENT marker in your response
  * Make sure you only respond with valid JSON
  
  [CONTENT]

  {{content}}

`;

export const emojifyCommandTemplate = Handlebars.compile(template, {noEscape: true});

// in the following json there are keys and empty values, fill inside values expressive emojis (one or two emojis) represengint its keys

// ''' json

// {
// "Visualize a breathtaking 2D anime-style illustration of": "",
// "The path of souls becomes clear and what is inside them becomes clear": "",
// "The sun rises and your star goes out": ""
// }