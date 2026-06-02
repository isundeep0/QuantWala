#!/usr/bin/env python3
"""
Build the Module 4 "Road to Candidate Master" roadmap from the LIVE Codeforces
problemset.

Why this exists
---------------
Module 4 is a Codeforces-only practice ladder that picks up where the Module 1
algorithms course ends. Every problem in it is a REAL Codeforces problem, pulled
from the public API (https://codeforces.com/api/problemset.problems), so links,
ratings and tags are always accurate. We never invent problem IDs.

Curation strategy
-----------------
The roadmap is authored here as a list of PHASES (rating tiers aligned to the
Codeforces rank ladder) -> THEMES (a recognizable problem *pattern*, each mapped
back to the exact Module 1 lessons that teach the underlying algorithm). For
each theme we:

  1. keep only rated problems whose tag set satisfies the theme filter,
  2. split the theme's rating window into sub-bands so the ladder ramps up,
  3. inside each sub-band rank by `solvedCount` (a strong proxy for "famous,
     well-tested, worth-doing" problems) and take the top few,
  4. sort the final ladder ascending by rating,
  5. globally de-duplicate so a problem appears in exactly one theme.

The authored prose (signals / technique / trap) is what builds *pattern
recognition* — the thing that actually moves you up the rating ladder.

Run:  python3 tools/cp-roadmap/build_roadmap.py
Out:  content/cp/roadmap.json
"""

import json
import os
import sys
import urllib.request
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(REPO, "content", "cp", "roadmap.json")
CACHE = "/tmp/cf_problems.json"
API = "https://codeforces.com/api/problemset.problems"


# --------------------------------------------------------------------------- #
#  Data loading
# --------------------------------------------------------------------------- #
def load_problems():
    raw = None
    if os.path.exists(CACHE):
        try:
            with open(CACHE) as f:
                raw = json.load(f)
        except Exception:
            raw = None
    if raw is None:
        print("Downloading Codeforces problemset ...", file=sys.stderr)
        req = urllib.request.Request(API, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = json.loads(resp.read().decode())
        with open(CACHE, "w") as f:
            json.dump(raw, f)
    if raw.get("status") != "OK":
        raise SystemExit("Codeforces API did not return OK")
    res = raw["result"]
    solved = {(s["contestId"], s["index"]): s.get("solvedCount", 0)
              for s in res["problemStatistics"]}
    out = []
    for p in res["problems"]:
        cid, idx = p.get("contestId"), p.get("index")
        if cid is None or idx is None:
            continue
        if not p.get("rating"):
            continue
        out.append({
            "contestId": cid,
            "index": idx,
            "name": p["name"],
            "rating": p["rating"],
            "tags": set(p.get("tags", [])),
            "solved": solved.get((cid, idx), 0),
        })
    return out


def link(p):
    return f"https://codeforces.com/problemset/problem/{p['contestId']}/{p['index']}"


# --------------------------------------------------------------------------- #
#  Roadmap authoring
# --------------------------------------------------------------------------- #
# Each theme:
#   id, title, icon (lucide name), lessons (Module 1 slugs),
#   require (tags that must ALL be present) / any (at least one present),
#   exclude (skip if any present), band [lo, hi], sub (sub-band width),
#   per (problems per sub-band), cap (max problems), blurb, signals[],
#   technique, trap, goal.
#
# `pick_problems` does the selection; everything else is shown verbatim in the UI.

PHASES = [
    {
        "id": "foundations",
        "title": "Foundations",
        "rank": "Newbie → Pupil",
        "ratingLabel": "800 – 1100",
        "color": "#22c55e",
        "summary": "Get fast and accurate at the basics. The whole game here is reading "
                   "carefully, coding cleanly, and not failing on edge cases. Aim to solve "
                   "A/B of most Div.2 rounds on autopilot.",
        "themes": [
            {
                "id": "implementation",
                "title": "Implementation & Simulation",
                "icon": "Layers",
                "lessons": ["two-pointers"],
                "any": ["implementation"],
                "band": [800, 1100], "sub": 100, "per": 4, "cap": 12,
                "blurb": "Most Div.2 A/B problems are just 'do exactly what the statement says, "
                         "without bugs'. Speed and correctness here free up your clock for the "
                         "harder problems later in the round.",
                "signals": [
                    "The statement describes a concrete process step by step.",
                    "Small constraints (n ≤ 2·10^5, often much smaller) and no obvious 'trick'.",
                    "You can already see the answer — the only risk is an off-by-one or an edge case.",
                ],
                "technique": "Translate the statement into code literally, then hunt edge cases: "
                             "empty input, n = 1, all-equal elements, max values (watch overflow → use 64-bit).",
                "trap": "Rushing and missing a corner case. Re-read the constraints and the output "
                        "format before submitting; a single wrong-answer on pretest 2 costs more time than a careful read.",
                "goal": "Solve these in under 10 minutes each with zero penalty.",
            },
            {
                "id": "math-basics",
                "title": "Math & Parity Basics",
                "icon": "Sigma",
                "lessons": ["gcd-lcm", "modular-arithmetic"],
                "any": ["math"], "exclude": ["dp", "graphs", "data structures", "trees"],
                "band": [800, 1100], "sub": 100, "per": 4, "cap": 12,
                "blurb": "A huge fraction of easy problems collapse to one observation: parity, "
                         "divisibility, a closed-form sum, or a gcd. Train yourself to look for the formula first.",
                "signals": [
                    "Answer asked for huge n — you can't simulate, you must find a formula.",
                    "Words like 'even/odd', 'divisible', 'multiple of', 'sum of first k'.",
                    "Tiny output (a single number) from large input.",
                ],
                "technique": "Compute small cases by hand, spot the pattern, prove it with parity/"
                             "divisibility/arithmetic-series reasoning. Keep gcd, lcm and n(n+1)/2 in muscle memory.",
                "trap": "Integer overflow on the closed form — sums of n up to 1e9 overflow 32-bit. Use 64-bit everywhere.",
                "goal": "See the formula within 2–3 small examples instead of coding a loop.",
            },
            {
                "id": "greedy-intro",
                "title": "First Greedy Moves",
                "icon": "Coins",
                "lessons": ["activity-selection", "exchange-argument"],
                "any": ["greedy"], "exclude": ["dp", "data structures", "graphs", "trees"],
                "band": [900, 1100], "sub": 100, "per": 5, "cap": 12,
                "blurb": "Sort, then take the best available choice. Easy greedies are about "
                         "*ordering* the input the right way and proving the obvious move is safe.",
                "signals": [
                    "'Maximize / minimize' with no dependency between choices.",
                    "Sorting the input makes the decision obvious.",
                    "Each step has a clearly 'best' local option.",
                ],
                "technique": "Sort by the right key, then sweep. Ask 'why is taking the best item now never wrong?' — that's your exchange argument.",
                "trap": "Greedy that *feels* right but isn't. If you can't argue why a local choice is globally safe, suspect DP.",
                "goal": "Recognise the sort key instantly.",
            },
            {
                "id": "brute-force",
                "title": "Brute Force & Search Spaces",
                "icon": "Undo2",
                "lessons": ["subsets", "permutations"],
                "any": ["brute force"], "exclude": ["dp", "data structures"],
                "band": [800, 1100], "sub": 100, "per": 4, "cap": 10,
                "blurb": "When n is tiny, just try everything. The skill is recognising that the "
                         "search space is small enough (2^n, n!, or n^2/n^3) to enumerate.",
                "signals": [
                    "n ≤ 20 → subsets (2^n).  n ≤ 10 → permutations (n!).",
                    "Constraints far smaller than usual — the setter is inviting brute force.",
                    "'Choose some subset / arrangement that...'",
                ],
                "technique": "Estimate the work: 2^n, n!, or nested loops. If it fits ~10^8, enumerate and check each candidate.",
                "trap": "Misjudging the size — 2^25 is 3·10^7 (fine), 2^40 is not. Always do the back-of-envelope count first.",
                "goal": "Map constraints → enumeration size in seconds.",
            },
            {
                "id": "two-pointers-intro",
                "title": "Two Pointers & Sorting Tricks",
                "icon": "MoveHorizontal",
                "lessons": ["two-pointers", "sliding-window"],
                "any": ["two pointers", "sortings"], "exclude": ["dp", "data structures", "graphs"],
                "band": [900, 1200], "sub": 100, "per": 4, "cap": 12,
                "blurb": "After sorting, a pair of indices sweeping the array answers a surprising "
                         "number of 'find a pair / a window' questions in linear time.",
                "signals": [
                    "'Find two elements with sum / difference X' on a sortable array.",
                    "'Longest / shortest contiguous segment such that ...'.",
                    "Monotonic relationship: moving one pointer only ever moves the other one way.",
                ],
                "technique": "Sort if order doesn't matter, then advance L/R based on whether the current window is too big or too small.",
                "trap": "Using two pointers when the window condition isn't monotonic — then you need a different tool.",
                "goal": "Reach for sort + two pointers reflexively on pair/window prompts.",
            },
        ],
    },
    {
        "id": "pupil-specialist",
        "title": "Climbing to Specialist",
        "rank": "Pupil → Specialist",
        "ratingLabel": "1100 – 1400",
        "color": "#06b6d4",
        "summary": "Now C-level problems need a real idea. This phase is where binary search, "
                   "prefix sums, constructive thinking and basic graph/DP first appear. Pattern "
                   "recognition starts paying off hard here.",
        "themes": [
            {
                "id": "binary-search",
                "title": "Binary Search",
                "icon": "Search",
                "lessons": ["binary-search", "binary-search-variations"],
                "any": ["binary search"], "exclude": ["dp", "data structures", "trees", "graphs"],
                "band": [1100, 1500], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Binary search on a sorted array — and, more powerfully, on the *answer*. "
                         "If a boolean check is monotonic, you can binary search the smallest/largest value that passes.",
                "signals": [
                    "'Minimum / maximum value such that some condition holds.'",
                    "A check(x) that is monotonic: false…false,true…true.",
                    "Sorted data + 'how many ≤ x' style queries.",
                ],
                "technique": "Define check(x) carefully, prove monotonicity, then standard lo/hi loop. Decide [lo,hi) vs [lo,hi] and stick to it.",
                "trap": "Off-by-one in the boundary and an infinite loop when lo/hi don't converge. Write the invariant down.",
                "goal": "Spot 'binary search the answer' from the phrase 'minimum maximum'.",
            },
            {
                "id": "constructive",
                "title": "Constructive Algorithms",
                "icon": "Boxes",
                "lessons": ["activity-selection"],
                "any": ["constructive algorithms"], "exclude": ["dp", "data structures"],
                "band": [1100, 1500], "sub": 100, "per": 3, "cap": 14,
                "blurb": "Codeforces' signature genre: 'construct ANY valid object'. There's no "
                         "search — you invent a pattern that always works and prove it does.",
                "signals": [
                    "'Construct any array/permutation/grid such that ...'.",
                    "Often 'print -1 if impossible' — first nail the impossibility condition.",
                    "Small examples in the statement that hint at a repeating structure.",
                ],
                "technique": "Play with n=1,2,3 by hand, find a repeatable pattern (alternate, pair up, snake, halve), then argue it always satisfies the constraints.",
                "trap": "Forgetting the -1 case, or a construction that breaks on the smallest n. Always test n=1 and n=2.",
                "goal": "Build intuition for 'invent a pattern' problems — these are free rating once it clicks.",
            },
            {
                "id": "number-theory-basics",
                "title": "Number Theory Basics",
                "icon": "Sigma",
                "lessons": ["sieve", "gcd-lcm", "modular-arithmetic"],
                "any": ["number theory"], "exclude": ["dp", "graphs", "data structures"],
                "band": [1100, 1500], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Primes, divisors, gcd and modular arithmetic. The sieve and divisor "
                         "enumeration in √n unlock most early number-theory problems.",
                "signals": [
                    "'Count divisors / primes', 'is it prime', 'gcd of subarray'.",
                    "Numbers up to 10^6 → precompute a sieve / smallest prime factor.",
                    "Anything 'modulo 10^9+7'.",
                ],
                "technique": "Sieve for primality/factorisation up to 1e6; trial-divide to √n for a single number; use gcd identities for subarray-gcd tricks.",
                "trap": "O(n) divisor loops when √n suffices; forgetting that gcd of a range only ever decreases.",
                "goal": "Know instantly whether to sieve or trial-divide.",
            },
            {
                "id": "greedy-sorting",
                "title": "Greedy + Sorting",
                "icon": "Coins",
                "lessons": ["exchange-argument", "activity-selection"],
                "any": ["greedy"], "require": ["sortings"], "exclude": ["dp", "data structures"],
                "band": [1100, 1500], "sub": 100, "per": 3, "cap": 12,
                "blurb": "The workhorse combo: sort by a clever key, then make the locally optimal "
                         "choice. The hard part is choosing the key and proving the exchange argument.",
                "signals": [
                    "Pairing / scheduling / assigning to minimise or maximise a total.",
                    "Two arrays you can reorder independently.",
                    "'If I swap two adjacent choices, the answer doesn't improve.'",
                ],
                "technique": "Guess a sort key, then prove with an exchange argument: any optimal solution can be reordered to match the greedy without getting worse.",
                "trap": "Sorting by the wrong attribute (e.g. by deadline vs by length). Test the greedy against brute force on tiny inputs.",
                "goal": "Derive and trust the exchange argument under contest pressure.",
            },
            {
                "id": "bfs-dfs",
                "title": "Graph Traversal (BFS / DFS)",
                "icon": "Share2",
                "lessons": ["graph-bfs", "graph-dfs", "tree-traversals"],
                "any": ["dfs and similar", "graphs"], "exclude": ["dp", "data structures", "shortest paths"],
                "band": [1200, 1500], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Connected components, flood fill, shortest path in an unweighted graph, "
                         "cycle detection. BFS/DFS is the backbone of half of CP.",
                "signals": [
                    "Grid or explicit graph; 'connected regions', 'reachable', 'components'.",
                    "Unweighted shortest path → plain BFS.",
                    "'Is there a cycle', 'is it bipartite', 'color the graph'.",
                ],
                "technique": "Model the state as nodes/edges, pick BFS (layers / shortest steps) or DFS (connectivity / recursion), and track a visited set.",
                "trap": "Recursion-depth stack overflow on big graphs (use an explicit stack / iterative DFS); revisiting nodes without a visited check.",
                "goal": "Translate a word problem into a graph automatically.",
            },
            {
                "id": "dp-intro",
                "title": "Intro Dynamic Programming",
                "icon": "Grid3x3",
                "lessons": ["coin-change", "knapsack", "lis", "lcs"],
                "any": ["dp"], "exclude": ["data structures", "trees", "graphs", "bitmasks", "matrices"],
                "band": [1200, 1500], "sub": 100, "per": 3, "cap": 14,
                "blurb": "1-D DP: count ways, min cost, can-you-reach. The leap is seeing the "
                         "problem as a sequence of decisions with overlapping subproblems.",
                "signals": [
                    "'Number of ways', 'minimum cost', 'can you reach' with sequential choices.",
                    "Exponential brute force that obviously repeats subproblems.",
                    "Choice at step i depends only on a few earlier states.",
                ],
                "technique": "Define dp[i] in words first ('best answer using first i'), write the transition, set the base case, decide iteration order.",
                "trap": "Wrong base case / iteration order, or a state that doesn't capture enough information. State design is 80% of DP.",
                "goal": "Phrase a clean dp[i] definition before touching code.",
            },
        ],
    },
    {
        "id": "specialist-expert",
        "title": "Becoming Expert",
        "rank": "Specialist → Expert",
        "ratingLabel": "1400 – 1700",
        "color": "#3b82f6",
        "summary": "The Expert wall. Problems now combine two ideas: binary-search-on-answer with "
                   "a greedy check, DP with bitmasks, graphs with DSU. This is where deliberate "
                   "pattern practice separates Experts from stuck Specialists.",
        "themes": [
            {
                "id": "binary-search-answer",
                "title": "Binary Search on the Answer",
                "icon": "Search",
                "lessons": ["binary-search-variations"],
                "any": ["binary search"], "require": ["greedy"], "exclude": ["data structures"],
                "band": [1500, 1900], "sub": 100, "per": 3, "cap": 12,
                "blurb": "The classic Expert combo: binary search the answer, and the feasibility "
                         "check is itself a greedy or simulation. Recognising the monotonic check is the whole skill.",
                "signals": [
                    "'Maximise the minimum' or 'minimise the maximum'.",
                    "Splitting / allocating with a threshold that gets easier as the threshold relaxes.",
                    "A check(x) you can verify greedily in O(n).",
                ],
                "technique": "Binary search x; write a greedy check(x). Prove that if x works, so does every easier x (monotonicity).",
                "trap": "A check that isn't actually monotonic, or an O(n log n) check that makes the whole thing too slow.",
                "goal": "Decompose into 'search the value' + 'greedy verify'.",
            },
            {
                "id": "dp-classic",
                "title": "Classic DP Patterns",
                "icon": "Grid3x3",
                "lessons": ["knapsack", "lis", "lcs", "coin-change"],
                "any": ["dp"], "exclude": ["trees", "bitmasks", "matrices", "data structures", "flows"],
                "band": [1500, 1900], "sub": 100, "per": 3, "cap": 16,
                "blurb": "Knapsack, LIS, LCS, partition, grid DP — the named patterns. Most "
                         "mid-level DP is one of these wearing a costume.",
                "signals": [
                    "Subset-sum / 'pick items under a budget' → knapsack.",
                    "'Longest increasing / common subsequence' → LIS / LCS.",
                    "2-D grid with moves → grid DP.",
                ],
                "technique": "Match to the closest named pattern, then adapt the state. Remember LIS in O(n log n) via patience sorting / lower_bound.",
                "trap": "Memory blowup on 2-D DP — roll the array to one row when only the previous row is needed.",
                "goal": "Instantly classify which classic pattern fits.",
            },
            {
                "id": "dsu",
                "title": "Disjoint Set Union (DSU)",
                "icon": "Share2",
                "lessons": ["union-find", "mst-kruskal"],
                "any": ["dsu"],
                "band": [1400, 1900], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Union-Find answers 'are these connected?' under merges, near-instantly. "
                         "It also powers Kruskal's MST and offline connectivity tricks.",
                "signals": [
                    "Edges added over time; 'are u and v connected now?'.",
                    "Counting / sizing connected components after unions.",
                    "Kruskal MST, or grouping elements by an equivalence relation.",
                ],
                "technique": "Path compression + union by size/rank → near-O(1). For 'connectivity over deletions', process queries offline in reverse.",
                "trap": "Forgetting to union by size/rank (degrades to O(n)); using find without path compression.",
                "goal": "See merges-over-time → DSU automatically.",
            },
            {
                "id": "shortest-paths",
                "title": "Weighted Shortest Paths",
                "icon": "Share2",
                "lessons": ["dijkstra", "bellman-ford", "floyd-warshall"],
                "any": ["shortest paths"],
                "band": [1500, 2000], "sub": 120, "per": 3, "cap": 12,
                "blurb": "Dijkstra (non-negative), Bellman-Ford (negative edges / k steps), "
                         "Floyd-Warshall (all pairs, small n). Pick by the edge weights and graph size.",
                "signals": [
                    "Weighted edges + 'shortest / cheapest path'.",
                    "Non-negative weights → Dijkstra; negative or 'at most k edges' → Bellman-Ford.",
                    "n ≤ 500 and all-pairs distances → Floyd-Warshall.",
                ],
                "technique": "Dijkstra with a heap and stale-entry skipping; sometimes the state is (node, extra) — a layered graph. Floyd-Warshall for transitive-closure style problems.",
                "trap": "Running Dijkstra with negative edges; 32-bit overflow on summed weights.",
                "goal": "Choose the right shortest-path algorithm from weights + n.",
            },
            {
                "id": "number-theory",
                "title": "Modular Arithmetic & Number Theory",
                "icon": "Sigma",
                "lessons": ["modular-arithmetic", "fast-exponentiation", "sieve"],
                "any": ["number theory"], "exclude": ["dp", "data structures", "trees"],
                "band": [1500, 1900], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Fast exponentiation, modular inverses, factorisation by smallest-prime, "
                         "and counting with divisors. The mod 10^9+7 toolkit.",
                "signals": [
                    "'Compute X mod p' for huge X, or a^b mod p.",
                    "Division under a modulus → modular inverse (Fermat).",
                    "Counting multiples / coprimes / divisor sums.",
                ],
                "technique": "Binary exponentiation for powers and inverses; precompute smallest-prime-factor for fast factorisation; inclusion–exclusion over prime factors.",
                "trap": "Negative values mod p (normalise with ((x%p)+p)%p); inverse of a non-coprime number.",
                "goal": "Fluent modular algebra under contest time.",
            },
            {
                "id": "strings-core",
                "title": "String Matching & Hashing",
                "icon": "Type",
                "lessons": ["kmp", "z-algorithm", "rabin-karp", "trie"],
                "any": ["strings", "hashing"], "exclude": ["dp", "data structures"],
                "band": [1400, 1900], "sub": 120, "per": 3, "cap": 12,
                "blurb": "Prefix-functions (KMP), Z-array, and polynomial hashing turn substring "
                         "questions into O(n). Hashing is the universal 'are these equal?' hammer.",
                "signals": [
                    "'Does pattern occur', 'count occurrences', 'longest border/period'.",
                    "Compare many substrings for equality → polynomial hashing.",
                    "Prefix = suffix structure → KMP failure function / Z.",
                ],
                "technique": "KMP/Z for occurrences and periods; double hashing (two mods) to kill collisions; precompute prefix hashes for O(1) substring compares.",
                "trap": "Single-mod hash collisions on adversarial tests; mismatched base/mod between strings.",
                "goal": "Reduce substring questions to hashing or a prefix function.",
            },
            {
                "id": "bitmask",
                "title": "Bit Tricks & Bitmask Enumeration",
                "icon": "Binary",
                "lessons": ["subsets", "bitmask-dp"],
                "any": ["bitmasks"], "exclude": ["dp"],
                "band": [1400, 1900], "sub": 120, "per": 3, "cap": 12,
                "blurb": "Treat a set / small array as the bits of an integer. XOR/AND/OR identities "
                         "and subset enumeration solve a whole class of 'choose a subset' problems.",
                "signals": [
                    "n ≤ 20–22 and 'choose a subset / partition'.",
                    "XOR-based conditions, 'pair up so that ...'.",
                    "Bitwise AND/OR/XOR of a range or subset.",
                ],
                "technique": "Iterate masks 0..2^n-1; enumerate submasks with the (m-1)&mask trick; reason bit-by-bit for AND/OR/XOR constraints (each bit independent).",
                "trap": "Confusing submask vs supermask iteration; forgetting bit independence simplifies the problem.",
                "goal": "Map 'small set' problems to integer bitmasks.",
            },
            {
                "id": "two-pointers-adv",
                "title": "Sliding Window & Prefix Sums",
                "icon": "MoveHorizontal",
                "lessons": ["sliding-window", "prefix-sums", "two-pointers"],
                "any": ["two pointers"], "exclude": ["dp", "binary search", "data structures"],
                "band": [1400, 1800], "sub": 100, "per": 3, "cap": 12,
                "blurb": "A window that grows/shrinks to maintain an invariant, backed by prefix "
                         "sums for O(1) range queries. The linear-time answer to many 'segment' problems.",
                "signals": [
                    "'Longest / number of subarrays with property P' where P is monotonic in length.",
                    "Range-sum queries → prefix sums (or prefix XOR / counts).",
                    "Count pairs (i,j) with a sum/condition via a running map.",
                ],
                "technique": "Expand right, shrink left while the window violates P; precompute prefix arrays so any range is O(1).",
                "trap": "Non-monotonic conditions break the window; prefix-sum overflow.",
                "goal": "Default to window + prefix sums on subarray prompts.",
            },
            {
                "id": "combinatorics",
                "title": "Counting & Combinatorics",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "exclude": ["dp", "data structures", "trees", "fft"],
                "band": [1500, 1900], "sub": 100, "per": 3, "cap": 12,
                "blurb": "Count arrangements with nCr, the stars-and-bars trick, and "
                         "inclusion–exclusion — all under a modulus with precomputed factorials.",
                "signals": [
                    "'How many ways / arrangements / sequences', answer mod p.",
                    "Distribute identical items → stars and bars.",
                    "'At least one' / 'none of' constraints → inclusion–exclusion.",
                ],
                "technique": "Precompute factorials + inverse factorials for O(1) nCr mod p; decompose the count into independent choices; subtract bad cases with inclusion–exclusion.",
                "trap": "Forgetting modular inverse for division; double counting symmetric arrangements.",
                "goal": "Break a count into independent multiplicative choices.",
            },
        ],
    },
    {
        "id": "expert-cm",
        "title": "The Candidate Master Push",
        "rank": "Expert → Candidate Master",
        "ratingLabel": "1700 – 1900",
        "color": "#a855f7",
        "summary": "The target tier. Data structures (segment trees / Fenwick), tree DP, advanced "
                   "DP states, and SCC-level graph theory. Problems reward a deep toolbox plus the "
                   "judgement to combine tools. This is the heart of the roadmap.",
        "themes": [
            {
                "id": "segtree-fenwick",
                "title": "Segment Trees & Fenwick",
                "icon": "Binary",
                "lessons": ["fenwick", "segment-tree"],
                "any": ["data structures"], "require": ["binary search"], "exclude": ["dp", "strings"],
                "band": [1600, 2000], "sub": 100, "per": 3, "cap": 14,
                "blurb": "Point-update / range-query in O(log n). Fenwick for sums and inversion "
                         "counting; segment trees for min/max/gcd and more. The CM-level data-structure backbone.",
                "signals": [
                    "Many range queries + point updates interleaved.",
                    "Count inversions / 'elements smaller to the right' → Fenwick.",
                    "Range min/max/sum/gcd with updates → segment tree.",
                ],
                "technique": "Fenwick for prefix-aggregate + point update; segment tree for any associative range op; coordinate-compress when values are large.",
                "trap": "Off-by-one in 1-indexed Fenwick; forgetting to compress coordinates.",
                "goal": "Reach for a BIT/segtree the moment you see range query + update.",
            },
            {
                "id": "tree-algorithms",
                "title": "Tree Algorithms & LCA",
                "icon": "GitBranch",
                "lessons": ["tree-traversals", "lca", "tree-diameter"],
                "any": ["trees"], "exclude": ["dp", "data structures", "matchings"],
                "band": [1600, 2000], "sub": 120, "per": 3, "cap": 12,
                "blurb": "Rooting, subtree sizes, diameter, LCA, and distance queries. The standard "
                         "tree toolkit that shows up in nearly every CM round.",
                "signals": [
                    "Input is a tree (n nodes, n-1 edges).",
                    "'Distance between u and v', 'kth ancestor' → LCA (binary lifting).",
                    "'Longest path' → diameter via two BFS / DFS.",
                ],
                "technique": "Root the tree, compute subtree sizes / depths with one DFS; binary-lifting LCA for distance and ancestor queries.",
                "trap": "Recursion depth on a path-shaped tree (10^5 deep) → iterative DFS or raise the limit.",
                "goal": "Apply the rooted-tree toolkit on sight.",
            },
            {
                "id": "tree-dp",
                "title": "DP on Trees",
                "icon": "GitBranch",
                "lessons": ["tree-dp", "tree-traversals"],
                "require": ["dp", "trees"],
                "band": [1700, 2100], "sub": 130, "per": 3, "cap": 12,
                "blurb": "Combine children's answers into the parent's. Add rerooting to get the "
                         "answer for every node in O(n). A signature CM skill.",
                "signals": [
                    "Tree + 'best/count over subtrees' or 'for every root'.",
                    "Answer at a node depends on its children's answers.",
                    "'Maximum independent set / matching / path' on a tree.",
                ],
                "technique": "Post-order DFS to fold children up; for 'answer for all roots', do a second DFS passing the parent's contribution down (rerooting).",
                "trap": "Mixing up which child contributions to exclude during rerooting; deep recursion.",
                "goal": "Design subtree states and reroot confidently.",
            },
            {
                "id": "dp-advanced",
                "title": "Advanced DP States",
                "icon": "Grid3x3",
                "lessons": ["interval-dp", "digit-dp", "bitmask-dp"],
                "any": ["dp"], "require": ["bitmasks"], "exclude": ["trees", "flows"],
                "band": [1700, 2100], "sub": 130, "per": 3, "cap": 14,
                "blurb": "Bitmask DP over subsets, interval DP, and digit DP. The state stops being "
                         "a single index and becomes a richer object — the key creative leap to CM.",
                "signals": [
                    "n ≤ 20 with 'visit all / assign all' → bitmask DP (TSP-like).",
                    "'Combine adjacent segments optimally' → interval DP.",
                    "'Count numbers ≤ N with a digit property' → digit DP.",
                ],
                "technique": "Bitmask DP: dp[mask] over visited sets. Interval DP: dp[l][r] over a split point. Digit DP: dp[pos][tight][state] over the decimal expansion.",
                "trap": "2^n · n blowing the time budget; forgetting the 'tight' flag in digit DP.",
                "goal": "Recognise which non-trivial DP state the problem needs.",
            },
            {
                "id": "graph-advanced",
                "title": "SCC, Topo & Graph Structure",
                "icon": "Share2",
                "lessons": ["scc", "topological-sort"],
                "any": ["graphs"], "require": ["dfs and similar"], "exclude": ["dp", "shortest paths", "trees"],
                "band": [1700, 2100], "sub": 130, "per": 3, "cap": 12,
                "blurb": "Condense a directed graph into its strongly-connected components, then "
                         "work on the resulting DAG. Topological order powers DAG DP and dependency problems.",
                "signals": [
                    "Directed graph with cycles you want to collapse.",
                    "'Group mutually reachable nodes', 'minimum to make strongly connected'.",
                    "DAG + longest/critical path → topo-order DP.",
                ],
                "technique": "Tarjan / Kosaraju for SCC → condensation DAG; topological sort then DP along the order. Implication graphs (2-SAT flavour) reduce to SCC.",
                "trap": "Treating the original graph as a DAG before condensing; cycle handling in topo sort.",
                "goal": "Condense to a DAG, then solve on the DAG.",
            },
            {
                "id": "constructive-hard",
                "title": "Hard Constructive & Greedy",
                "icon": "Boxes",
                "lessons": ["exchange-argument", "activity-selection"],
                "any": ["constructive algorithms"], "require": ["greedy"], "exclude": ["dp", "data structures"],
                "band": [1700, 2000], "sub": 100, "per": 3, "cap": 12,
                "blurb": "CM-level constructive: the pattern is subtle and the proof matters. These "
                         "build the 'invent + justify' muscle that defines a strong Expert/CM.",
                "signals": [
                    "'Construct such that ...' with a non-obvious global constraint.",
                    "Interactive or adaptive flavour, or a tight bound on operations.",
                    "A clean answer once you spot the right invariant.",
                ],
                "technique": "Find an invariant the construction must preserve; build greedily while maintaining it; prove optimality / validity by that invariant.",
                "trap": "A construction that passes small cases but violates the bound at scale. Stress-test against brute force.",
                "goal": "Invent and *prove* constructions under pressure.",
            },
            {
                "id": "math-hard",
                "title": "Harder Math & Probability",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic", "fast-exponentiation"],
                "any": ["math", "probabilities"], "require": ["combinatorics"], "exclude": ["dp", "data structures", "geometry"],
                "band": [1700, 2100], "sub": 130, "per": 3, "cap": 12,
                "blurb": "Expected value, probability, and combinatorial identities — usually mod p. "
                         "Linearity of expectation turns scary problems into a sum of easy ones.",
                "signals": [
                    "'Expected value of ...', 'probability that ...'.",
                    "A sum over all pairs / subsets that you can swap order on.",
                    "Counting with symmetry → Burnside-lite reasoning.",
                ],
                "technique": "Linearity of expectation: sum each element's contribution independently; swap summation order; combinatorial identities to collapse sums.",
                "trap": "Treating dependent events as independent; modular inverse of probabilities.",
                "goal": "Reach for linearity of expectation reflexively.",
            },
        ],
    },
    {
        "id": "cm-master",
        "title": "Toward Master",
        "rank": "Candidate Master → Master",
        "ratingLabel": "1900 – 2200+",
        "color": "#ef4444",
        "summary": "Beyond CM. Lazy segment trees, DP optimisation, suffix structures, matrix "
                   "exponentiation, and divide & conquer. Fewer new tools — deeper combinations and "
                   "sharper proofs. Solve these and CM is comfortably behind you.",
        "themes": [
            {
                "id": "segtree-advanced",
                "title": "Lazy Segment Trees",
                "icon": "Binary",
                "lessons": ["lazy-propagation", "segment-tree"],
                "any": ["data structures"], "require": ["dp"], "exclude": ["strings", "trees"],
                "band": [2000, 2400], "sub": 130, "per": 3, "cap": 12,
                "blurb": "Range-update + range-query with lazy propagation, segment-tree-on-DP, and "
                         "beats-style tricks. The heavy data-structure end of CM→Master.",
                "signals": [
                    "Range assign/add + range aggregate queries.",
                    "DP transitions that are really range updates over an index.",
                    "'Apply an operation to a whole segment' repeatedly.",
                ],
                "technique": "Push lazy tags down before recursing; compose tags carefully. Recognise when a DP recurrence is a segment-tree range operation in disguise.",
                "trap": "Tag composition order bugs; forgetting to push down before a query.",
                "goal": "Wield lazy propagation and segtree-accelerated DP.",
            },
            {
                "id": "dp-optimization",
                "title": "DP Optimisation & Divide-and-Conquer",
                "icon": "Grid3x3",
                "lessons": ["interval-dp", "merge-sort"],
                "any": ["dp"], "require": ["divide and conquer"], "exclude": ["trees"],
                "band": [2000, 2400], "sub": 130, "per": 3, "cap": 12,
                "blurb": "Speeding up O(n^2) DP: divide-and-conquer optimisation, convex-hull trick, "
                         "and Knuth. Plus D&C as an algorithmic technique in its own right.",
                "signals": [
                    "An O(n^2) DP that's too slow and has a monotone optimal split point.",
                    "Transitions of the form dp[i] = min(dp[j] + cost(j,i)).",
                    "Cost satisfies the quadrangle inequality → Knuth / D&C opt.",
                ],
                "technique": "Prove monotonicity of the optimal split, then divide-and-conquer over it; or maintain lines for the convex-hull trick.",
                "trap": "Applying an optimisation without verifying its monotonicity/convexity precondition.",
                "goal": "Spot when an O(n^2) DP can drop to O(n log n).",
            },
            {
                "id": "string-suffix",
                "title": "Suffix Structures & Heavy Strings",
                "icon": "Type",
                "lessons": ["suffix-array", "z-algorithm", "kmp"],
                "any": ["string suffix structures", "hashing", "strings"], "require": ["data structures"],
                "band": [1900, 2400], "sub": 150, "per": 3, "cap": 10,
                "blurb": "Suffix arrays / automata, plus hashing combined with data structures. The "
                         "high end of string problems where naive matching is far too slow.",
                "signals": [
                    "'Number of distinct substrings', 'longest repeated/common substring'.",
                    "Many substring comparisons across queries.",
                    "Lexicographic ordering of all suffixes.",
                ],
                "technique": "Suffix array + LCP for distinct-substring and ordering questions; suffix automaton for substring counting; hashing + a data structure for ad-hoc queries.",
                "trap": "Hash collisions at scale; the constant factor of suffix structures timing out.",
                "goal": "Choose the right suffix structure for the query type.",
            },
            {
                "id": "matrix-expo",
                "title": "Matrix Exponentiation",
                "icon": "Grid3x3",
                "lessons": ["fast-exponentiation"],
                "any": ["matrices"],
                "band": [1900, 2300], "sub": 130, "per": 3, "cap": 10,
                "blurb": "When a linear recurrence must be evaluated at huge n, raise its transition "
                         "matrix to the n-th power in O(k^3 log n). Counts paths of length n, too.",
                "signals": [
                    "Linear recurrence evaluated at n up to 10^18.",
                    "'Number of walks of length n' in a small graph.",
                    "A state vector updated by the same linear map every step.",
                ],
                "technique": "Write the transition as a matrix, then binary-exponentiate it under the modulus. Adjacency-matrix power counts fixed-length walks.",
                "trap": "Cubic multiply too slow if k is large; modular overflow in the matrix product.",
                "goal": "Recognise 'linear recurrence at huge n' → matrix power.",
            },
            {
                "id": "divide-conquer",
                "title": "Divide & Conquer",
                "icon": "Search",
                "lessons": ["merge-sort", "binary-search-variations"],
                "any": ["divide and conquer"], "exclude": ["dp", "data structures"],
                "band": [1900, 2300], "sub": 130, "per": 3, "cap": 10,
                "blurb": "Split, solve, and merge — counting cross-boundary contributions in the "
                         "merge step. Inversions, closest pair, and CDQ-style offline tricks.",
                "signals": [
                    "Count pairs (i<j) with some relation → count across the split in merge.",
                    "A problem that halves cleanly with a cheap combine.",
                    "Offline queries sortable into a divide-and-conquer over time.",
                ],
                "technique": "Recurse on halves, then count/merge cross-pairs in O(n) (as in merge-sort inversion counting); CDQ for 3-D dominance offline.",
                "trap": "An expensive merge step that breaks the O(n log n); double-counting cross pairs.",
                "goal": "Identify the cheap cross-boundary merge.",
            },
            {
                "id": "combinatorics-hard",
                "title": "Advanced Counting",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "require": ["dp"], "exclude": ["geometry", "fft"],
                "band": [2000, 2400], "sub": 130, "per": 3, "cap": 10,
                "blurb": "Counting that fuses combinatorics with DP: count configurations, count "
                         "with forbidden patterns, count over structures. The proof-heavy Master end.",
                "signals": [
                    "'Count the number of valid X' where X has rich structure.",
                    "DP whose value is itself a count, combined with binomials.",
                    "Inclusion–exclusion layered over a DP.",
                ],
                "technique": "Set up a counting DP, fold in nCr factors, and subtract invalid configurations via inclusion–exclusion. Keep everything mod p.",
                "trap": "Off-by-one in inclusion–exclusion signs; overcounting symmetric structures.",
                "goal": "Fuse combinatorial identities with DP states.",
            },
        ],
    },
]


def pick_problems(theme, problems, used):
    require = set(theme.get("require", []))
    anytags = set(theme.get("any", []))
    exclude = set(theme.get("exclude", []))
    lo, hi = theme["band"]
    sub = theme.get("sub", 100)
    per = theme.get("per", 3)
    cap = theme.get("cap", 12)

    candidates = []
    for p in problems:
        if (p["contestId"], p["index"]) in used:
            continue
        if not (lo <= p["rating"] <= hi):
            continue
        if require and not require.issubset(p["tags"]):
            continue
        if anytags and not (anytags & p["tags"]):
            continue
        if exclude and (exclude & p["tags"]):
            continue
        candidates.append(p)

    chosen = []
    band_lo = lo
    while band_lo <= hi:
        band_hi = band_lo + sub - 1
        in_band = [p for p in candidates if band_lo <= p["rating"] <= band_hi]
        in_band.sort(key=lambda p: (-p["solved"], p["contestId"]))
        for p in in_band[:per]:
            key = (p["contestId"], p["index"])
            if key in used:
                continue
            used.add(key)
            chosen.append(p)
            if len(chosen) >= cap:
                break
        if len(chosen) >= cap:
            break
        band_lo += sub

    chosen.sort(key=lambda p: (p["rating"], -p["solved"]))
    out = []
    for p in chosen:
        out.append({
            "id": f"cf{p['contestId']}{p['index']}",
            "name": p["name"],
            "rating": p["rating"],
            "tags": sorted(p["tags"]),
            "solved": p["solved"],
            "link": link(p),
        })
    return out


def main():
    problems = load_problems()
    used = set()
    total = 0
    phases_out = []
    for ph in PHASES:
        themes_out = []
        for th in ph["themes"]:
            probs = pick_problems(th, problems, used)
            total += len(probs)
            themes_out.append({
                "id": th["id"],
                "title": th["title"],
                "icon": th["icon"],
                "lessons": th.get("lessons", []),
                "blurb": th["blurb"],
                "signals": th["signals"],
                "technique": th["technique"],
                "trap": th["trap"],
                "goal": th.get("goal", ""),
                "tags": sorted(set().union(*[set(th.get(k, [])) for k in ("require", "any")]) or set()),
                "problemCount": len(probs),
                "problems": probs,
            })
            print(f"  {ph['id']}/{th['id']:24} {len(probs):3} problems", file=sys.stderr)
        phases_out.append({
            "id": ph["id"],
            "title": ph["title"],
            "rank": ph["rank"],
            "ratingLabel": ph["ratingLabel"],
            "color": ph["color"],
            "summary": ph["summary"],
            "themeCount": len(themes_out),
            "problemCount": sum(t["problemCount"] for t in themes_out),
            "themes": themes_out,
        })

    doc = {
        "module": 4,
        "title": "Road to Candidate Master",
        "tagline": "A Codeforces-only ladder that turns the Module 1 algorithm toolbox into "
                   "rating. Every problem is real, curated by popularity, and grouped by the "
                   "pattern it trains.",
        "source": "Codeforces public API (problemset.problems)",
        "generatedProblemCount": total,
        "phases": phases_out,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {OUT} — {total} problems across "
          f"{sum(p['themeCount'] for p in phases_out)} themes / {len(phases_out)} phases.",
          file=sys.stderr)


if __name__ == "__main__":
    main()
