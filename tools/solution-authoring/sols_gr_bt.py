# -*- coding: utf-8 -*-
SOLS = {
 "activity-selection": {
  "as1": dict(approach=[
     "Keep as many non-overlapping intervals as possible (earliest-finish-first); the rest must be removed.",
     "Sort by end. Greedily keep an interval if its start >= the last kept end; otherwise count it as a removal."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& iv) {
        sort(iv.begin(), iv.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        int end = INT_MIN, removed = 0;
        for (auto& x : iv) {
            if (x[0] >= end) end = x[1];
            else removed++;
        }
        return removed;
    }
};""",
   python="""class Solution:
    def eraseOverlapIntervals(self, iv: list[list[int]]) -> int:
        iv.sort(key=lambda x: x[1])
        end, removed = float('-inf'), 0
        for s, e in iv:
            if s >= end:
                end = e
            else:
                removed += 1
        return removed"""),
  "as2": dict(approach=[
     "One arrow at the end of an interval bursts every balloon overlapping that point — the same earliest-finish greedy.",
     "Sort by end; shoot an arrow at the first end, and only add a new arrow when a balloon starts after the last arrow's position."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        sort(points.begin(), points.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        int arrows = 1; long long pos = points[0][1];
        for (auto& p : points)
            if (p[0] > pos) { arrows++; pos = p[1]; }
        return arrows;
    }
};""",
   python="""class Solution:
    def findMinArrowShots(self, points: list[list[int]]) -> int:
        points.sort(key=lambda p: p[1])
        arrows, pos = 1, points[0][1]
        for s, e in points:
            if s > pos:
                arrows += 1
                pos = e
        return arrows"""),
  "as3": dict(approach=[
     "The number of rooms needed at once is the maximum number of overlapping meetings.",
     "Keep a min-heap of end times. For each meeting (sorted by start), free any room that ended before it starts, then occupy a room. The heap's peak size is the answer."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& meetings) {
        sort(meetings.begin(), meetings.end());
        priority_queue<int, vector<int>, greater<>> pq;
        for (auto& m : meetings) {
            if (!pq.empty() && pq.top() <= m[0]) pq.pop();
            pq.push(m[1]);
        }
        return pq.size();
    }
};""",
   python="""import heapq
class Solution:
    def minMeetingRooms(self, meetings: list[list[int]]) -> int:
        meetings.sort()
        pq = []
        for s, e in meetings:
            if pq and pq[0] <= s:
                heapq.heappop(pq)
            heapq.heappush(pq, e)
        return len(pq)"""),
  "as4": dict(approach=[
     "Longest chain where each next pair starts after the previous ends — earliest-finish greedy again.",
     "Sort by the second element; greedily extend the chain whenever the next pair's first value exceeds the current tail."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    int findLongestChain(vector<vector<int>>& pairs) {
        sort(pairs.begin(), pairs.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        int cur = INT_MIN, len = 0;
        for (auto& p : pairs)
            if (p[0] > cur) { cur = p[1]; len++; }
        return len;
    }
};""",
   python="""class Solution:
    def findLongestChain(self, pairs: list[list[int]]) -> int:
        pairs.sort(key=lambda p: p[1])
        cur, length = float('-inf'), 0
        for a, b in pairs:
            if a > cur:
                cur = b
                length += 1
        return length"""),
  "as5": dict(approach=[
     "Process courses by deadline. Greedily take each course; keep a max-heap of taken durations.",
     "If total time exceeds the current deadline, drop the longest course taken so far (heap top) — that frees the most time while losing only one course."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int scheduleCourse(vector<vector<int>>& courses) {
        sort(courses.begin(), courses.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        priority_queue<int> pq; int time = 0;
        for (auto& c : courses) {
            time += c[0]; pq.push(c[0]);
            if (time > c[1]) { time -= pq.top(); pq.pop(); }
        }
        return pq.size();
    }
};""",
   python="""import heapq
class Solution:
    def scheduleCourse(self, courses: list[list[int]]) -> int:
        courses.sort(key=lambda c: c[1])
        pq = []
        time = 0
        for dur, end in courses:
            time += dur
            heapq.heappush(pq, -dur)
            if time > end:
                time += heapq.heappop(pq)
        return len(pq)"""),
 },
 "exchange-argument": {
  "ea1": dict(approach=[
     "Place taller people first: sort by height descending, breaking ties by k ascending. Then insert each person at index k.",
     "Because everyone already placed is at least as tall, inserting at position k makes exactly k taller people precede them — the exchange argument justifies this ordering."],
   time="O(n^2)", space="O(n)",
   cpp="""class Solution {
public:
    vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {
        sort(people.begin(), people.end(), [](auto& a, auto& b){ return a[0] != b[0] ? a[0] > b[0] : a[1] < b[1]; });
        vector<vector<int>> res;
        for (auto& p : people) res.insert(res.begin() + p[1], p);
        return res;
    }
};""",
   python="""class Solution:
    def reconstructQueue(self, people: list[list[int]]) -> list[list[int]]:
        people.sort(key=lambda p: (-p[0], p[1]))
        res = []
        for p in people:
            res.insert(p[1], p)
        return res"""),
  "ea2": dict(approach=[
     "Always combine the two cheapest sticks (Huffman-style). A min-heap yields them in O(log n).",
     "Pop two, push their sum, accumulate the cost. The exchange argument shows merging small first minimises total cost."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int connectSticks(vector<int>& sticks) {
        priority_queue<int, vector<int>, greater<>> pq(sticks.begin(), sticks.end());
        int cost = 0;
        while (pq.size() > 1) {
            int a = pq.top(); pq.pop();
            int b = pq.top(); pq.pop();
            cost += a + b; pq.push(a + b);
        }
        return cost;
    }
};""",
   python="""import heapq
class Solution:
    def connectSticks(self, sticks: list[int]) -> int:
        heapq.heapify(sticks)
        cost = 0
        while len(sticks) > 1:
            a = heapq.heappop(sticks)
            b = heapq.heappop(sticks)
            cost += a + b
            heapq.heappush(sticks, a + b)
        return cost"""),
  "ea3": dict(approach=[
     "The most frequent task dictates the schedule. With max frequency f occurring c times, build (f-1) gaps of size (n+1) and append the c tail tasks.",
     "Idle slots only matter when there aren't enough other tasks to fill the gaps, so the answer is max(total tasks, (f-1)·(n+1) + c)."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        vector<int> cnt(26, 0);
        for (char c : tasks) cnt[c - 'A']++;
        int f = *max_element(cnt.begin(), cnt.end());
        int c = count(cnt.begin(), cnt.end(), f);
        return max((int)tasks.size(), (f - 1) * (n + 1) + c);
    }
};""",
   python="""from collections import Counter
class Solution:
    def leastInterval(self, tasks: list[str], n: int) -> int:
        cnt = Counter(tasks)
        f = max(cnt.values())
        c = sum(1 for v in cnt.values() if v == f)
        return max(len(tasks), (f - 1) * (n + 1) + c)"""),
  "ea4": dict(approach=[
     "Sort children's greed and cookie sizes. Give the smallest sufficient cookie to the least greedy child (two pointers).",
     "Advancing both pointers when a cookie satisfies a child is optimal by the exchange argument — wasting a big cookie on a small child can never help."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end()); sort(s.begin(), s.end());
        int i = 0, j = 0;
        while (i < (int)g.size() && j < (int)s.size()) {
            if (s[j] >= g[i]) i++;
            j++;
        }
        return i;
    }
};""",
   python="""class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g.sort(); s.sort()
        i = j = 0
        while i < len(g) and j < len(s):
            if s[j] >= g[i]:
                i += 1
            j += 1
        return i"""),
  "ea5": dict(approach=[
     "Sort weights. Pair the lightest remaining person with the heaviest; if they fit together in one boat, take both, else the heaviest goes alone.",
     "Two pointers from both ends. The exchange argument shows pairing extremes is optimal."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    int numRescueBoats(vector<int>& people, int limit) {
        sort(people.begin(), people.end());
        int i = 0, j = people.size() - 1, boats = 0;
        while (i <= j) {
            if (people[i] + people[j] <= limit) i++;
            j--; boats++;
        }
        return boats;
    }
};""",
   python="""class Solution:
    def numRescueBoats(self, people: list[int], limit: int) -> int:
        people.sort()
        i, j, boats = 0, len(people) - 1, 0
        while i <= j:
            if people[i] + people[j] <= limit:
                i += 1
            j -= 1
            boats += 1
        return boats"""),
 },
 "n-queens": {
  "nq1": dict(approach=[
     "Place one queen per row. Track occupied columns and both diagonals (r-c and r+c) in sets for O(1) conflict checks.",
     "Backtrack column by column in each row; when all rows are filled, record the board. Undo the markers when backtracking."],
   time="O(n!)", space="O(n)",
   cpp="""class Solution {
    int n; vector<vector<string>> res; vector<int> pos;
    set<int> cols, d1, d2;
    void solve(int r) {
        if (r == n) {
            vector<string> board(n, string(n, '.'));
            for (int i = 0; i < n; i++) board[i][pos[i]] = 'Q';
            res.push_back(board); return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || d1.count(r - c) || d2.count(r + c)) continue;
            cols.insert(c); d1.insert(r - c); d2.insert(r + c); pos[r] = c;
            solve(r + 1);
            cols.erase(c); d1.erase(r - c); d2.erase(r + c);
        }
    }
public:
    vector<vector<string>> solveNQueens(int N) { n = N; pos.assign(n, 0); solve(0); return res; }
};""",
   python="""class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        res = []
        cols, d1, d2 = set(), set(), set()
        pos = [0] * n
        def solve(r):
            if r == n:
                res.append(["".join('Q' if pos[i] == c else '.' for c in range(n)) for i in range(n)])
                return
            for c in range(n):
                if c in cols or (r - c) in d1 or (r + c) in d2:
                    continue
                cols.add(c); d1.add(r - c); d2.add(r + c); pos[r] = c
                solve(r + 1)
                cols.discard(c); d1.discard(r - c); d2.discard(r + c)
        solve(0)
        return res"""),
  "nq2": dict(approach=[
     "Identical search to N-Queens, but we only need the count, so skip building boards.",
     "Backtrack row by row using column and diagonal markers; increment a counter when a full placement is found."],
   time="O(n!)", space="O(n)",
   cpp="""class Solution {
    int n, count = 0;
    set<int> cols, d1, d2;
    void solve(int r) {
        if (r == n) { count++; return; }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || d1.count(r - c) || d2.count(r + c)) continue;
            cols.insert(c); d1.insert(r - c); d2.insert(r + c);
            solve(r + 1);
            cols.erase(c); d1.erase(r - c); d2.erase(r + c);
        }
    }
public:
    int totalNQueens(int N) { n = N; solve(0); return count; }
};""",
   python="""class Solution:
    def totalNQueens(self, n: int) -> int:
        self.count = 0
        cols, d1, d2 = set(), set(), set()
        def solve(r):
            if r == n:
                self.count += 1
                return
            for c in range(n):
                if c in cols or (r - c) in d1 or (r + c) in d2:
                    continue
                cols.add(c); d1.add(r - c); d2.add(r + c)
                solve(r + 1)
                cols.discard(c); d1.discard(r - c); d2.discard(r + c)
        solve(0)
        return self.count"""),
  "nq3": dict(approach=[
     "Backtracking: find an empty cell, try digits 1–9 that don't clash in the row, column, or 3×3 box.",
     "Recurse after each placement; if a branch fails, erase the digit and try the next. Bitmask/array masks make conflict checks O(1)."],
   time="O(9^(empty))", space="O(1)",
   cpp="""class Solution {
    bool valid(vector<vector<char>>& b, int r, int c, char d) {
        for (int i = 0; i < 9; i++) {
            if (b[r][i] == d || b[i][c] == d) return false;
            if (b[3*(r/3) + i/3][3*(c/3) + i%3] == d) return false;
        }
        return true;
    }
    bool solve(vector<vector<char>>& b) {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
                if (b[r][c] == '.') {
                    for (char d = '1'; d <= '9'; d++)
                        if (valid(b, r, c, d)) {
                            b[r][c] = d;
                            if (solve(b)) return true;
                            b[r][c] = '.';
                        }
                    return false;
                }
        return true;
    }
public:
    void solveSudoku(vector<vector<char>>& board) { solve(board); }
};""",
   python="""class Solution:
    def solveSudoku(self, board: list[list[str]]) -> None:
        def valid(r, c, d):
            for i in range(9):
                if board[r][i] == d or board[i][c] == d:
                    return False
                if board[3*(r//3) + i//3][3*(c//3) + i%3] == d:
                    return False
            return True
        def solve():
            for r in range(9):
                for c in range(9):
                    if board[r][c] == '.':
                        for d in '123456789':
                            if valid(r, c, d):
                                board[r][c] = d
                                if solve():
                                    return True
                                board[r][c] = '.'
                        return False
            return True
        solve()"""),
  "nq4": dict(approach=[
     "DFS from every cell that matches the first letter, marking visited cells along the path.",
     "Recurse to neighbours for the next letter; restore the cell on backtrack. Succeed when the whole word is matched."],
   time="O(R·C·4^L)", space="O(L)",
   cpp="""class Solution {
    int R, C; string w;
    bool dfs(vector<vector<char>>& b, int r, int c, int k) {
        if (k == (int)w.size()) return true;
        if (r < 0 || c < 0 || r >= R || c >= C || b[r][c] != w[k]) return false;
        char tmp = b[r][c]; b[r][c] = '#';
        bool found = dfs(b, r+1, c, k+1) || dfs(b, r-1, c, k+1) || dfs(b, r, c+1, k+1) || dfs(b, r, c-1, k+1);
        b[r][c] = tmp;
        return found;
    }
public:
    bool exist(vector<vector<char>>& board, string word) {
        R = board.size(); C = board[0].size(); w = word;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
                if (dfs(board, r, c, 0)) return true;
        return false;
    }
};""",
   python="""class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        R, C = len(board), len(board[0])
        def dfs(r, c, k):
            if k == len(word):
                return True
            if r < 0 or c < 0 or r >= R or c >= C or board[r][c] != word[k]:
                return False
            tmp = board[r][c]; board[r][c] = '#'
            found = (dfs(r+1, c, k+1) or dfs(r-1, c, k+1) or
                     dfs(r, c+1, k+1) or dfs(r, c-1, k+1))
            board[r][c] = tmp
            return found
        return any(dfs(r, c, 0) for r in range(R) for c in range(C))"""),
  "nq5": dict(approach=[
     "If total isn't divisible by k, fail. Otherwise backtrack filling k buckets to target each.",
     "Sort descending to prune fast; skip duplicate bucket states and stop a branch as soon as a bucket overshoots target. (Bitmask DP is the polynomial-space alternative.)"],
   time="O(k · 2^n)", space="O(n)",
   cpp="""class Solution {
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % k) return false;
        int target = total / k;
        sort(nums.rbegin(), nums.rend());
        if (nums[0] > target) return false;
        vector<int> buckets(k, 0);
        function<bool(int)> dfs = [&](int i) {
            if (i == (int)nums.size()) return true;
            for (int b = 0; b < k; b++) {
                if (buckets[b] + nums[i] <= target) {
                    buckets[b] += nums[i];
                    if (dfs(i + 1)) return true;
                    buckets[b] -= nums[i];
                }
                if (buckets[b] == 0) break;   // prune symmetric empty buckets
            }
            return false;
        };
        return dfs(0);
    }
};""",
   python="""class Solution:
    def canPartitionKSubsets(self, nums: list[int], k: int) -> bool:
        total = sum(nums)
        if total % k:
            return False
        target = total // k
        nums.sort(reverse=True)
        if nums[0] > target:
            return False
        buckets = [0] * k
        def dfs(i):
            if i == len(nums):
                return True
            for b in range(k):
                if buckets[b] + nums[i] <= target:
                    buckets[b] += nums[i]
                    if dfs(i + 1):
                        return True
                    buckets[b] -= nums[i]
                if buckets[b] == 0:
                    break
            return False
        return dfs(0)"""),
 },
 "permutations": {
  "pm1": dict(approach=[
     "Build permutations by choosing an unused element for each position. A boolean 'used' array tracks availability.",
     "Append to the current path, recurse, then undo. There are n! complete arrangements."],
   time="O(n · n!)", space="O(n)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path; vector<bool> used;
    void dfs(vector<int>& a) {
        if (path.size() == a.size()) { res.push_back(path); return; }
        for (int i = 0; i < (int)a.size(); i++) {
            if (used[i]) continue;
            used[i] = true; path.push_back(a[i]);
            dfs(a);
            path.pop_back(); used[i] = false;
        }
    }
public:
    vector<vector<int>> permute(vector<int>& a) { used.assign(a.size(), false); dfs(a); return res; }
};""",
   python="""class Solution:
    def permute(self, a: list[int]) -> list[list[int]]:
        res, path = [], []
        used = [False] * len(a)
        def dfs():
            if len(path) == len(a):
                res.append(path[:]); return
            for i in range(len(a)):
                if used[i]:
                    continue
                used[i] = True; path.append(a[i])
                dfs()
                path.pop(); used[i] = False
        dfs()
        return res"""),
  "pm2": dict(approach=[
     "Sort so duplicates are adjacent. At each position, skip a value equal to its predecessor when that predecessor hasn't been used in this branch — that prevents generating the same permutation twice.",
     "Otherwise it is the standard used-array backtracking."],
   time="O(n · n!)", space="O(n)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path; vector<bool> used;
    void dfs(vector<int>& a) {
        if (path.size() == a.size()) { res.push_back(path); return; }
        for (int i = 0; i < (int)a.size(); i++) {
            if (used[i]) continue;
            if (i && a[i] == a[i-1] && !used[i-1]) continue;
            used[i] = true; path.push_back(a[i]);
            dfs(a);
            path.pop_back(); used[i] = false;
        }
    }
public:
    vector<vector<int>> permuteUnique(vector<int>& a) {
        sort(a.begin(), a.end()); used.assign(a.size(), false); dfs(a); return res;
    }
};""",
   python="""class Solution:
    def permuteUnique(self, a: list[int]) -> list[list[int]]:
        a.sort()
        res, path = [], []
        used = [False] * len(a)
        def dfs():
            if len(path) == len(a):
                res.append(path[:]); return
            for i in range(len(a)):
                if used[i]:
                    continue
                if i and a[i] == a[i-1] and not used[i-1]:
                    continue
                used[i] = True; path.append(a[i])
                dfs()
                path.pop(); used[i] = False
        dfs()
        return res"""),
  "pm3": dict(approach=[
     "Find the rightmost ascent a[i] < a[i+1]. Swap a[i] with the smallest element to its right that is still larger, then reverse the suffix to make it the smallest arrangement.",
     "If no ascent exists, the array is the last permutation; reverse the whole thing."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    void nextPermutation(vector<int>& a) {
        int n = a.size(), i = n - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (a[j] <= a[i]) j--;
            swap(a[i], a[j]);
        }
        reverse(a.begin() + i + 1, a.end());
    }
};""",
   python="""class Solution:
    def nextPermutation(self, a: list[int]) -> None:
        n = len(a)
        i = n - 2
        while i >= 0 and a[i] >= a[i + 1]:
            i -= 1
        if i >= 0:
            j = n - 1
            while a[j] <= a[i]:
                j -= 1
            a[i], a[j] = a[j], a[i]
        a[i + 1:] = reversed(a[i + 1:])"""),
  "pm4": dict(approach=[
     "Place numbers 1..n into positions 1..n where position p must hold a value divisible by p or vice-versa.",
     "Backtrack position by position trying each unused number that satisfies the divisibility rule, counting completed arrangements."],
   time="O(n!) pruned", space="O(n)",
   cpp="""class Solution {
    int n, count = 0; vector<bool> used;
    void dfs(int pos) {
        if (pos > n) { count++; return; }
        for (int v = 1; v <= n; v++)
            if (!used[v] && (v % pos == 0 || pos % v == 0)) {
                used[v] = true; dfs(pos + 1); used[v] = false;
            }
    }
public:
    int countArrangement(int N) { n = N; used.assign(n + 1, false); dfs(1); return count; }
};""",
   python="""class Solution:
    def countArrangement(self, n: int) -> int:
        used = [False] * (n + 1)
        self.count = 0
        def dfs(pos):
            if pos > n:
                self.count += 1
                return
            for v in range(1, n + 1):
                if not used[v] and (v % pos == 0 or pos % v == 0):
                    used[v] = True
                    dfs(pos + 1)
                    used[v] = False
        dfs(1)
        return self.count"""),
  "pm5": dict(approach=[
     "Count distinct non-empty sequences from the tiles. Use a frequency map; at each step pick any letter with remaining count, append it (counts as a sequence), and recurse with one fewer.",
     "The frequency map automatically dedupes identical letters, so we never double-count."],
   time="O(sum of P(n,k))", space="O(26)",
   cpp="""class Solution {
    int dfs(vector<int>& cnt) {
        int total = 0;
        for (int i = 0; i < 26; i++)
            if (cnt[i] > 0) {
                total++; cnt[i]--;
                total += dfs(cnt);
                cnt[i]++;
            }
        return total;
    }
public:
    int numTilePossibilities(string tiles) {
        vector<int> cnt(26, 0);
        for (char c : tiles) cnt[c - 'A']++;
        return dfs(cnt);
    }
};""",
   python="""from collections import Counter
class Solution:
    def numTilePossibilities(self, tiles: str) -> int:
        cnt = Counter(tiles)
        def dfs():
            total = 0
            for ch in list(cnt):
                if cnt[ch] > 0:
                    total += 1
                    cnt[ch] -= 1
                    total += dfs()
                    cnt[ch] += 1
            return total
        return dfs()"""),
 },
 "subsets": {
  "su1": dict(approach=[
     "Each element is either in or out. Backtrack over a start index, recording the path at every node of the decision tree.",
     "Recurse from index i picking each later element once; this enumerates all 2^n subsets."],
   time="O(n · 2^n)", space="O(n)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path;
    void dfs(vector<int>& a, int start) {
        res.push_back(path);
        for (int i = start; i < (int)a.size(); i++) {
            path.push_back(a[i]);
            dfs(a, i + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<int>> subsets(vector<int>& a) { dfs(a, 0); return res; }
};""",
   python="""class Solution:
    def subsets(self, a: list[int]) -> list[list[int]]:
        res, path = [], []
        def dfs(start):
            res.append(path[:])
            for i in range(start, len(a)):
                path.append(a[i])
                dfs(i + 1)
                path.pop()
        dfs(0)
        return res"""),
  "su2": dict(approach=[
     "Sort so equal values are adjacent. When choosing at a level, skip a value equal to the previous one already considered at the same level to avoid duplicate subsets.",
     "Otherwise it's the standard subset backtracking."],
   time="O(n · 2^n)", space="O(n)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path;
    void dfs(vector<int>& a, int start) {
        res.push_back(path);
        for (int i = start; i < (int)a.size(); i++) {
            if (i > start && a[i] == a[i-1]) continue;
            path.push_back(a[i]);
            dfs(a, i + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<int>> subsetsWithDup(vector<int>& a) {
        sort(a.begin(), a.end()); dfs(a, 0); return res;
    }
};""",
   python="""class Solution:
    def subsetsWithDup(self, a: list[int]) -> list[list[int]]:
        a.sort()
        res, path = [], []
        def dfs(start):
            res.append(path[:])
            for i in range(start, len(a)):
                if i > start and a[i] == a[i-1]:
                    continue
                path.append(a[i])
                dfs(i + 1)
                path.pop()
        dfs(0)
        return res"""),
  "su3": dict(approach=[
     "Choose k numbers from 1..n. Backtrack over a start value, adding to the path until it has length k.",
     "Prune when not enough numbers remain to complete a combination of size k."],
   time="O(k · C(n,k))", space="O(k)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path; int n, k;
    void dfs(int start) {
        if ((int)path.size() == k) { res.push_back(path); return; }
        for (int i = start; i <= n - (k - (int)path.size()) + 1; i++) {
            path.push_back(i);
            dfs(i + 1);
            path.pop_back();
        }
    }
public:
    vector<vector<int>> combine(int N, int K) { n = N; k = K; dfs(1); return res; }
};""",
   python="""class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        res, path = [], []
        def dfs(start):
            if len(path) == k:
                res.append(path[:]); return
            for i in range(start, n - (k - len(path)) + 2):
                path.append(i)
                dfs(i + 1)
                path.pop()
        dfs(1)
        return res"""),
  "su4": dict(approach=[
     "Each candidate may be reused, so recurse with the same index after picking it (only advance to avoid earlier candidates and duplicate sets).",
     "Subtract from the remaining target; record a path when target hits 0, prune when it goes negative."],
   time="O(2^target)", space="O(target)",
   cpp="""class Solution {
    vector<vector<int>> res; vector<int> path;
    void dfs(vector<int>& a, int start, int target) {
        if (target == 0) { res.push_back(path); return; }
        for (int i = start; i < (int)a.size(); i++) {
            if (a[i] > target) continue;
            path.push_back(a[i]);
            dfs(a, i, target - a[i]);   // reuse i
            path.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        dfs(candidates, 0, target); return res;
    }
};""",
   python="""class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates.sort()
        res, path = [], []
        def dfs(start, remain):
            if remain == 0:
                res.append(path[:]); return
            for i in range(start, len(candidates)):
                if candidates[i] > remain:
                    break
                path.append(candidates[i])
                dfs(i, remain - candidates[i])
                path.pop()
        dfs(0, target)
        return res"""),
  "su5": dict(approach=[
     "Map each digit to its letters; backtrack one digit at a time, appending each possible letter.",
     "When the path length equals the input length, record the string. The tree has at most 4^n leaves."],
   time="O(4^n · n)", space="O(n)",
   cpp="""class Solution {
    vector<string> res; string path; vector<string> M = {"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
    void dfs(string& digits, int idx) {
        if (idx == (int)digits.size()) { res.push_back(path); return; }
        for (char c : M[digits[idx] - '0']) {
            path.push_back(c);
            dfs(digits, idx + 1);
            path.pop_back();
        }
    }
public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        dfs(digits, 0); return res;
    }
};""",
   python="""class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        if not digits:
            return []
        M = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
        res, path = [], []
        def dfs(idx):
            if idx == len(digits):
                res.append("".join(path)); return
            for c in M[digits[idx]]:
                path.append(c)
                dfs(idx + 1)
                path.pop()
        dfs(0)
        return res"""),
 },
 "sudoku": {
  "sd1": dict(approach=[
     "Backtracking: scan for an empty cell, try each digit 1–9 that's valid in its row, column, and 3×3 box.",
     "Recurse after placing; on failure erase and try the next digit. Maintaining row/col/box masks makes validity checks O(1)."],
   time="O(9^(empty))", space="O(1)",
   cpp="""class Solution {
    bool valid(vector<vector<char>>& b, int r, int c, char d) {
        for (int i = 0; i < 9; i++) {
            if (b[r][i] == d || b[i][c] == d) return false;
            if (b[3*(r/3)+i/3][3*(c/3)+i%3] == d) return false;
        }
        return true;
    }
    bool solve(vector<vector<char>>& b) {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
                if (b[r][c] == '.') {
                    for (char d = '1'; d <= '9'; d++)
                        if (valid(b, r, c, d)) { b[r][c] = d; if (solve(b)) return true; b[r][c] = '.'; }
                    return false;
                }
        return true;
    }
public:
    void solveSudoku(vector<vector<char>>& board) { solve(board); }
};""",
   python="""class Solution:
    def solveSudoku(self, board: list[list[str]]) -> None:
        def valid(r, c, d):
            for i in range(9):
                if board[r][i] == d or board[i][c] == d:
                    return False
                if board[3*(r//3)+i//3][3*(c//3)+i%3] == d:
                    return False
            return True
        def solve():
            for r in range(9):
                for c in range(9):
                    if board[r][c] == '.':
                        for d in '123456789':
                            if valid(r, c, d):
                                board[r][c] = d
                                if solve():
                                    return True
                                board[r][c] = '.'
                        return False
            return True
        solve()"""),
  "sd2": dict(approach=[
     "Validity needs no search — just check there are no duplicate filled digits in any row, column, or 3×3 box.",
     "Use 27 sets (or encoded keys) and scan all cells once."],
   time="O(81)", space="O(81)",
   cpp="""class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& b) {
        unordered_set<string> seen;
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                char d = b[r][c];
                if (d == '.') continue;
                if (!seen.insert("r" + to_string(r) + d).second) return false;
                if (!seen.insert("c" + to_string(c) + d).second) return false;
                if (!seen.insert("b" + to_string(r/3) + to_string(c/3) + d).second) return false;
            }
        return true;
    }
};""",
   python="""class Solution:
    def isValidSudoku(self, board: list[list[str]]) -> bool:
        seen = set()
        for r in range(9):
            for c in range(9):
                d = board[r][c]
                if d == '.':
                    continue
                keys = (("r", r, d), ("c", c, d), ("b", r//3, c//3, d))
                for k in keys:
                    if k in seen:
                        return False
                    seen.add(k)
        return True"""),
  "sd3": dict(approach=[
     "Same backtracking template as Sudoku, applied to queens: place one per row using column and diagonal markers, counting solutions.",
     "The two diagonals are identified by r-c and r+c."],
   time="O(n!)", space="O(n)",
   cpp="""class Solution {
    int n, count = 0; set<int> cols, d1, d2;
    void solve(int r) {
        if (r == n) { count++; return; }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || d1.count(r - c) || d2.count(r + c)) continue;
            cols.insert(c); d1.insert(r - c); d2.insert(r + c);
            solve(r + 1);
            cols.erase(c); d1.erase(r - c); d2.erase(r + c);
        }
    }
public:
    int totalNQueens(int N) { n = N; solve(0); return count; }
};""",
   python="""class Solution:
    def totalNQueens(self, n: int) -> int:
        self.count = 0
        cols, d1, d2 = set(), set(), set()
        def solve(r):
            if r == n:
                self.count += 1; return
            for c in range(n):
                if c in cols or (r - c) in d1 or (r + c) in d2:
                    continue
                cols.add(c); d1.add(r - c); d2.add(r + c)
                solve(r + 1)
                cols.discard(c); d1.discard(r - c); d2.discard(r + c)
        solve(0)
        return self.count"""),
  "sd4": dict(approach=[
     "Many words at once: build a trie of the words so a single DFS over the grid can match all of them simultaneously.",
     "DFS each cell following trie edges; when a node marks the end of a word, collect it. Prune the trie as words are found to speed things up."],
   time="O(R·C·4^L)", space="O(total letters)",
   cpp="""class Solution {
    struct Node { Node* ch[26] = {}; string word; };
    int R, C; vector<string> res;
    void dfs(vector<vector<char>>& b, int r, int c, Node* node) {
        if (r < 0 || c < 0 || r >= R || c >= C || b[r][c] == '#') return;
        char ch = b[r][c]; Node* nxt = node->ch[ch - 'a'];
        if (!nxt) return;
        if (!nxt->word.empty()) { res.push_back(nxt->word); nxt->word.clear(); }
        b[r][c] = '#';
        dfs(b, r+1, c, nxt); dfs(b, r-1, c, nxt); dfs(b, r, c+1, nxt); dfs(b, r, c-1, nxt);
        b[r][c] = ch;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (auto& w : words) {
            Node* cur = root;
            for (char c : w) { if (!cur->ch[c-'a']) cur->ch[c-'a'] = new Node(); cur = cur->ch[c-'a']; }
            cur->word = w;
        }
        R = board.size(); C = board[0].size();
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) dfs(board, r, c, root);
        return res;
    }
};""",
   python="""class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        trie = {}
        for w in words:
            node = trie
            for ch in w:
                node = node.setdefault(ch, {})
            node['$'] = w
        R, C, res = len(board), len(board[0]), []
        def dfs(r, c, node):
            ch = board[r][c]
            if ch not in node:
                return
            nxt = node[ch]
            if '$' in nxt:
                res.append(nxt['$']); del nxt['$']
            board[r][c] = '#'
            for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
                if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != '#':
                    dfs(nr, nc, nxt)
            board[r][c] = ch
        for r in range(R):
            for c in range(C):
                dfs(r, c, trie)
        return res"""),
  "sd5": dict(approach=[
     "Try to colour each vertex with one of m colours so no edge joins same-coloured vertices — classic backtracking.",
     "Assign colours vertex by vertex; before colouring, check all already-coloured neighbours. Backtrack when no colour fits."],
   time="O(m^V)", space="O(V)",
   cpp="""class Solution {
    bool ok(int v, vector<vector<int>>& g, vector<int>& color, int c) {
        for (int u = 0; u < (int)g.size(); u++) if (g[v][u] && color[u] == c) return false;
        return true;
    }
    bool solve(int v, vector<vector<int>>& g, int m, vector<int>& color) {
        if (v == (int)g.size()) return true;
        for (int c = 1; c <= m; c++)
            if (ok(v, g, color, c)) { color[v] = c; if (solve(v + 1, g, m, color)) return true; color[v] = 0; }
        return false;
    }
public:
    bool graphColoring(vector<vector<int>>& graph, int m) {
        vector<int> color(graph.size(), 0);
        return solve(0, graph, m, color);
    }
};""",
   python="""class Solution:
    def graphColoring(self, graph: list[list[int]], m: int) -> bool:
        n = len(graph)
        color = [0] * n
        def ok(v, c):
            return all(not (graph[v][u] and color[u] == c) for u in range(n))
        def solve(v):
            if v == n:
                return True
            for c in range(1, m + 1):
                if ok(v, c):
                    color[v] = c
                    if solve(v + 1):
                        return True
                    color[v] = 0
            return False
        return solve(0)"""),
 },
}
