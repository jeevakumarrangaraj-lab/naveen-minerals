import os
import re

src_dir = "./src"

def scan_file(filepath):
    if "translations.ts" in filepath or "types" in filepath or "vite-env" in filepath or "firebase" in filepath:
        return []

    with open(filepath, "r") as f:
        lines = f.readlines()

    issues = []

    for idx, line in enumerate(lines, 1):
        line_str = line.strip()
        # Skip comments
        if line_str.startswith("//") or line_str.startswith("/*") or line_str.startswith("*"):
            continue

        # 1. Check raw JSX text >Text<
        # Find raw text in JSX that is not inside {t(...)}
        raw_jsx = re.findall(r'>\s*([A-Za-z][A-Za-z0-9\s,\.\?\!\'\":\-\&\(\)]{2,})\s*<', line)
        for text in raw_jsx:
            text_clean = text.strip()
            # Exclude code symbols or single numbers or brand names if any
            if not text_clean.startswith("{") and not text_clean.endswith("}"):
                issues.append((idx, "JSX Text", text_clean))

        # 2. Check attributes placeholder="...", title="...", alt="...", aria-label="..."
        attrs = re.findall(r'\b(placeholder|title|alt|aria-label)\s*=\s*"([^"]+)"', line)
        for attr, val in attrs:
            if not val.startswith("{"):
                issues.append((idx, f"Attribute {attr}", val))

        # 3. Toast/Alert strings toast.success("..."), toast.error("..."), alert("...")
        toasts = re.findall(r'\b(toast\.(?:success|error|info|warning)|alert)\s*\(\s*"([^"]+)"', line)
        for fn, msg in toasts:
            issues.append((idx, "Toast/Alert", msg))

    return issues

file_results = {}
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            full_path = os.path.join(root, file)
            file_issues = scan_file(full_path)
            file_results[full_path] = file_issues

print("=== SCAN RESULTS FOR HARDCODED USER-VISIBLE STRINGS ===")
total_issues = 0
for path, issues in sorted(file_results.items()):
    clean_path = path.replace("./src/", "")
    print(f"{clean_path}: {len(issues)}")
    if len(issues) > 0:
        for line_num, kind, text in issues:
            print(f"  Line {line_num} [{kind}]: \"{text}\"")
        total_issues += len(issues)

print(f"\nTotal hardcoded user-visible strings: {total_issues}")
