import * as Handlebars from 'handlebars';

const template = `

	{{!-- {{ Please put the words as it and don't fix grammer or spelling issues, Please make bold (in markdown format) on the words you suspect it's ingrammatically incorrect }} --}}

	forget everything before,

	Please extract the sentences starting after [CONTENT] section, that contain the main idea of the scene, put each one of them in individual line (comma should break sentence to multiple lines, use), it shouldn't contain the artists and the sentences expressing styles
	you should differentiate between sentences expressing the idea of the scene (under // Idea), and sentences expressing scene visual setup (under // Environment)

	, apply the following rules:

	* keep any text after '~' character, and preserve its place among other statements in the document
    * 	keep any text after '//' characters from the input [CONTENT] 
	* Respond only with updated CONTENT
	* Ignore the CONTENT and OUTPUT_FORMAT marker in your response

	* Use the format inside [OUTPUT_FORMAT] section
	* Please punctuate each line, but don't end it with a fullstop or anything
	* Put an expressing emoji (emojis) before each line expressing that line

	[OUTPUT_FORMAT]

	// Idea
	sentence 1
	sentence 2
	// Environment
	sentence 1
	sentence 
	// Artists
	artist1, artist2

	[CONTENT]

	{{content}}

`;

export const formatCommandTemplate = Handlebars.compile(template, {noEscape: true});
