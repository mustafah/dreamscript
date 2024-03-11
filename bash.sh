percent="100%"
progressive=False
chunk="None"
question="

    please before 'this.promptLines.push(line)' removing commas at the end of this line
    
"

file_list="

    C:\Users\mohamus03\Projects\dreamscript\src\commands\dreamscript.compiler.ts

"

python 'c:\Users\mohamus03\.vscode-insiders\extensions\undefined_publisher.windows-code-prompt-0.0.1\chat-gpt\chat-gpt.py' $percent "$(echo "$question")" $progressive $(echo "$file_list")