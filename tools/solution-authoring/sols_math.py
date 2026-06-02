# -*- coding: utf-8 -*-
SOLS = {
 "combinatorics": {
  "cb1": dict(approach=[
     "Every path is a sequence of (m-1) downs and (n-1) rights; the count is the number of arrangements = C(m+n-2, m-1).",
     "Compute the binomial coefficient with a running product to avoid overflow (multiply by (i) and divide as you go)."],
   time="O(min(m, n))", space="O(1)",
   cpp="""class Solution {
public:
    int uniquePaths(int m, int n) {
        long long res = 1;
        for (int i = 1; i <= m - 1; i++) res = res * (n - 1 + i) / i;
        return (int)res;
    }
};""",
   python="""from math import comb
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        return comb(m + n - 2, m - 1)"""),
  "cb2": dict(approach=[
     "Each row starts and ends with 1; every interior entry is the sum of the two above it (Pascal's recurrence C(n,k)=C(n-1,k-1)+C(n-1,k)).",
     "Build row by row from the previous row."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> res(numRows);
        for (int i = 0; i < numRows; i++) {
            res[i].assign(i + 1, 1);
            for (int j = 1; j < i; j++) res[i][j] = res[i-1][j-1] + res[i-1][j];
        }
        return res;
    }
};""",
   python="""class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        res = []
        for i in range(numRows):
            row = [1] * (i + 1)
            for j in range(1, i):
                row[j] = res[i-1][j-1] + res[i-1][j]
            res.append(row)
        return res"""),
  "cb3": dict(approach=[
     "Modulo a prime p, division becomes multiplication by a modular inverse. Precompute factorials and inverse factorials.",
     "C(n, k) = fact[n] · invFact[k] · invFact[n-k] mod p. Inverse factorials come from Fermat's little theorem (inv(x)=x^(p-2))."],
   time="O(n) precompute, O(1) per query", space="O(n)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    long long power(long long a, long long b) { long long r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    int nCrModP(int n, int k) {
        if (k < 0 || k > n) return 0;
        vector<long long> fact(n + 1, 1);
        for (int i = 1; i <= n; i++) fact[i] = fact[i-1] * i % MOD;
        long long inv = power(fact[k] * fact[n-k] % MOD, MOD - 2);
        return (int)(fact[n] * inv % MOD);
    }
};""",
   python="""class Solution:
    def nCrModP(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        if k < 0 or k > n:
            return 0
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i-1] * i % MOD
        inv = pow(fact[k] * fact[n-k] % MOD, MOD - 2, MOD)
        return fact[n] * inv % MOD"""),
  "cb4": dict(approach=[
     "The first element is the BST root; values smaller form the left subtree, larger the right. The relative orders of the two groups can be interleaved in C(L+R, L) ways.",
     "Recursively, ways(tree) = C(L+R, L) · ways(left) · ways(right). The answer is ways(nums) - 1 (excluding the original ordering), modulo 1e9+7. Precompute Pascal's triangle for the binomials."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> C;
    long long dfs(vector<int>& nums) {
        int n = nums.size();
        if (n <= 2) return 1;
        vector<int> left, right;
        for (int i = 1; i < n; i++) (nums[i] < nums[0] ? left : right).push_back(nums[i]);
        long long l = dfs(left), r = dfs(right);
        return C[n - 1][left.size()] * l % MOD * r % MOD;
    }
public:
    int numOfWays(vector<int>& nums) {
        int n = nums.size();
        C.assign(n + 1, vector<long long>(n + 1, 0));
        for (int i = 0; i <= n; i++) { C[i][0] = 1; for (int j = 1; j <= i; j++) C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD; }
        return (int)((dfs(nums) - 1 + MOD) % MOD);
    }
};""",
   python="""from math import comb
class Solution:
    def numOfWays(self, nums: list[int]) -> int:
        MOD = 10**9 + 7
        def dfs(arr):
            if len(arr) <= 2:
                return 1
            root = arr[0]
            left = [x for x in arr[1:] if x < root]
            right = [x for x in arr[1:] if x > root]
            return comb(len(left) + len(right), len(left)) * dfs(left) % MOD * dfs(right) % MOD
        return (dfs(nums) - 1) % MOD"""),
  "cb5": dict(approach=[
     "dp[i][j] = number of subsequences of s[:i] equal to t[:j].",
     "If s[i-1]==t[j-1] we either use it (dp[i-1][j-1]) or skip it (dp[i-1][j]); otherwise only skip. Base: dp[i][0]=1 (empty target)."],
   time="O(n·m)", space="O(m)",
   cpp="""class Solution {
public:
    int numDistinct(string s, string t) {
        int n = s.size(), m = t.size();
        vector<unsigned long long> dp(m + 1, 0); dp[0] = 1;
        for (int i = 1; i <= n; i++)
            for (int j = m; j >= 1; j--)
                if (s[i-1] == t[j-1]) dp[j] += dp[j-1];
        return (int)dp[m];
    }
};""",
   python="""class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m = len(t)
        dp = [1] + [0] * m
        for c in s:
            for j in range(m, 0, -1):
                if c == t[j-1]:
                    dp[j] += dp[j-1]
        return dp[m]"""),
 },
 "fast-exponentiation": {
  "fp1": dict(approach=[
     "Binary exponentiation: square the base and halve the exponent, multiplying into the result when the current bit is set.",
     "For negative n, compute the positive power and take the reciprocal. O(log n)."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
public:
    double myPow(double x, int n) {
        long long e = n; bool neg = e < 0; if (neg) e = -e;
        double res = 1.0;
        while (e) { if (e & 1) res *= x; x *= x; e >>= 1; }
        return neg ? 1.0 / res : res;
    }
};""",
   python="""class Solution:
    def myPow(self, x: float, n: int) -> float:
        e = abs(n)
        res = 1.0
        while e:
            if e & 1:
                res *= x
            x *= x
            e >>= 1
        return res if n >= 0 else 1.0 / res"""),
  "fp2": dict(approach=[
     "The exponent is a huge number given as a digit array, so apply the rule a^(10·q + d) = (a^q)^10 · a^d, processing digits left to right.",
     "Keep everything modulo 1337 using fast exponentiation for the ^10 and ^d steps."],
   time="O(len · log)", space="O(1)",
   cpp="""class Solution {
    int MOD = 1337;
    int power(int a, int b) { int r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    int superPow(int a, vector<int>& b) {
        int res = 1;
        for (int d : b) res = power(res, 10) * power(a, d) % MOD;
        return res;
    }
};""",
   python="""class Solution:
    def superPow(self, a: int, b: list[int]) -> int:
        MOD = 1337
        res = 1
        for d in b:
            res = pow(res, 10, MOD) * pow(a, d, MOD) % MOD
        return res"""),
  "fp3": dict(approach=[
     "Fibonacci satisfies [[1,1],[1,0]]^n = [[F(n+1),F(n)],[F(n),F(n-1)]]. Raise the matrix by fast exponentiation.",
     "Each multiply is 2×2; O(log n) multiplications give F(n) modulo a prime."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    array<array<long long,2>,2> mul(array<array<long long,2>,2> A, array<array<long long,2>,2> B) {
        array<array<long long,2>,2> C = {};
        for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++) C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
        return C;
    }
public:
    int fib(int n) {
        if (n == 0) return 0;
        array<array<long long,2>,2> result = {{{1,0},{0,1}}}, base = {{{1,1},{1,0}}};
        while (n) { if (n & 1) result = mul(result, base); base = mul(base, base); n >>= 1; }
        return (int)result[0][1];
    }
};""",
   python="""class Solution:
    def fib(self, n: int) -> int:
        MOD = 10**9 + 7
        def mul(A, B):
            return [[(A[0][0]*B[0][0] + A[0][1]*B[1][0]) % MOD, (A[0][0]*B[0][1] + A[0][1]*B[1][1]) % MOD],
                    [(A[1][0]*B[0][0] + A[1][1]*B[1][0]) % MOD, (A[1][0]*B[0][1] + A[1][1]*B[1][1]) % MOD]]
        if n == 0:
            return 0
        result = [[1, 0], [0, 1]]
        base = [[1, 1], [1, 0]]
        while n:
            if n & 1:
                result = mul(result, base)
            base = mul(base, base)
            n >>= 1
        return result[0][1]"""),
  "fp4": dict(approach=[
     "Even indices (0-based) must hold an even digit (0,2,4,6,8 → 5 choices); odd indices must hold a prime digit (2,3,5,7 → 4 choices).",
     "There are ceil(n/2) even positions and floor(n/2) odd positions, so the answer is 5^ceil(n/2) · 4^floor(n/2) mod 1e9+7 via fast power."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    long long power(long long a, long long b) { long long r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    int countGoodNumbers(long long n) {
        long long even = (n + 1) / 2, odd = n / 2;
        return (int)(power(5, even) * power(4, odd) % MOD);
    }
};""",
   python="""class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        even = (n + 1) // 2
        odd = n // 2
        return pow(5, even, MOD) * pow(4, odd, MOD) % MOD"""),
  "fp5": dict(approach=[
     "When the modulus p is prime, Fermat's little theorem gives a^(p-1) ≡ 1, so the inverse of a is a^(p-2) mod p.",
     "Compute it with fast exponentiation."],
   time="O(log p)", space="O(1)",
   cpp="""class Solution {
public:
    long long modInverse(long long a, long long p) {
        long long r = 1, b = p - 2; a %= p;
        while (b) { if (b & 1) r = r * a % p; a = a * a % p; b >>= 1; }
        return r;
    }
};""",
   python="""class Solution:
    def modInverse(self, a: int, p: int) -> int:
        return pow(a, p - 2, p)"""),
 },
 "gcd-lcm": {
  "gl1": dict(approach=[
     "A common divisor string d must tile both strings; this can only happen if str1+str2 == str2+str1.",
     "If so, the answer length is gcd(len1, len2) and the divisor is that prefix."],
   time="O(n + m)", space="O(n + m)",
   cpp="""class Solution {
public:
    string gcdOfStrings(string a, string b) {
        if (a + b != b + a) return "";
        int g = __gcd((int)a.size(), (int)b.size());
        return a.substr(0, g);
    }
};""",
   python="""from math import gcd
class Solution:
    def gcdOfStrings(self, a: str, b: str) -> str:
        if a + b != b + a:
            return ""
        return a[:gcd(len(a), len(b))]"""),
  "gl2": dict(approach=[
     "By Bézout's identity, the measurable amounts are exactly the multiples of gcd(jug1, jug2).",
     "A target is reachable iff target <= jug1 + jug2 and target is divisible by gcd(jug1, jug2) (with the zero edge cases)."],
   time="O(log)", space="O(1)",
   cpp="""class Solution {
public:
    bool canMeasureWater(int a, int b, int target) {
        if (target > a + b) return false;
        if (a == 0 || b == 0) return target == 0 || target == a + b;
        return target % __gcd(a, b) == 0;
    }
};""",
   python="""from math import gcd
class Solution:
    def canMeasureWater(self, a: int, b: int, target: int) -> bool:
        if target > a + b:
            return False
        if a == 0 or b == 0:
            return target == 0 or target == a + b
        return target % gcd(a, b) == 0"""),
  "gl3": dict(approach=[
     "The smallest number divisible by all of 1..n is their LCM, built incrementally: lcm(acc, i) = acc / gcd(acc, i) · i.",
     "Divide before multiplying to limit overflow."],
   time="O(n log n)", space="O(1)",
   cpp="""class Solution {
public:
    long long smallestMultiple(int n) {
        long long acc = 1;
        for (int i = 2; i <= n; i++) acc = acc / __gcd(acc, (long long)i) * i;
        return acc;
    }
};""",
   python="""from math import gcd
class Solution:
    def smallestMultiple(self, n: int) -> int:
        acc = 1
        for i in range(2, n + 1):
            acc = acc // gcd(acc, i) * i
        return acc"""),
  "gl4": dict(approach=[
     "The extended Euclidean algorithm finds x, y with a·x + m·y = gcd(a, m). When gcd is 1, x mod m is the modular inverse.",
     "This works for any modulus (not only primes), unlike the Fermat method."],
   time="O(log m)", space="O(1)",
   cpp="""class Solution {
    long long ext(long long a, long long b, long long& x, long long& y) {
        if (!b) { x = 1; y = 0; return a; }
        long long x1, y1, g = ext(b, a % b, x1, y1);
        x = y1; y = x1 - (a / b) * y1;
        return g;
    }
public:
    long long modInverse(long long a, long long m) {
        long long x, y, g = ext(a, m, x, y);
        if (g != 1) return -1;       // no inverse
        return (x % m + m) % m;
    }
};""",
   python="""class Solution:
    def modInverse(self, a: int, m: int) -> int:
        def ext(a, b):
            if b == 0:
                return a, 1, 0
            g, x1, y1 = ext(b, a % b)
            return g, y1, x1 - (a // b) * y1
        g, x, _ = ext(a, m)
        if g != 1:
            return -1
        return x % m"""),
  "gl5": dict(approach=[
     "For each right endpoint, the gcds of all subarrays ending there take only O(log V) distinct values (each extension can only keep or shrink the gcd).",
     "Maintain (gcd, count) pairs for subarrays ending at i; carry them forward, fold equal gcds, and add the counts where gcd == k."],
   time="O(n log V)", space="O(log V)",
   cpp="""class Solution {
public:
    long long subarrayGCD(vector<int>& nums, int k) {
        long long ans = 0;
        vector<pair<int,int>> prev;   // (gcd, count)
        for (int x : nums) {
            vector<pair<int,int>> cur;
            cur.push_back({x, 1});
            for (auto& [g, c] : prev) {
                int ng = __gcd(g, x);
                if (!cur.empty() && cur.back().first == ng) cur.back().second += c;
                else cur.push_back({ng, c});
            }
            prev = cur;
            for (auto& [g, c] : prev) if (g == k) ans += c;
        }
        return ans;
    }
};""",
   python="""from math import gcd
class Solution:
    def subarrayGCD(self, nums: list[int], k: int) -> int:
        ans = 0
        prev = []   # list of [gcd, count]
        for x in nums:
            cur = [[x, 1]]
            for g, c in prev:
                ng = gcd(g, x)
                if cur[-1][0] == ng:
                    cur[-1][1] += c
                else:
                    cur.append([ng, c])
            prev = cur
            ans += sum(c for g, c in prev if g == k)
        return ans"""),
 },
 "modular-arithmetic": {
  "ma1": dict(approach=[
     "Under a prime modulus, the inverse of a is a^(p-2) by Fermat's little theorem.",
     "Fast exponentiation computes it in O(log p)."],
   time="O(log p)", space="O(1)",
   cpp="""class Solution {
public:
    long long modInverse(long long a, long long p) {
        long long r = 1, b = p - 2; a %= p;
        while (b) { if (b & 1) r = r * a % p; a = a * a % p; b >>= 1; }
        return r;
    }
};""",
   python="""class Solution:
    def modInverse(self, a: int, p: int) -> int:
        return pow(a, p - 2, p)"""),
  "ma2": dict(approach=[
     "Precompute factorials and inverse factorials modulo p, then C(n,k) = fact[n]·invFact[k]·invFact[n-k].",
     "Inverse factorials are obtained from invFact[n] = inv(fact[n]) and a backward recurrence, or directly via Fermat."],
   time="O(n) precompute, O(1) per query", space="O(n)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    long long power(long long a, long long b) { long long r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    int nCr(int n, int k) {
        if (k < 0 || k > n) return 0;
        vector<long long> fact(n + 1, 1), inv(n + 1, 1);
        for (int i = 1; i <= n; i++) fact[i] = fact[i-1] * i % MOD;
        inv[n] = power(fact[n], MOD - 2);
        for (int i = n; i > 0; i--) inv[i-1] = inv[i] * i % MOD;
        return (int)(fact[n] * inv[k] % MOD * inv[n-k] % MOD);
    }
};""",
   python="""class Solution:
    def nCr(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        if k < 0 or k > n:
            return 0
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i-1] * i % MOD
        inv = [1] * (n + 1)
        inv[n] = pow(fact[n], MOD - 2, MOD)
        for i in range(n, 0, -1):
            inv[i-1] = inv[i] * i % MOD
        return fact[n] * inv[k] % MOD * inv[n-k] % MOD"""),
  "ma3": dict(approach=[
     "Even positions need an even digit (5 choices), odd positions a prime digit (4 choices).",
     "Answer = 5^ceil(n/2) · 4^floor(n/2) mod 1e9+7, using modular fast exponentiation."],
   time="O(log n)", space="O(1)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    long long power(long long a, long long b) { long long r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    int countGoodNumbers(long long n) {
        return (int)(power(5, (n + 1) / 2) * power(4, n / 2) % MOD);
    }
};""",
   python="""class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD"""),
  "ma4": dict(approach=[
     "Maintain the sequence plus two lazy transforms: a global multiplier `mul` and adder `add`, so the real value of element i is raw[i]·mul + add.",
     "addAll/multAll just update add and mul. append(v) stores the raw value (v - add)·inv(mul) so it reads back as v. getIndex applies the transform with a modular inverse of mul."],
   time="O(1) per op (amortised)", space="O(n)",
   cpp="""class Fancy {
    const long long MOD = 1e9 + 7;
    vector<long long> seq; long long mul = 1, add = 0;
    long long power(long long a, long long b) { long long r = 1; a %= MOD; while (b) { if (b & 1) r = r * a % MOD; a = a * a % MOD; b >>= 1; } return r; }
public:
    Fancy() {}
    void append(int val) { seq.push_back((((val - add) % MOD + MOD) % MOD) * power(mul, MOD - 2) % MOD); }
    void addAll(int inc) { add = (add + inc) % MOD; }
    void multAll(int m) { mul = mul * m % MOD; add = add * m % MOD; }
    int getIndex(int idx) {
        if (idx >= (int)seq.size()) return -1;
        return (int)((seq[idx] * mul + add) % MOD);
    }
};""",
   python="""class Fancy:
    def __init__(self):
        self.MOD = 10**9 + 7
        self.seq = []
        self.mul = 1
        self.add = 0
    def append(self, val: int) -> None:
        inv = pow(self.mul, self.MOD - 2, self.MOD)
        self.seq.append((val - self.add) * inv % self.MOD)
    def addAll(self, inc: int) -> None:
        self.add = (self.add + inc) % self.MOD
    def multAll(self, m: int) -> None:
        self.mul = self.mul * m % self.MOD
        self.add = self.add * m % self.MOD
    def getIndex(self, idx: int) -> int:
        if idx >= len(self.seq):
            return -1
        return (self.seq[idx] * self.mul + self.add) % self.MOD"""),
  "ma5": dict(approach=[
     "The first value is the BST root; smaller values form the left subtree, larger the right, and their orders interleave in C(L+R, L) ways.",
     "ways(tree) = C(L+R, L) · ways(left) · ways(right) modulo 1e9+7; subtract 1 for the original ordering. Use precomputed binomials."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
    const long long MOD = 1e9 + 7;
    vector<vector<long long>> C;
    long long dfs(vector<int>& a) {
        int n = a.size();
        if (n <= 2) return 1;
        vector<int> l, r;
        for (int i = 1; i < n; i++) (a[i] < a[0] ? l : r).push_back(a[i]);
        return C[n-1][l.size()] * dfs(l) % MOD * dfs(r) % MOD;
    }
public:
    int numOfWays(vector<int>& nums) {
        int n = nums.size();
        C.assign(n + 1, vector<long long>(n + 1, 0));
        for (int i = 0; i <= n; i++) { C[i][0] = 1; for (int j = 1; j <= i; j++) C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD; }
        return (int)((dfs(nums) - 1 + MOD) % MOD);
    }
};""",
   python="""from math import comb
class Solution:
    def numOfWays(self, nums: list[int]) -> int:
        MOD = 10**9 + 7
        def dfs(a):
            if len(a) <= 2:
                return 1
            root = a[0]
            left = [x for x in a[1:] if x < root]
            right = [x for x in a[1:] if x > root]
            return comb(len(left) + len(right), len(left)) * dfs(left) % MOD * dfs(right) % MOD
        return (dfs(nums) - 1) % MOD"""),
 },
 "sieve": {
  "sv1": dict(approach=[
     "The Sieve of Eratosthenes marks multiples of each prime as composite; what's left are primes.",
     "Start from p=2; for each prime mark p·p, p·p+p, … as composite. Count remaining primes below n."],
   time="O(n log log n)", space="O(n)",
   cpp="""class Solution {
public:
    int countPrimes(int n) {
        if (n < 3) return 0;
        vector<bool> composite(n, false);
        int count = 0;
        for (int p = 2; p < n; p++) {
            if (composite[p]) continue;
            count++;
            for (long long m = (long long)p * p; m < n; m += p) composite[m] = true;
        }
        return count;
    }
};""",
   python="""class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        composite = [False] * n
        count = 0
        for p in range(2, n):
            if composite[p]:
                continue
            count += 1
            for m in range(p * p, n, p):
                composite[m] = True
        return count"""),
  "sv2": dict(approach=[
     "Sieve primes up to right, then scan the primes within [left, right] for the closest consecutive pair (smallest difference).",
     "Track the previous prime in range; the first pair with difference < current best wins (ties prefer the smaller pair)."],
   time="O(right log log right)", space="O(right)",
   cpp="""class Solution {
public:
    vector<int> closestPrimes(int left, int right) {
        vector<bool> comp(right + 1, false);
        for (int p = 2; (long long)p * p <= right; p++)
            if (!comp[p]) for (long long m = (long long)p * p; m <= right; m += p) comp[m] = true;
        int prev = -1, a = -1, b = -1, best = INT_MAX;
        for (int x = max(2, left); x <= right; x++) {
            if (comp[x]) continue;
            if (prev != -1 && x - prev < best) { best = x - prev; a = prev; b = x; }
            prev = x;
        }
        return {a, b};
    }
};""",
   python="""class Solution:
    def closestPrimes(self, left: int, right: int) -> list[int]:
        comp = [False] * (right + 1)
        p = 2
        while p * p <= right:
            if not comp[p]:
                for m in range(p * p, right + 1, p):
                    comp[m] = True
            p += 1
        prev, a, b, best = -1, -1, -1, float('inf')
        for x in range(max(2, left), right + 1):
            if comp[x]:
                continue
            if prev != -1 and x - prev < best:
                best, a, b = x - prev, prev, x
            prev = x
        return [a, b]"""),
  "sv3": dict(approach=[
     "A modified sieve records the smallest prime factor (SPF) of every number. Then any n is factorised by repeatedly dividing by spf[n].",
     "Precompute SPF once in O(N log log N); each factorisation is O(log n)."],
   time="O(N log log N) precompute", space="O(N)",
   cpp="""class Solution {
public:
    vector<int> primeFactorize(int n) {
        vector<int> spf(n + 1);
        for (int i = 2; i <= n; i++) if (!spf[i]) for (int j = i; j <= n; j += i) if (!spf[j]) spf[j] = i;
        vector<int> factors;
        while (n > 1) { factors.push_back(spf[n]); n /= spf[n]; }
        return factors;
    }
};""",
   python="""class Solution:
    def primeFactorize(self, n: int) -> list[int]:
        spf = [0] * (n + 1)
        for i in range(2, n + 1):
            if spf[i] == 0:
                for j in range(i, n + 1, i):
                    if spf[j] == 0:
                        spf[j] = i
        factors = []
        while n > 1:
            factors.append(spf[n])
            n //= spf[n]
        return factors"""),
  "sv4": dict(approach=[
     "A sieve variant counts distinct prime factors: for each prime p, increment a counter for every multiple of p.",
     "After the sieve, cnt[x] is the number of distinct primes dividing x."],
   time="O(N log log N)", space="O(N)",
   cpp="""class Solution {
public:
    vector<int> distinctPrimeFactors(int N) {
        vector<int> cnt(N + 1, 0);
        for (int p = 2; p <= N; p++)
            if (cnt[p] == 0)                       // p is prime
                for (int m = p; m <= N; m += p) cnt[m]++;
        return cnt;
    }
};""",
   python="""class Solution:
    def distinctPrimeFactors(self, N: int) -> list[int]:
        cnt = [0] * (N + 1)
        for p in range(2, N + 1):
            if cnt[p] == 0:
                for m in range(p, N + 1, p):
                    cnt[m] += 1
        return cnt"""),
  "sv5": dict(approach=[
     "Ugly numbers have only 2, 3, 5 as prime factors. Build them in order: each new ugly number is the smallest of (last·2, last·3, last·5) using three pointers.",
     "Advance whichever pointer(s) produced the chosen value to avoid duplicates."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int nthUglyNumber(int n) {
        vector<int> dp(n);
        dp[0] = 1; int i2 = 0, i3 = 0, i5 = 0;
        for (int i = 1; i < n; i++) {
            int n2 = dp[i2] * 2, n3 = dp[i3] * 3, n5 = dp[i5] * 5;
            int nxt = min({n2, n3, n5});
            dp[i] = nxt;
            if (nxt == n2) i2++;
            if (nxt == n3) i3++;
            if (nxt == n5) i5++;
        }
        return dp[n - 1];
    }
};""",
   python="""class Solution:
    def nthUglyNumber(self, n: int) -> int:
        dp = [1] * n
        i2 = i3 = i5 = 0
        for i in range(1, n):
            n2, n3, n5 = dp[i2] * 2, dp[i3] * 3, dp[i5] * 5
            nxt = min(n2, n3, n5)
            dp[i] = nxt
            if nxt == n2: i2 += 1
            if nxt == n3: i3 += 1
            if nxt == n5: i5 += 1
        return dp[-1]"""),
 },
}
