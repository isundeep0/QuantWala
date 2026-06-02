# -*- coding: utf-8 -*-
SOLS = {
 "binary-search": {
  "bs1": dict(approach=[
     "This is the canonical template. Keep a closed window [lo, hi] that always contains the answer if it exists.",
     "Probe the midpoint; if it equals the target you are done, otherwise the comparison tells you which half to discard. Loop while lo <= hi and return -1 when the window empties."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
public:
    int search(vector<int>& a, int target) {
        int lo = 0, hi = (int)a.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};""",
   python="""class Solution:
    def search(self, a: list[int], target: int) -> int:
        lo, hi = 0, len(a) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if a[mid] == target:
                return mid
            if a[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1"""),
  "bs2": dict(approach=[
     "Here we search for a boundary, not an exact value. The predicate isBadVersion is monotonic: once it turns true it stays true.",
     "Use the half-open style: while lo < hi, if isBadVersion(mid) the first bad version is mid or to its left (hi = mid), else it is strictly right (lo = mid + 1). lo converges on the first true."],
   time="O(log n)", space="O(1)",
   cpp="""// bool isBadVersion(int version);
class Solution {
public:
    int firstBadVersion(int n) {
        int lo = 1, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;   // avoids overflow
            if (isBadVersion(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
};""",
   python="""class Solution:
    def firstBadVersion(self, n: int) -> int:
        lo, hi = 1, n
        while lo < hi:
            mid = (lo + hi) // 2
            if isBadVersion(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo"""),
  "bs3": dict(approach=[
     "The array is two sorted runs. At any mid, at least one of [lo, mid] and [mid, hi] is fully sorted — compare a[lo] with a[mid] to find which.",
     "If the left half is sorted and the target lies inside [a[lo], a[mid]), go left; symmetrically for the right half. Each step still halves the range, giving O(log n)."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
public:
    int search(vector<int>& a, int target) {
        int lo = 0, hi = (int)a.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[lo] <= a[mid]) {                 // left half sorted
                if (a[lo] <= target && target < a[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                               // right half sorted
                if (a[mid] < target && target <= a[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
};""",
   python="""class Solution:
    def search(self, a: list[int], target: int) -> int:
        lo, hi = 0, len(a) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if a[mid] == target:
                return mid
            if a[lo] <= a[mid]:                    # left half sorted
                if a[lo] <= target < a[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                  # right half sorted
                if a[mid] < target <= a[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1"""),
  "bs4": dict(approach=[
     "Binary search on the answer (the speed k), not on the array. feasible(k) = total hours to finish all piles at speed k is monotonic: faster speed never needs more hours.",
     "Search k in [1, max(pile)]. Hours for a pile of size x at speed k is ceil(x/k). Find the smallest k whose total hours <= h."],
   time="O(n log(max pile))", space="O(1)",
   cpp="""class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int x : piles) hours += (x + mid - 1) / mid;
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};""",
   python="""class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            hours = sum((x + mid - 1) // mid for x in piles)
            if hours <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo"""),
  "bs5": dict(approach=[
     "Binary search the partition point of the smaller array. Choose i elements from A and j from B so the left side holds exactly half of all elements.",
     "A partition is valid when maxLeft(A) <= minRight(B) and maxLeft(B) <= minRight(A). Use ±infinity sentinels at the ends; then the median is read off the boundary values. O(log min(m,n))."],
   time="O(log min(m, n))", space="O(1)",
   cpp="""class Solution {
public:
    double findMedianSortedArrays(vector<int>& A, vector<int>& B) {
        if (A.size() > B.size()) swap(A, B);
        int m = A.size(), n = B.size(), lo = 0, hi = m;
        const long long NEG = LLONG_MIN, POS = LLONG_MAX;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = (m + n + 1) / 2 - i;
            long long aL = i == 0 ? NEG : A[i-1], aR = i == m ? POS : A[i];
            long long bL = j == 0 ? NEG : B[j-1], bR = j == n ? POS : B[j];
            if (aL <= bR && bL <= aR) {
                if ((m + n) % 2) return max(aL, bL);
                return (max(aL, bL) + min(aR, bR)) / 2.0;
            } else if (aL > bR) hi = i - 1;
            else lo = i + 1;
        }
        return 0.0;
    }
};""",
   python="""class Solution:
    def findMedianSortedArrays(self, A: list[int], B: list[int]) -> float:
        if len(A) > len(B):
            A, B = B, A
        m, n = len(A), len(B)
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2
            j = (m + n + 1) // 2 - i
            aL = float('-inf') if i == 0 else A[i-1]
            aR = float('inf') if i == m else A[i]
            bL = float('-inf') if j == 0 else B[j-1]
            bR = float('inf') if j == n else B[j]
            if aL <= bR and bL <= aR:
                if (m + n) % 2:
                    return max(aL, bL)
                return (max(aL, bL) + min(aR, bR)) / 2
            elif aL > bR:
                hi = i - 1
            else:
                lo = i + 1
        return 0.0"""),
 },
 "binary-search-variations": {
  "bsv1": dict(approach=[
     "This is exactly lower_bound: the first index where a[i] >= target. If the target is present it returns its position; otherwise the insertion point.",
     "Use the half-open window [0, n]; collapse toward the first index whose value is >= target."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
public:
    int searchInsert(vector<int>& a, int target) {
        int lo = 0, hi = a.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] >= target) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};""",
   python="""class Solution:
    def searchInsert(self, a: list[int], target: int) -> int:
        lo, hi = 0, len(a)
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] >= target:
                hi = mid
            else:
                lo = mid + 1
        return lo"""),
  "bsv2": dict(approach=[
     "Run two boundary searches. lower_bound finds the first index with value >= target; upper_bound finds the first index with value > target.",
     "The range is [lower, upper-1]. If lower == upper the target is absent, so return [-1, -1]."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
    int lb(vector<int>& a, int t){int lo=0,hi=a.size();while(lo<hi){int m=(lo+hi)/2;if(a[m]>=t)hi=m;else lo=m+1;}return lo;}
public:
    vector<int> searchRange(vector<int>& a, int target) {
        int l = lb(a, target), r = lb(a, target + 1);
        if (l == r) return {-1, -1};
        return {l, r - 1};
    }
};""",
   python="""import bisect
class Solution:
    def searchRange(self, a: list[int], target: int) -> list[int]:
        l = bisect.bisect_left(a, target)
        r = bisect.bisect_right(a, target)
        if l == r:
            return [-1, -1]
        return [l, r - 1]"""),
  "bsv3": dict(approach=[
     "Binary search on the answer: the ship capacity. feasible(cap) = number of days needed when no day exceeds cap; it is monotonic (bigger capacity never needs more days).",
     "The capacity must be at least max(weight) and at most sum(weights). Find the smallest capacity that ships within D days by a greedy day-count simulation."],
   time="O(n log(sum))", space="O(1)",
   cpp="""class Solution {
    bool ok(vector<int>& w, int cap, int days){
        int d = 1, cur = 0;
        for (int x : w){ if (cur + x > cap){ d++; cur = 0; } cur += x; }
        return d <= days;
    }
public:
    int shipWithinDays(vector<int>& w, int days) {
        int lo = *max_element(w.begin(), w.end());
        int hi = accumulate(w.begin(), w.end(), 0);
        while (lo < hi){ int mid = (lo + hi) / 2; if (ok(w, mid, days)) hi = mid; else lo = mid + 1; }
        return lo;
    }
};""",
   python="""class Solution:
    def shipWithinDays(self, w: list[int], days: int) -> int:
        def ok(cap):
            d, cur = 1, 0
            for x in w:
                if cur + x > cap:
                    d += 1
                    cur = 0
                cur += x
            return d <= days
        lo, hi = max(w), sum(w)
        while lo < hi:
            mid = (lo + hi) // 2
            if ok(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo"""),
  "bsv4": dict(approach=[
     "Identical pattern to ship-packages: binary search the largest allowed subarray sum. feasible(cap) = minimum number of subarrays whose sums each stay <= cap.",
     "Search cap in [max(nums), sum(nums)]; greedily start a new subarray whenever adding the next element would exceed cap. The smallest cap needing <= k subarrays is the answer."],
   time="O(n log(sum))", space="O(1)",
   cpp="""class Solution {
    int parts(vector<int>& a, long long cap){
        int p = 1; long long cur = 0;
        for (int x : a){ if (cur + x > cap){ p++; cur = 0; } cur += x; }
        return p;
    }
public:
    int splitArray(vector<int>& a, int k) {
        long long lo = *max_element(a.begin(), a.end());
        long long hi = accumulate(a.begin(), a.end(), 0LL);
        while (lo < hi){ long long mid = (lo + hi) / 2; if (parts(a, mid) <= k) hi = mid; else lo = mid + 1; }
        return (int)lo;
    }
};""",
   python="""class Solution:
    def splitArray(self, nums: list[int], k: int) -> int:
        def parts(cap):
            p, cur = 1, 0
            for x in nums:
                if cur + x > cap:
                    p += 1
                    cur = 0
                cur += x
            return p
        lo, hi = max(nums), sum(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if parts(mid) <= k:
                hi = mid
            else:
                lo = mid + 1
        return lo"""),
  "bsv5": dict(approach=[
     "A peak is any element greater than its neighbors; with nums[-1] = nums[n] = -infinity a peak always exists. Binary search on the slope.",
     "If a[mid] < a[mid+1] an ascending slope guarantees a peak to the right (lo = mid+1); otherwise a peak is at mid or to the left (hi = mid)."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
public:
    int findPeakElement(vector<int>& a) {
        int lo = 0, hi = a.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < a[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
};""",
   python="""class Solution:
    def findPeakElement(self, a: list[int]) -> int:
        lo, hi = 0, len(a) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] < a[mid + 1]:
                lo = mid + 1
            else:
                hi = mid
        return lo"""),
 },
 "counting-sort": {
  "cs1": dict(approach=[
     "Values lie in a known band (here [-5e4, 5e4]). Counting sort tallies each value, then rebuilds the array in order — no comparisons.",
     "Offset values by the minimum so counts index from 0. Total work is O(n + range), linear when the range is comparable to n."],
   time="O(n + range)", space="O(range)",
   cpp="""class Solution {
public:
    vector<int> sortArray(vector<int>& a) {
        if (a.empty()) return a;
        int lo = *min_element(a.begin(), a.end());
        int hi = *max_element(a.begin(), a.end());
        vector<int> cnt(hi - lo + 1, 0);
        for (int x : a) cnt[x - lo]++;
        int idx = 0;
        for (int v = 0; v < (int)cnt.size(); v++)
            while (cnt[v]--) a[idx++] = v + lo;
        return a;
    }
};""",
   python="""class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        if not a:
            return a
        lo, hi = min(a), max(a)
        cnt = [0] * (hi - lo + 1)
        for x in a:
            cnt[x - lo] += 1
        out = []
        for v, c in enumerate(cnt):
            out.extend([v + lo] * c)
        return out"""),
  "cs2": dict(approach=[
     "Only three values, so it is counting sort with k = 3 — or its in-place cousin, the Dutch National Flag, which sorts in one pass with three pointers.",
     "Keep low/mid/high pointers: swap 0s to the front, 2s to the back, and advance through 1s. One pass, O(1) extra space."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    void sortColors(vector<int>& a) {
        int low = 0, mid = 0, high = a.size() - 1;
        while (mid <= high) {
            if (a[mid] == 0) swap(a[low++], a[mid++]);
            else if (a[mid] == 1) mid++;
            else swap(a[mid], a[high--]);
        }
    }
};""",
   python="""class Solution:
    def sortColors(self, a: list[int]) -> None:
        low, mid, high = 0, 0, len(a) - 1
        while mid <= high:
            if a[mid] == 0:
                a[low], a[mid] = a[mid], a[low]
                low += 1
                mid += 1
            elif a[mid] == 1:
                mid += 1
            else:
                a[mid], a[high] = a[high], a[mid]
                high -= 1"""),
  "cs3": dict(approach=[
     "Count occurrences of each value in arr1. Then emit values in the order dictated by arr2, and finally the leftover values (not in arr2) in ascending order.",
     "Because values are bounded (0..1000), counting gives linear placement once arr2 fixes the priority order."],
   time="O(n + m + range)", space="O(range)",
   cpp="""class Solution {
public:
    vector<int> relativeSortArray(vector<int>& a, vector<int>& b) {
        vector<int> cnt(1001, 0);
        for (int x : a) cnt[x]++;
        vector<int> res;
        for (int x : b) while (cnt[x]--) res.push_back(x);
        for (int v = 0; v <= 1000; v++) while (cnt[v]-- > 0) res.push_back(v);
        return res;
    }
};""",
   python="""class Solution:
    def relativeSortArray(self, arr1: list[int], arr2: list[int]) -> list[int]:
        cnt = [0] * 1001
        for x in arr1:
            cnt[x] += 1
        res = []
        for x in arr2:
            res.extend([x] * cnt[x])
            cnt[x] = 0
        for v in range(1001):
            res.extend([v] * cnt[v])
        return res"""),
  "cs4": dict(approach=[
     "A comparison sort would be O(n log n); we want O(n). Use the pigeonhole idea: spread n numbers into n-1 buckets of equal width.",
     "The maximum gap must occur between buckets, not within one, so we only track each bucket's min and max and scan consecutive non-empty buckets."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int maximumGap(vector<int>& a) {
        int n = a.size();
        if (n < 2) return 0;
        int lo = *min_element(a.begin(), a.end());
        int hi = *max_element(a.begin(), a.end());
        if (lo == hi) return 0;
        int bsize = max(1, (hi - lo) / (n - 1));
        int cnt = (hi - lo) / bsize + 1;
        vector<int> bmin(cnt, INT_MAX), bmax(cnt, INT_MIN);
        for (int x : a) { int b = (x - lo) / bsize; bmin[b] = min(bmin[b], x); bmax[b] = max(bmax[b], x); }
        int gap = 0, prev = lo;
        for (int b = 0; b < cnt; b++) {
            if (bmin[b] == INT_MAX) continue;
            gap = max(gap, bmin[b] - prev);
            prev = bmax[b];
        }
        return gap;
    }
};""",
   python="""class Solution:
    def maximumGap(self, a: list[int]) -> int:
        n = len(a)
        if n < 2:
            return 0
        lo, hi = min(a), max(a)
        if lo == hi:
            return 0
        bsize = max(1, (hi - lo) // (n - 1))
        cnt = (hi - lo) // bsize + 1
        bmin = [float('inf')] * cnt
        bmax = [float('-inf')] * cnt
        for x in a:
            b = (x - lo) // bsize
            bmin[b] = min(bmin[b], x)
            bmax[b] = max(bmax[b], x)
        gap, prev = 0, lo
        for b in range(cnt):
            if bmin[b] == float('inf'):
                continue
            gap = max(gap, bmin[b] - prev)
            prev = bmax[b]
        return gap"""),
  "cs5": dict(approach=[
     "The h-index is at most n, so bucket citations by value, capping anything >= n into bucket n. This is counting sort over [0, n].",
     "Scan buckets from high to low accumulating how many papers have at least i citations; the first i where that count >= i is the h-index."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int hIndex(vector<int>& c) {
        int n = c.size();
        vector<int> bucket(n + 1, 0);
        for (int x : c) bucket[min(x, n)]++;
        int total = 0;
        for (int i = n; i >= 0; i--) {
            total += bucket[i];
            if (total >= i) return i;
        }
        return 0;
    }
};""",
   python="""class Solution:
    def hIndex(self, citations: list[int]) -> int:
        n = len(citations)
        bucket = [0] * (n + 1)
        for x in citations:
            bucket[min(x, n)] += 1
        total = 0
        for i in range(n, -1, -1):
            total += bucket[i]
            if total >= i:
                return i
        return 0"""),
 },
 "merge-sort": {
  "ms1": dict(approach=[
     "Textbook merge sort: split in half, sort each half recursively, then merge the two sorted halves in linear time.",
     "It is stable and guaranteed O(n log n) regardless of input, at the cost of O(n) auxiliary space for merging."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    void msort(vector<int>& a, int l, int r, vector<int>& tmp) {
        if (r - l <= 1) return;
        int m = (l + r) / 2;
        msort(a, l, m, tmp); msort(a, m, r, tmp);
        int i = l, j = m, k = l;
        while (i < m && j < r) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
        while (i < m) tmp[k++] = a[i++];
        while (j < r) tmp[k++] = a[j++];
        for (int t = l; t < r; t++) a[t] = tmp[t];
    }
public:
    vector<int> sortArray(vector<int>& a) {
        vector<int> tmp(a.size());
        msort(a, 0, a.size(), tmp);
        return a;
    }
};""",
   python="""class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        def msort(arr):
            if len(arr) <= 1:
                return arr
            mid = len(arr) // 2
            left, right = msort(arr[:mid]), msort(arr[mid:])
            res, i, j = [], 0, 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    res.append(left[i]); i += 1
                else:
                    res.append(right[j]); j += 1
            res.extend(left[i:]); res.extend(right[j:])
            return res
        return msort(a)"""),
  "ms2": dict(approach=[
     "While merging, every time an element from the right half is placed before remaining left-half elements, those left elements are all greater and were originally to its left — a counting opportunity.",
     "Sort indices (not values) so we can record counts per original position. When we take a left element, add the number of right elements already merged."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> cnt, idx, tmp;
    void msort(vector<int>& a, int l, int r) {
        if (r - l <= 1) return;
        int m = (l + r) / 2;
        msort(a, l, m); msort(a, m, r);
        int i = l, j = m, k = l, right = 0;
        while (i < m && j < r) {
            if (a[idx[j]] < a[idx[i]]) { right++; tmp[k++] = idx[j++]; }
            else { cnt[idx[i]] += right; tmp[k++] = idx[i++]; }
        }
        while (i < m) { cnt[idx[i]] += right; tmp[k++] = idx[i++]; }
        while (j < r) tmp[k++] = idx[j++];
        for (int t = l; t < r; t++) idx[t] = tmp[t];
    }
public:
    vector<int> countSmaller(vector<int>& a) {
        int n = a.size();
        cnt.assign(n, 0); idx.resize(n); tmp.resize(n);
        for (int i = 0; i < n; i++) idx[i] = i;
        msort(a, 0, n);
        return cnt;
    }
};""",
   python="""class Solution:
    def countSmaller(self, a: list[int]) -> list[int]:
        n = len(a)
        cnt = [0] * n
        idx = list(range(n))
        def msort(l, r):
            if r - l <= 1:
                return
            m = (l + r) // 2
            msort(l, m); msort(m, r)
            merged, i, j, right = [], l, m, 0
            while i < m and j < r:
                if a[idx[j]] < a[idx[i]]:
                    right += 1; merged.append(idx[j]); j += 1
                else:
                    cnt[idx[i]] += right; merged.append(idx[i]); i += 1
            while i < m:
                cnt[idx[i]] += right; merged.append(idx[i]); i += 1
            while j < r:
                merged.append(idx[j]); j += 1
            idx[l:r] = merged
        msort(0, n)
        return cnt"""),
  "ms3": dict(approach=[
     "A reverse pair is i < j with a[i] > 2*a[j]. Count them during merge sort: before merging two sorted halves, for each left element count right elements it dominates.",
     "Because both halves are sorted, the count pointer only moves forward, so the extra counting pass is linear per merge."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> tmp;
    long long msort(vector<int>& a, int l, int r) {
        if (r - l <= 1) return 0;
        int m = (l + r) / 2;
        long long c = msort(a, l, m) + msort(a, m, r);
        int j = m;
        for (int i = l; i < m; i++) { while (j < r && a[i] > 2LL * a[j]) j++; c += j - m; }
        int x = l, y = m, k = l;
        while (x < m && y < r) tmp[k++] = (a[x] <= a[y]) ? a[x++] : a[y++];
        while (x < m) tmp[k++] = a[x++];
        while (y < r) tmp[k++] = a[y++];
        for (int t = l; t < r; t++) a[t] = tmp[t];
        return c;
    }
public:
    int reversePairs(vector<int>& a) {
        tmp.resize(a.size());
        return (int)msort(a, 0, a.size());
    }
};""",
   python="""class Solution:
    def reversePairs(self, a: list[int]) -> int:
        def msort(l, r):
            if r - l <= 1:
                return 0
            m = (l + r) // 2
            c = msort(l, m) + msort(m, r)
            j = m
            for i in range(l, m):
                while j < r and a[i] > 2 * a[j]:
                    j += 1
                c += j - m
            a[l:r] = sorted(a[l:r])
            return c
        return msort(0, len(a))"""),
  "ms4": dict(approach=[
     "Merging k lists pairwise from the front is O(kn); instead apply divide and conquer — merge lists in pairs so the number of lists halves each round.",
     "log k rounds, each touching all n nodes once, gives O(n log k). Each pairwise merge is the standard two-list merge."],
   time="O(n log k)", space="O(1)",
   cpp="""class Solution {
    ListNode* merge2(ListNode* a, ListNode* b) {
        ListNode dummy, *t = &dummy;
        while (a && b) { if (a->val <= b->val) { t->next = a; a = a->next; } else { t->next = b; b = b->next; } t = t->next; }
        t->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) return nullptr;
        int n = lists.size();
        while (n > 1) {
            int k = (n + 1) / 2;
            for (int i = 0; i < n / 2; i++) lists[i] = merge2(lists[i], lists[i + k]);
            n = k;
        }
        return lists[0];
    }
};""",
   python="""class Solution:
    def mergeKLists(self, lists):
        def merge2(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next
        if not lists:
            return None
        while len(lists) > 1:
            merged = []
            for i in range(0, len(lists), 2):
                a = lists[i]
                b = lists[i + 1] if i + 1 < len(lists) else None
                merged.append(merge2(a, b))
            lists = merged
        return lists[0]"""),
  "ms5": dict(approach=[
     "Merge sort is the natural O(n log n) sort for a linked list: it needs no random access and only O(1) pointer rewiring to merge.",
     "Find the middle with slow/fast pointers, cut the list in two, sort each half recursively, then merge the two sorted halves."],
   time="O(n log n)", space="O(log n)",
   cpp="""class Solution {
    ListNode* merge2(ListNode* a, ListNode* b) {
        ListNode dummy, *t = &dummy;
        while (a && b) { if (a->val <= b->val) { t->next = a; a = a->next; } else { t->next = b; b = b->next; } t = t->next; }
        t->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode *slow = head, *fast = head->next;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        ListNode* mid = slow->next; slow->next = nullptr;
        return merge2(sortList(head), sortList(mid));
    }
};""",
   python="""class Solution:
    def sortList(self, head):
        if not head or not head.next:
            return head
        slow, fast = head, head.next
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        mid, slow.next = slow.next, None
        left, right = self.sortList(head), self.sortList(mid)
        dummy = tail = ListNode()
        while left and right:
            if left.val <= right.val:
                tail.next, left = left, left.next
            else:
                tail.next, right = right, right.next
            tail = tail.next
        tail.next = left or right
        return dummy.next"""),
 },
 "quick-sort": {
  "qs1": dict(approach=[
     "Quicksort partitions around a pivot so smaller elements go left, larger go right, then recurses on each side. A random pivot avoids the O(n^2) worst case on sorted/adversarial input.",
     "Use Hoare/Lomuto partitioning in place; expected O(n log n) with O(log n) recursion depth."],
   time="O(n log n) expected", space="O(log n)",
   cpp="""class Solution {
    void qsort(vector<int>& a, int lo, int hi) {
        while (lo < hi) {
            int p = lo + rand() % (hi - lo + 1);
            swap(a[p], a[hi]);
            int pivot = a[hi], i = lo;
            for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a[i++], a[j]);
            swap(a[i], a[hi]);
            if (i - lo < hi - i) { qsort(a, lo, i - 1); lo = i + 1; }
            else { qsort(a, i + 1, hi); hi = i - 1; }
        }
    }
public:
    vector<int> sortArray(vector<int>& a) { qsort(a, 0, a.size() - 1); return a; }
};""",
   python="""import random
class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        def qsort(lo, hi):
            while lo < hi:
                p = random.randint(lo, hi)
                a[p], a[hi] = a[hi], a[p]
                pivot, i = a[hi], lo
                for j in range(lo, hi):
                    if a[j] < pivot:
                        a[i], a[j] = a[j], a[i]; i += 1
                a[i], a[hi] = a[hi], a[i]
                if i - lo < hi - i:
                    qsort(lo, i - 1); lo = i + 1
                else:
                    qsort(i + 1, hi); hi = i - 1
        qsort(0, len(a) - 1)
        return a"""),
  "qs2": dict(approach=[
     "We do not need a full sort — only the kth largest. Quickselect partitions around a random pivot and recurses into just the side containing the target rank.",
     "The kth largest is the (n-k)th smallest. Each step discards one side, giving expected O(n)."],
   time="O(n) expected", space="O(1)",
   cpp="""class Solution {
public:
    int findKthLargest(vector<int>& a, int k) {
        int target = a.size() - k, lo = 0, hi = a.size() - 1;
        while (true) {
            int p = lo + rand() % (hi - lo + 1);
            swap(a[p], a[hi]);
            int pivot = a[hi], i = lo;
            for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a[i++], a[j]);
            swap(a[i], a[hi]);
            if (i == target) return a[i];
            if (i < target) lo = i + 1; else hi = i - 1;
        }
    }
};""",
   python="""import random
class Solution:
    def findKthLargest(self, a: list[int], k: int) -> int:
        target, lo, hi = len(a) - k, 0, len(a) - 1
        while True:
            p = random.randint(lo, hi)
            a[p], a[hi] = a[hi], a[p]
            pivot, i = a[hi], lo
            for j in range(lo, hi):
                if a[j] < pivot:
                    a[i], a[j] = a[j], a[i]; i += 1
            a[i], a[hi] = a[hi], a[i]
            if i == target:
                return a[i]
            if i < target:
                lo = i + 1
            else:
                hi = i - 1"""),
  "qs3": dict(approach=[
     "This is the partition step of quicksort generalised to a fixed pivot value of 1 — the Dutch National Flag three-way partition.",
     "Three pointers split the array into <1, =1, >1 regions in a single in-place pass."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    void sortColors(vector<int>& a) {
        int low = 0, mid = 0, high = a.size() - 1;
        while (mid <= high) {
            if (a[mid] < 1) swap(a[low++], a[mid++]);
            else if (a[mid] > 1) swap(a[mid], a[high--]);
            else mid++;
        }
    }
};""",
   python="""class Solution:
    def sortColors(self, a: list[int]) -> None:
        low, mid, high = 0, 0, len(a) - 1
        while mid <= high:
            if a[mid] < 1:
                a[low], a[mid] = a[mid], a[low]; low += 1; mid += 1
            elif a[mid] > 1:
                a[mid], a[high] = a[high], a[mid]; high -= 1
            else:
                mid += 1"""),
  "qs4": dict(approach=[
     "Find the median with quickselect, then three-way partition around it. Finally interleave: smaller half into odd indices, larger half into even indices (both filled from the high end) so equal medians never touch.",
     "The index mapping (1,3,5,...,0,2,4,...) is the trick that separates duplicate medians. O(n) average with O(1) extra space via virtual indexing."],
   time="O(n) average", space="O(1)",
   cpp="""class Solution {
public:
    void wiggleSort(vector<int>& nums) {
        int n = nums.size();
        vector<int> t = nums;
        nth_element(t.begin(), t.begin() + n / 2, t.end());
        int mid = t[n / 2];
        auto A = [&](int i){ return (1 + 2 * i) % (n | 1); };
        int i = 0, j = 0, k = n - 1;
        while (j <= k) {
            if (nums[A(j)] > mid) swap(nums[A(i++)], nums[A(j++)]);
            else if (nums[A(j)] < mid) swap(nums[A(j)], nums[A(k--)]);
            else j++;
        }
    }
};""",
   python="""class Solution:
    def wiggleSort(self, nums: list[int]) -> None:
        n = len(nums)
        s = sorted(nums)
        mid = (n - 1) // 2
        small, large = s[:mid + 1][::-1], s[mid + 1:][::-1]
        nums[::2] = small
        nums[1::2] = large"""),
  "qs5": dict(approach=[
     "Count frequencies, then we only need the k most frequent — quickselect on the unique elements by frequency, or bucket by frequency for guaranteed linear time.",
     "Bucketing places each value at index = its frequency (0..n); scanning buckets from high to low collects the top k. O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> topKFrequent(vector<int>& a, int k) {
        unordered_map<int,int> freq;
        for (int x : a) freq[x]++;
        vector<vector<int>> bucket(a.size() + 1);
        for (auto& [v, c] : freq) bucket[c].push_back(v);
        vector<int> res;
        for (int c = a.size(); c >= 1 && (int)res.size() < k; c--)
            for (int v : bucket[c]) { res.push_back(v); if ((int)res.size() == k) break; }
        return res;
    }
};""",
   python="""from collections import Counter
class Solution:
    def topKFrequent(self, a: list[int], k: int) -> list[int]:
        freq = Counter(a)
        bucket = [[] for _ in range(len(a) + 1)]
        for v, c in freq.items():
            bucket[c].append(v)
        res = []
        for c in range(len(a), 0, -1):
            for v in bucket[c]:
                res.append(v)
                if len(res) == k:
                    return res
        return res"""),
 },
 "radix-sort": {
  "rs1": dict(approach=[
     "Sort in linear time with LSD radix sort (or bucketing), then a single scan finds the largest gap between consecutive elements.",
     "Radix sort processes digits from least to most significant using stable counting passes, so the total cost is O(d·n) with d the number of digits — effectively O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int maximumGap(vector<int>& a) {
        int n = a.size();
        if (n < 2) return 0;
        int mx = *max_element(a.begin(), a.end());
        vector<int> buf(n);
        for (long long exp = 1; mx / exp > 0; exp *= 10) {
            vector<int> cnt(10, 0);
            for (int x : a) cnt[(x / exp) % 10]++;
            for (int i = 1; i < 10; i++) cnt[i] += cnt[i - 1];
            for (int i = n - 1; i >= 0; i--) buf[--cnt[(a[i] / exp) % 10]] = a[i];
            a = buf;
        }
        int gap = 0;
        for (int i = 1; i < n; i++) gap = max(gap, a[i] - a[i - 1]);
        return gap;
    }
};""",
   python="""class Solution:
    def maximumGap(self, a: list[int]) -> int:
        n = len(a)
        if n < 2:
            return 0
        mx = max(a)
        exp = 1
        while mx // exp > 0:
            cnt = [0] * 10
            for x in a:
                cnt[(x // exp) % 10] += 1
            for i in range(1, 10):
                cnt[i] += cnt[i - 1]
            buf = [0] * n
            for x in reversed(a):
                d = (x // exp) % 10
                cnt[d] -= 1
                buf[cnt[d]] = x
            a = buf
            exp *= 10
        return max(a[i] - a[i - 1] for i in range(1, n))"""),
  "rs2": dict(approach=[
     "Radix sort needs non-negative keys, so offset every value by -min so the smallest becomes 0, sort, then shift back.",
     "Run stable counting-sort passes over base-10 (or larger base) digits from least to most significant."],
   time="O(d·n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> sortArray(vector<int>& a) {
        if (a.empty()) return a;
        int mn = *min_element(a.begin(), a.end());
        for (int& x : a) x -= mn;
        int mx = *max_element(a.begin(), a.end());
        int n = a.size();
        vector<int> buf(n);
        for (long long exp = 1; mx / exp > 0; exp *= 10) {
            vector<int> cnt(10, 0);
            for (int x : a) cnt[(x / exp) % 10]++;
            for (int i = 1; i < 10; i++) cnt[i] += cnt[i - 1];
            for (int i = n - 1; i >= 0; i--) buf[--cnt[(a[i] / exp) % 10]] = a[i];
            a = buf;
        }
        for (int& x : a) x += mn;
        return a;
    }
};""",
   python="""class Solution:
    def sortArray(self, a: list[int]) -> list[int]:
        if not a:
            return a
        mn = min(a)
        a = [x - mn for x in a]
        mx = max(a)
        exp = 1
        while mx // exp > 0:
            cnt = [0] * 10
            for x in a:
                cnt[(x // exp) % 10] += 1
            for i in range(1, 10):
                cnt[i] += cnt[i - 1]
            buf = [0] * len(a)
            for x in reversed(a):
                d = (x // exp) % 10
                cnt[d] -= 1
                buf[cnt[d]] = x
            a = buf
            exp *= 10
        return [x + mn for x in a]"""),
  "rs3": dict(approach=[
     "For each query (index, trim), we rank numbers by their last `trim` characters. A stable LSD radix sort over those trailing digits reproduces the required ordering while keeping original indices on ties.",
     "Process the trimmed suffix digit by digit from the rightmost; stability preserves earlier order so equal trimmed values stay in original index order."],
   time="O(q·n·L)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> smallestTrimmedNumbers(vector<string>& nums, vector<vector<int>>& queries) {
        int n = nums.size(), L = nums[0].size();
        vector<int> res;
        for (auto& q : queries) {
            int k = q[0], trim = q[1];
            vector<int> idx(n);
            for (int i = 0; i < n; i++) idx[i] = i;
            for (int pos = L - 1; pos >= L - trim; pos--) {
                vector<int> cnt(10, 0), out(n);
                for (int i : idx) cnt[nums[i][pos] - '0']++;
                for (int d = 1; d < 10; d++) cnt[d] += cnt[d - 1];
                for (int i = n - 1; i >= 0; i--) { int d = nums[idx[i]][pos] - '0'; out[--cnt[d]] = idx[i]; }
                idx = out;
            }
            res.push_back(idx[k - 1]);
        }
        return res;
    }
};""",
   python="""class Solution:
    def smallestTrimmedNumbers(self, nums, queries):
        n, L = len(nums), len(nums[0])
        res = []
        for k, trim in queries:
            idx = list(range(n))
            for pos in range(L - 1, L - trim - 1, -1):
                cnt = [0] * 10
                for i in idx:
                    cnt[ord(nums[i][pos]) - 48] += 1
                for d in range(1, 10):
                    cnt[d] += cnt[d - 1]
                out = [0] * n
                for i in reversed(idx):
                    d = ord(nums[i][pos]) - 48
                    cnt[d] -= 1
                    out[cnt[d]] = i
                idx = out
            res.append(idx[k - 1])
        return res"""),
  "rs4": dict(approach=[
     "Sort by a composite key (popcount, value). This is a stable multi-key sort — exactly what radix/bucket sorting expresses naturally.",
     "Simplest correct form: key each number by bit-count*100000 + value (values <= 10^4), then sort. Equal popcounts fall back to numeric order."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> sortByBits(vector<int>& a) {
        sort(a.begin(), a.end(), [](int x, int y){
            int bx = __builtin_popcount(x), by = __builtin_popcount(y);
            return bx != by ? bx < by : x < y;
        });
        return a;
    }
};""",
   python="""class Solution:
    def sortByBits(self, a: list[int]) -> list[int]:
        return sorted(a, key=lambda x: (bin(x).count('1'), x))"""),
  "rs5": dict(approach=[
     "Arrange numbers so their concatenation is largest. Sort with a custom comparator: a before b iff a+b > b+a (string concatenation).",
     "After sorting descending by that rule, join. Guard the all-zeros case so the result is \"0\" not \"00…0\"."],
   time="O(n log n · L)", space="O(n)",
   cpp="""class Solution {
public:
    string largestNumber(vector<int>& nums) {
        vector<string> s;
        for (int x : nums) s.push_back(to_string(x));
        sort(s.begin(), s.end(), [](const string& a, const string& b){ return a + b > b + a; });
        if (s[0] == "0") return "0";
        string res;
        for (auto& x : s) res += x;
        return res;
    }
};""",
   python="""from functools import cmp_to_key
class Solution:
    def largestNumber(self, nums: list[int]) -> str:
        s = list(map(str, nums))
        s.sort(key=cmp_to_key(lambda a, b: (a + b < b + a) - (a + b > b + a)))
        res = ''.join(s)
        return '0' if res[0] == '0' else res"""),
 },
}
