"""Reference checker used to validate data/canon.json when it was generated.
Usage (PowerShell):  python scripts/reference/check_canon.py data/canon.json
The real CI validator is scripts/validate-canon.ts (to be written by Claude Code); keep both rule sets in sync.
"""
import json, sys, re
import os
P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "data", "canon.json")
c = json.load(open(P, encoding="utf-8"))
errs, warns = [], []
ids = {}
for sec in ("sources", "characters", "glossary", "worldLines", "events", "transitions", "endings", "works", "disputes"):
    for o in c[sec]:
        if o["id"] in ids:
            errs.append(f"duplicate id {o['id']}")
        ids[o["id"]] = sec
for m in c["mechanics"]:
    ids[m["id"]] = "mechanics"
for e in c["sg0Branch"]["endings"]:
    ids[e["id"]] = "sg0endings"
src = {s["id"]: s for s in c["sources"]}
TIERS = [t["id"] for t in c["meta"]["spoilerTiers"]]
CONF = {"CONFIRMED", "INTERPRETATION", "UNCLEAR"}
MEDIA = set(c["meta"]["mediaKeys"])
used_src = set()

def need(i, sec_set, where):
    if i is None:
        return
    if i not in ids or ids[i] not in sec_set:
        errs.append(f"{where}: unresolved ref {i} (expected {sec_set})")

def walk(o, path, parent_tier=None):
    if isinstance(o, dict):
        tier = o.get("spoilerTier", o.get("firstSpoilerTier", parent_tier))
        if "spoilerTier" in o and o["spoilerTier"] not in TIERS:
            errs.append(f"{path}: bad tier {o['spoilerTier']}")
        if parent_tier and "spoilerTier" in o and TIERS.index(o["spoilerTier"]) < TIERS.index(parent_tier) and path.split(".")[-1].startswith(("reveals", "details")):
            errs.append(f"{path}: reveal tier below parent")
        for k, v in o.items():
            if k == "sourceIds":
                if not v:
                    errs.append(f"{path}: empty sourceIds")
                for s in v:
                    if s not in src:
                        errs.append(f"{path}: unknown source {s}")
                    else:
                        used_src.add(s)
                        if src[s]["status"] in ("failed", "search-only"):
                            errs.append(f"{path}: cites unusable source {s}")
            if k == "confidence" and v not in CONF:
                errs.append(f"{path}: bad confidence {v}")
            if k in ("media",) and isinstance(v, list):
                for m in v:
                    if m not in MEDIA:
                        errs.append(f"{path}: bad media {m}")
            if k == "characterId" or k == "characterIds":
                for x in (v if isinstance(v, list) else [v]):
                    need(x, {"characters"}, path)
            if k in ("relatedIds",):
                for x in v:
                    need(x, {"glossary"}, path)
            if k in ("keyEventIds", "dmailsSent"):
                for x in v:
                    need(x, {"events"}, path)
            if k in ("worldLineBefore", "worldLineAfter", "worldLineId", "branchWorldLineId", "forkFromWorldLineId", "from", "to") and isinstance(v, (str, type(None))):
                need(v, {"worldLines"}, path + "." + k)
            if k in ("cause", "branchEventId", "fromEventId", "toEventId", "unlocksEventId"):
                need(v, {"events"}, path + "." + k)
            if k == "transitionId":
                need(v, {"transitions"}, path)
            walk(v, f"{path}.{k}", tier)
        # fact-bearing objects
        fb = any(k in o for k in ("text", "claim", "caption", "summary", "plainLanguage", "whatIsDifferent", "outcome", "description", "role", "notes"))
        if fb and path.count(".") >= 1 and not path.startswith("sources") and "versions" not in path and "conflicts" not in path:
            if not o.get("sourceIds"):
                errs.append(f"{path}: fact-bearing object without sourceIds")
            if "confidence" not in o and not path.endswith("canonStatus"):
                errs.append(f"{path}: fact-bearing object without confidence")
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, f"{path}[{i}]", parent_tier)

for sec in ("characters", "glossary", "worldLines", "events", "transitions", "mechanics", "endings", "works", "disputes"):
    for o in c[sec]:
        walk(o, f"{sec}:{o['id']}")
        if sec in ("characters", "glossary", "worldLines", "events", "transitions", "endings"):
            if not o.get("sourceIds"): errs.append(f"{sec}:{o['id']}: top-level missing sourceIds")
            if o.get("confidence") not in CONF: errs.append(f"{sec}:{o['id']}: top-level missing confidence")
        if sec == "works":
            if not o.get("sourceIds") or o["canonStatus"].get("confidence") not in CONF: errs.append(f"works:{o['id']}: missing sources/canonStatus confidence")
        if sec == "disputes" and o.get("confidence") != "UNCLEAR": errs.append(f"disputes:{o['id']}: confidence must be UNCLEAR")
        if sec == "mechanics":
            for s in o["steps"]:
                if not s.get("sourceIds") or s.get("confidence") not in CONF: errs.append(f"mechanics:{o['id']} step {s['order']} missing")
            for s in o["commonMisconceptions"]:
                if not s.get("sourceIds") or s.get("confidence") not in CONF: errs.append(f"mechanics:{o['id']} misconception missing")
walk(c["sg0Branch"], "sg0Branch:root")
# premise-tier world lines must not expose higher-tier aliveDead without a tier
for w in c["worldLines"]:
    for lst in w["aliveDead"].values():
        for a in lst:
            if w["spoilerTier"] == "premise" and a["characterId"] == "mayuri" and "spoilerTier" not in a: errs.append(f"{w['id']}: premise line exposes untiered Mayuri fate")
    if w["spoilerTier"] == "premise" and "premiseLabel" not in w: errs.append(f"{w['id']}: premise world line needs premiseLabel")
# disputes: versions need sources
for d in c["disputes"]:
    for v in d["versions"]:
        if not v["sourceIds"]:
            errs.append(f"{d['id']}: version without source")
# timeline checks
def bounds(d):
    if d is None: return None
    if re.fullmatch(r"\d{4}", d): return (d + "-01-01", d + "-12-31")
    if re.fullmatch(r"\d{4}-\d{2}", d): return (d + "-01", d + "-31")
    return (d, d)
prev = None
for e in c["events"]:
    b = bounds(e["sortDate"])
    if prev and b and b[1] < prev[0]:
        errs.append(f"event order: {e['id']} before previous")
    if b: prev = b
seqs = [e["seq"] for e in c["events"]]
if len(seqs) != len(set(seqs)): errs.append("duplicate seq")
trans = {t["id"]: t for t in c["transitions"]}
evs = {e["id"]: e for e in c["events"]}
for e in c["events"]:
    if e["transitionId"]:
        t = trans[e["transitionId"]]
        if t["from"] != e["worldLineBefore"] or t["to"] != e["worldLineAfter"] or t["cause"] != e["id"]:
            errs.append(f"{e['id']}: transition mismatch")
    elif e["worldLineBefore"] and e["worldLineAfter"] and e["worldLineBefore"] != e["worldLineAfter"]:
        errs.append(f"{e['id']}: world line changes without transition")
for t in c["transitions"]:
    if evs[t["cause"]]["transitionId"] != t["id"]:
        errs.append(f"{t['id']}: cause event does not point back")
for w in c["worldLines"]:
    v, f = w["divergenceNumeric"], w["attractorField"]
    if v is None: continue
    if w["divergence"] is not None and float(w["divergence"]) != v: errs.append(f"{w['id']}: numeric mismatch")
    if f == "alpha" and not (0 <= v < 1): errs.append(f"{w['id']}: alpha out of band")
    if f == "beta" and not (1 <= v < 2): errs.append(f"{w['id']}: beta out of band")
    if w["id"].startswith("wl-") and w["divergence"] and w["divergence"].replace(".", "").replace("-", "") not in w["id"].replace("-", ""):
        warns.append(f"{w['id']}: id/digits mismatch")
unused = [s for s in src if s not in used_src]
print("ERRORS:", len(errs)); [print(" ", x) for x in errs[:80]]
print("WARNINGS:", len(warns)); [print(" ", x) for x in warns]
print("sources never cited:", len(unused), unused)
for k in ("sources", "characters", "glossary", "worldLines", "events", "transitions", "mechanics", "endings", "works", "disputes"):
    print(k, len(c[k]))
print("sg0Branch.endings", len(c["sg0Branch"]["endings"]))
def count_single(o):
    n = 0
    if isinstance(o, dict):
        n += 1 if o.get("singleSource") else 0
        n += sum(count_single(v) for v in o.values())
    elif isinstance(o, list):
        n += sum(count_single(v) for v in o)
    return n
print("singleSource-flagged objects", count_single(c))
sys.exit(1 if errs else 0)
