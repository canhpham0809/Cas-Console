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
                    if name in ["replace_file_content", "write_to_file", "multi_replace_file_content"]:
                        args = call["args"]
                        if "page.tsx" in args.get("TargetFile", ""):
                            edits.append((name, args))
        except Exception as e:
            pass

print(f"Found {len(edits)} edits to page.tsx")
for idx, (name, args) in enumerate(edits):
    print(f"{idx}: {name}")
