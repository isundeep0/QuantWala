# -*- coding: utf-8 -*-
SOLS = {
 "bitmask-dp": {
  "bm1": dict(approach=[
     "Each element is either used or not — a subset, encoded as a bitmask. dp[mask] = the amount filled in the current bucket (mod target) when exactly the elements in mask are placed.",
     "If the total isn't divisible by k, or any element exceeds target, it's impossible. Otherwise add an unused element only if it keeps the current bucket <= target; reaching the full mask with remainder 0 means success."],
   time="O(2^n · n)", space="O(2^n)",
   cpp="""class Solution {
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % k) return false;
        int target = total / k, n = nums.size();
        if (*max_element(nums.begin(), nums.end()) > target) return false;
        vector<int> dp(1 << n, -1); dp[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == -1) continue;
            for (int i = 0; i < n; i++)
                if (!(mask & (1 << i)) && dp[mask] + nums[i] <= target)
                    dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;
        }
        return dp[(1 << n) - 1] == 0;
    }
};""",
   python="""class Solution:
    def canPartitionKSubsets(self, nums: list[int], k: int) -> bool:
        total = sum(nums)
        if total % k:
            return False
        target, n = total // k, len(nums)
        if max(nums) > target:
            return False
        dp = [-1] * (1 << n)
        dp[0] = 0
        for mask in range(1 << n):
            if dp[mask] == -1:
                continue
            for i in range(n):
                if not (mask >> i & 1) and dp[mask] + nums[i] <= target:
                    dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target
        return dp[(1 << n) - 1] == 0"""),
  "bm2": dict(approach=[
     "State is (current node, set of visited nodes as a bitmask). We want the shortest walk whose mask becomes all-ones.",
     "BFS over these states (edges are unweighted) starting from every node with only itself visited; the first time any state reaches the full mask gives the answer."],
   time="O(2^n · n^2)", space="O(2^n · n)",
   cpp="""class Solution {
public:
    int shortestPathLength(vector<vector<int>>& graph) {
        int n = graph.size(), full = (1 << n) - 1;
        vector<vector<bool>> seen(n, vector<bool>(1 << n, false));
        queue<tuple<int,int,int>> q;   // node, mask, dist
        for (int i = 0; i < n; i++) { q.push({i, 1 << i, 0}); seen[i][1 << i] = true; }
        while (!q.empty()) {
            auto [u, mask, d] = q.front(); q.pop();
            if (mask == full) return d;
            for (int v : graph[u]) {
                int nm = mask | (1 << v);
                if (!seen[v][nm]) { seen[v][nm] = true; q.push({v, nm, d + 1}); }
            }
        }
        return 0;
    }
};""",
   python="""from collections import deque
class Solution:
    def shortestPathLength(self, graph):
        n = len(graph)
        full = (1 << n) - 1
        seen = set()
        q = deque()
        for i in range(n):
            q.append((i, 1 << i, 0)); seen.add((i, 1 << i))
        while q:
            u, mask, d = q.popleft()
            if mask == full:
                return d
            for v in graph[u]:
                nm = mask | (1 << v)
                if (v, nm) not in seen:
                    seen.add((v, nm)); q.append((v, nm, d + 1))
        return 0"""),
  "bm3": dict(approach=[
     "There are at most 10 people but 40 hats, so make people the bitmask (2^10) and iterate over hats.",
     "dp[mask] = ways to assign hats so the people in mask have hats. For each hat, optionally give it to one person who likes it: dp'[mask | 1<<p] += dp[mask]. Answer is dp[fullPeople]."],
   time="O(40 · 2^n · n)", space="O(2^n)",
   cpp="""class Solution {
public:
    int numberWays(vector<vector<int>>& hats) {
        const long long MOD = 1e9 + 7;
        int n = hats.size(), full = (1 << n) - 1;
        vector<vector<int>> hatToPeople(41);
        for (int p = 0; p < n; p++) for (int h : hats[p]) hatToPeople[h].push_back(p);
        vector<long long> dp(1 << n, 0); dp[0] = 1;
        for (int h = 1; h <= 40; h++) {
            vector<long long> ndp = dp;
            for (int mask = 0; mask <= full; mask++) {
                if (!dp[mask]) continue;
                for (int p : hatToPeople[h])
                    if (!(mask & (1 << p))) ndp[mask | (1 << p)] = (ndp[mask | (1 << p)] + dp[mask]) % MOD;
            }
            dp = ndp;
        }
        return (int)dp[full];
    }
};""",
   python="""class Solution:
    def numberWays(self, hats):
        MOD = 10**9 + 7
        n = len(hats)
        full = (1 << n) - 1
        hat_to_people = [[] for _ in range(41)]
        for p in range(n):
            for h in hats[p]:
                hat_to_people[h].append(p)
        dp = [0] * (1 << n)
        dp[0] = 1
        for h in range(1, 41):
            ndp = dp[:]
            for mask in range(full + 1):
                if not dp[mask]:
                    continue
                for p in hat_to_people[h]:
                    if not (mask >> p & 1):
                        ndp[mask | (1 << p)] = (ndp[mask | (1 << p)] + dp[mask]) % MOD
            dp = ndp
        return dp[full]"""),
  "bm4": dict(approach=[
     "Process the grid row by row; each row's seating is a bitmask. A valid row mask uses only good seats and has no two horizontally adjacent students.",
     "A row mask is compatible with the previous row's mask if there are no upper-left/upper-right conflicts: (mask & prev<<1)==0 and (mask & prev>>1)==0. DP keeps the max students over compatible transitions."],
   time="O(m · 4^n)", space="O(2^n)",
   cpp="""class Solution {
public:
    int maxStudents(vector<vector<char>>& seats) {
        int m = seats.size(), n = seats[0].size();
        vector<int> good(m, 0);
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (seats[i][j] == '.') good[i] |= (1 << j);
        vector<int> prev(1 << n, -1); prev[0] = 0;
        for (int i = 0; i < m; i++) {
            vector<int> cur(1 << n, -1);
            for (int mask = 0; mask < (1 << n); mask++) {
                if ((mask & good[i]) != mask) continue;     // only good seats
                if (mask & (mask << 1)) continue;            // no horizontal neighbour
                for (int pm = 0; pm < (1 << n); pm++) {
                    if (prev[pm] == -1) continue;
                    if ((mask & (pm << 1)) || (mask & (pm >> 1))) continue;
                    cur[mask] = max(cur[mask], prev[pm] + __builtin_popcount(mask));
                }
            }
            prev = cur;
        }
        int best = 0;
        for (int v : prev) best = max(best, v);
        return best;
    }
};""",
   python="""class Solution:
    def maxStudents(self, seats):
        m, n = len(seats), len(seats[0])
        good = [0] * m
        for i in range(m):
            for j in range(n):
                if seats[i][j] == '.':
                    good[i] |= (1 << j)
        prev = {0: 0}
        for i in range(m):
            cur = {}
            for mask in range(1 << n):
                if (mask & good[i]) != mask:
                    continue
                if mask & (mask << 1):
                    continue
                pc = bin(mask).count('1')
                for pm, val in prev.items():
                    if (mask & (pm << 1)) or (mask & (pm >> 1)):
                        continue
                    cur[mask] = max(cur.get(mask, 0), val + pc)
            prev = cur if cur else {0: max(prev.values())}
        return max(prev.values())"""),
  "bm5": dict(approach=[
     "Held-Karp: dp[mask][i] = minimum cost of a path that visits exactly the nodes in mask and ends at i.",
     "Transition from dp[mask][i] to dp[mask | 1<<j][j] adding dist[i][j]. The answer is the minimum dp[full][i] over all endpoints i (a Hamiltonian path)."],
   time="O(2^n · n^2)", space="O(2^n · n)",
   cpp="""class Solution {
public:
    int tsp(vector<vector<int>>& dist) {
        int n = dist.size(), full = (1 << n) - 1;
        const int INF = 1e9;
        vector<vector<int>> dp(1 << n, vector<int>(n, INF));
        for (int i = 0; i < n; i++) dp[1 << i][i] = 0;
        for (int mask = 1; mask <= full; mask++)
            for (int i = 0; i < n; i++) {
                if (dp[mask][i] == INF || !(mask & (1 << i))) continue;
                for (int j = 0; j < n; j++)
                    if (!(mask & (1 << j)))
                        dp[mask | (1 << j)][j] = min(dp[mask | (1 << j)][j], dp[mask][i] + dist[i][j]);
            }
        int best = INF;
        for (int i = 0; i < n; i++) best = min(best, dp[full][i]);
        return best;
    }
};""",
   python="""class Solution:
    def tsp(self, dist):
        n = len(dist)
        full = (1 << n) - 1
        INF = float('inf')
        dp = [[INF] * n for _ in range(1 << n)]
        for i in range(n):
            dp[1 << i][i] = 0
        for mask in range(1, full + 1):
            for i in range(n):
                if dp[mask][i] == INF or not (mask >> i & 1):
                    continue
                for j in range(n):
                    if not (mask >> j & 1):
                        nm = mask | (1 << j)
                        if dp[mask][i] + dist[i][j] < dp[nm][j]:
                            dp[nm][j] = dp[mask][i] + dist[i][j]
        return min(dp[full])"""),
 },
 "digit-dp": {
  "dd1": dict(approach=[
     "Count numbers in [0, 10^n) whose digits are all distinct. This is a counting-principle (the combinatorial heart of digit DP).",
     "For length 1 there are 10. For each additional digit the first digit has 9 choices (no leading zero) and each subsequent has one fewer available digit: 9·9, 9·9·8, …. Sum across lengths."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int countNumbersWithUniqueDigits(int n) {
        if (n == 0) return 1;
        int res = 10, unique = 9, available = 9;
        for (int i = 2; i <= n; i++) { unique *= available; available--; res += unique; }
        return res;
    }
};""",
   python="""class Solution:
    def countNumbersWithUniqueDigits(self, n: int) -> int:
        if n == 0:
            return 1
        res, unique, available = 10, 9, 9
        for _ in range(2, n + 1):
            unique *= available
            available -= 1
            res += unique
        return res"""),
  "dd2": dict(approach=[
     "Count positive integers <= n built only from the allowed digit set. Split by length.",
     "Numbers with fewer digits than n: m^len for each shorter length (m = set size). For the same length, scan n's digits left to right: at each position count allowed digits strictly smaller (each frees the rest to be anything → ·m^remaining), then continue only if the exact digit is allowed; add 1 at the end if n itself is fully constructible."],
   time="O(len · m)", space="O(len)",
   cpp="""class Solution {
public:
    int atMostNGivenDigitSet(vector<string>& digits, int n) {
        string s = to_string(n);
        int k = s.size(), m = digits.size();
        vector<long long> pw(k + 1, 1);
        for (int i = 1; i <= k; i++) pw[i] = pw[i - 1] * m;
        long long res = 0;
        for (int len = 1; len < k; len++) res += pw[len];
        for (int i = 0; i < k; i++) {
            bool canEqual = false;
            for (auto& d : digits) {
                if (d[0] < s[i]) res += pw[k - 1 - i];
                else if (d[0] == s[i]) canEqual = true;
            }
            if (!canEqual) return (int)res;
        }
        return (int)res + 1;          // n itself is constructible
    }
};""",
   python="""class Solution:
    def atMostNGivenDigitSet(self, digits: list[str], n: int) -> int:
        s = str(n)
        k, m = len(s), len(digits)
        pw = [1] * (k + 1)
        for i in range(1, k + 1):
            pw[i] = pw[i - 1] * m
        res = sum(pw[length] for length in range(1, k))
        for i, ch in enumerate(s):
            can_equal = False
            for d in digits:
                if d < ch:
                    res += pw[k - 1 - i]
                elif d == ch:
                    can_equal = True
            if not can_equal:
                return res
        return res + 1"""),
  "dd3": dict(approach=[
     "Define f(x) = count of integers in [0, x] whose digit sum lies in [min_sum, max_sum]. The answer is f(num2) - f(num1 - 1).",
     "Digit DP over the decimal string with state (position, running sum, tight). Prune when the sum exceeds max_sum; memoise the non-tight states. Take everything modulo 1e9+7."],
   time="O(len · maxSum · 10)", space="O(len · maxSum)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    int mins, maxs; string s;
    vector<vector<long long>> memo;
    long long dp(int pos, int sum, bool tight) {
        if (sum > maxs) return 0;
        if (pos == (int)s.size()) return sum >= mins ? 1 : 0;
        if (!tight && memo[pos][sum] != -1) return memo[pos][sum];
        int hi = tight ? s[pos] - '0' : 9;
        long long res = 0;
        for (int d = 0; d <= hi; d++) res = (res + dp(pos + 1, sum + d, tight && d == hi)) % MOD;
        if (!tight) memo[pos][sum] = res;
        return res;
    }
    long long f(string x) { s = x; memo.assign(s.size(), vector<long long>(maxs + 1, -1)); return dp(0, 0, true); }
    string dec(string x) {                 // x - 1 for x >= "1"
        int i = x.size() - 1;
        while (x[i] == '0') { x[i] = '9'; i--; }
        x[i]--;
        int start = 0; while (start + 1 < (int)x.size() && x[start] == '0') start++;
        return x.substr(start);
    }
public:
    int count(string num1, string num2, int min_sum, int max_sum) {
        mins = min_sum; maxs = max_sum;
        return (int)((f(num2) - f(dec(num1)) + MOD) % MOD);
    }
};""",
   python="""from functools import lru_cache
class Solution:
    def count(self, num1: str, num2: str, min_sum: int, max_sum: int) -> int:
        MOD = 10**9 + 7
        def f(x: str) -> int:
            @lru_cache(None)
            def dp(pos, s, tight):
                if s > max_sum:
                    return 0
                if pos == len(x):
                    return 1 if s >= min_sum else 0
                hi = int(x[pos]) if tight else 9
                res = 0
                for d in range(hi + 1):
                    res += dp(pos + 1, s + d, tight and d == hi)
                return res % MOD
            ans = dp(0, 0, True)
            dp.cache_clear()
            return ans
        lo = str(int(num1) - 1)
        return (f(num2) - f(lo)) % MOD"""),
  "dd4": dict(approach=[
     "Count integers in [0, n] whose binary representation has no two consecutive 1s. Digit DP over the bits (most significant first).",
     "State (position, previous bit, tight). Forbid placing a 1 right after a 1; otherwise try both bits within the tight bound."],
   time="O(bits)", space="O(bits)",
   cpp="""class Solution {
    vector<int> bits;
    int memo[32][2];
    bool done[32][2];
    int dp(int pos, int prev, bool tight) {
        if (pos == (int)bits.size()) return 1;
        if (!tight && done[pos][prev]) return memo[pos][prev];
        int hi = tight ? bits[pos] : 1, res = 0;
        for (int b = 0; b <= hi; b++) {
            if (prev == 1 && b == 1) continue;
            res += dp(pos + 1, b, tight && b == hi);
        }
        if (!tight) { done[pos][prev] = true; memo[pos][prev] = res; }
        return res;
    }
public:
    int findIntegers(int n) {
        for (int i = 30; i >= 0; i--) if ((n >> i) & 1 || !bits.empty()) bits.push_back((n >> i) & 1);
        if (bits.empty()) return 1;
        memset(done, 0, sizeof(done));
        return dp(0, 0, true);
    }
};""",
   python="""from functools import lru_cache
class Solution:
    def findIntegers(self, n: int) -> int:
        bits = bin(n)[2:]
        @lru_cache(None)
        def dp(pos, prev, tight):
            if pos == len(bits):
                return 1
            hi = int(bits[pos]) if tight else 1
            res = 0
            for b in range(hi + 1):
                if prev == 1 and b == 1:
                    continue
                res += dp(pos + 1, b, tight and b == hi)
            return res
        return dp(0, 0, True)"""),
  "dd5": dict(approach=[
     "A 'classy' number has at most three non-zero digits. Define f(x) = count of classy integers in [1, x]; the answer is f(R) - f(L-1).",
     "Digit DP over x's decimal digits with state (position, count of non-zero digits used, tight). Stop a branch once the count would exceed 3."],
   time="O(len · 4 · 10)", space="O(len)",
   cpp="""class Solution {
    string s;
    long long memo[19][4];
    bool done[19][4];
    long long dp(int pos, int nz, bool tight) {
        if (nz > 3) return 0;
        if (pos == (int)s.size()) return 1;
        if (!tight && done[pos][nz]) return memo[pos][nz];
        int hi = tight ? s[pos] - '0' : 9;
        long long res = 0;
        for (int d = 0; d <= hi; d++) res += dp(pos + 1, nz + (d != 0), tight && d == hi);
        if (!tight) { done[pos][nz] = true; memo[pos][nz] = res; }
        return res;
    }
    long long f(long long x) { if (x <= 0) return 0; s = to_string(x); memset(done, 0, sizeof(done)); return dp(0, 0, true); }
public:
    long long countClassy(long long L, long long R) { return f(R) - f(L - 1); }
};""",
   python="""from functools import lru_cache
class Solution:
    def countClassy(self, L: int, R: int) -> int:
        def f(x: int) -> int:
            if x <= 0:
                return 0
            s = str(x)
            @lru_cache(None)
            def dp(pos, nz, tight):
                if nz > 3:
                    return 0
                if pos == len(s):
                    return 1
                hi = int(s[pos]) if tight else 9
                res = 0
                for d in range(hi + 1):
                    res += dp(pos + 1, nz + (1 if d else 0), tight and d == hi)
                return res
            ans = dp(0, 0, True)
            dp.cache_clear()
            return ans
        return f(R) - f(L - 1)"""),
 },
 "interval-dp": {
  "id1": dict(approach=[
     "Think of the LAST balloon to burst in an interval (i, j). When it bursts, its neighbours are exactly the boundaries i and j (everything inside is gone).",
     "dp[i][j] = max coins bursting all balloons strictly between i and j. Try each k as the last: dp[i][j] = max(dp[i][k] + a[i]·a[k]·a[j] + dp[k][j]). Pad the array with 1s on both ends."],
   time="O(n^3)", space="O(n^2)",
   cpp="""class Solution {
public:
    int maxCoins(vector<int>& nums) {
        int n = nums.size();
        vector<int> a(n + 2, 1);
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
        for (int len = 2; len <= n + 1; len++)
            for (int i = 0; i + len <= n + 1; i++) {
                int j = i + len;
                for (int k = i + 1; k < j; k++)
                    dp[i][j] = max(dp[i][j], dp[i][k] + a[i] * a[k] * a[j] + dp[k][j]);
            }
        return dp[0][n + 1];
    }
};""",
   python="""class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):
            for i in range(n - length):
                j = i + length
                for k in range(i + 1, j):
                    dp[i][j] = max(dp[i][j], dp[i][k] + a[i] * a[k] * a[j] + dp[k][j])
        return dp[0][n - 1]"""),
  "id2": dict(approach=[
     "Triangulating a polygon: pick the third vertex k of the triangle on edge (i, j). That splits the polygon into two sub-polygons.",
     "dp[i][j] = min over k of dp[i][k] + dp[k][j] + v[i]·v[k]·v[j]. Base: adjacent vertices cost 0."],
   time="O(n^3)", space="O(n^2)",
   cpp="""class Solution {
public:
    int minScoreTriangulation(vector<int>& v) {
        int n = v.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int len = 2; len < n; len++)
            for (int i = 0; i + len < n; i++) {
                int j = i + len; dp[i][j] = INT_MAX;
                for (int k = i + 1; k < j; k++)
                    dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + v[i] * v[k] * v[j]);
            }
        return dp[0][n - 1];
    }
};""",
   python="""class Solution:
    def minScoreTriangulation(self, v: list[int]) -> int:
        n = len(v)
        dp = [[0] * n for _ in range(n)]
        for length in range(2, n):
            for i in range(n - length):
                j = i + length
                dp[i][j] = min(dp[i][k] + dp[k][j] + v[i] * v[k] * v[j] for k in range(i + 1, j))
        return dp[0][n - 1]"""),
  "id3": dict(approach=[
     "Both players play optimally, so track the score difference (current player minus opponent) on each interval.",
     "dp[i][j] = max(take left: a[i] - dp[i+1][j], take right: a[j] - dp[i][j-1]). The first player wins iff dp over the whole array is positive."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
public:
    bool stoneGame(vector<int>& a) {
        int n = a.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++) dp[i][i] = a[i];
        for (int len = 1; len < n; len++)
            for (int i = 0; i + len < n; i++) {
                int j = i + len;
                dp[i][j] = max(a[i] - dp[i + 1][j], a[j] - dp[i][j - 1]);
            }
        return dp[0][n - 1] > 0;
    }
};""",
   python="""class Solution:
    def stoneGame(self, a: list[int]) -> bool:
        n = len(a)
        dp = [[0] * n for _ in range(n)]
        for i in range(n):
            dp[i][i] = a[i]
        for length in range(1, n):
            for i in range(n - length):
                j = i + length
                dp[i][j] = max(a[i] - dp[i + 1][j], a[j] - dp[i][j - 1])
        return dp[0][n - 1] > 0"""),
  "id4": dict(approach=[
     "dp[i][j] = minimum turns to print s[i..j]. Printing s[i] can also cover a later equal character, merging the work.",
     "Start with dp[i][j] = dp[i+1][j] + 1 (print s[i] alone). For any k in (i, j] with s[k]==s[i], combine: dp[i][j] = min(dp[i][j], dp[i+1][k-1] + dp[k][j])."],
   time="O(n^3)", space="O(n^2)",
   cpp="""class Solution {
public:
    int strangePrinter(string s) {
        int n = s.size();
        if (n == 0) return 0;
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++) dp[i][i] = 1;
        for (int len = 1; len < n; len++)
            for (int i = 0; i + len < n; i++) {
                int j = i + len;
                dp[i][j] = dp[i + 1][j] + 1;
                for (int k = i + 1; k <= j; k++)
                    if (s[k] == s[i])
                        dp[i][j] = min(dp[i][j], dp[i + 1][k - 1] + dp[k][j]);
            }
        return dp[0][n - 1];
    }
};""",
   python="""class Solution:
    def strangePrinter(self, s: str) -> int:
        n = len(s)
        if n == 0:
            return 0
        dp = [[0] * n for _ in range(n)]
        for i in range(n):
            dp[i][i] = 1
        for length in range(1, n):
            for i in range(n - length):
                j = i + length
                dp[i][j] = dp[i + 1][j] + 1
                for k in range(i + 1, j + 1):
                    if s[k] == s[i]:
                        left = dp[i + 1][k - 1] if k - 1 >= i + 1 else 0
                        dp[i][j] = min(dp[i][j], left + dp[k][j])
        return dp[0][n - 1]"""),
  "id5": dict(approach=[
     "Precompute pal[i][j] = whether s[i..j] is a palindrome using interval DP (it is iff ends match and the inside is a palindrome).",
     "Then cut[i] = min cuts for s[0..i]: if s[0..i] is a palindrome, 0; else min over j of cut[j-1]+1 where s[j..i] is a palindrome."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
public:
    int minCut(string s) {
        int n = s.size();
        vector<vector<bool>> pal(n, vector<bool>(n, false));
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
        vector<int> cut(n, 0);
        for (int i = 0; i < n; i++) {
            if (pal[0][i]) { cut[i] = 0; continue; }
            cut[i] = i;
            for (int j = 1; j <= i; j++)
                if (pal[j][i]) cut[i] = min(cut[i], cut[j - 1] + 1);
        }
        return cut[n - 1];
    }
};""",
   python="""class Solution:
    def minCut(self, s: str) -> int:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        cut = [0] * n
        for i in range(n):
            if pal[0][i]:
                cut[i] = 0
                continue
            cut[i] = i
            for j in range(1, i + 1):
                if pal[j][i]:
                    cut[i] = min(cut[i], cut[j - 1] + 1)
        return cut[n - 1]"""),
 },
}
