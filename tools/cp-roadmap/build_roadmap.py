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
        "id": "cm",
        "title": "Candidate Master",
        "rank": "Expert → Candidate Master",
        "ratingLabel": "1900 – 2100",
        "color": "#a855f7",
        "summary": "The CM threshold. The tools don't change — the combinations and the proofs get "
                   "sharper. This tier is intentionally wide: drill every Module-1 family at 1900–2100 "
                   "until the patterns fire automatically and your implementation is clean under pressure.",
        "themes": [
            {
                "id": "dp-cm",
                "title": "Dynamic Programming",
                "icon": "Grid3x3",
                "lessons": ["knapsack", "lis", "interval-dp", "coin-change"],
                "any": ["dp"], "exclude": ["trees", "data structures", "bitmasks", "strings", "geometry", "probabilities"],
                "band": [1900, 2100], "sub": 100, "per": 7, "cap": 14,
                "blurb": "DP at the CM line: the state design is the puzzle. Most of these hide a "
                         "knapsack, an LIS, an interval split, or a clever index behind a new costume.",
                "signals": [
                    "A brute force that obviously repeats overlapping subproblems.",
                    "Sequential choices where the future depends on a small summary of the past.",
                    "'Count / minimise / maximise over arrangements' with n large enough to rule out brute force.",
                ],
                "technique": "Write dp[state] in words before code; minimise the state to exactly what the transition needs; pick the iteration order so dependencies are ready.",
                "trap": "An under-specified state that loses information, or an order that reads dp cells before they're computed.",
                "goal": "Design a correct, minimal DP state in one pass.",
            },
            {
                "id": "segtree-cm",
                "title": "Segment Trees & Fenwick",
                "icon": "Binary",
                "lessons": ["segment-tree", "fenwick", "lazy-propagation"],
                "any": ["data structures"], "exclude": ["strings", "trees"],
                "band": [1900, 2100], "sub": 100, "per": 7, "cap": 14,
                "blurb": "Range query + update under O(log n). At this level the data structure is "
                         "often the easy part — spotting that the problem reduces to range ops is the skill.",
                "signals": [
                    "Interleaved range queries and updates over an array.",
                    "Counting 'how many earlier elements satisfy …' → BIT over compressed values.",
                    "A DP transition that is really a range max/sum lookup.",
                ],
                "technique": "Fenwick for prefix aggregates; segment tree for any associative op; coordinate-compress big values; sweep events left-to-right.",
                "trap": "Forgetting coordinate compression; 1-indexed BIT off-by-ones; non-associative ops on a segment tree.",
                "goal": "Reduce the problem to range query + update on sight.",
            },
            {
                "id": "tree-cm",
                "title": "Trees & Tree DP",
                "icon": "GitBranch",
                "lessons": ["tree-dp", "lca", "tree-diameter"],
                "any": ["trees"], "exclude": ["strings"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Subtree DP, rerooting, LCA and distance arguments. Tree problems reward a "
                         "fixed mental checklist: root it, get sizes/depths, fold children up.",
                "signals": [
                    "Input is a tree; the answer combines children into the parent.",
                    "'For every node' answers → rerooting in O(n).",
                    "Distance / ancestor queries → binary-lifting LCA.",
                ],
                "technique": "Post-order DFS to fold subtree answers; a second top-down pass to reroot; binary lifting for LCA and kth-ancestor.",
                "trap": "Recursion depth on a path-shaped tree; mishandling which child to exclude when rerooting.",
                "goal": "Apply the rooted-tree checklist reflexively.",
            },
            {
                "id": "graphs-cm",
                "title": "Graphs & Shortest Paths",
                "icon": "Share2",
                "lessons": ["dijkstra", "scc", "topological-sort", "union-find"],
                "any": ["graphs", "shortest paths", "dsu", "dfs and similar"], "exclude": ["trees", "dp"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Modelling is the battle: turn the prose into nodes and edges, then it's "
                         "Dijkstra, DSU, topo-order, or an SCC condensation you already know.",
                "signals": [
                    "States with transitions → a (possibly layered) graph.",
                    "Merges over time / connectivity → DSU; directed cycles to collapse → SCC.",
                    "Weighted shortest path → Dijkstra; dependencies → topological order.",
                ],
                "technique": "Define the state graph explicitly; pick BFS/Dijkstra/DSU/SCC by the structure; build the condensation DAG when cycles get in the way.",
                "trap": "Hidden state in the node (e.g. parity) you forgot to encode; 0/1-BFS vs Dijkstra confusion.",
                "goal": "Translate any process into the right graph instantly.",
            },
            {
                "id": "strings-cm",
                "title": "Strings & Hashing",
                "icon": "Type",
                "lessons": ["kmp", "z-algorithm", "rabin-karp", "suffix-array"],
                "any": ["strings", "hashing", "string suffix structures"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 10,
                "blurb": "Prefix functions, Z, and polynomial hashing reduce substring questions to "
                         "O(n). Hashing is the universal equality hammer once collisions are controlled.",
                "signals": [
                    "Occurrences, borders, periods → KMP / Z.",
                    "Many substring equality checks → prefix hashes (double-mod).",
                    "Lexicographic / distinct-substring questions → suffix array + LCP.",
                ],
                "technique": "Precompute prefix hashes for O(1) compares; KMP/Z for periodicity; suffix array + LCP for ordering and counting.",
                "trap": "Single-mod hash collisions on adversarial tests; mismatched base/mod across strings.",
                "goal": "Map substring questions to a prefix function or hash.",
            },
            {
                "id": "combinatorics-cm",
                "title": "Counting & Combinatorics",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "exclude": ["geometry"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Decompose a count into independent multiplicative choices, with nCr, stars "
                         "and bars, and inclusion–exclusion — all mod p with precomputed factorials.",
                "signals": [
                    "'How many ways / sequences / arrangements', answer mod p.",
                    "Distribute identical items → stars and bars.",
                    "'At least one' / 'none of' → inclusion–exclusion.",
                ],
                "technique": "Precompute factorials + inverse factorials for O(1) nCr; split into independent choices; subtract bad cases with inclusion–exclusion.",
                "trap": "Division without modular inverse; double counting symmetric configurations.",
                "goal": "Factor a count into independent choices fast.",
            },
            {
                "id": "number-theory-cm",
                "title": "Number Theory",
                "icon": "Sigma",
                "lessons": ["sieve", "modular-arithmetic", "fast-exponentiation", "gcd-lcm"],
                "any": ["number theory"], "exclude": ["dp"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 10,
                "blurb": "Sieve / smallest-prime factorisation, modular inverses, divisor sums and "
                         "gcd structure. The mod-p toolkit applied to harder counting and divisibility.",
                "signals": [
                    "Factorise many numbers ≤ 1e6 → precompute smallest prime factor.",
                    "Counting coprimes / multiples → inclusion–exclusion over prime factors.",
                    "Division under a modulus → Fermat inverse.",
                ],
                "technique": "Linear sieve for SPF; binary exponentiation for powers/inverses; inclusion–exclusion over the prime factorisation.",
                "trap": "Negative residues mod p; inverse of a non-coprime value; overflow before the mod.",
                "goal": "Fluent factorisation + modular algebra.",
            },
            {
                "id": "bitmask-cm",
                "title": "Bitmask & Meet-in-the-Middle",
                "icon": "Binary",
                "lessons": ["bitmask-dp", "subsets"],
                "any": ["bitmasks", "meet-in-the-middle"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 10,
                "blurb": "Small sets become integers. Bitmask DP over subsets, submask enumeration, "
                         "and splitting n in half (meet-in-the-middle) to beat 2^n.",
                "signals": [
                    "n ≤ 20–22 with 'assign / visit all' → bitmask DP.",
                    "n ≤ 40 'choose a subset with target sum' → meet in the middle.",
                    "Per-bit independent AND/OR/XOR constraints.",
                ],
                "technique": "dp[mask] over visited sets; submask loop with (m-1)&mask; split into two halves and merge sorted partial sums.",
                "trap": "2^n·n exceeding the budget; submask vs supermask iteration mix-ups.",
                "goal": "See 'small set' / 'n≈40' → bitmask or MITM.",
            },
            {
                "id": "constructive-cm",
                "title": "Constructive & Greedy",
                "icon": "Coins",
                "lessons": ["exchange-argument", "activity-selection"],
                "any": ["constructive algorithms"], "require": ["greedy"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Invent a pattern that always works and prove it. CM-level constructive needs "
                         "an invariant and a clean greedy that maintains it.",
                "signals": [
                    "'Construct any … such that', often with a -1 impossibility case.",
                    "A tight bound on the number of operations.",
                    "Small examples hinting at a repeating structure.",
                ],
                "technique": "Find the invariant the answer must preserve; build greedily maintaining it; pin the impossibility condition first.",
                "trap": "A construction that breaks at the smallest n or violates the op bound at scale — stress-test it.",
                "goal": "Invent and justify constructions under time pressure.",
            },
            {
                "id": "binsearch-cm",
                "title": "Binary Search & Two Pointers",
                "icon": "Search",
                "lessons": ["binary-search-variations", "sliding-window"],
                "any": ["binary search", "two pointers"], "exclude": ["data structures", "dp"],
                "band": [1900, 2100], "sub": 100, "per": 6, "cap": 10,
                "blurb": "Binary search the answer with a greedy/sim check, or sweep two pointers over "
                         "a monotone window. The decomposition into 'search value + verify' is the move.",
                "signals": [
                    "'Maximise the minimum' / 'minimise the maximum'.",
                    "A monotone check(x) verifiable in O(n).",
                    "Longest/shortest window with a monotone property.",
                ],
                "technique": "Binary search x with a greedy check; prove monotonicity; or expand/shrink a two-pointer window maintaining the invariant.",
                "trap": "A check that isn't truly monotonic; an O(n log n) check making the whole thing too slow.",
                "goal": "Split into 'search the value' + 'verify greedily'.",
            },
        ],
    },
    {
        "id": "master",
        "title": "Master",
        "rank": "Candidate Master → Master",
        "ratingLabel": "2100 – 2300",
        "color": "#ff8c00",
        "summary": "Master tier (orange). Problems now layer techniques: a data structure inside a DP, "
                   "a greedy inside a binary search, a counting argument with a structural twist. Solving "
                   "these consistently is a 2100+ rating.",
        "themes": [
            {
                "id": "dp-master",
                "title": "Hard Dynamic Programming",
                "icon": "Grid3x3",
                "lessons": ["interval-dp", "bitmask-dp", "knapsack", "digit-dp"],
                "any": ["dp"], "exclude": ["trees", "data structures", "strings", "geometry"],
                "band": [2100, 2300], "sub": 100, "per": 7, "cap": 14,
                "blurb": "Multi-dimensional states, DP over structure, and transitions that need a "
                         "second idea to compute efficiently. State design plus a transition trick.",
                "signals": [
                    "The obvious DP is correct but a dimension or transition is too slow.",
                    "State = (position, some compressed summary, tight/parity flag).",
                    "Counting DP whose transition is itself an aggregate.",
                ],
                "technique": "Nail the minimal state, then attack the transition: prefix sums, monotonic structure, or a small data structure to speed it.",
                "trap": "A state that's one dimension too big; recomputing transitions that could be accumulated.",
                "goal": "Find the extra idea that makes a correct DP fast.",
            },
            {
                "id": "segtree-master",
                "title": "Advanced Data Structures",
                "icon": "Binary",
                "lessons": ["lazy-propagation", "segment-tree", "fenwick"],
                "any": ["data structures"], "exclude": ["strings", "trees"],
                "band": [2100, 2300], "sub": 100, "per": 7, "cap": 14,
                "blurb": "Lazy propagation, segment-tree-on-DP, BIT-of-BIT, and offline sweeps. The "
                         "structure encodes the whole problem; correctness lives in the tag algebra.",
                "signals": [
                    "Range assign/add + range aggregate, repeated.",
                    "Offline queries you can sort by one coordinate and sweep.",
                    "A DP recurrence equal to a range operation over an index.",
                ],
                "technique": "Compose lazy tags carefully and push down before recursing; sort queries offline; encode the DP transition as a segment-tree op.",
                "trap": "Tag composition order; forgetting push-down on queries; merge step that isn't associative.",
                "goal": "Express the problem as clean range operations.",
            },
            {
                "id": "tree-master",
                "title": "Hard Tree Problems",
                "icon": "GitBranch",
                "lessons": ["tree-dp", "lca", "tree-diameter"],
                "any": ["trees"], "exclude": ["strings"],
                "band": [2100, 2300], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Rerooting with non-trivial merges, small-to-large, Euler-tour + BIT, and "
                         "auxiliary/virtual-tree ideas. Tree structure exploited to the hilt.",
                "signals": [
                    "Aggregate over all paths / all subtrees with a heavy merge.",
                    "Subtree queries → Euler tour flattening + a BIT/segment tree.",
                    "Per-node answers needing both downward and upward information.",
                ],
                "technique": "Euler-tour to turn subtrees into ranges; small-to-large for set merges; reroot with an invertible combine.",
                "trap": "Small-to-large without the size check (loses the log); Euler-tour index bugs.",
                "goal": "Reach for Euler-tour / small-to-large when subtree-DP stalls.",
            },
            {
                "id": "graphs-master",
                "title": "Graph Theory",
                "icon": "Share2",
                "lessons": ["scc", "dijkstra", "union-find", "mst-kruskal"],
                "any": ["graphs", "shortest paths", "dsu"], "exclude": ["trees"],
                "band": [2100, 2300], "sub": 100, "per": 6, "cap": 12,
                "blurb": "SCC condensation, DSU on the MST / Kruskal reconstruction, layered shortest "
                         "paths, and implication graphs. The structural graph toolbox at Master level.",
                "signals": [
                    "Directed cycles to collapse → SCC + DAG DP.",
                    "Bottleneck / 'minimise the max edge on a path' → MST / Kruskal reconstruction.",
                    "Constraints of the form 'a OR b' → 2-SAT-style implication graph (reduces to SCC).",
                ],
                "technique": "Condense to a DAG and DP on it; build the reconstruction tree from Kruskal; model implications as a graph and run SCC.",
                "trap": "Treating a cyclic graph as a DAG; missing that bottleneck paths live on the MST.",
                "goal": "Pick the structural reduction the graph is hinting at.",
            },
            {
                "id": "strings-master",
                "title": "Heavy Strings",
                "icon": "Type",
                "lessons": ["suffix-array", "z-algorithm", "kmp", "rabin-karp"],
                "any": ["string suffix structures", "strings", "hashing"],
                "band": [2100, 2300], "sub": 100, "per": 5, "cap": 10,
                "blurb": "Suffix arrays/automata and hashing fused with data structures. Distinct "
                         "substrings, longest common/repeated, and query-heavy substring problems.",
                "signals": [
                    "'Number of distinct substrings', 'longest repeated/common substring'.",
                    "Substring queries answered offline across many positions.",
                    "Periodicity + ranges combined.",
                ],
                "technique": "Suffix array + LCP (or suffix automaton) for counting/ordering; combine hashing with a BIT/segment tree for queries.",
                "trap": "Suffix-structure constant factor timing out; hash collisions at scale.",
                "goal": "Choose the suffix structure that matches the query type.",
            },
            {
                "id": "combinatorics-master",
                "title": "Advanced Counting",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "exclude": ["geometry"],
                "band": [2100, 2300], "sub": 100, "per": 6, "cap": 12,
                "blurb": "Counting fused with DP and inclusion–exclusion: count configurations, count "
                         "with forbidden patterns, count over structures — proofs you must trust.",
                "signals": [
                    "'Count valid X' where X has rich internal structure.",
                    "DP whose value is a count, combined with binomials.",
                    "Inclusion–exclusion layered over a DP or over constraints.",
                ],
                "technique": "Set up a counting DP, fold in nCr factors, subtract invalid configurations by inclusion–exclusion; exploit symmetry.",
                "trap": "Inclusion–exclusion sign/term errors; overcounting symmetric objects.",
                "goal": "Fuse combinatorial identities with a DP cleanly.",
            },
            {
                "id": "number-theory-master",
                "title": "Deep Number Theory",
                "icon": "Sigma",
                "lessons": ["modular-arithmetic", "fast-exponentiation", "sieve", "gcd-lcm"],
                "any": ["number theory"], "exclude": ["dp"],
                "band": [2100, 2300], "sub": 100, "per": 5, "cap": 10,
                "blurb": "Multiplicative functions, Möbius/CRT-flavoured counting, and divisor-sum "
                         "manipulation. Number theory where the identity is the whole solution.",
                "signals": [
                    "Sums over gcd / divisors that beg for Möbius or divisor sieving.",
                    "Independent constraints modulo coprime numbers → CRT.",
                    "Counting via multiplicative structure.",
                ],
                "technique": "Divisor sieve to aggregate over multiples; Möbius inversion for coprime counting; CRT to merge modular constraints.",
                "trap": "Forgetting multiplicativity preconditions; overflow in divisor sums.",
                "goal": "Recognise gcd/divisor sums → Möbius / divisor sieve.",
            },
            {
                "id": "dp-opt-master",
                "title": "DP Optimisation & Divide-and-Conquer",
                "icon": "Search",
                "lessons": ["interval-dp", "merge-sort", "binary-search-variations"],
                "any": ["divide and conquer"], "exclude": ["strings"],
                "band": [2100, 2400], "sub": 150, "per": 5, "cap": 10,
                "blurb": "Drop an O(n^2) DP to O(n log n): divide-and-conquer optimisation, convex-hull "
                         "trick, Knuth — and D&C as a technique (inversions, CDQ).",
                "signals": [
                    "dp[i] = min(dp[j] + cost(j,i)) with a monotone optimal j.",
                    "Cost obeys the quadrangle inequality → Knuth / D&C opt.",
                    "Count cross-pairs over a split → divide and conquer.",
                ],
                "technique": "Prove monotonicity of the optimal split and recurse over it; maintain lines for CHT; merge-count cross-pairs in O(n).",
                "trap": "Applying an optimisation without checking its monotonicity/convexity precondition.",
                "goal": "Spot the structure that unlocks a faster DP.",
            },
            {
                "id": "probability-master",
                "title": "Probability & Expectation",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["probabilities"],
                "band": [2100, 2400], "sub": 150, "per": 5, "cap": 10,
                "blurb": "Expected value and probability, usually mod p. Linearity of expectation turns "
                         "a frightening global quantity into a sum of tiny independent contributions.",
                "signals": [
                    "'Expected value / probability that …'.",
                    "A global random quantity that decomposes per element / per pair.",
                    "Markov-chain-like transitions on a small state space.",
                ],
                "technique": "Linearity of expectation: sum each contribution independently; set up and solve the linear system / DP over states; keep probabilities as modular fractions.",
                "trap": "Assuming independence that isn't there; modular inverse of probabilities.",
                "goal": "Decompose expectations by linearity automatically.",
            },
            {
                "id": "matrix-master",
                "title": "Matrix Exponentiation",
                "icon": "Grid3x3",
                "lessons": ["fast-exponentiation"],
                "any": ["matrices"],
                "band": [2100, 2500], "sub": 200, "per": 4, "cap": 10,
                "blurb": "Evaluate a linear recurrence at enormous n by raising its transition matrix to "
                         "the n-th power in O(k^3 log n) — also counts fixed-length walks in a small graph.",
                "signals": [
                    "Linear recurrence wanted at n up to 1e18.",
                    "'Number of walks of length n' in a small graph.",
                    "A state vector advanced by the same linear map each step.",
                ],
                "technique": "Encode the transition as a matrix and binary-exponentiate it under the modulus; adjacency-matrix powers count walks.",
                "trap": "Cubic multiply too slow when k is large; modular overflow in the product.",
                "goal": "See 'linear recurrence at huge n' → matrix power.",
            },
        ],
    },
    {
        "id": "grandmaster",
        "title": "Grandmaster",
        "rank": "Master → Grandmaster",
        "ratingLabel": "2300 – 2600",
        "color": "#ff0000",
        "summary": "Grandmaster territory (red). Each problem needs a genuine insight plus flawless "
                   "implementation of a heavy technique. Fewer per theme — every one is a serious sitting. "
                   "Still built entirely from the Module-1 toolbox, taken much deeper.",
        "themes": [
            {
                "id": "dp-gm",
                "title": "Grandmaster DP",
                "icon": "Grid3x3",
                "lessons": ["bitmask-dp", "interval-dp", "digit-dp"],
                "any": ["dp"], "exclude": ["trees", "data structures", "strings"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 13,
                "blurb": "DP where even seeing the state is hard: profile/broken-profile DP, DP on "
                         "subsets with extra structure, and transitions that need their own algorithm.",
                "signals": [
                    "The state is an object (a profile, a partition, a set with metadata).",
                    "A correct DP whose transition is itself a non-trivial computation.",
                    "Optimisation only possible after reformulating the recurrence.",
                ],
                "technique": "Reformulate until the state is minimal and the transition is a known fast operation; layer prefix sums / data structures inside the transition.",
                "trap": "Locking onto the first state you think of; missing a reformulation that halves a dimension.",
                "goal": "Reformulate DPs until they become tractable.",
            },
            {
                "id": "ds-gm",
                "title": "Heavy Data Structures",
                "icon": "Binary",
                "lessons": ["lazy-propagation", "segment-tree", "fenwick"],
                "any": ["data structures"], "exclude": ["strings"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 13,
                "blurb": "Segment tree beats, persistent structures, merge-sort tree, and DSU-on-tree. "
                         "The structure is intricate and the proof of its complexity matters.",
                "signals": [
                    "Range operations with a non-obvious potential/amortised bound.",
                    "Historic / versioned queries → persistence.",
                    "Offline tree queries → DSU on tree (small-to-large on counts).",
                ],
                "technique": "Reach for beats / persistence / merge-sort tree by the query type; argue the amortised or O(n log^2) bound explicitly.",
                "trap": "Hand-waving the complexity of a beats/amortised structure; memory blowup in persistence.",
                "goal": "Match an exotic structure to the query and prove its bound.",
            },
            {
                "id": "tree-gm",
                "title": "Advanced Trees",
                "icon": "GitBranch",
                "lessons": ["tree-dp", "lca", "tree-diameter"],
                "any": ["trees"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 12,
                "blurb": "Centroid decomposition, heavy-light, auxiliary/virtual trees, and DSU-on-tree. "
                         "Path and subtree problems that need a genuine tree-decomposition.",
                "signals": [
                    "Count/aggregate over all paths → centroid decomposition.",
                    "Path queries with updates → heavy-light + segment tree.",
                    "Queries on a small set of important nodes → virtual tree.",
                ],
                "technique": "Centroid decomposition for path counting; HLD to map paths to ranges; build the virtual tree on the relevant nodes.",
                "trap": "Centroid recursion bugs / double counting through the centroid; HLD index errors.",
                "goal": "Select the right tree decomposition for the query.",
            },
            {
                "id": "graphs-gm",
                "title": "Hard Graph Theory",
                "icon": "Share2",
                "lessons": ["scc", "dijkstra", "union-find", "mst-kruskal"],
                "any": ["graphs", "shortest paths", "dsu"], "exclude": ["trees"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 12,
                "blurb": "SCC/2-SAT reductions, MST reconstruction trees, small-to-large on components, "
                         "and shortest paths with exotic state. Deep structural graph reasoning.",
                "signals": [
                    "Boolean constraints 'a OR b' → 2-SAT via SCC.",
                    "Queries about the min/max edge on paths → Kruskal reconstruction tree.",
                    "Offline connectivity over edge insertions/deletions → DSU tricks.",
                ],
                "technique": "Reduce to SCC where possible; build the reconstruction tree; process connectivity offline; layer state into the graph nodes.",
                "trap": "Incorrect 2-SAT implication edges; assuming online when an offline DSU is intended.",
                "goal": "Find the reduction that turns the graph tractable.",
            },
            {
                "id": "strings-gm",
                "title": "Suffix Structures",
                "icon": "Type",
                "lessons": ["suffix-array", "z-algorithm", "kmp"],
                "any": ["string suffix structures", "strings", "hashing"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 11,
                "blurb": "Suffix automaton/array, Aho-Corasick-style multi-pattern reasoning, and "
                         "hashing fused with heavy data structures. The top end of string algorithmics.",
                "signals": [
                    "Counting distinct substrings / occurrences across many patterns.",
                    "Substring statistics over the suffix-automaton DAG.",
                    "Lexicographic structure exploited with a data structure.",
                ],
                "technique": "Suffix automaton for substring counting; suffix array + LCP for ordering; combine with segment trees / BIT for query aggregation.",
                "trap": "Suffix-automaton transition/clone bugs; constant factor timing out.",
                "goal": "Wield suffix structures as a routine tool.",
            },
            {
                "id": "combinatorics-gm",
                "title": "Counting Masterclass",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "exclude": ["geometry"],
                "band": [2300, 2600], "sub": 100, "per": 5, "cap": 12,
                "blurb": "Generating-function thinking, layered inclusion–exclusion, and counting over "
                         "complex structures. Where the right algebraic manipulation is the whole problem.",
                "signals": [
                    "A count that resists direct DP but telescopes algebraically.",
                    "Inclusion–exclusion nested several levels deep.",
                    "Symmetry you can quotient out (Burnside-style).",
                ],
                "technique": "Model with generating functions / convolutions; apply layered inclusion–exclusion; collapse sums with combinatorial identities.",
                "trap": "Sign/term bookkeeping in deep inclusion–exclusion; missing a symmetry.",
                "goal": "Reach for the algebraic reformulation of a count.",
            },
            {
                "id": "number-theory-gm",
                "title": "Number Theory Masterclass",
                "icon": "Sigma",
                "lessons": ["modular-arithmetic", "fast-exponentiation", "sieve"],
                "any": ["number theory"],
                "band": [2300, 2600], "sub": 100, "per": 4, "cap": 10,
                "blurb": "Möbius inversion, multiplicative-function sieves, primitive roots and discrete "
                         "logs. Number theory where a deep identity collapses the whole computation.",
                "signals": [
                    "Sums over gcd/divisors at scale → Möbius / Dirichlet.",
                    "Order / primitive-root structure modulo p.",
                    "Counting with multiplicative functions.",
                ],
                "technique": "Möbius inversion and divisor sieves to aggregate; precompute multiplicative functions; use orders / discrete log where the group structure helps.",
                "trap": "Multiplicativity assumed where it fails; precision/overflow in large sieved sums.",
                "goal": "Collapse number-theoretic sums with the right identity.",
            },
            {
                "id": "divide-conquer-gm",
                "title": "Divide & Conquer / DP-Opt",
                "icon": "Search",
                "lessons": ["merge-sort", "interval-dp", "binary-search-variations"],
                "any": ["divide and conquer"],
                "band": [2300, 2600], "sub": 100, "per": 4, "cap": 10,
                "blurb": "CDQ divide-and-conquer over time, divide-and-conquer DP optimisation, and "
                         "parallel binary search. Offline machinery that turns hard queries linear-ish.",
                "signals": [
                    "Offline queries + updates orderable by time → CDQ.",
                    "Answer-monotone queries solvable together → parallel binary search.",
                    "dp split point monotone in the outer index → D&C opt.",
                ],
                "technique": "CDQ: recurse on time, apply left updates to right queries; parallel binary search across all queries at once; D&C over the monotone optimal split.",
                "trap": "Mixing update/query order across the CDQ split; non-monotone assumptions.",
                "goal": "Recognise when offline D&C machinery applies.",
            },
            {
                "id": "constructive-gm",
                "title": "Grandmaster Constructive",
                "icon": "Coins",
                "lessons": ["exchange-argument", "activity-selection"],
                "any": ["constructive algorithms"],
                "band": [2300, 2600], "sub": 100, "per": 4, "cap": 11,
                "blurb": "Constructions with deep invariants and tight proofs, often interactive or "
                         "adaptive. The 'invent + prove' muscle at its strongest.",
                "signals": [
                    "'Construct …' with a subtle global constraint and an operation budget.",
                    "Interactive/adaptive judging.",
                    "A clean answer once the right invariant is found.",
                ],
                "technique": "Hunt the invariant; build incrementally maintaining it; prove validity and the bound; stress-test against brute force.",
                "trap": "A construction that passes small cases but breaks the bound at scale.",
                "goal": "Invent and rigorously justify hard constructions.",
            },
        ],
    },
    {
        "id": "intl-grandmaster",
        "title": "International Grandmaster",
        "rank": "Grandmaster → International GM & beyond",
        "ratingLabel": "2600 – 3500+",
        "color": "#b00000",
        "summary": "The summit. 2600+ problems are among the hardest Codeforces has produced — yet they "
                   "are still assembled from the Module-1 toolbox pushed to its absolute limit. Treat each "
                   "as a mini research problem: expect to spend hours, and to learn something every time.",
        "themes": [
            {
                "id": "dp-igm",
                "title": "Frontier DP",
                "icon": "Grid3x3",
                "lessons": ["bitmask-dp", "interval-dp", "digit-dp"],
                "any": ["dp"], "exclude": ["trees", "data structures"],
                "band": [2600, 3600], "sub": 200, "per": 4, "cap": 12,
                "blurb": "DP at the edge of the field: deep reformulations, connection-profile DP, and "
                         "recurrences that only become tractable after a hard structural observation.",
                "signals": [
                    "A count/optimum with no obvious state until you reframe the object.",
                    "Transitions hiding another full algorithm.",
                    "Optimisation possible only after an algebraic or structural rewrite.",
                ],
                "technique": "Reframe relentlessly; compress the state; embed convolutions / data structures / matrix powers inside the transition.",
                "trap": "Committing to a state before exploring reformulations; under-estimating the transition cost.",
                "goal": "Turn an intractable-looking count into a clean recurrence.",
            },
            {
                "id": "ds-igm",
                "title": "Extreme Data Structures",
                "icon": "Binary",
                "lessons": ["lazy-propagation", "segment-tree", "fenwick"],
                "any": ["data structures"], "exclude": ["strings"],
                "band": [2600, 3600], "sub": 200, "per": 4, "cap": 12,
                "blurb": "Persistent + amortised hybrids, segment tree beats with subtle potentials, "
                         "and offline machinery with delicate complexity proofs.",
                "signals": [
                    "Range ops whose efficiency rests on a non-obvious potential function.",
                    "Versioned + range + order-statistic queries combined.",
                    "Complexity only justified by amortised analysis.",
                ],
                "technique": "Combine persistence, beats, and offline sweeps; prove the amortised / O(n log^2) bound carefully; compress aggressively.",
                "trap": "Unproven complexity; memory limits on persistence; tag-algebra subtleties.",
                "goal": "Engineer and justify a bespoke heavy structure.",
            },
            {
                "id": "graphs-igm",
                "title": "Frontier Graph Theory",
                "icon": "Share2",
                "lessons": ["scc", "dijkstra", "union-find", "mst-kruskal"],
                "any": ["graphs", "shortest paths", "dsu"], "exclude": ["trees"],
                "band": [2600, 3600], "sub": 200, "per": 4, "cap": 11,
                "blurb": "Deep structural graph problems: layered SCC reductions, reconstruction-tree "
                         "queries, and shortest paths over richly augmented state spaces.",
                "signals": [
                    "A reduction to SCC / DSU that itself takes work to see.",
                    "Path-extremal queries over an MST reconstruction tree.",
                    "State graphs with many augmenting dimensions.",
                ],
                "technique": "Find the reduction, then apply the known machinery flawlessly; augment node state minimally; exploit the reconstruction tree.",
                "trap": "Wrong reduction; exploding the augmented state space.",
                "goal": "See the hidden reduction in a hard graph problem.",
            },
            {
                "id": "trees-igm",
                "title": "Frontier Trees",
                "icon": "GitBranch",
                "lessons": ["tree-dp", "lca", "tree-diameter"],
                "any": ["trees"],
                "band": [2600, 3600], "sub": 200, "per": 3, "cap": 11,
                "blurb": "Centroid + data structure hybrids, auxiliary trees with DP, and path "
                         "aggregates needing several techniques stacked together.",
                "signals": [
                    "All-paths aggregates with a heavy per-centroid computation.",
                    "Dynamic / offline tree queries combining decomposition and a structure.",
                    "Virtual tree + DP over a query-specific subtree.",
                ],
                "technique": "Stack centroid decomposition / HLD / virtual trees with segment trees and DP; keep each layer's complexity in check.",
                "trap": "Compounding log factors past the time limit; decomposition double-counting.",
                "goal": "Compose multiple tree techniques correctly.",
            },
            {
                "id": "strings-igm",
                "title": "Frontier Strings",
                "icon": "Type",
                "lessons": ["suffix-array", "z-algorithm", "kmp"],
                "any": ["string suffix structures", "strings", "hashing"],
                "band": [2600, 3600], "sub": 250, "per": 3, "cap": 10,
                "blurb": "Suffix automaton/array combined with heavy data structures and DP. The hardest "
                         "substring problems on Codeforces, where every component must be optimal.",
                "signals": [
                    "Substring statistics over the suffix-automaton with extra constraints.",
                    "Multi-pattern matching fused with counting.",
                    "Lexicographic + structural queries together.",
                ],
                "technique": "Build the suffix automaton/array, then run DP / data structures over its DAG / LCP intervals; control constant factors.",
                "trap": "Automaton edge cases; constant factor death.",
                "goal": "Treat suffix structures as a base layer for harder logic.",
            },
            {
                "id": "combinatorics-igm",
                "title": "Frontier Counting",
                "icon": "Sigma",
                "lessons": ["combinatorics", "modular-arithmetic"],
                "any": ["combinatorics"], "exclude": ["geometry"],
                "band": [2600, 3600], "sub": 200, "per": 4, "cap": 11,
                "blurb": "Generating functions, advanced inclusion–exclusion, and counting over deeply "
                         "structured objects. Long algebraic derivations that must be exactly right.",
                "signals": [
                    "Counts expressible as polynomial / power-series convolutions.",
                    "Several layers of inclusion–exclusion or symmetry.",
                    "Bijections that transform a hard count into an easy one.",
                ],
                "technique": "Generating functions and convolutions; layered inclusion–exclusion; bijective reformulation; everything mod p with precomputed factorials.",
                "trap": "A single sign or index error invalidating the whole derivation.",
                "goal": "Carry a long counting derivation without error.",
            },
            {
                "id": "number-theory-igm",
                "title": "Frontier Number Theory",
                "icon": "Sigma",
                "lessons": ["modular-arithmetic", "fast-exponentiation", "sieve"],
                "any": ["number theory"],
                "band": [2600, 3600], "sub": 250, "per": 3, "cap": 10,
                "blurb": "Deep multiplicative-function machinery, sublinear sieves, and group-structure "
                         "tricks. Number theory at the level where the identity is a small theorem.",
                "signals": [
                    "Sublinear evaluation of a multiplicative sum.",
                    "Heavy Möbius / Dirichlet manipulation.",
                    "Order / discrete-log structure exploited deeply.",
                ],
                "technique": "Sublinear sieves for prefix sums of multiplicative functions; Möbius/Dirichlet algebra; group structure for order-based counting.",
                "trap": "Precision/overflow at scale; multiplicativity edge cases.",
                "goal": "Apply sublinear number-theoretic machinery.",
            },
            {
                "id": "constructive-igm",
                "title": "Frontier Constructive",
                "icon": "Coins",
                "lessons": ["exchange-argument", "activity-selection"],
                "any": ["constructive algorithms"],
                "band": [2600, 3600], "sub": 200, "per": 3, "cap": 10,
                "blurb": "The deepest constructive and interactive problems: a single elegant invariant "
                         "or adaptive strategy, found only after long thought and proven airtight.",
                "signals": [
                    "'Construct / interact …' with an extremely tight bound.",
                    "Adaptive judging that punishes any wasted query.",
                    "A beautiful answer that is invisible until the key idea lands.",
                ],
                "technique": "Search for the one invariant or strategy that dominates; prove it fully; stress-test the construction exhaustively.",
                "trap": "Plausible ideas that fail the bound — only a proof saves you here.",
                "goal": "Find and prove the decisive constructive idea.",
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
        "title": "Road to Grandmaster",
        "tagline": "A Codeforces-only ladder that turns the Module 1 algorithm toolbox into "
                   "rating — Newbie all the way to International Grandmaster. Every problem is real, "
                   "curated by popularity, and grouped by the pattern it trains.",
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
