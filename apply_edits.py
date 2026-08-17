import json

transcript_path = "/Users/canhphq/.gemini/antigravity-ide/brain/11702c07-8fe1-4bac-9da3-eaab5bc9a52d/.system_generated/logs/transcript_full.jsonl"
edits = []

with open(transcript_path, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            if "tool_calls" in data:
                for call in data["tool_calls"]:
                    name = call["name"]
                    if name in ["replace_file_content", "multi_replace_file_content"]:
                        args = call["args"]
                        if "page.tsx" in args.get("TargetFile", ""):
                            edits.append((name, args))
        except Exception as e:
            pass

with open("app/page.tsx", "r") as f:
    content = f.read()

# I need to checkout the fresh version first to reset
import subprocess
subprocess.run(["git", "checkout", "app/page.tsx"])
with open("app/page.tsx", "r") as f:
    content = f.read()

for i, (name, args) in enumerate(edits):
    try:
        if name == "replace_file_content":
            target = args["TargetContent"]
            repl = args["ReplacementContent"]
            if target in content:
                content = content.replace(target, repl, 1)
            else:
                print(f"Warning: Target not found in edit {i}")
        elif name == "multi_replace_file_content":
            for chunk in args["ReplacementChunks"]:
                target = chunk["TargetContent"]
                repl = chunk["ReplacementContent"]
                if target in content:
                    content = content.replace(target, repl, 1)
                else:
                    print(f"Warning: Target not found in multi-edit {i}")
    except Exception as e:
        print(f"Error applying edit {i}: {e}")

with open("app/page.tsx", "w") as f:
    f.write(content)

