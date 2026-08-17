import json

transcript_path = "/Users/canhphq/.gemini/antigravity-ide/brain/11702c07-8fe1-4bac-9da3-eaab5bc9a52d/.system_generated/logs/transcript_full.jsonl"
with open(transcript_path, "r") as f:
    for line in f:
        data = json.loads(line)
        if "tool_calls" in data:
            print("Found tool_calls in step:", data.get("step_index"))
            for call in data["tool_calls"]:
                print("Call:", call["function"]["name"])
                args = json.loads(call["function"]["arguments"])
                if "TargetFile" in args:
                    print("TargetFile:", args["TargetFile"])
