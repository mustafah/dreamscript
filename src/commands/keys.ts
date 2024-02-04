import * as vscode from 'vscode';
import { Globals } from '../globals';

export class Keys {

    static async getSecret(key: string, name: string, help: string = null): Promise<string | undefined> {
        const secrets = Globals.extensionContext.secrets;
        let secret = await secrets.get(key);
        if (!secret) {
            secret = await vscode.window.showInputBox({
                title: `Enter your ${name} (${help})`,
                password: true
            });
            if (secret) {
                await secrets.store(key, secret);
            }
        }
        return secret;
    }

    static async storeSecret(key: string, value: string) {
        const secrets = Globals.extensionContext.secrets;
        await secrets.store(key, value);
    }

    static async removeKey(key: string) {
        const secrets = Globals.extensionContext.secrets;
        await secrets.delete(key);
    }
}