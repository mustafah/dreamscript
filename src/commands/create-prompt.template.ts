import * as Handlebars from 'handlebars';

const template = `
  forget everything before,
      
  inspired by what's written after [CONTENT], can you write a new prompt for midjourney or lenardoai, apply the following rules:

  * the new prompt shoud have {{ maxLines }} lines maximum
  * Respond only with created prompt
  * Ignore the CONTENT marker in your response
    
  [CONTENT]

  {{content}}

`;

export const createPromptCommandTemplate = Handlebars.compile(template, {noEscape: true});
