# -*- coding: utf-8 -*-
SOLS = {
 "bellman-ford": {
  "bf1": dict(approach=[
     "We want the cheapest price using at most K stops, i.e. at most K+1 edges. Bellman-Ford naturally bounds the number of edges by the number of relaxation rounds.",
     "Run K+1 rounds; in each round relax every flight using costs from the previous round only (snapshot), so a path never uses more than the allowed number of edges."],
   time="O(K · E)", space="O(n)",
   cpp="""class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int K) {
        const int INF = 1e9;
        vector<int> dist(n, INF); dist[src] = 0;
        for (int i = 0; i <= K; i++) {
            vector<int> tmp = dist;
            for (auto& f : flights)
                if (dist[f[0]] != INF) tmp[f[1]] = min(tmp[f[1]], dist[f[0]] + f[2]);
            dist = tmp;
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
};""",
   python="""class Solution:
    def findCheapestPrice(self, n, flights, src, dst, K):
        INF = float('inf')
        dist = [INF] * n
        dist[src] = 0
        for _ in range(K + 1):
            tmp = dist[:]
            for u, v, w in flights:
                if dist[u] + w < tmp[v]:
                    tmp[v] = dist[u] + w
            dist = tmp
        return -1 if dist[dst] == INF else dist[dst]"""),
  "bf2": dict(approach=[
     "Single-source shortest path from node k; the answer is the maximum finishing distance (or -1 if some node is unreachable).",
     "Bellman-Ford relaxes all edges V-1 times. The signal time is the largest shortest-distance over all nodes."],
   time="O(V · E)", space="O(V)",
   cpp="""class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        const int INF = 1e9;
        vector<int> dist(n + 1, INF); dist[k] = 0;
        for (int i = 1; i < n; i++)
            for (auto& t : times)
                if (dist[t[0]] != INF) dist[t[1]] = min(dist[t[1]], dist[t[0]] + t[2]);
        int ans = 0;
        for (int i = 1; i <= n; i++) ans = max(ans, dist[i]);
        return ans == INF ? -1 : ans;
    }
};""",
   python="""class Solution:
    def networkDelayTime(self, times, n, k):
        INF = float('inf')
        dist = [INF] * (n + 1)
        dist[k] = 0
        for _ in range(n - 1):
            for u, v, w in times:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        ans = max(dist[1:])
        return -1 if ans == INF else ans"""),
  "bf3": dict(approach=[
     "After V-1 rounds of relaxation all shortest paths are settled if there is no negative cycle. A Vth round that still relaxes an edge proves a reachable negative cycle exists.",
     "Start all distances at 0 (a virtual source connected to every node) so the detection covers the whole graph."],
   time="O(V · E)", space="O(V)",
   cpp="""class Solution {
public:
    bool hasNegativeCycle(int n, vector<vector<int>>& edges) {
        vector<long long> dist(n, 0);          // virtual source to all
        for (int i = 0; i < n - 1; i++)
            for (auto& e : edges)
                if (dist[e[0]] + e[2] < dist[e[1]]) dist[e[1]] = dist[e[0]] + e[2];
        for (auto& e : edges)
            if (dist[e[0]] + e[2] < dist[e[1]]) return true;   // still relaxes
        return false;
    }
};""",
   python="""class Solution:
    def hasNegativeCycle(self, n, edges):
        dist = [0] * n
        for _ in range(n - 1):
            for u, v, w in edges:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                return True
        return False"""),
  "bf4": dict(approach=[
     "An arbitrage cycle multiplies rates to > 1. Take negative logarithms of rates: a product > 1 becomes a sum < 0, so arbitrage is exactly a negative cycle.",
     "Run Bellman-Ford on the -log(rate) graph and detect a negative cycle."],
   time="O(V · E)", space="O(V)",
   cpp="""#include <cmath>
class Solution {
public:
    bool arbitrage(int n, vector<vector<double>>& rates) {  // rates: {u, v, rate}
        vector<double> dist(n, 0.0);
        vector<array<double,3>> edges;
        for (auto& r : rates) edges.push_back({r[0], r[1], -log(r[2])});
        for (int i = 0; i < n - 1; i++)
            for (auto& e : edges) {
                int u = (int)e[0], v = (int)e[1];
                if (dist[u] + e[2] < dist[v] - 1e-9) dist[v] = dist[u] + e[2];
            }
        for (auto& e : edges) {
            int u = (int)e[0], v = (int)e[1];
            if (dist[u] + e[2] < dist[v] - 1e-9) return true;
        }
        return false;
    }
};""",
   python="""import math
class Solution:
    def arbitrage(self, n, rates):   # rates: list of (u, v, rate)
        dist = [0.0] * n
        edges = [(u, v, -math.log(r)) for u, v, r in rates]
        for _ in range(n - 1):
            for u, v, w in edges:
                if dist[u] + w < dist[v] - 1e-9:
                    dist[v] = dist[u] + w
        for u, v, w in edges:
            if dist[u] + w < dist[v] - 1e-9:
                return True
        return False"""),
  "bf5": dict(approach=[
     "When edges may be negative (but no negative cycle), Dijkstra is invalid; Bellman-Ford is the right tool.",
     "Relax all edges V-1 times from the source; distances converge because any shortest path has at most V-1 edges."],
   time="O(V · E)", space="O(V)",
   cpp="""class Solution {
public:
    vector<long long> shortestPaths(int n, vector<vector<int>>& edges, int src) {
        const long long INF = 1e18;
        vector<long long> dist(n, INF); dist[src] = 0;
        for (int i = 0; i < n - 1; i++)
            for (auto& e : edges)
                if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]])
                    dist[e[1]] = dist[e[0]] + e[2];
        return dist;
    }
};""",
   python="""class Solution:
    def shortestPaths(self, n, edges, src):
        INF = float('inf')
        dist = [INF] * n
        dist[src] = 0
        for _ in range(n - 1):
            for u, v, w in edges:
                if dist[u] != INF and dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        return dist"""),
 },
 "dijkstra": {
  "dij1": dict(approach=[
     "Non-negative weights, so Dijkstra is optimal. Use a min-heap keyed by distance from the source k.",
     "Pop the closest unsettled node, relax its edges. The answer is the largest settled distance, or -1 if some node never settles."],
   time="O(E log V)", space="O(V + E)",
   cpp="""class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> adj(n + 1);
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INT_MAX); dist[k] = 0;
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& [v, w] : adj[u])
                if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) ans = max(ans, dist[i]);
        return ans == INT_MAX ? -1 : ans;
    }
};""",
   python="""import heapq
class Solution:
    def networkDelayTime(self, times, n, k):
        adj = [[] for _ in range(n + 1)]
        for u, v, w in times:
            adj[u].append((v, w))
        dist = {k: 0}
        pq = [(0, k)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist.get(u, float('inf')):
                continue
            for v, w in adj[u]:
                if d + w < dist.get(v, float('inf')):
                    dist[v] = d + w
                    heapq.heappush(pq, (dist[v], v))
        return max(dist.values()) if len(dist) == n else -1"""),
  "dij2": dict(approach=[
     "Edge 'cost' is the absolute height difference, and a path's cost is its largest single step. This is a min-max (bottleneck) shortest path — Dijkstra works with max instead of sum.",
     "Key cells by the minimum possible effort to reach them; relax with effort = max(currentEffort, |height diff|)."],
   time="O(mn log(mn))", space="O(mn)",
   cpp="""class Solution {
public:
    int minimumEffortPath(vector<vector<int>>& h) {
        int R = h.size(), C = h[0].size();
        vector<vector<int>> eff(R, vector<int>(C, INT_MAX));
        priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
        pq.push({0, 0, 0}); eff[0][0] = 0;
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!pq.empty()) {
            auto [e, r, c] = pq.top(); pq.pop();
            if (r == R - 1 && c == C - 1) return e;
            if (e > eff[r][c]) continue;
            for (int d = 0; d < 4; d++) {
                int nr = r + dx[d], nc = c + dy[d];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                int ne = max(e, abs(h[nr][nc] - h[r][c]));
                if (ne < eff[nr][nc]) { eff[nr][nc] = ne; pq.push({ne, nr, nc}); }
            }
        }
        return 0;
    }
};""",
   python="""import heapq
class Solution:
    def minimumEffortPath(self, h):
        R, C = len(h), len(h[0])
        eff = [[float('inf')] * C for _ in range(R)]
        eff[0][0] = 0
        pq = [(0, 0, 0)]
        while pq:
            e, r, c = heapq.heappop(pq)
            if r == R - 1 and c == C - 1:
                return e
            if e > eff[r][c]:
                continue
            for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                if 0 <= nr < R and 0 <= nc < C:
                    ne = max(e, abs(h[nr][nc] - h[r][c]))
                    if ne < eff[nr][nc]:
                        eff[nr][nc] = ne
                        heapq.heappush(pq, (ne, nr, nc))
        return 0"""),
  "dij3": dict(approach=[
     "State is (node, stops used). A node may be revisited if we reach it with fewer stops, so we cannot prune purely by cost.",
     "Dijkstra-style heap ordered by cost; carry the stop count and only expand while stops <= K. The first time we pop the destination it is optimal."],
   time="O(E·K log(E·K))", space="O(n·K)",
   cpp="""class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int K) {
        vector<vector<pair<int,int>>> adj(n);
        for (auto& f : flights) adj[f[0]].push_back({f[1], f[2]});
        priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
        pq.push({0, src, K + 1});
        vector<int> bestStops(n, -1);
        while (!pq.empty()) {
            auto [cost, u, stops] = pq.top(); pq.pop();
            if (u == dst) return cost;
            if (stops <= 0 || stops <= bestStops[u]) continue;
            bestStops[u] = stops;
            for (auto& [v, w] : adj[u]) pq.push({cost + w, v, stops - 1});
        }
        return -1;
    }
};""",
   python="""import heapq
class Solution:
    def findCheapestPrice(self, n, flights, src, dst, K):
        adj = [[] for _ in range(n)]
        for u, v, w in flights:
            adj[u].append((v, w))
        pq = [(0, src, K + 1)]
        best_stops = [-1] * n
        while pq:
            cost, u, stops = heapq.heappop(pq)
            if u == dst:
                return cost
            if stops <= 0 or stops <= best_stops[u]:
                continue
            best_stops[u] = stops
            for v, w in adj[u]:
                heapq.heappush(pq, (cost + w, v, stops - 1))
        return -1"""),
  "dij4": dict(approach=[
     "You can move once the water level reaches the higher of two adjacent cells. The cost of a path is the maximum cell value on it — a bottleneck shortest path.",
     "Dijkstra from (0,0) keying each cell by the minimum possible 'time' (max elevation) to reach it; answer is that value at the bottom-right corner."],
   time="O(n^2 log n)", space="O(n^2)",
   cpp="""class Solution {
public:
    int swimInWater(vector<vector<int>>& g) {
        int n = g.size();
        vector<vector<int>> best(n, vector<int>(n, INT_MAX));
        priority_queue<tuple<int,int,int>, vector<tuple<int,int,int>>, greater<>> pq;
        pq.push({g[0][0], 0, 0}); best[0][0] = g[0][0];
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!pq.empty()) {
            auto [t, r, c] = pq.top(); pq.pop();
            if (r == n - 1 && c == n - 1) return t;
            if (t > best[r][c]) continue;
            for (int d = 0; d < 4; d++) {
                int nr = r + dx[d], nc = c + dy[d];
                if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
                int nt = max(t, g[nr][nc]);
                if (nt < best[nr][nc]) { best[nr][nc] = nt; pq.push({nt, nr, nc}); }
            }
        }
        return -1;
    }
};""",
   python="""import heapq
class Solution:
    def swimInWater(self, g):
        n = len(g)
        best = [[float('inf')] * n for _ in range(n)]
        best[0][0] = g[0][0]
        pq = [(g[0][0], 0, 0)]
        while pq:
            t, r, c = heapq.heappop(pq)
            if r == n - 1 and c == n - 1:
                return t
            if t > best[r][c]:
                continue
            for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                if 0 <= nr < n and 0 <= nc < n:
                    nt = max(t, g[nr][nc])
                    if nt < best[nr][nc]:
                        best[nr][nc] = nt
                        heapq.heappush(pq, (nt, nr, nc))
        return -1"""),
  "dij5": dict(approach=[
     "Run Dijkstra from 0, but additionally keep ways[v] = number of shortest paths to v.",
     "When we find a strictly shorter distance, ways[v] = ways[u]; when we find an equally short one, ways[v] += ways[u]. Return ways[n-1] modulo 1e9+7."],
   time="O(E log V)", space="O(V)",
   cpp="""class Solution {
public:
    int countPaths(int n, vector<vector<int>>& roads) {
        const long long MOD = 1e9 + 7;
        vector<vector<pair<int,long long>>> adj(n);
        for (auto& r : roads) { adj[r[0]].push_back({r[1], r[2]}); adj[r[1]].push_back({r[0], r[2]}); }
        vector<long long> dist(n, LLONG_MAX), ways(n, 0);
        priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
        dist[0] = 0; ways[0] = 1; pq.push({0, 0});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            for (auto& [v, w] : adj[u]) {
                if (d + w < dist[v]) { dist[v] = d + w; ways[v] = ways[u]; pq.push({dist[v], v}); }
                else if (d + w == dist[v]) ways[v] = (ways[v] + ways[u]) % MOD;
            }
        }
        return (int)ways[n - 1];
    }
};""",
   python="""import heapq
class Solution:
    def countPaths(self, n, roads):
        MOD = 10**9 + 7
        adj = [[] for _ in range(n)]
        for u, v, w in roads:
            adj[u].append((v, w)); adj[v].append((u, w))
        dist = [float('inf')] * n
        ways = [0] * n
        dist[0], ways[0] = 0, 1
        pq = [(0, 0)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    ways[v] = ways[u]
                    heapq.heappush(pq, (dist[v], v))
                elif d + w == dist[v]:
                    ways[v] = (ways[v] + ways[u]) % MOD
        return ways[n - 1] % MOD"""),
 },
 "floyd-warshall": {
  "fw1": dict(approach=[
     "All-pairs shortest paths via Floyd-Warshall, then for each city count how many others are within the distance threshold.",
     "Return the city with the smallest reachable count, breaking ties by the largest index."],
   time="O(n^3)", space="O(n^2)",
   cpp="""class Solution {
public:
    int findTheCity(int n, vector<vector<int>>& edges, int threshold) {
        const int INF = 1e9;
        vector<vector<int>> d(n, vector<int>(n, INF));
        for (int i = 0; i < n; i++) d[i][i] = 0;
        for (auto& e : edges) { d[e[0]][e[1]] = e[2]; d[e[1]][e[0]] = e[2]; }
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        int best = -1, bestCnt = INT_MAX;
        for (int i = 0; i < n; i++) {
            int cnt = 0;
            for (int j = 0; j < n; j++) if (i != j && d[i][j] <= threshold) cnt++;
            if (cnt <= bestCnt) { bestCnt = cnt; best = i; }
        }
        return best;
    }
};""",
   python="""class Solution:
    def findTheCity(self, n, edges, threshold):
        INF = float('inf')
        d = [[INF] * n for _ in range(n)]
        for i in range(n):
            d[i][i] = 0
        for u, v, w in edges:
            d[u][v] = d[v][u] = w
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    if d[i][k] + d[k][j] < d[i][j]:
                        d[i][j] = d[i][k] + d[k][j]
        best, best_cnt = -1, INF
        for i in range(n):
            cnt = sum(1 for j in range(n) if i != j and d[i][j] <= threshold)
            if cnt <= best_cnt:
                best_cnt, best = cnt, i
        return best"""),
  "fw2": dict(approach=[
     "The queries ask about reachability (transitive closure). Floyd-Warshall generalises: reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j]).",
     "Build the closure in O(n^3), then answer each prerequisite query in O(1)."],
   time="O(n^3 + q)", space="O(n^2)",
   cpp="""class Solution {
public:
    vector<bool> checkIfPrerequisite(int n, vector<vector<int>>& pre, vector<vector<int>>& queries) {
        vector<vector<bool>> reach(n, vector<bool>(n, false));
        for (auto& p : pre) reach[p[0]][p[1]] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                if (reach[i][k])
                    for (int j = 0; j < n; j++)
                        if (reach[k][j]) reach[i][j] = true;
        vector<bool> res;
        for (auto& q : queries) res.push_back(reach[q[0]][q[1]]);
        return res;
    }
};""",
   python="""class Solution:
    def checkIfPrerequisite(self, n, prerequisites, queries):
        reach = [[False] * n for _ in range(n)]
        for a, b in prerequisites:
            reach[a][b] = True
        for k in range(n):
            for i in range(n):
                if reach[i][k]:
                    for j in range(n):
                        if reach[k][j]:
                            reach[i][j] = True
        return [reach[a][b] for a, b in queries]"""),
  "fw3": dict(approach=[
     "Treat variables as nodes and a/b = value as a directed edge with that ratio (and 1/value back). Path products give other ratios.",
     "Floyd-Warshall over multiplication: d[i][j] = d[i][k]·d[k][j]. Then each query is a table lookup, or -1 if disconnected."],
   time="O(V^3 + q)", space="O(V^2)",
   cpp="""class Solution {
public:
    vector<double> calcEquation(vector<vector<string>>& eq, vector<double>& vals, vector<vector<string>>& queries) {
        unordered_map<string,int> id; int n = 0;
        for (auto& e : eq) for (auto& s : e) if (!id.count(s)) id[s] = n++;
        vector<vector<double>> d(n, vector<double>(n, 0.0));
        for (int i = 0; i < n; i++) d[i][i] = 1.0;
        for (int i = 0; i < (int)eq.size(); i++) {
            int a = id[eq[i][0]], b = id[eq[i][1]];
            d[a][b] = vals[i]; d[b][a] = 1.0 / vals[i];
        }
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] && d[k][j]) d[i][j] = d[i][k] * d[k][j];
        vector<double> res;
        for (auto& q : queries) {
            if (!id.count(q[0]) || !id.count(q[1]) || d[id[q[0]]][id[q[1]]] == 0.0) res.push_back(-1.0);
            else res.push_back(d[id[q[0]]][id[q[1]]]);
        }
        return res;
    }
};""",
   python="""class Solution:
    def calcEquation(self, equations, values, queries):
        idx = {}
        for a, b in equations:
            idx.setdefault(a, len(idx)); idx.setdefault(b, len(idx))
        n = len(idx)
        d = [[0.0] * n for _ in range(n)]
        for i in range(n):
            d[i][i] = 1.0
        for (a, b), v in zip(equations, values):
            d[idx[a]][idx[b]] = v
            d[idx[b]][idx[a]] = 1.0 / v
        for k in range(n):
            for i in range(n):
                if d[i][k]:
                    for j in range(n):
                        if d[k][j]:
                            d[i][j] = d[i][k] * d[k][j]
        res = []
        for a, b in queries:
            if a in idx and b in idx and d[idx[a]][idx[b]]:
                res.append(d[idx[a]][idx[b]])
            else:
                res.append(-1.0)
        return res"""),
  "fw4": dict(approach=[
     "There are only 26 letters, so build a 26×26 cost matrix of single-character conversions and run Floyd-Warshall for cheapest letter-to-letter costs.",
     "Sum the per-position costs of converting source to target; if any position is unreachable, return -1."],
   time="O(26^3 + n)", space="O(26^2)",
   cpp="""class Solution {
public:
    long long minimumCost(string source, string target, vector<char>& original, vector<char>& changed, vector<int>& cost) {
        const long long INF = 1e18;
        vector<vector<long long>> d(26, vector<long long>(26, INF));
        for (int i = 0; i < 26; i++) d[i][i] = 0;
        for (int i = 0; i < (int)cost.size(); i++) {
            int u = original[i] - 'a', v = changed[i] - 'a';
            d[u][v] = min(d[u][v], (long long)cost[i]);
        }
        for (int k = 0; k < 26; k++)
            for (int i = 0; i < 26; i++)
                for (int j = 0; j < 26; j++)
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        long long total = 0;
        for (int i = 0; i < (int)source.size(); i++) {
            long long c = d[source[i] - 'a'][target[i] - 'a'];
            if (c == INF) return -1;
            total += c;
        }
        return total;
    }
};""",
   python="""class Solution:
    def minimumCost(self, source, target, original, changed, cost):
        INF = float('inf')
        d = [[INF] * 26 for _ in range(26)]
        for i in range(26):
            d[i][i] = 0
        for o, c, w in zip(original, changed, cost):
            u, v = ord(o) - 97, ord(c) - 97
            d[u][v] = min(d[u][v], w)
        for k in range(26):
            for i in range(26):
                if d[i][k] < INF:
                    for j in range(26):
                        if d[i][k] + d[k][j] < d[i][j]:
                            d[i][j] = d[i][k] + d[k][j]
        total = 0
        for s, t in zip(source, target):
            c = d[ord(s) - 97][ord(t) - 97]
            if c == INF:
                return -1
            total += c
        return total"""),
  "fw5": dict(approach=[
     "When the graph is dense or many all-pairs queries are needed, Floyd-Warshall computes every shortest distance in one O(n^3) sweep.",
     "Initialise the matrix with direct edges and 0 on the diagonal, then relax through each intermediate vertex k."],
   time="O(n^3)", space="O(n^2)",
   cpp="""class Solution {
public:
    vector<vector<int>> allPairs(int n, vector<vector<int>>& edges) {
        const int INF = 1e9;
        vector<vector<int>> d(n, vector<int>(n, INF));
        for (int i = 0; i < n; i++) d[i][i] = 0;
        for (auto& e : edges) d[e[0]][e[1]] = min(d[e[0]][e[1]], e[2]);
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        return d;
    }
};""",
   python="""class Solution:
    def allPairs(self, n, edges):
        INF = float('inf')
        d = [[INF] * n for _ in range(n)]
        for i in range(n):
            d[i][i] = 0
        for u, v, w in edges:
            d[u][v] = min(d[u][v], w)
        for k in range(n):
            for i in range(n):
                dik = d[i][k]
                if dik < INF:
                    row = d[i]
                    for j in range(n):
                        if dik + d[k][j] < row[j]:
                            row[j] = dik + d[k][j]
        return d"""),
 },
 "graph-bfs": {
  "bfs1": dict(approach=[
     "Scan the grid; each unvisited land cell starts a new island. Flood-fill its whole component with BFS, marking cells visited.",
     "The number of flood-fills is the island count. O(rows·cols)."],
   time="O(R·C)", space="O(R·C)",
   cpp="""class Solution {
public:
    int numIslands(vector<vector<char>>& g) {
        int R = g.size(), C = g[0].size(), count = 0;
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++)
                if (g[i][j] == '1') {
                    count++;
                    queue<pair<int,int>> q; q.push({i, j}); g[i][j] = '0';
                    while (!q.empty()) {
                        auto [r, c] = q.front(); q.pop();
                        for (int d = 0; d < 4; d++) {
                            int nr = r + dx[d], nc = c + dy[d];
                            if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] == '1') {
                                g[nr][nc] = '0'; q.push({nr, nc});
                            }
                        }
                    }
                }
        return count;
    }
};""",
   python="""from collections import deque
class Solution:
    def numIslands(self, g: list[list[str]]) -> int:
        R, C, count = len(g), len(g[0]), 0
        for i in range(R):
            for j in range(C):
                if g[i][j] == '1':
                    count += 1
                    q = deque([(i, j)]); g[i][j] = '0'
                    while q:
                        r, c = q.popleft()
                        for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == '1':
                                g[nr][nc] = '0'; q.append((nr, nc))
        return count"""),
  "bfs2": dict(approach=[
     "All rotten oranges spread simultaneously, so this is multi-source BFS: enqueue every rotten cell at time 0.",
     "Each BFS layer is one minute. Track fresh count; if any fresh remain after BFS, return -1, else the number of layers."],
   time="O(R·C)", space="O(R·C)",
   cpp="""class Solution {
public:
    int orangesRotting(vector<vector<int>>& g) {
        int R = g.size(), C = g[0].size(), fresh = 0, minutes = 0;
        queue<pair<int,int>> q;
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) {
            if (g[i][j] == 2) q.push({i, j});
            else if (g[i][j] == 1) fresh++;
        }
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!q.empty() && fresh) {
            int sz = q.size(); minutes++;
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dx[d], nc = c + dy[d];
                    if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] == 1) {
                        g[nr][nc] = 2; fresh--; q.push({nr, nc});
                    }
                }
            }
        }
        return fresh ? -1 : minutes;
    }
};""",
   python="""from collections import deque
class Solution:
    def orangesRotting(self, g: list[list[int]]) -> int:
        R, C = len(g), len(g[0])
        q, fresh = deque(), 0
        for i in range(R):
            for j in range(C):
                if g[i][j] == 2: q.append((i, j))
                elif g[i][j] == 1: fresh += 1
        minutes = 0
        while q and fresh:
            minutes += 1
            for _ in range(len(q)):
                r, c = q.popleft()
                for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                    if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 1:
                        g[nr][nc] = 2; fresh -= 1; q.append((nr, nc))
        return -1 if fresh else minutes"""),
  "bfs3": dict(approach=[
     "Each word is a node; edges connect words differing by one letter. The shortest transformation is an unweighted shortest path → BFS.",
     "Generate neighbours by replacing each position with a-z and checking the dictionary. BFS layers count the ladder length."],
   time="O(N · L^2 · 26)", space="O(N · L)",
   cpp="""class Solution {
public:
    int ladderLength(string begin, string end, vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(end)) return 0;
        queue<string> q; q.push(begin);
        int steps = 1;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                string w = q.front(); q.pop();
                if (w == end) return steps;
                for (int i = 0; i < (int)w.size(); i++) {
                    char old = w[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        w[i] = c;
                        if (dict.count(w)) { dict.erase(w); q.push(w); }
                    }
                    w[i] = old;
                }
            }
            steps++;
        }
        return 0;
    }
};""",
   python="""from collections import deque
class Solution:
    def ladderLength(self, begin, end, wordList):
        dict_ = set(wordList)
        if end not in dict_:
            return 0
        q = deque([begin])
        steps = 1
        while q:
            for _ in range(len(q)):
                w = q.popleft()
                if w == end:
                    return steps
                for i in range(len(w)):
                    for c in 'abcdefghijklmnopqrstuvwxyz':
                        nxt = w[:i] + c + w[i+1:]
                        if nxt in dict_:
                            dict_.remove(nxt); q.append(nxt)
            steps += 1
        return 0"""),
  "bfs4": dict(approach=[
     "Distance to the nearest 0 for every cell: seed a multi-source BFS with all 0-cells at distance 0.",
     "BFS expands outward in unit steps, so the first time a 1-cell is reached gives its nearest-zero distance."],
   time="O(R·C)", space="O(R·C)",
   cpp="""class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int R = mat.size(), C = mat[0].size();
        vector<vector<int>> dist(R, vector<int>(C, -1));
        queue<pair<int,int>> q;
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++)
            if (mat[i][j] == 0) { dist[i][j] = 0; q.push({i, j}); }
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; d++) {
                int nr = r + dx[d], nc = c + dy[d];
                if (nr >= 0 && nc >= 0 && nr < R && nc < C && dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1; q.push({nr, nc});
                }
            }
        }
        return dist;
    }
};""",
   python="""from collections import deque
class Solution:
    def updateMatrix(self, mat):
        R, C = len(mat), len(mat[0])
        dist = [[-1] * C for _ in range(R)]
        q = deque()
        for i in range(R):
            for j in range(C):
                if mat[i][j] == 0:
                    dist[i][j] = 0; q.append((i, j))
        while q:
            r, c = q.popleft()
            for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1:
                    dist[nr][nc] = dist[r][c] + 1; q.append((nr, nc))
        return dist"""),
  "bfs5": dict(approach=[
     "Shortest clear path with 8-directional moves on an unweighted grid → BFS from the top-left.",
     "Count cells along the path (not edges). Return -1 if start/end is blocked or no path exists."],
   time="O(n^2)", space="O(n^2)",
   cpp="""class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& g) {
        int n = g.size();
        if (g[0][0] || g[n-1][n-1]) return -1;
        queue<pair<int,int>> q; q.push({0, 0}); g[0][0] = 1;
        int dist = 1;
        while (!q.empty()) {
            int sz = q.size();
            while (sz--) {
                auto [r, c] = q.front(); q.pop();
                if (r == n - 1 && c == n - 1) return dist;
                for (int dr = -1; dr <= 1; dr++)
                    for (int dc = -1; dc <= 1; dc++) {
                        int nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nc >= 0 && nr < n && nc < n && g[nr][nc] == 0) {
                            g[nr][nc] = 1; q.push({nr, nc});
                        }
                    }
            }
            dist++;
        }
        return -1;
    }
};""",
   python="""from collections import deque
class Solution:
    def shortestPathBinaryMatrix(self, g):
        n = len(g)
        if g[0][0] or g[n-1][n-1]:
            return -1
        q = deque([(0, 0)]); g[0][0] = 1
        dist = 1
        while q:
            for _ in range(len(q)):
                r, c = q.popleft()
                if r == n - 1 and c == n - 1:
                    return dist
                for dr in (-1, 0, 1):
                    for dc in (-1, 0, 1):
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < n and 0 <= nc < n and g[nr][nc] == 0:
                            g[nr][nc] = 1; q.append((nr, nc))
            dist += 1
        return -1"""),
 },
 "graph-dfs": {
  "dfs1": dict(approach=[
     "Provinces are connected components of the friendship graph given as an adjacency matrix.",
     "DFS from each unvisited city, marking all reachable cities; each DFS launch is one province."],
   time="O(n^2)", space="O(n)",
   cpp="""class Solution {
    void dfs(int u, vector<vector<int>>& M, vector<bool>& seen) {
        seen[u] = true;
        for (int v = 0; v < (int)M.size(); v++)
            if (M[u][v] && !seen[v]) dfs(v, M, seen);
    }
public:
    int findCircleNum(vector<vector<int>>& M) {
        int n = M.size(), count = 0;
        vector<bool> seen(n, false);
        for (int i = 0; i < n; i++) if (!seen[i]) { count++; dfs(i, M, seen); }
        return count;
    }
};""",
   python="""class Solution:
    def findCircleNum(self, M: list[list[int]]) -> int:
        n = len(M)
        seen = [False] * n
        def dfs(u):
            seen[u] = True
            for v in range(n):
                if M[u][v] and not seen[v]:
                    dfs(v)
        count = 0
        for i in range(n):
            if not seen[i]:
                count += 1
                dfs(i)
        return count"""),
  "dfs2": dict(approach=[
     "Courses are takeable iff the prerequisite graph is a DAG. Detect a cycle with DFS three-colouring (white/grey/black).",
     "If DFS reaches a grey (in-progress) node, there is a back edge → cycle → impossible."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
    vector<vector<int>> adj; vector<int> state; // 0 white,1 grey,2 black
    bool cycle(int u) {
        state[u] = 1;
        for (int v : adj[u]) {
            if (state[v] == 1) return true;
            if (state[v] == 0 && cycle(v)) return true;
        }
        state[u] = 2; return false;
    }
public:
    bool canFinish(int n, vector<vector<int>>& pre) {
        adj.assign(n, {}); state.assign(n, 0);
        for (auto& p : pre) adj[p[1]].push_back(p[0]);
        for (int i = 0; i < n; i++) if (state[i] == 0 && cycle(i)) return false;
        return true;
    }
};""",
   python="""class Solution:
    def canFinish(self, n, prerequisites):
        adj = [[] for _ in range(n)]
        for a, b in prerequisites:
            adj[b].append(a)
        state = [0] * n
        def cycle(u):
            state[u] = 1
            for v in adj[u]:
                if state[v] == 1 or (state[v] == 0 and cycle(v)):
                    return True
            state[u] = 2
            return False
        return not any(state[i] == 0 and cycle(i) for i in range(n))"""),
  "dfs3": dict(approach=[
     "Water flows to an ocean if there is a non-increasing path to its border. Reverse the question: from each ocean's border, climb to cells with height >= current.",
     "DFS inward from Pacific borders and Atlantic borders separately; cells reachable from both can drain to both oceans."],
   time="O(R·C)", space="O(R·C)",
   cpp="""class Solution {
    int R, C;
    void dfs(int r, int c, vector<vector<int>>& h, vector<vector<bool>>& ocean) {
        ocean[r][c] = true;
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nr = r + dx[d], nc = c + dy[d];
            if (nr >= 0 && nc >= 0 && nr < R && nc < C && !ocean[nr][nc] && h[nr][nc] >= h[r][c])
                dfs(nr, nc, h, ocean);
        }
    }
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {
        R = h.size(); C = h[0].size();
        vector<vector<bool>> pac(R, vector<bool>(C, false)), atl(R, vector<bool>(C, false));
        for (int i = 0; i < R; i++) { dfs(i, 0, h, pac); dfs(i, C - 1, h, atl); }
        for (int j = 0; j < C; j++) { dfs(0, j, h, pac); dfs(R - 1, j, h, atl); }
        vector<vector<int>> res;
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++)
            if (pac[i][j] && atl[i][j]) res.push_back({i, j});
        return res;
    }
};""",
   python="""class Solution:
    def pacificAtlantic(self, h):
        R, C = len(h), len(h[0])
        pac = [[False] * C for _ in range(R)]
        atl = [[False] * C for _ in range(R)]
        def dfs(r, c, ocean):
            ocean[r][c] = True
            for nr, nc in ((r,c+1),(r,c-1),(r+1,c),(r-1,c)):
                if 0 <= nr < R and 0 <= nc < C and not ocean[nr][nc] and h[nr][nc] >= h[r][c]:
                    dfs(nr, nc, ocean)
        for i in range(R):
            dfs(i, 0, pac); dfs(i, C - 1, atl)
        for j in range(C):
            dfs(0, j, pac); dfs(R - 1, j, atl)
        return [[i, j] for i in range(R) for j in range(C) if pac[i][j] and atl[i][j]]"""),
  "dfs4": dict(approach=[
     "Deep-copy the graph with DFS, keeping a map from original node to its clone to handle cycles and shared neighbours.",
     "On first visit, create the clone, then recurse to clone and attach each neighbour."],
   time="O(V + E)", space="O(V)",
   cpp="""class Solution {
    unordered_map<Node*, Node*> seen;
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (seen.count(node)) return seen[node];
        Node* copy = new Node(node->val);
        seen[node] = copy;
        for (Node* nb : node->neighbors) copy->neighbors.push_back(cloneGraph(nb));
        return copy;
    }
};""",
   python="""class Solution:
    def cloneGraph(self, node):
        seen = {}
        def dfs(n):
            if not n:
                return None
            if n in seen:
                return seen[n]
            copy = Node(n.val)
            seen[n] = copy
            copy.neighbors = [dfs(nb) for nb in n.neighbors]
            return copy
        return dfs(node)"""),
  "dfs5": dict(approach=[
     "A bridge (critical connection) is an edge that lies on no cycle. Tarjan's DFS assigns each node a discovery time and a low-link = earliest reachable time.",
     "Edge (u, v) is a bridge iff low[v] > disc[u], meaning v's subtree cannot reach u or earlier without that edge."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
    vector<vector<int>> adj; vector<int> disc, low; int timer = 0;
    vector<vector<int>> bridges;
    void dfs(int u, int parent) {
        disc[u] = low[u] = ++timer;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (!disc[v]) {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                if (low[v] > disc[u]) bridges.push_back({u, v});
            } else low[u] = min(low[u], disc[v]);
        }
    }
public:
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        adj.assign(n, {}); disc.assign(n, 0); low.assign(n, 0);
        for (auto& e : connections) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        for (int i = 0; i < n; i++) if (!disc[i]) dfs(i, -1);
        return bridges;
    }
};""",
   python="""import sys
class Solution:
    def criticalConnections(self, n, connections):
        sys.setrecursionlimit(10**6)
        adj = [[] for _ in range(n)]
        for a, b in connections:
            adj[a].append(b); adj[b].append(a)
        disc = [0] * n
        low = [0] * n
        self.timer = 0
        bridges = []
        def dfs(u, parent):
            self.timer += 1
            disc[u] = low[u] = self.timer
            for v in adj[u]:
                if v == parent:
                    continue
                if not disc[v]:
                    dfs(v, u)
                    low[u] = min(low[u], low[v])
                    if low[v] > disc[u]:
                        bridges.append([u, v])
                else:
                    low[u] = min(low[u], disc[v])
        for i in range(n):
            if not disc[i]:
                dfs(i, -1)
        return bridges"""),
 },
}
