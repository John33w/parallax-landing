import json
with open("/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/.system_generated/logs/transcript.jsonl") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("type") == "CODE_ACTION":
            content = obj.get("content", "")
            if "for mobile and other devices" in content: break
            if "replace_file_content" in content and "App.tsx" in content:
                last_app_content = content
print(last_app_content)
