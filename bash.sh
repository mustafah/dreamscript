percent="100%"
progressive=False
chunk="None"
question="

    JsGoogleTranslateFree is imported as undefined although I installed it !

"

file_list="

    C:\Users\mohamus03\Projects\dreamscript\src\commands\translate.command.ts
    C:\Users\mohamus03\Projects\dreamscript\package.json

"

python 'c:\Users\mohamus03\.vscode-insiders\extensions\undefined_publisher.windows-code-prompt-0.0.1\chat-gpt\chat-gpt.py' $percent "$(echo "$question")" $progressive $(echo "$file_list")