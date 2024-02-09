import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

class DreamScriptCompiler {
    private promptLines: string[] = [];
    private variables: any = {};

    constructor(private input: string) {}

    compile() {
        const lines = this.input.split('\n');
        for (let line of lines) {
            line = line.trim();
            line = line.replace(/\/\/.*/, '');
            if (!this.processLine(line)) {
                this.promptLines.push(line);
            }
        }
        this.variables.prompt = this.promptLines.join('\n');
        return this.variables;
    }

    private processLine(line: string): boolean {
        return this.processImportLine(line) || this.processAssignmentLine(line);
    }

    private processImportLine(line: string): boolean {
        const importMatch = line.match(/^\s*~\s*import\s+(.+)$/);
        if (importMatch) {
            const filePath = importMatch[1];
            this.promptLines.push(this.handleImportStatement(filePath));
            return true;
        }
        return false;
    }
    
    private handleImportStatement(filePath: string): string {
            // Resolve the file path relative to the workspace root
            const workspaceFolders = vscode.workspace.workspaceFolders;
            let fullPath = filePath;
        try {
            if (workspaceFolders && !path.isAbsolute(filePath)) {
                fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
            }
    
            return fs.readFileSync(fullPath, 'utf8');
        } catch (e) {
            console.error(`Failed to read file: ${fullPath}`);
            return '';
        }
    }

    private processAssignmentLine(line: string): boolean {
        const assignmentMatch = line.match(/^\s*~\s*(\w+)\s*=\s*(.+)$/);
        if (assignmentMatch) {
            const variableName = assignmentMatch[1];
            const expression = assignmentMatch[2];
            try {
                this.variables[variableName] = eval(expression);
            } catch (e) {
                this.variables[variableName] = expression;
                // console.error(`Failed to evaluate expression: ${expression}`);
            }
            return true;
        }
        return false;
    }
}

export default DreamScriptCompiler;
