import * as fs from 'fs';

export function processImportLine(line: string, promptLines: any[]) {
	const importMatch = line.match(/^~\s*import\s+(.+)$/);
	if (importMatch) {
		const filePath = importMatch[1];
		promptLines.push(handleImportStatement(filePath));
	}
}

export function handleImportStatement(filePath: string): string {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (e) {
        console.error(`Failed to read file: ${filePath}`);
        return '';
    }
}