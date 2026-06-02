# -*- coding: utf-8 -*-
SOLS = {
 "kmp": {
  "kmp1": dict(approach=[
     "KMP avoids re-checking matched characters. Precompute the failure (longest-proper-prefix-that-is-also-suffix) array of the pattern.",
     "Scan the text once; on a mismatch, fall back via the failure array instead of restarting. O(n+m)."],
   time="O(n + m)", space="O(m)",
   cpp="""class Solution {
public:
    int strStr(string h, string n) {
        if (n.empty()) return 0;
        int m = n.size();
        vector<int> lps(m, 0);
        for (int i = 1, len = 0; i < m; ) {
            if (n[i] == n[len]) lps[i++] = ++len;
            else if (len) len = lps[len - 1];
            else lps[i++] = 0;
        }
        for (int i = 0, j = 0; i < (int)h.size(); ) {
            if (h[i] == n[j]) { i++; j++; if (j == m) return i - m; }
            else if (j) j = lps[j - 1];
            else i++;
        }
        return -1;
    }
};""",
   python="""class Solution:
    def strStr(self, h: str, n: str) -> int:
        if not n:
            return 0
        m = len(n)
        lps = [0] * m
        length = 0
        i = 1
        while i < m:
            if n[i] == n[length]:
                length += 1; lps[i] = length; i += 1
            elif length:
                length = lps[length - 1]
            else:
                lps[i] = 0; i += 1
        i = j = 0
        while i < len(h):
            if h[i] == n[j]:
                i += 1; j += 1
                if j == m:
                    return i - m
            elif j:
                j = lps[j - 1]
            else:
                i += 1
        return -1"""),
  "kmp2": dict(approach=[
     "If b is a substring of a repeated k times, k is at least ceil(len(b)/len(a)); one extra copy covers an offset overflow.",
     "Repeat a until its length >= len(b), test with KMP/find, then try one more repeat. If still absent, return -1."],
   time="O(n + m)", space="O(n + m)",
   cpp="""class Solution {
public:
    int repeatedStringMatch(string a, string b) {
        string s = a;
        int count = 1;
        while ((int)s.size() < (int)b.size()) { s += a; count++; }
        if (s.find(b) != string::npos) return count;
        s += a;
        if (s.find(b) != string::npos) return count + 1;
        return -1;
    }
};""",
   python="""class Solution:
    def repeatedStringMatch(self, a: str, b: str) -> int:
        s = a
        count = 1
        while len(s) < len(b):
            s += a; count += 1
        if b in s:
            return count
        if b in s + a:
            return count + 1
        return -1"""),
  "kmp3": dict(approach=[
     "We prepend the fewest characters to make s a palindrome — equivalent to finding the longest palindromic prefix of s.",
     "Build the string s + '#' + reverse(s) and compute its KMP failure value; that value is the longest prefix of s that is also a suffix of reverse(s) — i.e. the longest palindromic prefix. Prepend the rest reversed."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    string shortestPalindrome(string s) {
        string rev(s.rbegin(), s.rend());
        string t = s + "#" + rev;
        int m = t.size();
        vector<int> lps(m, 0);
        for (int i = 1, len = 0; i < m; ) {
            if (t[i] == t[len]) lps[i++] = ++len;
            else if (len) len = lps[len - 1];
            else lps[i++] = 0;
        }
        int pal = lps[m - 1];
        return rev.substr(0, s.size() - pal) + s;
    }
};""",
   python="""class Solution:
    def shortestPalindrome(self, s: str) -> str:
        rev = s[::-1]
        t = s + "#" + rev
        m = len(t)
        lps = [0] * m
        length = 0
        for i in range(1, m):
            while length and t[i] != t[length]:
                length = lps[length - 1]
            if t[i] == t[length]:
                length += 1
            lps[i] = length
        pal = lps[-1]
        return rev[:len(s) - pal] + s"""),
  "kmp4": dict(approach=[
     "The longest happy prefix is the longest proper prefix that is also a suffix — exactly lps[n-1] from KMP.",
     "Compute the failure array of the whole string; the answer is the prefix of that length."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    string longestPrefix(string s) {
        int n = s.size();
        vector<int> lps(n, 0);
        for (int i = 1, len = 0; i < n; ) {
            if (s[i] == s[len]) lps[i++] = ++len;
            else if (len) len = lps[len - 1];
            else lps[i++] = 0;
        }
        return s.substr(0, lps[n - 1]);
    }
};""",
   python="""class Solution:
    def longestPrefix(self, s: str) -> str:
        n = len(s)
        lps = [0] * n
        length = 0
        for i in range(1, n):
            while length and s[i] != s[length]:
                length = lps[length - 1]
            if s[i] == s[length]:
                length += 1
            lps[i] = length
        return s[:lps[-1]]"""),
  "kmp5": dict(approach=[
     "An anagram is a fixed-length window whose character counts match p's. Slide a window of length |p| over s maintaining a frequency array.",
     "Track how many of the 26 counts match; record a start index whenever all match. (KMP doesn't apply here — anagram matching is a counting window, included to contrast pattern-matching tools.)"],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        if (p.size() > s.size()) return {};
        vector<int> need(26, 0), win(26, 0); vector<int> res;
        for (char c : p) need[c - 'a']++;
        int k = p.size();
        for (int i = 0; i < (int)s.size(); i++) {
            win[s[i] - 'a']++;
            if (i >= k) win[s[i - k] - 'a']--;
            if (i >= k - 1 && win == need) res.push_back(i - k + 1);
        }
        return res;
    }
};""",
   python="""class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        if len(p) > len(s):
            return []
        need = [0] * 26
        win = [0] * 26
        for c in p:
            need[ord(c) - 97] += 1
        k = len(p)
        res = []
        for i, c in enumerate(s):
            win[ord(c) - 97] += 1
            if i >= k:
                win[ord(s[i - k]) - 97] -= 1
            if i >= k - 1 and win == need:
                res.append(i - k + 1)
        return res"""),
 },
 "rabin-karp": {
  "rk1": dict(approach=[
     "Hash the pattern, then roll a hash over each window of the text: dropping the leading character and adding the trailing one in O(1).",
     "When hashes match, verify the substring to guard against collisions. Use a large prime modulus."],
   time="O(n + m) average", space="O(1)",
   cpp="""class Solution {
public:
    int strStr(string h, string n) {
        if (n.empty()) return 0;
        int m = n.size(), N = h.size();
        if (m > N) return -1;
        const long long MOD = 1e9 + 7, B = 131;
        long long pw = 1, hp = 0, hw = 0;
        for (int i = 0; i < m; i++) { pw = i ? pw * B % MOD : 1; hp = (hp * B + n[i]) % MOD; hw = (hw * B + h[i]) % MOD; }
        for (int i = 0; i + m <= N; i++) {
            if (hw == hp && h.compare(i, m, n) == 0) return i;
            if (i + m < N) hw = ((hw - h[i] * pw % MOD + MOD) % MOD * B + h[i + m]) % MOD;
        }
        return -1;
    }
};""",
   python="""class Solution:
    def strStr(self, h: str, n: str) -> int:
        if not n:
            return 0
        m, N = len(n), len(h)
        if m > N:
            return -1
        MOD, B = 10**9 + 7, 131
        pw = pow(B, m - 1, MOD)
        hp = hw = 0
        for i in range(m):
            hp = (hp * B + ord(n[i])) % MOD
            hw = (hw * B + ord(h[i])) % MOD
        for i in range(N - m + 1):
            if hw == hp and h[i:i+m] == n:
                return i
            if i + m < N:
                hw = ((hw - ord(h[i]) * pw) * B + ord(h[i + m])) % MOD
        return -1"""),
  "rk2": dict(approach=[
     "Binary search the answer length L (duplicate-existence is monotonic). For a given L, hash every length-L window and look for a repeat.",
     "Store seen hashes in a set; on a hash hit, verify to avoid collisions. Each check is O(n), so total O(n log n)."],
   time="O(n log n) average", space="O(n)",
   cpp="""class Solution {
    string s; long long MOD = (1LL << 61) - 1, B = 131;
    int check(int L) {
        if (L == 0) return 0;
        unordered_map<long long, vector<int>> seen;
        long long pw = 1, h = 0;
        for (int i = 0; i < L; i++) { h = (__int128)h * B % MOD; h = (h + s[i]) % MOD; if (i) pw = (__int128)pw * B % MOD; }
        seen[h].push_back(0);
        for (int i = 1; i + L <= (int)s.size(); i++) {
            h = (h + MOD - (__int128)s[i-1] * pw % MOD) % MOD;
            h = ((__int128)h * B + s[i + L - 1]) % MOD;
            for (int st : seen[h]) if (s.compare(st, L, s, i, L) == 0) return i;
            seen[h].push_back(i);
        }
        return -1;
    }
public:
    string longestDupSubstring(string S) {
        s = S; int lo = 1, hi = s.size() - 1, start = -1, len = 0;
        while (lo <= hi) {
            int mid = (lo + hi) / 2, p = check(mid);
            if (p != -1) { start = p; len = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return start == -1 ? "" : s.substr(start, len);
    }
};""",
   python="""class Solution:
    def longestDupSubstring(self, s: str) -> str:
        MOD, B = (1 << 61) - 1, 131
        n = len(s)
        nums = [ord(c) for c in s]
        def check(L):
            if L == 0:
                return 0
            h = 0
            for i in range(L):
                h = (h * B + nums[i]) % MOD
            pw = pow(B, L, MOD)
            seen = {h: [0]}
            for i in range(1, n - L + 1):
                h = (h * B - nums[i - 1] * pw + nums[i + L - 1]) % MOD
                if h in seen:
                    for st in seen[h]:
                        if s[st:st+L] == s[i:i+L]:
                            return i
                    seen[h].append(i)
                else:
                    seen[h] = [i]
            return -1
        lo, hi, start, length = 1, n - 1, -1, 0
        while lo <= hi:
            mid = (lo + hi) // 2
            p = check(mid)
            if p != -1:
                start, length = p, mid; lo = mid + 1
            else:
                hi = mid - 1
        return s[start:start + length] if start != -1 else """""),
  "rk3": dict(approach=[
     "All substrings have fixed length 10, so simply hash each window and record which appear more than once.",
     "A rolling hash (or even a sliding set of the raw 10-char strings) finds the repeats in one pass."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<string> findRepeatedDnaSequences(string s) {
        unordered_map<string,int> cnt; vector<string> res;
        for (int i = 0; i + 10 <= (int)s.size(); i++) {
            string w = s.substr(i, 10);
            if (++cnt[w] == 2) res.push_back(w);
        }
        return res;
    }
};""",
   python="""class Solution:
    def findRepeatedDnaSequences(self, s: str) -> list[str]:
        seen, res = set(), set()
        for i in range(len(s) - 9):
            w = s[i:i+10]
            if w in seen:
                res.add(w)
            seen.add(w)
        return list(res)"""),
  "rk4": dict(approach=[
     "An echo substring is t+t. For every possible half-length L, slide and compare the two halves using prefix hashes in O(1).",
     "Collect distinct echo substrings by their hash (verify on hit). Iterate L from 1; total O(n^2) with hashing."],
   time="O(n^2) average", space="O(n^2)",
   cpp="""class Solution {
public:
    int distinctEchoSubstrings(string text) {
        int n = text.size();
        const long long MOD = (1LL << 61) - 1, B = 131;
        vector<long long> h(n + 1, 0), pw(n + 1, 1);
        for (int i = 0; i < n; i++) { h[i+1] = ((__int128)h[i] * B + text[i]) % MOD; pw[i+1] = (__int128)pw[i] * B % MOD; }
        auto sub = [&](int l, int r){ return (h[r] - (__int128)h[l] * pw[r - l] % MOD + MOD) % MOD; };
        unordered_set<long long> seen;
        for (int len = 1; 2 * len <= n; len++)
            for (int i = 0; i + 2 * len <= n; i++)
                if (sub(i, i + len) == sub(i + len, i + 2 * len)) seen.insert(sub(i, i + 2 * len));
        return seen.size();
    }
};""",
   python="""class Solution:
    def distinctEchoSubstrings(self, text: str) -> int:
        n = len(text)
        MOD, B = (1 << 61) - 1, 131
        h = [0] * (n + 1)
        pw = [1] * (n + 1)
        for i in range(n):
            h[i+1] = (h[i] * B + ord(text[i])) % MOD
            pw[i+1] = pw[i] * B % MOD
        def sub(l, r):
            return (h[r] - h[l] * pw[r - l]) % MOD
        seen = set()
        for length in range(1, n // 2 + 1):
            for i in range(n - 2 * length + 1):
                if sub(i, i + length) == sub(i + length, i + 2 * length):
                    seen.add(sub(i, i + 2 * length))
        return len(seen)"""),
  "rk5": dict(approach=[
     "Binary search the common-subpath length L (monotonic). For each L, hash all length-L windows of every path and intersect the hash sets.",
     "If the intersection across all paths is non-empty, length L is feasible. Use a strong 64-bit modulus to keep collisions negligible."],
   time="O(N log N) average", space="O(N)",
   cpp="""class Solution {
    vector<vector<int>>* paths; long long MOD = (1LL << 61) - 1, B = 1000003;
    bool feasible(int L) {
        if (L == 0) return true;
        long long pw = 1; for (int i = 0; i < L; i++) pw = (__int128)pw * B % MOD;
        unordered_set<long long> common;
        bool first = true;
        for (auto& p : *paths) {
            if ((int)p.size() < L) return false;
            unordered_set<long long> cur; long long h = 0;
            for (int i = 0; i < L; i++) h = ((__int128)h * B + p[i] + 1) % MOD;
            cur.insert(h);
            for (int i = L; i < (int)p.size(); i++) {
                h = (h + MOD - (__int128)(p[i-L]+1) * pw % MOD) % MOD;
                h = ((__int128)h * B + p[i] + 1) % MOD;
                cur.insert(h);
            }
            if (first) { common = cur; first = false; }
            else { unordered_set<long long> nx; for (long long x : cur) if (common.count(x)) nx.insert(x); common = nx; }
            if (common.empty()) return false;
        }
        return !common.empty();
    }
public:
    int longestCommonSubpath(int n, vector<vector<int>>& p) {
        paths = &p; int lo = 0, hi = INT_MAX;
        for (auto& x : p) hi = min(hi, (int)x.size());
        int ans = 0;
        while (lo <= hi) { int mid = (lo + hi) / 2; if (feasible(mid)) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
        return ans;
    }
};""",
   python="""class Solution:
    def longestCommonSubpath(self, n: int, paths: list[list[int]]) -> int:
        MOD, B = (1 << 61) - 1, 1000003
        def feasible(L):
            if L == 0:
                return True
            pw = pow(B, L, MOD)
            common = None
            for p in paths:
                if len(p) < L:
                    return False
                h = 0
                for i in range(L):
                    h = (h * B + p[i] + 1) % MOD
                cur = {h}
                for i in range(L, len(p)):
                    h = (h * B - (p[i - L] + 1) * pw + p[i] + 1) % MOD
                    cur.add(h)
                common = cur if common is None else (common & cur)
                if not common:
                    return False
            return bool(common)
        lo, hi = 0, min(len(p) for p in paths)
        ans = 0
        while lo <= hi:
            mid = (lo + hi) // 2
            if feasible(mid):
                ans = mid; lo = mid + 1
            else:
                hi = mid - 1
        return ans"""),
 },
 "suffix-array": {
  "sa1": dict(approach=[
     "Build the suffix array (suffixes sorted) and the LCP array (longest common prefix of adjacent suffixes).",
     "Two equal substrings appear as a shared prefix of adjacent sorted suffixes, so the longest repeated substring length is max(LCP)."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> buildSA(const string& s) {
        int n = s.size(); vector<int> sa(n), rk(n), tmp(n);
        for (int i = 0; i < n; i++) { sa[i] = i; rk[i] = s[i]; }
        for (int k = 1; k < n; k <<= 1) {
            auto cmp = [&](int a, int b){
                if (rk[a] != rk[b]) return rk[a] < rk[b];
                int ra = a + k < n ? rk[a+k] : -1, rb = b + k < n ? rk[b+k] : -1;
                return ra < rb;
            };
            sort(sa.begin(), sa.end(), cmp);
            tmp[sa[0]] = 0;
            for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1], sa[i]) ? 1 : 0);
            rk = tmp;
            if (rk[sa[n-1]] == n - 1) break;
        }
        return sa;
    }
    vector<int> kasai(const string& s, vector<int>& sa) {
        int n = s.size(); vector<int> rk(n), lcp(n, 0);
        for (int i = 0; i < n; i++) rk[sa[i]] = i;
        int h = 0;
        for (int i = 0; i < n; i++)
            if (rk[i] > 0) {
                int j = sa[rk[i]-1];
                while (i + h < n && j + h < n && s[i+h] == s[j+h]) h++;
                lcp[rk[i]] = h; if (h) h--;
            } else h = 0;
        return lcp;
    }
public:
    string longestRepeatedSubstring(string s) {
        if (s.empty()) return "";
        auto sa = buildSA(s); auto lcp = kasai(s, sa);
        int best = 0, pos = 0;
        for (int i = 0; i < (int)s.size(); i++) if (lcp[i] > best) { best = lcp[i]; pos = sa[i]; }
        return s.substr(pos, best);
    }
};""",
   python="""class Solution:
    def longestRepeatedSubstring(self, s: str) -> str:
        n = len(s)
        if n == 0:
            return ""
        sa = sorted(range(n), key=lambda i: s[i:])
        rank = [0] * n
        for i, x in enumerate(sa):
            rank[x] = i
        lcp = [0] * n
        h = 0
        for i in range(n):
            if rank[i] > 0:
                j = sa[rank[i] - 1]
                while i + h < n and j + h < n and s[i + h] == s[j + h]:
                    h += 1
                lcp[rank[i]] = h
                if h:
                    h -= 1
            else:
                h = 0
        best = max(range(n), key=lambda i: lcp[i])
        return s[sa[best]:sa[best] + lcp[best]]"""),
  "sa2": dict(approach=[
     "Every substring is a prefix of some suffix. The total number of prefixes is n(n+1)/2, but adjacent sorted suffixes share LCP-many prefixes that are duplicates.",
     "Distinct substrings = n(n+1)/2 - sum(LCP)."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> buildSA(const string& s) {
        int n = s.size(); vector<int> sa(n), rk(n), tmp(n);
        for (int i = 0; i < n; i++) { sa[i] = i; rk[i] = s[i]; }
        for (int k = 1; k < n; k <<= 1) {
            auto cmp = [&](int a, int b){ if (rk[a] != rk[b]) return rk[a] < rk[b]; int ra = a+k<n?rk[a+k]:-1, rb = b+k<n?rk[b+k]:-1; return ra < rb; };
            sort(sa.begin(), sa.end(), cmp);
            tmp[sa[0]] = 0;
            for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1], sa[i]) ? 1 : 0);
            rk = tmp; if (rk[sa[n-1]] == n - 1) break;
        }
        return sa;
    }
    vector<int> kasai(const string& s, vector<int>& sa) {
        int n = s.size(); vector<int> rk(n), lcp(n, 0);
        for (int i = 0; i < n; i++) rk[sa[i]] = i; int h = 0;
        for (int i = 0; i < n; i++) if (rk[i] > 0) { int j = sa[rk[i]-1]; while (i+h<n && j+h<n && s[i+h]==s[j+h]) h++; lcp[rk[i]] = h; if (h) h--; } else h = 0;
        return lcp;
    }
public:
    long long countDistinctSubstrings(string s) {
        int n = s.size();
        long long total = (long long)n * (n + 1) / 2;
        auto sa = buildSA(s); auto lcp = kasai(s, sa);
        for (int x : lcp) total -= x;
        return total;
    }
};""",
   python="""class Solution:
    def countDistinctSubstrings(self, s: str) -> int:
        n = len(s)
        if n == 0:
            return 0
        sa = sorted(range(n), key=lambda i: s[i:])
        rank = [0] * n
        for i, x in enumerate(sa):
            rank[x] = i
        total = n * (n + 1) // 2
        h = 0
        for i in range(n):
            if rank[i] > 0:
                j = sa[rank[i] - 1]
                while i + h < n and j + h < n and s[i + h] == s[j + h]:
                    h += 1
                total -= h
                if h:
                    h -= 1
            else:
                h = 0
        return total"""),
  "sa3": dict(approach=[
     "The longest duplicated substring is the maximum LCP between adjacent sorted suffixes — identical to the longest repeated substring.",
     "Build the suffix array and LCP; return the substring achieving max LCP."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> buildSA(const string& s) {
        int n = s.size(); vector<int> sa(n), rk(n), tmp(n);
        for (int i = 0; i < n; i++) { sa[i] = i; rk[i] = s[i]; }
        for (int k = 1; k < n; k <<= 1) {
            auto cmp = [&](int a, int b){ if (rk[a]!=rk[b]) return rk[a]<rk[b]; int ra=a+k<n?rk[a+k]:-1, rb=b+k<n?rk[b+k]:-1; return ra<rb; };
            sort(sa.begin(), sa.end(), cmp);
            tmp[sa[0]] = 0;
            for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1], sa[i]) ? 1 : 0);
            rk = tmp; if (rk[sa[n-1]] == n - 1) break;
        }
        return sa;
    }
    vector<int> kasai(const string& s, vector<int>& sa) {
        int n = s.size(); vector<int> rk(n), lcp(n, 0);
        for (int i = 0; i < n; i++) rk[sa[i]] = i; int h = 0;
        for (int i = 0; i < n; i++) if (rk[i] > 0) { int j = sa[rk[i]-1]; while (i+h<n && j+h<n && s[i+h]==s[j+h]) h++; lcp[rk[i]] = h; if (h) h--; } else h = 0;
        return lcp;
    }
public:
    string longestDupSubstring(string s) {
        int n = s.size(); if (n < 2) return "";
        auto sa = buildSA(s); auto lcp = kasai(s, sa);
        int best = 0, pos = 0;
        for (int i = 0; i < n; i++) if (lcp[i] > best) { best = lcp[i]; pos = sa[i]; }
        return s.substr(pos, best);
    }
};""",
   python="""class Solution:
    def longestDupSubstring(self, s: str) -> str:
        n = len(s)
        if n < 2:
            return ""
        sa = sorted(range(n), key=lambda i: s[i:])
        rank = [0] * n
        for i, x in enumerate(sa):
            rank[x] = i
        best = best_pos = 0
        h = 0
        for i in range(n):
            if rank[i] > 0:
                j = sa[rank[i] - 1]
                while i + h < n and j + h < n and s[i + h] == s[j + h]:
                    h += 1
                if h > best:
                    best, best_pos = h, i
                if h:
                    h -= 1
            else:
                h = 0
        return s[sa[best_pos]:sa[best_pos] + best]"""),
  "sa4": dict(approach=[
     "Sorted suffixes let us binary-search a pattern: all suffixes starting with the pattern form a contiguous block.",
     "Find the lower and upper bounds by comparing the pattern with suffix prefixes; the matching suffix start indices are the occurrence positions."],
   time="O((n + m) log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> buildSA(const string& s) {
        int n = s.size(); vector<int> sa(n), rk(n), tmp(n);
        for (int i = 0; i < n; i++) { sa[i] = i; rk[i] = s[i]; }
        for (int k = 1; k < n; k <<= 1) {
            auto cmp = [&](int a, int b){ if (rk[a]!=rk[b]) return rk[a]<rk[b]; int ra=a+k<n?rk[a+k]:-1, rb=b+k<n?rk[b+k]:-1; return ra<rb; };
            sort(sa.begin(), sa.end(), cmp);
            tmp[sa[0]] = 0;
            for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1], sa[i]) ? 1 : 0);
            rk = tmp; if (rk[sa[n-1]] == n - 1) break;
        }
        return sa;
    }
public:
    vector<int> search(string text, string pat) {
        int n = text.size(); auto sa = buildSA(text);
        auto cmp = [&](int idx){ return text.compare(idx, pat.size(), pat); };
        int lo = 0, hi = n;
        while (lo < hi) { int mid = (lo + hi) / 2; if (cmp(sa[mid]) < 0) lo = mid + 1; else hi = mid; }
        int start = lo; hi = n;
        while (lo < hi) { int mid = (lo + hi) / 2; if (cmp(sa[mid]) <= 0) lo = mid + 1; else hi = mid; }
        vector<int> res;
        for (int i = start; i < lo; i++) res.push_back(sa[i]);
        sort(res.begin(), res.end());
        return res;
    }
};""",
   python="""import bisect
class Solution:
    def search(self, text: str, pat: str) -> list[int]:
        n = len(text)
        sa = sorted(range(n), key=lambda i: text[i:])
        suffixes = [text[i:i+len(pat)] for i in sa]
        lo = bisect.bisect_left(suffixes, pat)
        hi = bisect.bisect_right(suffixes, pat)
        return sorted(sa[lo:hi])"""),
  "sa5": dict(approach=[
     "The lexicographically smallest rotation is found by Booth's algorithm on the doubled string in linear time.",
     "It scans s+s maintaining the candidate start of the least rotation, advancing past mismatches like a failure-function comparison."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    string leastRotation(string s) {
        int n = s.size();
        string t = s + s;
        vector<int> f(2 * n, -1);
        int k = 0;
        for (int j = 1; j < 2 * n; j++) {
            char sj = t[j]; int i = f[j - k - 1];
            while (i != -1 && sj != t[k + i + 1]) {
                if (sj < t[k + i + 1]) k = j - i - 1;
                i = f[i];
            }
            if (sj != t[k + i + 1]) {
                if (sj < t[k]) k = j;
                f[j - k] = -1;
            } else f[j - k] = i + 1;
        }
        return t.substr(k, n);
    }
};""",
   python="""class Solution:
    def leastRotation(self, s: str) -> str:
        n = len(s)
        t = s + s
        f = [-1] * (2 * n)
        k = 0
        for j in range(1, 2 * n):
            sj = t[j]
            i = f[j - k - 1]
            while i != -1 and sj != t[k + i + 1]:
                if sj < t[k + i + 1]:
                    k = j - i - 1
                i = f[i]
            if sj != t[k + i + 1]:
                if sj < t[k]:
                    k = j
                f[j - k] = -1
            else:
                f[j - k] = i + 1
        return t[k:k + n]"""),
 },
 "trie": {
  "tr1": dict(approach=[
     "A trie node has up to 26 children and an end-of-word flag. insert/search/startsWith all walk the tree letter by letter.",
     "Each operation is O(word length)."],
   time="O(L) per op", space="O(total letters)",
   cpp="""class Trie {
    struct Node { Node* ch[26] = {}; bool end = false; };
    Node* root;
    Node* walk(const string& w) { Node* cur = root; for (char c : w) { if (!cur->ch[c-'a']) return nullptr; cur = cur->ch[c-'a']; } return cur; }
public:
    Trie() { root = new Node(); }
    void insert(string w) { Node* cur = root; for (char c : w) { if (!cur->ch[c-'a']) cur->ch[c-'a'] = new Node(); cur = cur->ch[c-'a']; } cur->end = true; }
    bool search(string w) { Node* n = walk(w); return n && n->end; }
    bool startsWith(string p) { return walk(p) != nullptr; }
};""",
   python="""class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, w: str) -> None:
        node = self.root
        for c in w:
            node = node.setdefault(c, {})
        node['$'] = True
    def _walk(self, w):
        node = self.root
        for c in w:
            if c not in node:
                return None
            node = node[c]
        return node
    def search(self, w: str) -> bool:
        node = self._walk(w)
        return node is not None and '$' in node
    def startsWith(self, p: str) -> bool:
        return self._walk(p) is not None"""),
  "tr2": dict(approach=[
     "Insert all words into a trie, then DFS the grid once, descending the trie in lockstep with the path.",
     "When a trie node marks a complete word, record it (and clear it to avoid duplicates). The trie prunes impossible directions early."],
   time="O(R·C·4^L)", space="O(total letters)",
   cpp="""class Solution {
    struct Node { Node* ch[26] = {}; string word; };
    int R, C; vector<string> res;
    void dfs(vector<vector<char>>& b, int r, int c, Node* node) {
        if (r < 0 || c < 0 || r >= R || c >= C || b[r][c] == '#') return;
        char ch = b[r][c]; Node* nxt = node->ch[ch-'a'];
        if (!nxt) return;
        if (!nxt->word.empty()) { res.push_back(nxt->word); nxt->word.clear(); }
        b[r][c] = '#';
        dfs(b, r+1, c, nxt); dfs(b, r-1, c, nxt); dfs(b, r, c+1, nxt); dfs(b, r, c-1, nxt);
        b[r][c] = ch;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (auto& w : words) { Node* cur = root; for (char c : w) { if (!cur->ch[c-'a']) cur->ch[c-'a'] = new Node(); cur = cur->ch[c-'a']; } cur->word = w; }
        R = board.size(); C = board[0].size();
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) dfs(board, r, c, root);
        return res;
    }
};""",
   python="""class Solution:
    def findWords(self, board, words):
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
  "tr3": dict(approach=[
     "Insert words into a trie. For search, '.' matches any child, so the search branches at dots — handle it with recursion (or DFS).",
     "At a '.', recurse into every existing child; otherwise follow the single matching edge."],
   time="O(L) average, O(26^dots) worst", space="O(total letters)",
   cpp="""class WordDictionary {
    struct Node { Node* ch[26] = {}; bool end = false; };
    Node* root;
    bool dfs(Node* node, const string& w, int i) {
        if (!node) return false;
        if (i == (int)w.size()) return node->end;
        if (w[i] == '.') {
            for (int c = 0; c < 26; c++) if (dfs(node->ch[c], w, i + 1)) return true;
            return false;
        }
        return dfs(node->ch[w[i]-'a'], w, i + 1);
    }
public:
    WordDictionary() { root = new Node(); }
    void addWord(string w) { Node* cur = root; for (char c : w) { if (!cur->ch[c-'a']) cur->ch[c-'a'] = new Node(); cur = cur->ch[c-'a']; } cur->end = true; }
    bool search(string w) { return dfs(root, w, 0); }
};""",
   python="""class WordDictionary:
    def __init__(self):
        self.root = {}
    def addWord(self, w: str) -> None:
        node = self.root
        for c in w:
            node = node.setdefault(c, {})
        node['$'] = True
    def search(self, w: str) -> bool:
        def dfs(node, i):
            if i == len(w):
                return '$' in node
            c = w[i]
            if c == '.':
                return any(dfs(child, i + 1) for k, child in node.items() if k != '$')
            return c in node and dfs(node[c], i + 1)
        return dfs(self.root, 0)"""),
  "tr4": dict(approach=[
     "Insert each number's 32-bit binary into a binary trie (bit 0/1 children). To maximise XOR with a number, greedily pick the opposite bit at each level.",
     "For every number, traverse the trie choosing the complementary bit when possible; track the best XOR."],
   time="O(32 n)", space="O(32 n)",
   cpp="""class Solution {
    struct Node { Node* ch[2] = {}; };
public:
    int findMaximumXOR(vector<int>& nums) {
        Node* root = new Node();
        for (int x : nums) {
            Node* cur = root;
            for (int b = 31; b >= 0; b--) { int bit = (x >> b) & 1; if (!cur->ch[bit]) cur->ch[bit] = new Node(); cur = cur->ch[bit]; }
        }
        int best = 0;
        for (int x : nums) {
            Node* cur = root; int curXor = 0;
            for (int b = 31; b >= 0; b--) {
                int bit = (x >> b) & 1;
                if (cur->ch[1 - bit]) { curXor |= (1 << b); cur = cur->ch[1 - bit]; }
                else cur = cur->ch[bit];
            }
            best = max(best, curXor);
        }
        return best;
    }
};""",
   python="""class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        root = {}
        for x in nums:
            node = root
            for b in range(31, -1, -1):
                bit = (x >> b) & 1
                node = node.setdefault(bit, {})
        best = 0
        for x in nums:
            node = root
            cur = 0
            for b in range(31, -1, -1):
                bit = (x >> b) & 1
                want = 1 - bit
                if want in node:
                    cur |= (1 << b); node = node[want]
                else:
                    node = node[bit]
            best = max(best, cur)
        return best"""),
  "tr5": dict(approach=[
     "Insert all roots into a trie. For each word, walk the trie until the first end-of-root and replace the word with that shortest root.",
     "If no root matches, keep the original word."],
   time="O(total letters)", space="O(total letters)",
   cpp="""class Solution {
    struct Node { Node* ch[26] = {}; bool end = false; };
public:
    string replaceWords(vector<string>& dict, string sentence) {
        Node* root = new Node();
        for (auto& w : dict) { Node* cur = root; for (char c : w) { if (!cur->ch[c-'a']) cur->ch[c-'a'] = new Node(); cur = cur->ch[c-'a']; } cur->end = true; }
        stringstream ss(sentence); string word, res;
        while (ss >> word) {
            Node* cur = root; string pre;
            for (char c : word) {
                if (!cur->ch[c-'a'] || cur->end) break;
                pre += c; cur = cur->ch[c-'a'];
            }
            if (!res.empty()) res += " ";
            res += (cur->end ? pre : word);
        }
        return res;
    }
};""",
   python="""class Solution:
    def replaceWords(self, dictionary: list[str], sentence: str) -> str:
        trie = {}
        for w in dictionary:
            node = trie
            for c in w:
                node = node.setdefault(c, {})
            node['$'] = True
        def shorten(word):
            node = trie
            pre = []
            for c in word:
                if c not in node or '$' in node:
                    break
                pre.append(c)
                node = node[c]
            return "".join(pre) if '$' in node else word
        return " ".join(shorten(w) for w in sentence.split())"""),
 },
 "z-algorithm": {
  "z1": dict(approach=[
     "Form pattern + '#' + text and compute the Z-array (z[i] = longest prefix match starting at i).",
     "Any position in the text part where z[i] equals the pattern length marks a full occurrence."],
   time="O(n + m)", space="O(n + m)",
   cpp="""class Solution {
    vector<int> zfunc(const string& s) {
        int n = s.size(); vector<int> z(n, 0); z[0] = n;
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i < r) z[i] = min(r - i, z[i - l]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > r) { l = i; r = i + z[i]; }
        }
        return z;
    }
public:
    int strStr(string h, string n) {
        if (n.empty()) return 0;
        string s = n + "#" + h;
        auto z = zfunc(s); int m = n.size();
        for (int i = m + 1; i < (int)s.size(); i++)
            if (z[i] >= m) return i - m - 1;
        return -1;
    }
};""",
   python="""class Solution:
    def strStr(self, h: str, n: str) -> int:
        if not n:
            return 0
        s = n + "#" + h
        z = [0] * len(s)
        z[0] = len(s)
        l = r = 0
        for i in range(1, len(s)):
            if i < r:
                z[i] = min(r - i, z[i - l])
            while i + z[i] < len(s) and s[z[i]] == s[i + z[i]]:
                z[i] += 1
            if i + z[i] > r:
                l, r = i, i + z[i]
        m = len(n)
        for i in range(m + 1, len(s)):
            if z[i] >= m:
                return i - m - 1
        return -1"""),
  "z2": dict(approach=[
     "A happy prefix is a proper prefix that's also a suffix. Compute the Z-array; at position i, if z[i] == n - i then the suffix starting at i equals a prefix — a candidate.",
     "Take the longest such suffix (smallest i) and return that prefix."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    string longestPrefix(string s) {
        int n = s.size(); vector<int> z(n, 0); z[0] = n;
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i < r) z[i] = min(r - i, z[i - l]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > r) { l = i; r = i + z[i]; }
        }
        for (int i = 1; i < n; i++) if (z[i] == n - i) return s.substr(0, z[i]);
        return "";
    }
};""",
   python="""class Solution:
    def longestPrefix(self, s: str) -> str:
        n = len(s)
        z = [0] * n
        z[0] = n
        l = r = 0
        for i in range(1, n):
            if i < r:
                z[i] = min(r - i, z[i - l])
            while i + z[i] < n and s[z[i]] == s[i + z[i]]:
                z[i] += 1
            if i + z[i] > r:
                l, r = i, i + z[i]
        for i in range(1, n):
            if z[i] == n - i:
                return s[:z[i]]
        return """""),
  "z3": dict(approach=[
     "The 'score' of the i-th built string (the suffix starting at i) is the length of its longest prefix shared with the whole string — exactly z[i].",
     "Compute the Z-array (with z[0] = n) and sum all values."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    long long sumScores(string s) {
        int n = s.size(); vector<int> z(n, 0); z[0] = n;
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i < r) z[i] = min(r - i, z[i - l]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > r) { l = i; r = i + z[i]; }
        }
        long long sum = 0;
        for (int x : z) sum += x;
        return sum;
    }
};""",
   python="""class Solution:
    def sumScores(self, s: str) -> int:
        n = len(s)
        z = [0] * n
        z[0] = n
        l = r = 0
        for i in range(1, n):
            if i < r:
                z[i] = min(r - i, z[i - l])
            while i + z[i] < n and s[z[i]] == s[i + z[i]]:
                z[i] += 1
            if i + z[i] > r:
                l, r = i, i + z[i]
        return sum(z)"""),
  "z4": dict(approach=[
     "An echo substring is t+t. Using prefix hashes, for each half-length L and start i compare the two halves in O(1).",
     "Collect distinct echoes by hash. (The Z-array can also detect equal halves; hashing keeps it simple.)"],
   time="O(n^2) average", space="O(n^2)",
   cpp="""class Solution {
public:
    int distinctEchoSubstrings(string text) {
        int n = text.size();
        const long long MOD = (1LL << 61) - 1, B = 131;
        vector<long long> h(n + 1, 0), pw(n + 1, 1);
        for (int i = 0; i < n; i++) { h[i+1] = ((__int128)h[i] * B + text[i]) % MOD; pw[i+1] = (__int128)pw[i] * B % MOD; }
        auto sub = [&](int l, int r){ return (h[r] - (__int128)h[l] * pw[r - l] % MOD + MOD) % MOD; };
        unordered_set<long long> seen;
        for (int len = 1; 2 * len <= n; len++)
            for (int i = 0; i + 2 * len <= n; i++)
                if (sub(i, i + len) == sub(i + len, i + 2 * len)) seen.insert(sub(i, i + 2 * len));
        return seen.size();
    }
};""",
   python="""class Solution:
    def distinctEchoSubstrings(self, text: str) -> int:
        n = len(text)
        MOD, B = (1 << 61) - 1, 131
        h = [0] * (n + 1)
        pw = [1] * (n + 1)
        for i in range(n):
            h[i+1] = (h[i] * B + ord(text[i])) % MOD
            pw[i+1] = pw[i] * B % MOD
        def sub(l, r):
            return (h[r] - h[l] * pw[r - l]) % MOD
        seen = set()
        for length in range(1, n // 2 + 1):
            for i in range(n - 2 * length + 1):
                if sub(i, i + length) == sub(i + length, i + 2 * length):
                    seen.add(sub(i, i + 2 * length))
        return len(seen)"""),
  "z5": dict(approach=[
     "A word is counted if it appears as a substring of any other word.",
     "For each word, check whether it is contained in any other (built-in substring search / Z-matching). Collect those that are."],
   time="O(n^2 · L)", space="O(1)",
   cpp="""class Solution {
public:
    vector<string> stringMatching(vector<string>& words) {
        vector<string> res;
        for (int i = 0; i < (int)words.size(); i++)
            for (int j = 0; j < (int)words.size(); j++)
                if (i != j && words[j].find(words[i]) != string::npos) { res.push_back(words[i]); break; }
        return res;
    }
};""",
   python="""class Solution:
    def stringMatching(self, words: list[str]) -> list[str]:
        res = []
        for i, w in enumerate(words):
            if any(i != j and w in other for j, other in enumerate(words)):
                res.append(w)
        return res"""),
 },
}
