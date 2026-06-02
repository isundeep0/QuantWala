import json, glob, sys, os, importlib.util

spec = importlib.util.spec_from_file_location("d", sys.argv[1])
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
SOLS = m.SOLS

# Resolve the content directory relative to the repo root so this script can be
# run from anywhere (it lives in tools/solution-authoring/).
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONTENT_GLOB = os.path.join(REPO_ROOT, "content", "algorithms", "*", "*.json")

paths = {}
for f in glob.glob(CONTENT_GLOB):
    paths[json.load(open(f))["slug"]] = f

applied = 0
missing = []
for slug, probs in SOLS.items():
    if slug not in paths:
        missing.append(slug)
        continue
    f = paths[slug]
    d = json.load(open(f))
    byid = {p["id"]: p for p in d["problems"]}
    for pid, s in probs.items():
        if pid not in byid:
            missing.append(f"{slug}:{pid}")
            continue
        sol = {"approach": s["approach"]}
        if s.get("time") or s.get("space"):
            sol["complexity"] = {"time": s.get("time", ""), "space": s.get("space", "")}
        codes = []
        if s.get("cpp"):
            codes.append({"language": "cpp", "title": s.get("cppTitle", "solution.cpp"), "source": s["cpp"].strip("\n")})
        if s.get("python"):
            codes.append({"language": "python", "title": s.get("pyTitle", "solution.py"), "source": s["python"].strip("\n")})
        sol["codes"] = codes
        byid[pid]["solution"] = sol
        applied += 1
    json.dump(d, open(f, "w"), indent=2, ensure_ascii=False)
    open(f, "a").write("\n")
print("applied:", applied, "missing:", missing or "none")
