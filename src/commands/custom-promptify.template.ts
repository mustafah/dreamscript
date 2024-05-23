import * as Handlebars from 'handlebars';

const template = `
  forget everything before,
      
  starting after [CONTENT], can you write a better prompt for midjourney or lenardoai,
  
  also "{{promptQuery}}",

  apply the following rules:

  * the new prompt shoud have {{ maxLines }} lines maximum
  * keep lines starting with ~ or // as is
  * Respond only with updated CONTENT
  * Ignore the CONTENT marker in your response
  
  [CONTENT]

  {{content}}

`;

export const customPromptifyCommandTemplate = Handlebars.compile(template, {noEscape: true});
