percent="100%"
progressive=False
chunk="None"

question="

   We want a add a watch mode to the controller so when new points added to the Controller and watch mode is Watching it should call CallEngine method

"

file_list="

    C:\Users\mohamus03\Projects\FEGeosteeringUI\Playground\Controller.cs
    
    # C:\Users\mohamus03\Projects\FEGeosteeringUI\Addin_Gridding\Sources\Gridding.Application.Logic\Postlanding\Postlanding_FeatureController.cs
    # C:\Users\mohamus03\Projects\FEGeosteeringUI\Playground\Stream.cs
    # C:\Users\mohamus03\Projects\FEGeosteeringUI\Addin_Gridding\Sources\Gridding.Application.Logic\Utils\Stream.cs
    # 

    # /Users/mustafah/Projects/dreamscript/src/commands/llm.ts
    # /Users/mustafah/Desktop/FastDtw.CSharp/Playground/SensorySeries.cs
    #

"

python 'c:\Users\mohamus03\.vscode\extensions\undefined_publisher.windows-code-prompt-0.0.5\chat-gpt\chat-gpt.py' $percent "$(echo $question)" $progressive $(echo "$file_list")