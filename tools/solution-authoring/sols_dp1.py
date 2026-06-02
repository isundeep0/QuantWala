# -*- coding: utf-8 -*-
SOLS = {
 "coin-change": {
  "cc1": dict(approach=[
     "Unbounded knapsack on amount: dp[a] = fewest coins to make amount a.",
     "For each coin, relax every amount >= coin: dp[a] = min(dp[a], dp[a-coin]+1). Initialise dp[0]=0 and the rest to infinity; unreachable stays infinity → -1."],
   time="O(amount · coins)", space="O(amount)",
   cpp="""class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1); dp[0] = 0;
        for (int c : coins)
            for (int a = c; a <= amount; a++)
                dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};""",
   python="""class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0
        for c in coins:
            for a in range(c, amount + 1):
                dp[a] = min(dp[a], dp[a - c] + 1)
        return -1 if dp[amount] > amount else dp[amount]"""),
  "cc2": dict(approach=[
     "Count combinations (order doesn't matter). Iterate coins on the outside so each coin is considered once per amount, avoiding double-counting permutations.",
     "dp[a] += dp[a-coin]; dp[0]=1 (one way to make 0)."],
   time="O(amount · coins)", space="O(amount)",
   cpp="""class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned long long> dp(amount + 1, 0); dp[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++)
                dp[a] += dp[a - c];
        return (int)dp[amount];
    }
};""",
   python="""class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1
        for c in coins:
            for a in range(c, amount + 1):
                dp[a] += dp[a - c]
        return dp[amount]"""),
  "cc3": dict(approach=[
     "Perfect squares are the 'coins'. dp[i] = fewest squares summing to i.",
     "For each i, try every square j*j <= i: dp[i] = min(dp[i], dp[i-j*j]+1)."],
   time="O(n √n)", space="O(n)",
   cpp="""class Solution {
public:
    int numSquares(int n) {
        vector<int> dp(n + 1, INT_MAX); dp[0] = 0;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j * j <= i; j++)
                dp[i] = min(dp[i], dp[i - j * j] + 1);
        return dp[n];
    }
};""",
   python="""class Solution:
    def numSquares(self, n: int) -> int:
        dp = [0] + [float('inf')] * n
        for i in range(1, n + 1):
            j = 1
            while j * j <= i:
                dp[i] = min(dp[i], dp[i - j * j] + 1)
                j += 1
        return dp[n]"""),
  "cc4": dict(approach=[
     "Here order matters (it counts sequences), so loop amount on the outside and try every number inside.",
     "dp[t] += dp[t-num] for every num; dp[0]=1. This counts ordered combinations."],
   time="O(target · n)", space="O(target)",
   cpp="""class Solution {
public:
    int combinationSum4(vector<int>& nums, int target) {
        vector<unsigned long long> dp(target + 1, 0); dp[0] = 1;
        for (int t = 1; t <= target; t++)
            for (int x : nums)
                if (x <= t) dp[t] += dp[t - x];
        return (int)dp[target];
    }
};""",
   python="""class Solution:
    def combinationSum4(self, nums: list[int], target: int) -> int:
        dp = [1] + [0] * target
        for t in range(1, target + 1):
            for x in nums:
                if x <= t:
                    dp[t] += dp[t - x]
        return dp[target]"""),
  "cc5": dict(approach=[
     "dp[d] = minimum cost to cover all travel up to day d. On non-travel days the cost carries over.",
     "On a travel day take the cheapest of a 1-day, 7-day, or 30-day pass bought to cover day d: min(dp[d-1]+c1, dp[d-7]+c7, dp[d-30]+c30)."],
   time="O(maxDay)", space="O(maxDay)",
   cpp="""class Solution {
public:
    int mincostTickets(vector<int>& days, vector<int>& costs) {
        int last = days.back();
        vector<int> dp(last + 1, 0);
        unordered_set<int> travel(days.begin(), days.end());
        for (int d = 1; d <= last; d++) {
            if (!travel.count(d)) { dp[d] = dp[d - 1]; continue; }
            dp[d] = min({dp[d - 1] + costs[0],
                         dp[max(0, d - 7)] + costs[1],
                         dp[max(0, d - 30)] + costs[2]});
        }
        return dp[last];
    }
};""",
   python="""class Solution:
    def mincostTickets(self, days: list[int], costs: list[int]) -> int:
        last = days[-1]
        travel = set(days)
        dp = [0] * (last + 1)
        for d in range(1, last + 1):
            if d not in travel:
                dp[d] = dp[d - 1]
            else:
                dp[d] = min(dp[d - 1] + costs[0],
                            dp[max(0, d - 7)] + costs[1],
                            dp[max(0, d - 30)] + costs[2])
        return dp[last]"""),
 },
 "knapsack": {
  "ks1": dict(approach=[
     "If the total is odd it can't split evenly. Otherwise ask: can a subset sum to total/2? That's a 0/1 subset-sum knapsack.",
     "Boolean dp over reachable sums; iterate sums downward so each number is used at most once."],
   time="O(n · sum)", space="O(sum)",
   cpp="""class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total & 1) return false;
        int target = total / 2;
        vector<bool> dp(target + 1, false); dp[0] = true;
        for (int x : nums)
            for (int s = target; s >= x; s--)
                dp[s] = dp[s] || dp[s - x];
        return dp[target];
    }
};""",
   python="""class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True
        for x in nums:
            for s in range(target, x - 1, -1):
                dp[s] = dp[s] or dp[s - x]
        return dp[target]"""),
  "ks2": dict(approach=[
     "Splitting numbers into + and - groups with sum S means the positive group sums to (total + S)/2. Count subsets reaching that target.",
     "Check feasibility (non-negative, even). Then a counting subset-sum knapsack: dp[s] += dp[s-x] iterating downward."],
   time="O(n · sum)", space="O(sum)",
   cpp="""class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int S) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (abs(S) > total || ((total + S) & 1)) return 0;
        int target = (total + S) / 2;
        vector<int> dp(target + 1, 0); dp[0] = 1;
        for (int x : nums)
            for (int s = target; s >= x; s--)
                dp[s] += dp[s - x];
        return dp[target];
    }
};""",
   python="""class Solution:
    def findTargetSumWays(self, nums: list[int], S: int) -> int:
        total = sum(nums)
        if abs(S) > total or (total + S) % 2:
            return 0
        target = (total + S) // 2
        dp = [1] + [0] * target
        for x in nums:
            for s in range(target, x - 1, -1):
                dp[s] += dp[s - x]
        return dp[target]"""),
  "ks3": dict(approach=[
     "Smashing stones with signs ±1 leaves total - 2·(subset sum). To minimise the residue, maximise a subset sum not exceeding total/2.",
     "Subset-sum knapsack over reachable sums; the answer is total - 2·bestReachable."],
   time="O(n · sum)", space="O(sum)",
   cpp="""class Solution {
public:
    int lastStoneWeightII(vector<int>& stones) {
        int total = accumulate(stones.begin(), stones.end(), 0);
        int half = total / 2;
        vector<bool> dp(half + 1, false); dp[0] = true;
        int best = 0;
        for (int x : stones)
            for (int s = half; s >= x; s--)
                if (dp[s - x]) { dp[s] = true; best = max(best, s); }
        return total - 2 * best;
    }
};""",
   python="""class Solution:
    def lastStoneWeightII(self, stones: list[int]) -> int:
        total = sum(stones)
        half = total // 2
        dp = [False] * (half + 1)
        dp[0] = True
        best = 0
        for x in stones:
            for s in range(half, x - 1, -1):
                if dp[s - x]:
                    dp[s] = True
                    best = max(best, s)
        return total - 2 * best"""),
  "ks4": dict(approach=[
     "Coins are reusable, so this is the unbounded-knapsack variant: dp[a] = fewest coins for amount a.",
     "Iterate the amount upward for each coin so a coin can be picked multiple times."],
   time="O(amount · coins)", space="O(amount)",
   cpp="""class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1); dp[0] = 0;
        for (int c : coins)
            for (int a = c; a <= amount; a++)
                dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};""",
   python="""class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0
        for c in coins:
            for a in range(c, amount + 1):
                dp[a] = min(dp[a], dp[a - c] + 1)
        return -1 if dp[amount] > amount else dp[amount]"""),
  "ks5": dict(approach=[
     "Two capacities: members used and minimum profit reached. dp[g][p] = number of schemes using g members achieving at least p profit.",
     "For each crime add a dimension and iterate members downward (0/1). Cap profit at minProfit so all higher profits collapse into one bucket. Sum over all g."],
   time="O(crimes · n · minProfit)", space="O(n · minProfit)",
   cpp="""class Solution {
public:
    int profitableSchemes(int n, int minProfit, vector<int>& group, vector<int>& profit) {
        const long long MOD = 1e9 + 7;
        vector<vector<long long>> dp(n + 1, vector<long long>(minProfit + 1, 0));
        for (int g = 0; g <= n; g++) dp[g][0] = 1;
        for (int i = 0; i < (int)group.size(); i++) {
            int g = group[i], p = profit[i];
            for (int used = n; used >= g; used--)
                for (int pr = minProfit; pr >= 0; pr--)
                    dp[used][pr] = (dp[used][pr] + dp[used - g][max(0, pr - p)]) % MOD;
        }
        return (int)dp[n][minProfit];
    }
};""",
   python="""class Solution:
    def profitableSchemes(self, n, minProfit, group, profit):
        MOD = 10**9 + 7
        dp = [[0] * (minProfit + 1) for _ in range(n + 1)]
        for g in range(n + 1):
            dp[g][0] = 1
        for g, p in zip(group, profit):
            for used in range(n, g - 1, -1):
                for pr in range(minProfit, -1, -1):
                    dp[used][pr] = (dp[used][pr] + dp[used - g][max(0, pr - p)]) % MOD
        return dp[n][minProfit]"""),
 },
 "lcs": {
  "lcs1": dict(approach=[
     "dp[i][j] = LCS length of the first i chars of A and first j of B.",
     "If A[i-1]==B[j-1] extend the diagonal (dp[i-1][j-1]+1); otherwise take the better of dropping one character from either string."],
   time="O(n·m)", space="O(n·m)",
   cpp="""class Solution {
public:
    int longestCommonSubsequence(string a, string b) {
        int n = a.size(), m = b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
        return dp[n][m];
    }
};""",
   python="""class Solution:
    def longestCommonSubsequence(self, a: str, b: str) -> int:
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return dp[n][m]"""),
  "lcs2": dict(approach=[
     "dp[i][j] = edits to turn the first i chars of A into the first j of B.",
     "If characters match, no cost (diagonal). Else 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1]). Base rows/cols are prefix lengths."],
   time="O(n·m)", space="O(n·m)",
   cpp="""class Solution {
public:
    int minDistance(string a, string b) {
        int n = a.size(), m = b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1]
                         : 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});
        return dp[n][m];
    }
};""",
   python="""class Solution:
    def minDistance(self, a: str, b: str) -> int:
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = i
        for j in range(m + 1):
            dp[0][j] = j
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
        return dp[n][m]"""),
  "lcs3": dict(approach=[
     "The longest palindromic subsequence of s equals the LCS of s and its reverse.",
     "Run the standard LCS between s and reversed(s)."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
public:
    int longestPalindromeSubseq(string s) {
        string r(s.rbegin(), s.rend());
        int n = s.size();
        vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = s[i-1] == r[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
        return dp[n][n];
    }
};""",
   python="""class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        r = s[::-1]
        n = len(s)
        dp = [[0] * (n + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                if s[i-1] == r[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return dp[n][n]"""),
  "lcs4": dict(approach=[
     "Characters outside the LCS must be deleted from one side or the other.",
     "Answer = len(A) + len(B) - 2·LCS(A, B)."],
   time="O(n·m)", space="O(n·m)",
   cpp="""class Solution {
public:
    int minDistance(string a, string b) {
        int n = a.size(), m = b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
        return n + m - 2 * dp[n][m];
    }
};""",
   python="""class Solution:
    def minDistance(self, a: str, b: str) -> int:
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return n + m - 2 * dp[n][m]"""),
  "lcs5": dict(approach=[
     "The shortest common supersequence keeps the LCS once and inserts the leftover characters of both strings around it.",
     "Build the LCS dp table, then walk backward from (n, m): on a match emit the shared char, otherwise emit the character from whichever direction the larger dp came, and prepend leftovers."],
   time="O(n·m)", space="O(n·m)",
   cpp="""class Solution {
public:
    string shortestCommonSupersequence(string a, string b) {
        int n = a.size(), m = b.size();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
        string res; int i = n, j = m;
        while (i > 0 && j > 0) {
            if (a[i-1] == b[j-1]) { res += a[--i]; --j; }
            else if (dp[i-1][j] >= dp[i][j-1]) res += a[--i];
            else res += b[--j];
        }
        while (i > 0) res += a[--i];
        while (j > 0) res += b[--j];
        reverse(res.begin(), res.end());
        return res;
    }
};""",
   python="""class Solution:
    def shortestCommonSupersequence(self, a: str, b: str) -> str:
        n, m = len(a), len(b)
        dp = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        res = []
        i, j = n, m
        while i > 0 and j > 0:
            if a[i-1] == b[j-1]:
                res.append(a[i-1]); i -= 1; j -= 1
            elif dp[i-1][j] >= dp[i][j-1]:
                res.append(a[i-1]); i -= 1
            else:
                res.append(b[j-1]); j -= 1
        res.append(a[:i]); res.append(b[:j])
        return "".join(reversed(res))"""),
 },
 "lis": {
  "lis1": dict(approach=[
     "Patience sorting: keep `tails`, where tails[k] is the smallest possible tail of an increasing subsequence of length k+1.",
     "For each value, binary-search its insertion point in tails; replace or append. The length of tails is the LIS length."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int lengthOfLIS(vector<int>& a) {
        vector<int> tails;
        for (int x : a) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};""",
   python="""import bisect
class Solution:
    def lengthOfLIS(self, a: list[int]) -> int:
        tails = []
        for x in a:
            i = bisect.bisect_left(tails, x)
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        return len(tails)"""),
  "lis2": dict(approach=[
     "Sort by width ascending, breaking ties by height descending. Then the answer is the LIS over heights — the tie-break stops equal-width envelopes from nesting.",
     "Apply the O(n log n) patience LIS to the height sequence."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int maxEnvelopes(vector<vector<int>>& env) {
        sort(env.begin(), env.end(), [](auto& a, auto& b){ return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1]; });
        vector<int> tails;
        for (auto& e : env) {
            int h = e[1];
            auto it = lower_bound(tails.begin(), tails.end(), h);
            if (it == tails.end()) tails.push_back(h);
            else *it = h;
        }
        return tails.size();
    }
};""",
   python="""import bisect
class Solution:
    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:
        envelopes.sort(key=lambda e: (e[0], -e[1]))
        tails = []
        for _, h in envelopes:
            i = bisect.bisect_left(tails, h)
            if i == len(tails):
                tails.append(h)
            else:
                tails[i] = h
        return len(tails)"""),
  "lis3": dict(approach=[
     "Track two arrays: length[i] (LIS ending at i) and count[i] (number of such LIS).",
     "For j < i with a[j] < a[i]: if it extends to a longer subsequence, copy the count; if it ties the best length, add the count. Sum counts of maximal length."],
   time="O(n^2)", space="O(n)",
   cpp="""class Solution {
public:
    int findNumberOfLIS(vector<int>& a) {
        int n = a.size(), best = 0, total = 0;
        vector<int> len(n, 1), cnt(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) if (a[j] < a[i]) {
                if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
                else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
            }
            if (len[i] > best) { best = len[i]; total = cnt[i]; }
            else if (len[i] == best) total += cnt[i];
        }
        return total;
    }
};""",
   python="""class Solution:
    def findNumberOfLIS(self, a: list[int]) -> int:
        n = len(a)
        length = [1] * n
        count = [1] * n
        best = total = 0
        for i in range(n):
            for j in range(i):
                if a[j] < a[i]:
                    if length[j] + 1 > length[i]:
                        length[i] = length[j] + 1
                        count[i] = count[j]
                    elif length[j] + 1 == length[i]:
                        count[i] += count[j]
            if length[i] > best:
                best, total = length[i], count[i]
            elif length[i] == best:
                total += count[i]
        return total"""),
  "lis4": dict(approach=[
     "Sort words by length. dp[w] = longest chain ending at w; try removing each character to form a predecessor and extend its best chain.",
     "Hash-map dp keyed by word; answer is the maximum chain length."],
   time="O(n · L^2)", space="O(n)",
   cpp="""class Solution {
public:
    int longestStrChain(vector<string>& words) {
        sort(words.begin(), words.end(), [](const string& a, const string& b){ return a.size() < b.size(); });
        unordered_map<string,int> dp; int best = 0;
        for (auto& w : words) {
            int cur = 1;
            for (int i = 0; i < (int)w.size(); i++) {
                string prev = w.substr(0, i) + w.substr(i + 1);
                if (dp.count(prev)) cur = max(cur, dp[prev] + 1);
            }
            dp[w] = cur; best = max(best, cur);
        }
        return best;
    }
};""",
   python="""class Solution:
    def longestStrChain(self, words: list[str]) -> int:
        words.sort(key=len)
        dp = {}
        best = 0
        for w in words:
            cur = 1
            for i in range(len(w)):
                prev = w[:i] + w[i+1:]
                if prev in dp:
                    cur = max(cur, dp[prev] + 1)
            dp[w] = cur
            best = max(best, cur)
        return best"""),
  "lis5": dict(approach=[
     "Sort each cuboid's dimensions so any face can be the base, then sort cuboids. Now stacking is a 3-D 'all dimensions non-increasing' LIS.",
     "dp[i] = max height with cuboid i on top; for j < i where all dims of j <= dims of i, dp[i] = max(dp[i], dp[j]) + height_i."],
   time="O(n^2)", space="O(n)",
   cpp="""class Solution {
public:
    int maxHeight(vector<vector<int>>& cuboids) {
        for (auto& c : cuboids) sort(c.begin(), c.end());
        sort(cuboids.begin(), cuboids.end());
        int n = cuboids.size(), best = 0;
        vector<int> dp(n);
        for (int i = 0; i < n; i++) {
            dp[i] = cuboids[i][2];
            for (int j = 0; j < i; j++)
                if (cuboids[j][0] <= cuboids[i][0] && cuboids[j][1] <= cuboids[i][1] && cuboids[j][2] <= cuboids[i][2])
                    dp[i] = max(dp[i], dp[j] + cuboids[i][2]);
            best = max(best, dp[i]);
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxHeight(self, cuboids: list[list[int]]) -> int:
        for c in cuboids:
            c.sort()
        cuboids.sort()
        n = len(cuboids)
        dp = [0] * n
        best = 0
        for i in range(n):
            dp[i] = cuboids[i][2]
            for j in range(i):
                if all(cuboids[j][k] <= cuboids[i][k] for k in range(3)):
                    dp[i] = max(dp[i], dp[j] + cuboids[i][2])
            best = max(best, dp[i])
        return best"""),
 },
}
