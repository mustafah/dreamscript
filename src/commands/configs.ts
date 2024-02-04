import * as vscode from 'vscode';

export class Configs {
    private static readonly CONFIG_NAMESPACE = 'dreamscript';

    static async getConfig(key: string, message: string = null): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_NAMESPACE);
        let configValue = config.get<string>(key);

        if (!configValue && message) {
            configValue = await vscode.window.showInputBox({
                prompt: message,
                ignoreFocusOut: true
            });

            if (configValue) {
                await config.update(key, configValue, vscode.ConfigurationTarget.Global);
            }
        }

        return configValue;
    }
}
