# -*- coding: utf-8 -*-
SOLS = {
 "fenwick": {
  "fw1": dict(approach=[
     "A Fenwick tree (BIT) supports point updates and prefix sums in O(log n).",
     "update(i, delta) walks indices upward by i += i&-i; query(i) walks down by i -= i&-i. A range sum is query(r) - query(l-1)."],
   time="O(log n) per op", space="O(n)",
   cpp="""class NumArray {
    vector<int> bit, a; int n;
    void add(int i, int delta) { for (++i; i <= n; i += i & -i) bit[i] += delta; }
    int pre(int i) { int s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }
public:
    NumArray(vector<int>& nums) : a(nums), n(nums.size()) {
        bit.assign(n + 1, 0);
        for (int i = 0; i < n; i++) add(i, nums[i]);
    }
    void update(int i, int val) { add(i, val - a[i]); a[i] = val; }
    int sumRange(int l, int r) { return pre(r) - (l ? pre(l - 1) : 0); }
};""",
   python="""class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.a = nums[:]
        self.bit = [0] * (self.n + 1)
        for i, v in enumerate(nums):
            self._add(i, v)
    def _add(self, i, delta):
        i += 1
        while i <= self.n:
            self.bit[i] += delta
            i += i & -i
    def _pre(self, i):
        i += 1; s = 0
        while i > 0:
            s += self.bit[i]
            i -= i & -i
        return s
    def update(self, i: int, val: int) -> None:
        self._add(i, val - self.a[i]); self.a[i] = val
    def sumRange(self, l: int, r: int) -> int:
        return self._pre(r) - (self._pre(l - 1) if l else 0)"""),
  "fw2": dict(approach=[
     "Count, for each element, how many later elements are smaller. Process right-to-left, querying a BIT indexed by value rank.",
     "Coordinate-compress the values to ranks. query(rank-1) gives how many already-seen (to the right) values are smaller, then add the current rank."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> countSmaller(vector<int>& nums) {
        vector<int> sorted(nums); sort(sorted.begin(), sorted.end());
        sorted.erase(unique(sorted.begin(), sorted.end()), sorted.end());
        int m = sorted.size();
        vector<int> bit(m + 1, 0), res(nums.size());
        auto add = [&](int i){ for (++i; i <= m; i += i & -i) bit[i]++; };
        auto pre = [&](int i){ int s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; };
        for (int k = nums.size() - 1; k >= 0; k--) {
            int r = lower_bound(sorted.begin(), sorted.end(), nums[k]) - sorted.begin();
            res[k] = r ? pre(r - 1) : 0;
            add(r);
        }
        return res;
    }
};""",
   python="""import bisect
class Solution:
    def countSmaller(self, nums: list[int]) -> list[int]:
        sorted_vals = sorted(set(nums))
        m = len(sorted_vals)
        bit = [0] * (m + 1)
        def add(i):
            i += 1
            while i <= m:
                bit[i] += 1; i += i & -i
        def pre(i):
            i += 1; s = 0
            while i > 0:
                s += bit[i]; i -= i & -i
            return s
        res = [0] * len(nums)
        for k in range(len(nums) - 1, -1, -1):
            r = bisect.bisect_left(sorted_vals, nums[k])
            res[k] = pre(r - 1) if r else 0
            add(r)
        return res"""),
  "fw3": dict(approach=[
     "Reverse pairs (i<j with a[i] > 2·a[j]) can be counted with a BIT over compressed values, scanning left-to-right.",
     "For each a[j], first count earlier values greater than 2·a[j] (query the suffix of ranks), then insert a[j]'s rank."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int reversePairs(vector<int>& nums) {
        vector<long long> s(nums.begin(), nums.end());
        sort(s.begin(), s.end()); s.erase(unique(s.begin(), s.end()), s.end());
        int m = s.size(); vector<int> bit(m + 1, 0); long long ans = 0;
        auto add = [&](int i){ for (++i; i <= m; i += i & -i) bit[i]++; };
        auto pre = [&](int i){ int t = 0; for (++i; i > 0; i -= i & -i) t += bit[i]; return t; };
        int seen = 0;
        for (int j = 0; j < (int)nums.size(); j++) {
            int r = upper_bound(s.begin(), s.end(), 2LL * nums[j]) - s.begin();
            ans += seen - (r ? pre(r - 1) : 0);
            int pos = lower_bound(s.begin(), s.end(), (long long)nums[j]) - s.begin();
            add(pos); seen++;
        }
        return (int)ans;
    }
};""",
   python="""import bisect
class Solution:
    def reversePairs(self, nums: list[int]) -> int:
        s = sorted(set(nums))
        m = len(s)
        bit = [0] * (m + 1)
        def add(i):
            i += 1
            while i <= m:
                bit[i] += 1; i += i & -i
        def pre(i):
            i += 1; t = 0
            while i > 0:
                t += bit[i]; i -= i & -i
            return t
        ans = seen = 0
        for x in nums:
            r = bisect.bisect_right(s, 2 * x)
            ans += seen - (pre(r - 1) if r else 0)
            pos = bisect.bisect_left(s, x)
            add(pos); seen += 1
        return ans"""),
  "fw4": dict(approach=[
     "Extend the BIT to two dimensions: bit[i][j] accumulates a 2D prefix. Point update and rectangle sum each cost O(log m · log n).",
     "A rectangle sum uses 2D inclusion-exclusion over four prefix queries."],
   time="O(log m · log n) per op", space="O(mn)",
   cpp="""class NumMatrix {
    vector<vector<int>> bit, a; int R, C;
    void add(int r, int c, int delta) { for (int i = r + 1; i <= R; i += i & -i) for (int j = c + 1; j <= C; j += j & -j) bit[i][j] += delta; }
    int pre(int r, int c) { int s = 0; for (int i = r + 1; i > 0; i -= i & -i) for (int j = c + 1; j > 0; j -= j & -j) s += bit[i][j]; return s; }
public:
    NumMatrix(vector<vector<int>>& m) {
        R = m.size(); C = m[0].size();
        a.assign(R, vector<int>(C, 0)); bit.assign(R + 1, vector<int>(C + 1, 0));
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) update(i, j, m[i][j]);
    }
    void update(int r, int c, int val) { add(r, c, val - a[r][c]); a[r][c] = val; }
    int sumRegion(int r1, int c1, int r2, int c2) {
        return pre(r2, c2) - pre(r1 - 1, c2) - pre(r2, c1 - 1) + pre(r1 - 1, c1 - 1);
    }
};""",
   python="""class NumMatrix:
    def __init__(self, matrix: list[list[int]]):
        self.R, self.C = len(matrix), len(matrix[0])
        self.a = [[0]*self.C for _ in range(self.R)]
        self.bit = [[0]*(self.C+1) for _ in range(self.R+1)]
        for i in range(self.R):
            for j in range(self.C):
                self.update(i, j, matrix[i][j])
    def _add(self, r, c, delta):
        i = r + 1
        while i <= self.R:
            j = c + 1
            while j <= self.C:
                self.bit[i][j] += delta; j += j & -j
            i += i & -i
    def _pre(self, r, c):
        s = 0; i = r + 1
        while i > 0:
            j = c + 1
            while j > 0:
                s += self.bit[i][j]; j -= j & -j
            i -= i & -i
        return s
    def update(self, r: int, c: int, val: int) -> None:
        self._add(r, c, val - self.a[r][c]); self.a[r][c] = val
    def sumRegion(self, r1, c1, r2, c2) -> int:
        return self._pre(r2, c2) - self._pre(r1-1, c2) - self._pre(r2, c1-1) + self._pre(r1-1, c1-1)"""),
  "fw5": dict(approach=[
     "Track LIS length and the number of LIS simultaneously with a BIT keyed by value rank, where each node stores the best (length, count) over a prefix.",
     "For each value, query smaller ranks for the best length and its total count; the new state is (best+1, count or 1). Merge into the BIT, combining equal lengths by adding counts."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int findNumberOfLIS(vector<int>& nums) {
        vector<int> s(nums); sort(s.begin(), s.end()); s.erase(unique(s.begin(), s.end()), s.end());
        int m = s.size();
        vector<pair<int,int>> bit(m + 1, {0, 0});   // (maxLen, countAtThatLen)
        auto combine = [](pair<int,int> a, pair<int,int> b) {
            if (a.first == b.first) return make_pair(a.first, a.first == 0 ? 0 : a.second + b.second);
            return a.first > b.first ? a : b;
        };
        auto query = [&](int i){ pair<int,int> r = {0, 0}; for (++i; i > 0; i -= i & -i) r = combine(r, bit[i]); return r; };
        auto update = [&](int i, pair<int,int> v){ for (++i; i <= m; i += i & -i) bit[i] = combine(bit[i], v); };
        for (int x : nums) {
            int r = lower_bound(s.begin(), s.end(), x) - s.begin();
            auto best = r ? query(r - 1) : make_pair(0, 0);
            int nl = best.first + 1, nc = best.first == 0 ? 1 : best.second;
            update(r, {nl, nc});
        }
        return query(m - 1).second;
    }
};""",
   python="""import bisect
class Solution:
    def findNumberOfLIS(self, nums: list[int]) -> int:
        s = sorted(set(nums))
        m = len(s)
        bit = [(0, 0)] * (m + 1)
        def combine(a, b):
            if a[0] == b[0]:
                return (a[0], 0 if a[0] == 0 else a[1] + b[1])
            return a if a[0] > b[0] else b
        def query(i):
            i += 1; r = (0, 0)
            while i > 0:
                r = combine(r, bit[i]); i -= i & -i
            return r
        def update(i, v):
            i += 1
            while i <= m:
                bit[i] = combine(bit[i], v); i += i & -i
        for x in nums:
            r = bisect.bisect_left(s, x)
            best = query(r - 1) if r else (0, 0)
            nl = best[0] + 1
            nc = 1 if best[0] == 0 else best[1]
            update(r, (nl, nc))
        return query(m - 1)[1]"""),
 },
 "lazy-propagation": {
  "lp1": dict(approach=[
     "Range add + range sum needs lazy propagation: each node stores its subtree sum and a pending 'add' to push down on demand.",
     "On a range update, mark fully-covered nodes lazily (sum += add·len) instead of touching every leaf; push the lazy tag to children only when you must recurse deeper."],
   time="O(log n) per op", space="O(n)",
   cpp="""class SegTree {
    int n; vector<long long> sum, lazy;
    void push(int node, int l, int r) {
        if (!lazy[node]) return;
        int mid = (l + r) / 2;
        sum[2*node] += lazy[node] * (mid - l + 1); lazy[2*node] += lazy[node];
        sum[2*node+1] += lazy[node] * (r - mid);   lazy[2*node+1] += lazy[node];
        lazy[node] = 0;
    }
    void update(int node, int l, int r, int ql, int qr, long long v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { sum[node] += v * (r - l + 1); lazy[node] += v; return; }
        push(node, l, r); int mid = (l + r) / 2;
        update(2*node, l, mid, ql, qr, v); update(2*node+1, mid+1, r, ql, qr, v);
        sum[node] = sum[2*node] + sum[2*node+1];
    }
    long long query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return sum[node];
        push(node, l, r); int mid = (l + r) / 2;
        return query(2*node, l, mid, ql, qr) + query(2*node+1, mid+1, r, ql, qr);
    }
public:
    SegTree(int size) : n(size), sum(4*size, 0), lazy(4*size, 0) {}
    void rangeAdd(int l, int r, long long v) { update(1, 0, n-1, l, r, v); }
    long long rangeSum(int l, int r) { return query(1, 0, n-1, l, r); }
};""",
   python="""class SegTree:
    def __init__(self, n: int):
        self.n = n
        self.sum = [0] * (4 * n)
        self.lazy = [0] * (4 * n)
    def _push(self, node, l, r):
        if self.lazy[node]:
            mid = (l + r) // 2
            for child, lo, hi in ((2*node, l, mid), (2*node+1, mid+1, r)):
                self.sum[child] += self.lazy[node] * (hi - lo + 1)
                self.lazy[child] += self.lazy[node]
            self.lazy[node] = 0
    def _update(self, node, l, r, ql, qr, v):
        if qr < l or r < ql:
            return
        if ql <= l and r <= qr:
            self.sum[node] += v * (r - l + 1); self.lazy[node] += v; return
        self._push(node, l, r)
        mid = (l + r) // 2
        self._update(2*node, l, mid, ql, qr, v)
        self._update(2*node+1, mid+1, r, ql, qr, v)
        self.sum[node] = self.sum[2*node] + self.sum[2*node+1]
    def _query(self, node, l, r, ql, qr):
        if qr < l or r < ql:
            return 0
        if ql <= l and r <= qr:
            return self.sum[node]
        self._push(node, l, r)
        mid = (l + r) // 2
        return self._query(2*node, l, mid, ql, qr) + self._query(2*node+1, mid+1, r, ql, qr)
    def range_add(self, l, r, v):
        self._update(1, 0, self.n - 1, l, r, v)
    def range_sum(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)"""),
  "lp2": dict(approach=[
     "Range assignment (set every element in [l,r] to v) plus range sum. The lazy tag is now an assignment, not an increment.",
     "A covered node's sum becomes v·len and its lazy is set to v. push() copies the assignment to children and clears it. Use a sentinel to distinguish 'no pending assignment'."],
   time="O(log n) per op", space="O(n)",
   cpp="""class SegTree {
    int n; vector<long long> sum; vector<long long> lazy; const long long NONE = LLONG_MIN;
    void apply(int node, int l, int r, long long v) { sum[node] = v * (r - l + 1); lazy[node] = v; }
    void push(int node, int l, int r) {
        if (lazy[node] == NONE) return;
        int mid = (l + r) / 2;
        apply(2*node, l, mid, lazy[node]); apply(2*node+1, mid+1, r, lazy[node]);
        lazy[node] = NONE;
    }
    void assign(int node, int l, int r, int ql, int qr, long long v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { apply(node, l, r, v); return; }
        push(node, l, r); int mid = (l + r) / 2;
        assign(2*node, l, mid, ql, qr, v); assign(2*node+1, mid+1, r, ql, qr, v);
        sum[node] = sum[2*node] + sum[2*node+1];
    }
    long long query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return sum[node];
        push(node, l, r); int mid = (l + r) / 2;
        return query(2*node, l, mid, ql, qr) + query(2*node+1, mid+1, r, ql, qr);
    }
public:
    SegTree(int size) : n(size), sum(4*size, 0), lazy(4*size, LLONG_MIN) {}
    void rangeAssign(int l, int r, long long v) { assign(1, 0, n-1, l, r, v); }
    long long rangeSum(int l, int r) { return query(1, 0, n-1, l, r); }
};""",
   python="""class SegTree:
    NONE = None
    def __init__(self, n: int):
        self.n = n
        self.sum = [0] * (4 * n)
        self.lazy = [None] * (4 * n)
    def _apply(self, node, l, r, v):
        self.sum[node] = v * (r - l + 1)
        self.lazy[node] = v
    def _push(self, node, l, r):
        if self.lazy[node] is not None:
            mid = (l + r) // 2
            self._apply(2*node, l, mid, self.lazy[node])
            self._apply(2*node+1, mid+1, r, self.lazy[node])
            self.lazy[node] = None
    def _assign(self, node, l, r, ql, qr, v):
        if qr < l or r < ql:
            return
        if ql <= l and r <= qr:
            self._apply(node, l, r, v); return
        self._push(node, l, r)
        mid = (l + r) // 2
        self._assign(2*node, l, mid, ql, qr, v)
        self._assign(2*node+1, mid+1, r, ql, qr, v)
        self.sum[node] = self.sum[2*node] + self.sum[2*node+1]
    def _query(self, node, l, r, ql, qr):
        if qr < l or r < ql:
            return 0
        if ql <= l and r <= qr:
            return self.sum[node]
        self._push(node, l, r)
        mid = (l + r) // 2
        return self._query(2*node, l, mid, ql, qr) + self._query(2*node+1, mid+1, r, ql, qr)
    def range_assign(self, l, r, v):
        self._assign(1, 0, self.n - 1, l, r, v)
    def range_sum(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)"""),
  "lp3": dict(approach=[
     "We need the maximum number of simultaneously overlapping bookings (a k-booking). A difference-array over event points captures overlaps.",
     "Increment a counter at each start and decrement at each end in an ordered map; sweep keeping a running sum and track its maximum. (A lazy segment tree over compressed coordinates achieves the same in O(log n) per booking.)"],
   time="O(n^2) sweep / O(n log n) ordered map", space="O(n)",
   cpp="""class MyCalendarThree {
    map<int,int> delta;
public:
    int book(int start, int end) {
        delta[start]++; delta[end]--;
        int cur = 0, best = 0;
        for (auto& [t, d] : delta) { cur += d; best = max(best, cur); }
        return best;
    }
};""",
   python="""from sortedcontainers import SortedDict
class MyCalendarThree:
    def __init__(self):
        self.delta = SortedDict()
    def book(self, start: int, end: int) -> int:
        self.delta[start] = self.delta.get(start, 0) + 1
        self.delta[end] = self.delta.get(end, 0) - 1
        cur = best = 0
        for d in self.delta.values():
            cur += d
            best = max(best, cur)
        return best"""),
  "lp4": dict(approach=[
     "Maintain a set of disjoint covered intervals in an ordered map keyed by start. addRange merges overlaps, removeRange splits them, queryRange checks containment.",
     "This range-tracking is the same problem lazy segment trees solve; an ordered map is the clean balanced-tree implementation."],
   time="O(log n) amortised per op", space="O(n)",
   cpp="""class RangeModule {
    map<int,int> mp;   // start -> end of covered intervals
public:
    void addRange(int left, int right) {
        auto it = mp.upper_bound(left);
        if (it != mp.begin() && prev(it)->second >= left) { --it; left = it->first; right = max(right, it->second); }
        while (it != mp.end() && it->first <= right) { right = max(right, it->second); it = mp.erase(it); }
        mp[left] = right;
    }
    bool queryRange(int left, int right) {
        auto it = mp.upper_bound(left);
        if (it == mp.begin()) return false;
        return prev(it)->second >= right;
    }
    void removeRange(int left, int right) {
        auto it = mp.upper_bound(left);
        if (it != mp.begin() && prev(it)->second >= left) {
            --it; int s = it->first, e = it->second; it = mp.erase(it);
            if (s < left) mp[s] = left;
            if (e > right) it = mp.emplace(right, e).first;
            else it = mp.upper_bound(left);
        }
        while (it != mp.end() && it->first < right) {
            int e = it->second; it = mp.erase(it);
            if (e > right) { mp[right] = e; break; }
        }
    }
};""",
   python="""from sortedcontainers import SortedDict
class RangeModule:
    def __init__(self):
        self.mp = SortedDict()    # start -> end
    def addRange(self, left: int, right: int) -> None:
        idx = self.mp.bisect_right(left)
        if idx and self.mp.values()[idx-1] >= left:
            idx -= 1; left = self.mp.keys()[idx]
            right = max(right, self.mp.values()[idx])
        while idx < len(self.mp) and self.mp.keys()[idx] <= right:
            right = max(right, self.mp.values()[idx])
            del self.mp[self.mp.keys()[idx]]
        self.mp[left] = right
    def queryRange(self, left: int, right: int) -> bool:
        idx = self.mp.bisect_right(left)
        if idx == 0:
            return False
        return self.mp.values()[idx-1] >= right
    def removeRange(self, left: int, right: int) -> None:
        idx = self.mp.bisect_right(left)
        segs = []
        if idx and self.mp.values()[idx-1] > left:
            idx -= 1
        while idx < len(self.mp) and self.mp.keys()[idx] < right:
            s, e = self.mp.keys()[idx], self.mp.values()[idx]
            del self.mp[s]
            if s < left:
                segs.append((s, left))
            if e > right:
                segs.append((right, e))
        for s, e in segs:
            self.mp[s] = e"""),
  "lp5": dict(approach=[
     "For each person at time t, the number of flowers in bloom is (flowers that started by t) - (flowers that ended before t).",
     "Sort start times and end times separately. Each query is two binary searches: bisect_right(starts, t) - bisect_left(ends, t)."],
   time="O((n + q) log n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {
        vector<int> starts, ends;
        for (auto& f : flowers) { starts.push_back(f[0]); ends.push_back(f[1]); }
        sort(starts.begin(), starts.end()); sort(ends.begin(), ends.end());
        vector<int> res;
        for (int t : people) {
            int opened = upper_bound(starts.begin(), starts.end(), t) - starts.begin();
            int closed = lower_bound(ends.begin(), ends.end(), t) - ends.begin();
            res.push_back(opened - closed);
        }
        return res;
    }
};""",
   python="""import bisect
class Solution:
    def fullBloomFlowers(self, flowers: list[list[int]], people: list[int]) -> list[int]:
        starts = sorted(f[0] for f in flowers)
        ends = sorted(f[1] for f in flowers)
        res = []
        for t in people:
            opened = bisect.bisect_right(starts, t)
            closed = bisect.bisect_left(ends, t)
            res.append(opened - closed)
        return res"""),
 },
 "segment-tree": {
  "st1": dict(approach=[
     "A segment tree stores subtree sums; point update walks one root-to-leaf path and fixes O(log n) nodes; range sum merges O(log n) covered segments.",
     "Build recursively; updates and queries recurse only into overlapping children."],
   time="O(log n) per op", space="O(n)",
   cpp="""class NumArray {
    int n; vector<int> tree;
    void build(vector<int>& a, int node, int l, int r) {
        if (l == r) { tree[node] = a[l]; return; }
        int mid = (l + r) / 2;
        build(a, 2*node, l, mid); build(a, 2*node+1, mid+1, r);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
    void upd(int node, int l, int r, int i, int v) {
        if (l == r) { tree[node] = v; return; }
        int mid = (l + r) / 2;
        if (i <= mid) upd(2*node, l, mid, i, v); else upd(2*node+1, mid+1, r, i, v);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
    int qry(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return tree[node];
        int mid = (l + r) / 2;
        return qry(2*node, l, mid, ql, qr) + qry(2*node+1, mid+1, r, ql, qr);
    }
public:
    NumArray(vector<int>& nums) : n(nums.size()), tree(4*nums.size(), 0) { build(nums, 1, 0, n-1); }
    void update(int i, int val) { upd(1, 0, n-1, i, val); }
    int sumRange(int l, int r) { return qry(1, 0, n-1, l, r); }
};""",
   python="""class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        def build(node, l, r):
            if l == r:
                self.tree[node] = nums[l]; return
            mid = (l + r) // 2
            build(2*node, l, mid); build(2*node+1, mid+1, r)
            self.tree[node] = self.tree[2*node] + self.tree[2*node+1]
        if self.n:
            build(1, 0, self.n - 1)
    def update(self, i: int, val: int) -> None:
        def upd(node, l, r):
            if l == r:
                self.tree[node] = val; return
            mid = (l + r) // 2
            if i <= mid: upd(2*node, l, mid)
            else: upd(2*node+1, mid+1, r)
            self.tree[node] = self.tree[2*node] + self.tree[2*node+1]
        upd(1, 0, self.n - 1)
    def sumRange(self, l: int, r: int) -> int:
        def qry(node, lo, hi):
            if r < lo or hi < l:
                return 0
            if l <= lo and hi <= r:
                return self.tree[node]
            mid = (lo + hi) // 2
            return qry(2*node, lo, mid) + qry(2*node+1, mid+1, hi)
        return qry(1, 0, self.n - 1)"""),
  "st2": dict(approach=[
     "Identical structure to the sum tree, but the merge operation is min instead of add, and empty ranges return +infinity.",
     "Build, point-update, and range-min all run in O(log n)."],
   time="O(log n) per op", space="O(n)",
   cpp="""class SegTreeMin {
    int n; vector<int> tree;
    void build(vector<int>& a, int node, int l, int r) {
        if (l == r) { tree[node] = a[l]; return; }
        int mid = (l + r) / 2;
        build(a, 2*node, l, mid); build(a, 2*node+1, mid+1, r);
        tree[node] = min(tree[2*node], tree[2*node+1]);
    }
    int qry(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return INT_MAX;
        if (ql <= l && r <= qr) return tree[node];
        int mid = (l + r) / 2;
        return min(qry(2*node, l, mid, ql, qr), qry(2*node+1, mid+1, r, ql, qr));
    }
public:
    SegTreeMin(vector<int>& a) : n(a.size()), tree(4*a.size(), INT_MAX) { build(a, 1, 0, n-1); }
    int rangeMin(int l, int r) { return qry(1, 0, n-1, l, r); }
};""",
   python="""class SegTreeMin:
    def __init__(self, a: list[int]):
        self.n = len(a)
        self.tree = [float('inf')] * (4 * self.n)
        def build(node, l, r):
            if l == r:
                self.tree[node] = a[l]; return
            mid = (l + r) // 2
            build(2*node, l, mid); build(2*node+1, mid+1, r)
            self.tree[node] = min(self.tree[2*node], self.tree[2*node+1])
        build(1, 0, self.n - 1)
    def range_min(self, l: int, r: int) -> int:
        def qry(node, lo, hi):
            if r < lo or hi < l:
                return float('inf')
            if l <= lo and hi <= r:
                return self.tree[node]
            mid = (lo + hi) // 2
            return min(qry(2*node, lo, mid), qry(2*node+1, mid+1, hi))
        return qry(1, 0, self.n - 1)"""),
  "st3": dict(approach=[
     "A range sum in [lower, upper] equals prefix[j] - prefix[i] within bounds. Sweep prefix sums and count, for each prefix[j], how many earlier prefix[i] fall in [prefix[j]-upper, prefix[j]-lower].",
     "Coordinate-compress all needed prefix values and use a BIT for the range counts."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    int countRangeSum(vector<int>& nums, int lower, int upper) {
        int n = nums.size();
        vector<long long> pre(n + 1, 0);
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + nums[i];
        vector<long long> all;
        for (long long p : pre) { all.push_back(p); all.push_back(p - lower); all.push_back(p - upper); }
        sort(all.begin(), all.end()); all.erase(unique(all.begin(), all.end()), all.end());
        int m = all.size(); vector<int> bit(m + 1, 0);
        auto add = [&](int i){ for (++i; i <= m; i += i & -i) bit[i]++; };
        auto qy = [&](int i){ int s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; };
        auto idx = [&](long long v){ return (int)(lower_bound(all.begin(), all.end(), v) - all.begin()); };
        int ans = 0;
        for (long long p : pre) {
            int lo = idx(p - upper), hi = idx(p - lower);
            ans += qy(hi) - (lo ? qy(lo - 1) : 0);
            add(idx(p));
        }
        return ans;
    }
};""",
   python="""import bisect
class Solution:
    def countRangeSum(self, nums: list[int], lower: int, upper: int) -> int:
        n = len(nums)
        pre = [0] * (n + 1)
        for i in range(n):
            pre[i + 1] = pre[i] + nums[i]
        allv = sorted(set([p for p in pre] + [p - lower for p in pre] + [p - upper for p in pre]))
        m = len(allv)
        bit = [0] * (m + 1)
        def add(i):
            i += 1
            while i <= m:
                bit[i] += 1; i += i & -i
        def qy(i):
            i += 1; s = 0
            while i > 0:
                s += bit[i]; i -= i & -i
            return s
        idx = lambda v: bisect.bisect_left(allv, v)
        ans = 0
        for p in pre:
            lo, hi = idx(p - upper), idx(p - lower)
            ans += qy(hi) - (qy(lo - 1) if lo else 0)
            add(idx(p))
        return ans"""),
  "st4": dict(approach=[
     "Sweep x-coordinates. At each building's left edge add its height, at the right edge remove it; the current skyline height is the max active height.",
     "A multiset of active heights gives the current max in O(log n); emit a key point whenever the max changes."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
        vector<pair<int,int>> events;
        for (auto& b : buildings) { events.push_back({b[0], -b[2]}); events.push_back({b[1], b[2]}); }
        sort(events.begin(), events.end());
        multiset<int> heights = {0};
        vector<vector<int>> res; int prev = 0;
        for (auto& [x, h] : events) {
            if (h < 0) heights.insert(-h);
            else heights.erase(heights.find(h));
            int cur = *heights.rbegin();
            if (cur != prev) { res.push_back({x, cur}); prev = cur; }
        }
        return res;
    }
};""",
   python="""import heapq
class Solution:
    def getSkyline(self, buildings: list[list[int]]) -> list[list[int]]:
        events = []
        for L, R, H in buildings:
            events.append((L, -H, R))
            events.append((R, 0, 0))
        events.sort()
        res = [[0, 0]]
        live = [(0, float('inf'))]   # (-height, end)
        for x, negH, R in events:
            while live[0][1] <= x:
                heapq.heappop(live)
            if negH:
                heapq.heappush(live, (negH, R))
            cur = -live[0][0]
            if res[-1][1] != cur:
                res.append([x, cur])
        return res[1:]"""),
  "st5": dict(approach=[
     "Each falling square lands on the current max height across the x-interval it covers, then raises that interval.",
     "With small input a coordinate-interval scan works: for every previous square overlapping in x, the base is the max of their tops; the new top is base + side. (A coordinate-compressed segment tree with range-assign + range-max does this in O(n log n).)"],
   time="O(n^2)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> fallingSquares(vector<vector<int>>& positions) {
        int n = positions.size();
        vector<int> heights(n, 0), res;
        int best = 0;
        for (int i = 0; i < n; i++) {
            int l1 = positions[i][0], r1 = l1 + positions[i][1];
            int base = 0;
            for (int j = 0; j < i; j++) {
                int l2 = positions[j][0], r2 = l2 + positions[j][1];
                if (l1 < r2 && l2 < r1) base = max(base, heights[j]);
            }
            heights[i] = base + positions[i][1];
            best = max(best, heights[i]);
            res.push_back(best);
        }
        return res;
    }
};""",
   python="""class Solution:
    def fallingSquares(self, positions: list[list[int]]) -> list[int]:
        n = len(positions)
        heights = [0] * n
        res = []
        best = 0
        for i, (l1, s1) in enumerate(positions):
            r1 = l1 + s1
            base = 0
            for j in range(i):
                l2, s2 = positions[j]
                r2 = l2 + s2
                if l1 < r2 and l2 < r1:
                    base = max(base, heights[j])
            heights[i] = base + s1
            best = max(best, heights[i])
            res.append(best)
        return res"""),
 },
}
