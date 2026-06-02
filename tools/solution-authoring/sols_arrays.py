# -*- coding: utf-8 -*-
SOLS = {
 "kadane": {
  "kd1": dict(approach=[
     "Kadane's core: a maximum-sum subarray ending at i either extends the best subarray ending at i-1 or restarts at a[i].",
     "Keep a running `cur = max(a[i], cur + a[i])` and track the global best. One pass, O(1) memory."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int maxSubArray(vector<int>& a) {
        int cur = a[0], best = a[0];
        for (int i = 1; i < (int)a.size(); i++) {
            cur = max(a[i], cur + a[i]);
            best = max(best, cur);
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxSubArray(self, a: list[int]) -> int:
        cur = best = a[0]
        for x in a[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best"""),
  "kd2": dict(approach=[
     "Products flip sign, so a large negative times a negative can become the new maximum. Track both the max and min product ending at i.",
     "When a[i] is negative, swap the running max and min before updating. The answer is the largest max product seen."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int maxProduct(vector<int>& a) {
        int mx = a[0], mn = a[0], best = a[0];
        for (int i = 1; i < (int)a.size(); i++) {
            if (a[i] < 0) swap(mx, mn);
            mx = max(a[i], mx * a[i]);
            mn = min(a[i], mn * a[i]);
            best = max(best, mx);
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxProduct(self, a: list[int]) -> int:
        mx = mn = best = a[0]
        for x in a[1:]:
            if x < 0:
                mx, mn = mn, mx
            mx = max(x, mx * x)
            mn = min(x, mn * x)
            best = max(best, mx)
        return best"""),
  "kd3": dict(approach=[
     "The best circular subarray is either a normal (non-wrapping) max subarray, or the total minus the minimum subarray (which carves out a wrapping one).",
     "Compute both with Kadane. Edge case: if every element is negative, total - minSum becomes 0 (empty), so fall back to the plain maximum."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int maxSubarraySumCircular(vector<int>& a) {
        int total = 0, curMax = 0, bestMax = INT_MIN, curMin = 0, bestMin = INT_MAX;
        for (int x : a) {
            total += x;
            curMax = max(x, curMax + x); bestMax = max(bestMax, curMax);
            curMin = min(x, curMin + x); bestMin = min(bestMin, curMin);
        }
        if (bestMax < 0) return bestMax;          // all negative
        return max(bestMax, total - bestMin);
    }
};""",
   python="""class Solution:
    def maxSubarraySumCircular(self, a: list[int]) -> int:
        total = 0
        cur_max = best_max = a[0]
        cur_min = best_min = a[0]
        for i, x in enumerate(a):
            total += x
            if i == 0:
                continue
            cur_max = max(x, cur_max + x); best_max = max(best_max, cur_max)
            cur_min = min(x, cur_min + x); best_min = min(best_min, cur_min)
        if best_max < 0:
            return best_max
        return max(best_max, total - best_min)"""),
  "kd4": dict(approach=[
     "Maximising sell-buy profit is Kadane in disguise: track the minimum price seen so far and the best profit if you sold today.",
     "profit = max(profit, price - minSoFar); update minSoFar each step. Single pass."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int maxProfit(vector<int>& p) {
        int minPrice = INT_MAX, best = 0;
        for (int x : p) { minPrice = min(minPrice, x); best = max(best, x - minPrice); }
        return best;
    }
};""",
   python="""class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price, best = float('inf'), 0
        for x in prices:
            min_price = min(min_price, x)
            best = max(best, x - min_price)
        return best"""),
  "kd5": dict(approach=[
     "Reduce 2D to 1D: fix a pair of top/bottom rows, compress each column's values between them into a single array, and run Kadane on that array.",
     "Iterate all O(rows^2) row pairs; each Kadane pass is O(cols). Total O(rows^2 · cols)."],
   time="O(rows^2 · cols)", space="O(cols)",
   cpp="""class Solution {
public:
    int maxRectangleSum(vector<vector<int>>& m) {
        int R = m.size(), C = m[0].size(), best = INT_MIN;
        for (int top = 0; top < R; top++) {
            vector<int> col(C, 0);
            for (int bot = top; bot < R; bot++) {
                for (int c = 0; c < C; c++) col[c] += m[bot][c];
                int cur = col[0], local = col[0];
                for (int c = 1; c < C; c++) { cur = max(col[c], cur + col[c]); local = max(local, cur); }
                best = max(best, local);
            }
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxRectangleSum(self, m: list[list[int]]) -> int:
        R, C = len(m), len(m[0])
        best = float('-inf')
        for top in range(R):
            col = [0] * C
            for bot in range(top, R):
                for c in range(C):
                    col[c] += m[bot][c]
                cur = local = col[0]
                for c in range(1, C):
                    cur = max(col[c], cur + col[c])
                    local = max(local, cur)
                best = max(best, local)
        return best"""),
 },
 "prefix-sums": {
  "ps1": dict(approach=[
     "Precompute pre[i] = a[0]+...+a[i-1]. Any range sum [l, r] is pre[r+1] - pre[l] in O(1).",
     "Build the prefix array once in the constructor; each query is a single subtraction."],
   time="O(n) build, O(1) query", space="O(n)",
   cpp="""class NumArray {
    vector<long long> pre;
public:
    NumArray(vector<int>& a) {
        pre.assign(a.size() + 1, 0);
        for (int i = 0; i < (int)a.size(); i++) pre[i + 1] = pre[i] + a[i];
    }
    int sumRange(int l, int r) { return (int)(pre[r + 1] - pre[l]); }
};""",
   python="""from itertools import accumulate
class NumArray:
    def __init__(self, a: list[int]):
        self.pre = [0] + list(accumulate(a))
    def sumRange(self, l: int, r: int) -> int:
        return self.pre[r + 1] - self.pre[l]"""),
  "ps2": dict(approach=[
     "A subarray sums to k iff pre[j] - pre[i] = k, i.e. pre[i] = pre[j] - k. Count, with a hash map, how many earlier prefixes equal pre[j] - k.",
     "Stream the prefix sum, look up (prefix - k) in the map, then record the current prefix. O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int subarraySum(vector<int>& a, int k) {
        unordered_map<int,int> cnt{{0, 1}};
        int pre = 0, ans = 0;
        for (int x : a) { pre += x; ans += cnt[pre - k]; cnt[pre]++; }
        return ans;
    }
};""",
   python="""from collections import defaultdict
class Solution:
    def subarraySum(self, a: list[int], k: int) -> int:
        cnt = defaultdict(int); cnt[0] = 1
        pre = ans = 0
        for x in a:
            pre += x
            ans += cnt[pre - k]
            cnt[pre] += 1
        return ans"""),
  "ps3": dict(approach=[
     "Map 0 -> -1 and 1 -> +1; then a subarray with equal 0s and 1s has prefix sum difference 0, i.e. two equal prefix sums.",
     "Store the first index where each prefix value appears; the longest span is the current index minus that earliest index."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int findMaxLength(vector<int>& a) {
        unordered_map<int,int> first{{0, -1}};
        int pre = 0, best = 0;
        for (int i = 0; i < (int)a.size(); i++) {
            pre += a[i] ? 1 : -1;
            if (first.count(pre)) best = max(best, i - first[pre]);
            else first[pre] = i;
        }
        return best;
    }
};""",
   python="""class Solution:
    def findMaxLength(self, a: list[int]) -> int:
        first = {0: -1}
        pre = best = 0
        for i, x in enumerate(a):
            pre += 1 if x else -1
            if pre in first:
                best = max(best, i - first[pre])
            else:
                first[pre] = i
        return best"""),
  "ps4": dict(approach=[
     "Build a 2D prefix where pre[i][j] is the sum of the rectangle from (0,0) to (i-1,j-1).",
     "Any submatrix sum uses inclusion-exclusion: pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]."],
   time="O(mn) build, O(1) query", space="O(mn)",
   cpp="""class NumMatrix {
    vector<vector<long long>> pre;
public:
    NumMatrix(vector<vector<int>>& m) {
        int R = m.size(), C = m[0].size();
        pre.assign(R + 1, vector<long long>(C + 1, 0));
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++)
                pre[i+1][j+1] = m[i][j] + pre[i][j+1] + pre[i+1][j] - pre[i][j];
    }
    int sumRegion(int r1, int c1, int r2, int c2) {
        return (int)(pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]);
    }
};""",
   python="""class NumMatrix:
    def __init__(self, m: list[list[int]]):
        R, C = len(m), len(m[0])
        self.pre = [[0] * (C + 1) for _ in range(R + 1)]
        for i in range(R):
            for j in range(C):
                self.pre[i+1][j+1] = m[i][j] + self.pre[i][j+1] + self.pre[i+1][j] - self.pre[i][j]
    def sumRegion(self, r1, c1, r2, c2):
        p = self.pre
        return p[r2+1][c2+1] - p[r1][c2+1] - p[r2+1][c1] + p[r1][c1]"""),
  "ps5": dict(approach=[
     "Same identity as Subarray-Sum-Equals-K, but now maximise length: we need the earliest index with prefix value pre - k.",
     "Record the first occurrence of each prefix sum only; for each j check if pre - k was seen and update the best length."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int maxSubArrayLen(vector<int>& a, int k) {
        unordered_map<long long,int> first{{0, -1}};
        long long pre = 0; int best = 0;
        for (int i = 0; i < (int)a.size(); i++) {
            pre += a[i];
            if (first.count(pre - k)) best = max(best, i - first[pre - k]);
            if (!first.count(pre)) first[pre] = i;
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxSubArrayLen(self, a: list[int], k: int) -> int:
        first = {0: -1}
        pre = best = 0
        for i, x in enumerate(a):
            pre += x
            if pre - k in first:
                best = max(best, i - first[pre - k])
            if pre not in first:
                first[pre] = i
        return best"""),
 },
 "sliding-window": {
  "sw1": dict(approach=[
     "Fixed-size window of length k: compute the first window's sum, then slide by adding the entering element and removing the leaving one.",
     "Track the max average = max window sum / k. O(n) with O(1) memory."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    double findMaxAverage(vector<int>& a, int k) {
        double sum = 0;
        for (int i = 0; i < k; i++) sum += a[i];
        double best = sum;
        for (int i = k; i < (int)a.size(); i++) { sum += a[i] - a[i - k]; best = max(best, sum); }
        return best / k;
    }
};""",
   python="""class Solution:
    def findMaxAverage(self, a: list[int], k: int) -> float:
        s = sum(a[:k])
        best = s
        for i in range(k, len(a)):
            s += a[i] - a[i - k]
            best = max(best, s)
        return best / k"""),
  "sw2": dict(approach=[
     "Grow a window [l, r]; track the last index each character appeared. When a repeat is inside the window, jump l past the previous occurrence.",
     "The answer is the maximum window width seen. Each index is visited once, O(n)."],
   time="O(n)", space="O(min(n, charset))",
   cpp="""class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(128, -1);
        int l = 0, best = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            if (last[s[r]] >= l) l = last[s[r]] + 1;
            last[s[r]] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};""",
   python="""class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        l = best = 0
        for r, c in enumerate(s):
            if c in last and last[c] >= l:
                l = last[c] + 1
            last[c] = r
            best = max(best, r - l + 1)
        return best"""),
  "sw3": dict(approach=[
     "Expand the right edge adding to a running sum. Whenever sum >= target, shrink from the left while it still holds, recording the minimum window length.",
     "Each index enters and leaves the window once, so it is O(n) despite the nested shrink loop."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int minSubArrayLen(int target, vector<int>& a) {
        int l = 0, sum = 0, best = INT_MAX;
        for (int r = 0; r < (int)a.size(); r++) {
            sum += a[r];
            while (sum >= target) { best = min(best, r - l + 1); sum -= a[l++]; }
        }
        return best == INT_MAX ? 0 : best;
    }
};""",
   python="""class Solution:
    def minSubArrayLen(self, target: int, a: list[int]) -> int:
        l = s = 0
        best = float('inf')
        for r, x in enumerate(a):
            s += x
            while s >= target:
                best = min(best, r - l + 1)
                s -= a[l]; l += 1
        return 0 if best == float('inf') else best"""),
  "sw4": dict(approach=[
     "We seek a window of length len(s1) in s2 whose character counts match s1's exactly. Maintain a fixed-size sliding window of frequency counts.",
     "Track how many of the 26 letters currently match the target count; the window is a permutation when all 26 match."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        if (s1.size() > s2.size()) return false;
        vector<int> need(26, 0), win(26, 0);
        for (char c : s1) need[c - 'a']++;
        int k = s1.size();
        for (int i = 0; i < (int)s2.size(); i++) {
            win[s2[i] - 'a']++;
            if (i >= k) win[s2[i - k] - 'a']--;
            if (i >= k - 1 && win == need) return true;
        }
        return false;
    }
};""",
   python="""class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        need = [0] * 26
        win = [0] * 26
        for c in s1:
            need[ord(c) - 97] += 1
        k = len(s1)
        for i, c in enumerate(s2):
            win[ord(c) - 97] += 1
            if i >= k:
                win[ord(s2[i - k]) - 97] -= 1
            if i >= k - 1 and win == need:
                return True
        return False"""),
  "sw5": dict(approach=[
     "Keep a `need` count of t's characters and a `missing` counter. Expand right, decrementing missing when a needed char is covered.",
     "Once missing hits 0, shrink from the left to drop unnecessary characters, recording the smallest valid window. O(n)."],
   time="O(n)", space="O(charset)",
   cpp="""class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int missing = t.size(), l = 0, bestLen = INT_MAX, bestL = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            if (need[s[r]]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
                if (++need[s[l++]] > 0) missing++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};""",
   python="""from collections import Counter
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)
        l = best_l = 0
        best_len = float('inf')
        for r, c in enumerate(s):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            while missing == 0:
                if r - l + 1 < best_len:
                    best_len, best_l = r - l + 1, l
                need[s[l]] += 1
                if need[s[l]] > 0:
                    missing += 1
                l += 1
        return "" if best_len == float('inf') else s[best_l:best_l + best_len]"""),
 },
 "two-pointers": {
  "tp1": dict(approach=[
     "Because the array is sorted, two pointers from both ends converge: if the pair sum is too small move left pointer right, if too big move right pointer left.",
     "When the sum matches, return the 1-based indices. O(n) with no extra space."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    vector<int> twoSum(vector<int>& a, int target) {
        int i = 0, j = a.size() - 1;
        while (i < j) {
            int s = a[i] + a[j];
            if (s == target) return {i + 1, j + 1};
            if (s < target) i++; else j--;
        }
        return {};
    }
};""",
   python="""class Solution:
    def twoSum(self, a: list[int], target: int) -> list[int]:
        i, j = 0, len(a) - 1
        while i < j:
            s = a[i] + a[j]
            if s == target:
                return [i + 1, j + 1]
            if s < target:
                i += 1
            else:
                j -= 1
        return []"""),
  "tp2": dict(approach=[
     "Two pointers from both ends; skip non-alphanumeric characters and compare lowercased letters.",
     "If any mismatch occurs it is not a palindrome; pointers meeting means success. O(n)."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    bool isPalindrome(string s) {
        int i = 0, j = s.size() - 1;
        while (i < j) {
            while (i < j && !isalnum(s[i])) i++;
            while (i < j && !isalnum(s[j])) j--;
            if (tolower(s[i]) != tolower(s[j])) return false;
            i++; j--;
        }
        return true;
    }
};""",
   python="""class Solution:
    def isPalindrome(self, s: str) -> bool:
        i, j = 0, len(s) - 1
        while i < j:
            while i < j and not s[i].isalnum():
                i += 1
            while i < j and not s[j].isalnum():
                j -= 1
            if s[i].lower() != s[j].lower():
                return False
            i += 1; j -= 1
        return True"""),
  "tp3": dict(approach=[
     "Sort, then fix each a[i] and two-pointer the rest for pairs summing to -a[i].",
     "Skip duplicates at the fixed index and after finding a triple to avoid repeats. O(n^2)."],
   time="O(n^2)", space="O(1)",
   cpp="""class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& a) {
        sort(a.begin(), a.end());
        vector<vector<int>> res;
        int n = a.size();
        for (int i = 0; i < n - 2; i++) {
            if (i && a[i] == a[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int s = a[i] + a[l] + a[r];
                if (s < 0) l++;
                else if (s > 0) r--;
                else {
                    res.push_back({a[i], a[l], a[r]});
                    while (l < r && a[l] == a[l + 1]) l++;
                    while (l < r && a[r] == a[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return res;
    }
};""",
   python="""class Solution:
    def threeSum(self, a: list[int]) -> list[list[int]]:
        a.sort()
        res, n = [], len(a)
        for i in range(n - 2):
            if i and a[i] == a[i - 1]:
                continue
            l, r = i + 1, n - 1
            while l < r:
                s = a[i] + a[l] + a[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([a[i], a[l], a[r]])
                    while l < r and a[l] == a[l + 1]:
                        l += 1
                    while l < r and a[r] == a[r - 1]:
                        r -= 1
                    l += 1; r -= 1
        return res"""),
  "tp4": dict(approach=[
     "Water held by two lines is width × min(height). Start widest; the shorter line limits the area, so moving it inward is the only way to possibly improve.",
     "Move the pointer at the shorter line each step, tracking the max area. O(n)."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int maxArea(vector<int>& h) {
        int i = 0, j = h.size() - 1, best = 0;
        while (i < j) {
            best = max(best, (j - i) * min(h[i], h[j]));
            if (h[i] < h[j]) i++; else j--;
        }
        return best;
    }
};""",
   python="""class Solution:
    def maxArea(self, h: list[int]) -> int:
        i, j, best = 0, len(h) - 1, 0
        while i < j:
            best = max(best, (j - i) * min(h[i], h[j]))
            if h[i] < h[j]:
                i += 1
            else:
                j -= 1
        return best"""),
  "tp5": dict(approach=[
     "Water above each bar is min(maxLeft, maxRight) - height. Two pointers track running left/right maxima from both ends.",
     "Whichever side has the smaller running max is the binding constraint, so process that side and add its trapped water. O(n), O(1) space."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int trap(vector<int>& h) {
        int i = 0, j = h.size() - 1, lmax = 0, rmax = 0, water = 0;
        while (i < j) {
            if (h[i] < h[j]) { lmax = max(lmax, h[i]); water += lmax - h[i]; i++; }
            else { rmax = max(rmax, h[j]); water += rmax - h[j]; j--; }
        }
        return water;
    }
};""",
   python="""class Solution:
    def trap(self, h: list[int]) -> int:
        i, j = 0, len(h) - 1
        lmax = rmax = water = 0
        while i < j:
            if h[i] < h[j]:
                lmax = max(lmax, h[i]); water += lmax - h[i]; i += 1
            else:
                rmax = max(rmax, h[j]); water += rmax - h[j]; j -= 1
        return water"""),
 },
}
