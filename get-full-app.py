import json

app_content = ""
with open("/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/.system_generated/logs/transcript.jsonl") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("type") == "PLANNER_RESPONSE":
            continue
        
        # In case write_to_file or replace_file_content has the full content:
        if obj.get("type") == "MODEL_RESPONSE":
            calls = obj.get("tool_calls", [])
            for call in calls:
                if call.get("name") in ["default_api:write_to_file", "default_api:replace_file_content", "default_api:multi_replace_file_content"]:
                    args = call.get("arguments", {})
                    path = args.get("TargetFile", "")
                    if "App.tsx" in path:
                        if "CodeContent" in args:
                            app_content = args["CodeContent"]
                        
        if "for mobile and other devices" in str(obj):
            break

print("App content length:", len(app_content))
if len(app_content) > 0:
    lines = app_content.split("\n")
    for i, l in enumerate(lines):
        if "SCENE 3: BLOGS" in l:
            print("\n".join(lines[i:i+40]))
