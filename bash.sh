percent="100%"
progressive=False
chunk="None"
question="

    hello

"

file_list="

    C:\Users\mohamus03\Projects\dreamscript\src\extension.ts

"

python 'c:\Users\mohamus03\.vscode-insiders\extensions\undefined_publisher.windows-code-prompt-0.0.1\chat-gpt\chat-gpt.py' $percent "$(echo "$question")" $progressive $(echo "$file_list")