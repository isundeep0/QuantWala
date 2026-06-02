# -*- coding: utf-8 -*-
SOLS = {
 "mst-kruskal": {
  "kr1": dict(approach=[
     "Build a complete graph where each edge weight is the Manhattan distance between two points, then find the MST.",
     "Kruskal sorts all O(n^2) edges and unions endpoints with DSU, skipping edges that would form a cycle, until n-1 edges are chosen."],
   time="O(n^2 log n)", space="O(n^2)",
   cpp="""struct DSU { vector<int> p, r; DSU(int n):p(n),r(n,0){iota(p.begin(),p.end(),0);} 
    int find(int x){return p[x]==x?x:p[x]=find(p[x]);}
    bool uni(int a,int b){a=find(a);b=find(b);if(a==b)return false;if(r[a]<r[b])swap(a,b);p[b]=a;if(r[a]==r[b])r[a]++;return true;} };
class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& pts) {
        int n = pts.size();
        vector<array<int,3>> edges;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                edges.push_back({abs(pts[i][0]-pts[j][0]) + abs(pts[i][1]-pts[j][1]), i, j});
        sort(edges.begin(), edges.end());
        DSU dsu(n); int cost = 0, used = 0;
        for (auto& [w, u, v] : edges) {
            if (dsu.uni(u, v)) { cost += w; if (++used == n - 1) break; }
        }
        return cost;
    }
};""",
   python="""class Solution:
    def minCostConnectPoints(self, pts: list[list[int]]) -> int:
        n = len(pts)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        edges = []
        for i in range(n):
            for j in range(i + 1, n):
                w = abs(pts[i][0]-pts[j][0]) + abs(pts[i][1]-pts[j][1])
                edges.append((w, i, j))
        edges.sort()
        cost = used = 0
        for w, u, v in edges:
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv; cost += w; used += 1
                if used == n - 1:
                    break
        return cost"""),
  "kr2": dict(approach=[
     "Classic MST: connect all cities at minimum total cost. Sort edges ascending and union endpoints with DSU.",
     "If after processing we used fewer than n-1 edges, the graph is disconnected → return -1."],
   time="O(E log E)", space="O(n)",
   cpp="""struct DSU { vector<int> p; DSU(int n):p(n){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} bool uni(int a,int b){a=find(a);b=find(b);if(a==b)return false;p[a]=b;return true;} };
class Solution {
public:
    int minimumCost(int n, vector<vector<int>>& conns) {
        sort(conns.begin(), conns.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
        DSU dsu(n + 1); int cost = 0, used = 0;
        for (auto& c : conns) if (dsu.uni(c[0], c[1])) { cost += c[2]; used++; }
        return used == n - 1 ? cost : -1;
    }
};""",
   python="""class Solution:
    def minimumCost(self, n: int, connections: list[list[int]]) -> int:
        parent = list(range(n + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        connections.sort(key=lambda c: c[2])
        cost = used = 0
        for a, b, w in connections:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb; cost += w; used += 1
        return cost if used == n - 1 else -1"""),
  "kr3": dict(approach=[
     "Digging a well in a house is modelled as an edge from a virtual node 0 to that house with the well's cost.",
     "Now every house is either connected to a neighbour by a pipe or to the 'water source' node 0. Run Kruskal on all these edges to get the cheapest way to supply water everywhere."],
   time="O(E log E)", space="O(n)",
   cpp="""struct DSU { vector<int> p; DSU(int n):p(n){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} bool uni(int a,int b){a=find(a);b=find(b);if(a==b)return false;p[a]=b;return true;} };
class Solution {
public:
    int minCostToSupplyWater(int n, vector<int>& wells, vector<vector<int>>& pipes) {
        vector<array<int,3>> edges;
        for (int i = 0; i < n; i++) edges.push_back({wells[i], 0, i + 1});
        for (auto& p : pipes) edges.push_back({p[2], p[0], p[1]});
        sort(edges.begin(), edges.end());
        DSU dsu(n + 1); int cost = 0;
        for (auto& [w, u, v] : edges) if (dsu.uni(u, v)) cost += w;
        return cost;
    }
};""",
   python="""class Solution:
    def minCostToSupplyWater(self, n, wells, pipes):
        parent = list(range(n + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        edges = [(w, 0, i + 1) for i, w in enumerate(wells)]
        edges += [(w, u, v) for u, v, w in pipes]
        edges.sort()
        cost = 0
        for w, u, v in edges:
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv; cost += w
        return cost"""),
  "kr4": dict(approach=[
     "An edge is critical if removing it increases the MST weight (or disconnects the graph); pseudo-critical if it can appear in some MST but is not critical.",
     "Compute the base MST weight. For each edge: test criticality by skipping it and rebuilding; test pseudo-criticality by forcing it in first. Sort edges but keep original indices."],
   time="O(E^2 α)", space="O(E)",
   cpp="""struct DSU { vector<int> p; int cnt; DSU(int n):p(n),cnt(n){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} bool uni(int a,int b){a=find(a);b=find(b);if(a==b)return false;p[a]=b;cnt--;return true;} };
class Solution {
    int build(int n, vector<vector<int>>& e, int skip, int force) {
        DSU dsu(n); int w = 0;
        if (force >= 0) { dsu.uni(e[force][0], e[force][1]); w += e[force][2]; }
        for (int i = 0; i < (int)e.size(); i++) {
            if (i == skip) continue;
            if (dsu.uni(e[i][0], e[i][1])) w += e[i][2];
        }
        return dsu.cnt == 1 ? w : INT_MAX;
    }
public:
    vector<vector<int>> findCriticalAndPseudoCriticalEdges(int n, vector<vector<int>>& edges) {
        int m = edges.size();
        for (int i = 0; i < m; i++) edges[i].push_back(i);
        sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
        int base = build(n, edges, -1, -1);
        vector<int> crit, pseudo;
        for (int i = 0; i < m; i++) {
            if (build(n, edges, i, -1) > base) crit.push_back(edges[i][3]);
            else if (build(n, edges, -1, i) == base) pseudo.push_back(edges[i][3]);
        }
        return {crit, pseudo};
    }
};""",
   python="""class Solution:
    def findCriticalAndPseudoCriticalEdges(self, n, edges):
        for i, e in enumerate(edges):
            e.append(i)
        order = sorted(range(len(edges)), key=lambda i: edges[i][2])
        def build(skip, force):
            parent = list(range(n)); cnt = [n]
            def find(x):
                while parent[x] != x:
                    parent[x] = parent[parent[x]]; x = parent[x]
                return x
            def uni(a, b):
                ra, rb = find(a), find(b)
                if ra == rb: return False
                parent[ra] = rb; cnt[0] -= 1; return True
            w = 0
            if force >= 0:
                u, v, ww, _ = edges[force]
                uni(u, v); w += ww
            for i in order:
                if i == skip: continue
                u, v, ww, _ = edges[i]
                if uni(u, v): w += ww
            return w if cnt[0] == 1 else float('inf')
        base = build(-1, -1)
        crit, pseudo = [], []
        for i in range(len(edges)):
            if build(i, -1) > base:
                crit.append(edges[i][3])
            elif build(-1, i) == base:
                pseudo.append(edges[i][3])
        return [crit, pseudo]"""),
  "kr5": dict(approach=[
     "Offline trick: queries 'is there a path between p and q using only edges with weight < limit' are answered by adding edges in increasing weight and unioning.",
     "Sort both edges and queries by weight/limit. Process each query after unioning all lighter edges; the answer is whether the endpoints share a DSU root."],
   time="O((E + Q) log)", space="O(n)",
   cpp="""struct DSU { vector<int> p; DSU(int n):p(n){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} void uni(int a,int b){p[find(a)]=find(b);} };
class Solution {
public:
    vector<bool> distanceLimitedPathsExist(int n, vector<vector<int>>& edges, vector<vector<int>>& queries) {
        sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
        int q = queries.size();
        vector<int> order(q); iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b){ return queries[a][2] < queries[b][2]; });
        DSU dsu(n); vector<bool> res(q); int ei = 0;
        for (int idx : order) {
            int limit = queries[idx][2];
            while (ei < (int)edges.size() && edges[ei][2] < limit) dsu.uni(edges[ei][0], edges[ei][1]), ei++;
            res[idx] = dsu.find(queries[idx][0]) == dsu.find(queries[idx][1]);
        }
        return res;
    }
};""",
   python="""class Solution:
    def distanceLimitedPathsExist(self, n, edges, queries):
        edges.sort(key=lambda e: e[2])
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        res = [False] * len(queries)
        order = sorted(range(len(queries)), key=lambda i: queries[i][2])
        ei = 0
        for idx in order:
            p, q, limit = queries[idx]
            while ei < len(edges) and edges[ei][2] < limit:
                parent[find(edges[ei][0])] = find(edges[ei][1]); ei += 1
            res[idx] = find(p) == find(q)
        return res"""),
 },
 "mst-prim": {
  "pr1": dict(approach=[
     "Prim grows the tree from one vertex, always adding the cheapest edge crossing to an unvisited point. With a complete Manhattan graph a min-heap drives the selection.",
     "Pop the nearest unvisited point, add its weight, then push its distances to remaining points."],
   time="O(n^2 log n)", space="O(n)",
   cpp="""class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& pts) {
        int n = pts.size(), cost = 0, used = 0;
        vector<bool> inMST(n, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, 0});
        while (!pq.empty() && used < n) {
            auto [w, u] = pq.top(); pq.pop();
            if (inMST[u]) continue;
            inMST[u] = true; cost += w; used++;
            for (int v = 0; v < n; v++)
                if (!inMST[v]) pq.push({abs(pts[u][0]-pts[v][0]) + abs(pts[u][1]-pts[v][1]), v});
        }
        return cost;
    }
};""",
   python="""import heapq
class Solution:
    def minCostConnectPoints(self, pts):
        n = len(pts)
        in_mst = [False] * n
        pq = [(0, 0)]
        cost = used = 0
        while pq and used < n:
            w, u = heapq.heappop(pq)
            if in_mst[u]:
                continue
            in_mst[u] = True; cost += w; used += 1
            for v in range(n):
                if not in_mst[v]:
                    d = abs(pts[u][0]-pts[v][0]) + abs(pts[u][1]-pts[v][1])
                    heapq.heappush(pq, (d, v))
        return cost"""),
  "pr2": dict(approach=[
     "Build an adjacency list and run Prim from city 1, repeatedly adding the cheapest edge to a new city via a min-heap.",
     "If we cannot include all n cities, the graph is disconnected → -1."],
   time="O(E log V)", space="O(V + E)",
   cpp="""class Solution {
public:
    int minimumCost(int n, vector<vector<int>>& conns) {
        vector<vector<pair<int,int>>> adj(n + 1);
        for (auto& c : conns) { adj[c[0]].push_back({c[1], c[2]}); adj[c[1]].push_back({c[0], c[2]}); }
        vector<bool> seen(n + 1, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, 1}); int cost = 0, used = 0;
        while (!pq.empty()) {
            auto [w, u] = pq.top(); pq.pop();
            if (seen[u]) continue;
            seen[u] = true; cost += w; used++;
            for (auto& [v, ww] : adj[u]) if (!seen[v]) pq.push({ww, v});
        }
        return used == n ? cost : -1;
    }
};""",
   python="""import heapq
class Solution:
    def minimumCost(self, n, connections):
        adj = [[] for _ in range(n + 1)]
        for a, b, w in connections:
            adj[a].append((b, w)); adj[b].append((a, w))
        seen = [False] * (n + 1)
        pq = [(0, 1)]
        cost = used = 0
        while pq:
            w, u = heapq.heappop(pq)
            if seen[u]:
                continue
            seen[u] = True; cost += w; used += 1
            for v, ww in adj[u]:
                if not seen[v]:
                    heapq.heappush(pq, (ww, v))
        return cost if used == n else -1"""),
  "pr3": dict(approach=[
     "Add a virtual node 0 connected to each house by an edge equal to that house's well cost. Then a spanning tree of this augmented graph is the cheapest water plan.",
     "Run Prim from node 0 with a min-heap over both pipe edges and well edges."],
   time="O(E log V)", space="O(V + E)",
   cpp="""class Solution {
public:
    int minCostToSupplyWater(int n, vector<int>& wells, vector<vector<int>>& pipes) {
        vector<vector<pair<int,int>>> adj(n + 1);
        for (int i = 0; i < n; i++) { adj[0].push_back({i + 1, wells[i]}); adj[i + 1].push_back({0, wells[i]}); }
        for (auto& p : pipes) { adj[p[0]].push_back({p[1], p[2]}); adj[p[1]].push_back({p[0], p[2]}); }
        vector<bool> seen(n + 1, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, 0}); int cost = 0;
        while (!pq.empty()) {
            auto [w, u] = pq.top(); pq.pop();
            if (seen[u]) continue;
            seen[u] = true; cost += w;
            for (auto& [v, ww] : adj[u]) if (!seen[v]) pq.push({ww, v});
        }
        return cost;
    }
};""",
   python="""import heapq
class Solution:
    def minCostToSupplyWater(self, n, wells, pipes):
        adj = [[] for _ in range(n + 1)]
        for i, w in enumerate(wells):
            adj[0].append((i + 1, w)); adj[i + 1].append((0, w))
        for u, v, w in pipes:
            adj[u].append((v, w)); adj[v].append((u, w))
        seen = [False] * (n + 1)
        pq = [(0, 0)]
        cost = 0
        while pq:
            w, u = heapq.heappop(pq)
            if seen[u]:
                continue
            seen[u] = True; cost += w
            for v, ww in adj[u]:
                if not seen[v]:
                    heapq.heappush(pq, (ww, v))
        return cost"""),
  "pr4": dict(approach=[
     "Generic MST via Prim: start anywhere, keep a min-heap of edges crossing the cut, and pull the lightest one that reaches a new vertex.",
     "Return the accumulated weight once all vertices are included."],
   time="O(E log V)", space="O(V + E)",
   cpp="""class Solution {
public:
    int minimumSpanningTree(int n, vector<vector<int>>& edges) {
        vector<vector<pair<int,int>>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
        vector<bool> seen(n, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, 0}); int cost = 0, used = 0;
        while (!pq.empty()) {
            auto [w, u] = pq.top(); pq.pop();
            if (seen[u]) continue;
            seen[u] = true; cost += w; used++;
            for (auto& [v, ww] : adj[u]) if (!seen[v]) pq.push({ww, v});
        }
        return used == n ? cost : -1;
    }
};""",
   python="""import heapq
class Solution:
    def minimumSpanningTree(self, n, edges):
        adj = [[] for _ in range(n)]
        for u, v, w in edges:
            adj[u].append((v, w)); adj[v].append((u, w))
        seen = [False] * n
        pq = [(0, 0)]
        cost = used = 0
        while pq:
            w, u = heapq.heappop(pq)
            if seen[u]:
                continue
            seen[u] = True; cost += w; used += 1
            for v, ww in adj[u]:
                if not seen[v]:
                    heapq.heappush(pq, (ww, v))
        return cost if used == n else -1"""),
  "pr5": dict(approach=[
     "The cheapest network build-out connecting all sites is exactly an MST. Prim accumulates the minimum total edge weight that keeps the network connected.",
     "Use a visited array plus a min-heap; each site joins via its cheapest crossing edge."],
   time="O(E log V)", space="O(V + E)",
   cpp="""class Solution {
public:
    int networkBuildCost(int n, vector<vector<int>>& edges) {
        vector<vector<pair<int,int>>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
        vector<bool> seen(n, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
        pq.push({0, 0}); int cost = 0, used = 0;
        while (!pq.empty()) {
            auto [w, u] = pq.top(); pq.pop();
            if (seen[u]) continue;
            seen[u] = true; cost += w; used++;
            for (auto& [v, ww] : adj[u]) if (!seen[v]) pq.push({ww, v});
        }
        return used == n ? cost : -1;
    }
};""",
   python="""import heapq
class Solution:
    def networkBuildCost(self, n, edges):
        adj = [[] for _ in range(n)]
        for u, v, w in edges:
            adj[u].append((v, w)); adj[v].append((u, w))
        seen = [False] * n
        pq = [(0, 0)]
        cost = used = 0
        while pq:
            w, u = heapq.heappop(pq)
            if seen[u]:
                continue
            seen[u] = True; cost += w; used += 1
            for v, ww in adj[u]:
                if not seen[v]:
                    heapq.heappush(pq, (ww, v))
        return cost if used == n else -1"""),
 },
 "scc": {
  "scc1": dict(approach=[
     "Critical connections are bridges. Tarjan's DFS computes disc[u] (discovery time) and low[u] (earliest reachable discovery time).",
     "Edge (u, v) is a bridge iff low[v] > disc[u]: v's subtree cannot reach u or above without that edge."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
    vector<vector<int>> adj; vector<int> disc, low; int timer = 0; vector<vector<int>> res;
    void dfs(int u, int parent) {
        disc[u] = low[u] = ++timer;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (!disc[v]) { dfs(v, u); low[u] = min(low[u], low[v]); if (low[v] > disc[u]) res.push_back({u, v}); }
            else low[u] = min(low[u], disc[v]);
        }
    }
public:
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& conns) {
        adj.assign(n, {}); disc.assign(n, 0); low.assign(n, 0);
        for (auto& e : conns) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        for (int i = 0; i < n; i++) if (!disc[i]) dfs(i, -1);
        return res;
    }
};""",
   python="""import sys
class Solution:
    def criticalConnections(self, n, connections):
        sys.setrecursionlimit(10**6)
        adj = [[] for _ in range(n)]
        for a, b in connections:
            adj[a].append(b); adj[b].append(a)
        disc = [0]*n; low = [0]*n; self.t = 0; res = []
        def dfs(u, p):
            self.t += 1; disc[u] = low[u] = self.t
            for v in adj[u]:
                if v == p: continue
                if not disc[v]:
                    dfs(v, u); low[u] = min(low[u], low[v])
                    if low[v] > disc[u]: res.append([u, v])
                else:
                    low[u] = min(low[u], disc[v])
        for i in range(n):
            if not disc[i]: dfs(i, -1)
        return res"""),
  "scc2": dict(approach=[
     "Kosaraju's algorithm: run a DFS pushing nodes onto a stack by finish time, then DFS the transpose graph in reverse-finish order.",
     "Each DFS tree in the second pass is one strongly connected component."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
public:
    vector<vector<int>> stronglyConnectedComponents(int n, vector<vector<int>>& edges) {
        vector<vector<int>> g(n), gt(n);
        for (auto& e : edges) { g[e[0]].push_back(e[1]); gt[e[1]].push_back(e[0]); }
        vector<bool> seen(n, false); vector<int> order;
        function<void(int)> dfs1 = [&](int u){ seen[u]=true; for(int v:g[u]) if(!seen[v]) dfs1(v); order.push_back(u); };
        for (int i = 0; i < n; i++) if (!seen[i]) dfs1(i);
        vector<vector<int>> comps; vector<bool> seen2(n, false);
        function<void(int,vector<int>&)> dfs2 = [&](int u, vector<int>& c){ seen2[u]=true; c.push_back(u); for(int v:gt[u]) if(!seen2[v]) dfs2(v, c); };
        for (int i = n - 1; i >= 0; i--) {
            int u = order[i];
            if (!seen2[u]) { vector<int> c; dfs2(u, c); comps.push_back(c); }
        }
        return comps;
    }
};""",
   python="""import sys
class Solution:
    def stronglyConnectedComponents(self, n, edges):
        sys.setrecursionlimit(10**6)
        g = [[] for _ in range(n)]; gt = [[] for _ in range(n)]
        for u, v in edges:
            g[u].append(v); gt[v].append(u)
        seen = [False]*n; order = []
        def dfs1(u):
            seen[u] = True
            for v in g[u]:
                if not seen[v]: dfs1(v)
            order.append(u)
        for i in range(n):
            if not seen[i]: dfs1(i)
        comps = []; seen2 = [False]*n
        def dfs2(u, c):
            seen2[u] = True; c.append(u)
            for v in gt[u]:
                if not seen2[v]: dfs2(v, c)
        for u in reversed(order):
            if not seen2[u]:
                c = []; dfs2(u, c); comps.append(c)
        return comps"""),
  "scc3": dict(approach=[
     "Each clause (a ∨ b) forces two implications: ¬a ⇒ b and ¬b ⇒ a. Build this implication graph over 2n literal-nodes.",
     "The formula is satisfiable iff no variable x has x and ¬x in the same SCC. Tarjan numbers SCCs in reverse topological order, so set x true when its true-literal's component comes later."],
   time="O(n + m)", space="O(n + m)",
   cpp="""class TwoSAT {
    int n; vector<vector<int>> adj; vector<int> comp, order; vector<bool> seen;
    void dfs1(int u){ seen[u]=true; for(int v:adj[u]) if(!seen[v]) dfs1(v); order.push_back(u); }
    vector<vector<int>> adjT;
    void dfs2(int u, int c){ comp[u]=c; for(int v:adjT[u]) if(comp[v]==-1) dfs2(v, c); }
public:
    TwoSAT(int vars): n(vars), adj(2*vars), adjT(2*vars) {}
    // literal (i, val): node = 2*i + (val?0:1); neg flips the low bit
    void addOr(int i, bool vi, int j, bool vj) {
        int a = 2*i + (vi?0:1), b = 2*j + (vj?0:1);
        adj[a^1].push_back(b); adj[b^1].push_back(a);
        adjT[b].push_back(a^1); adjT[a].push_back(b^1);
    }
    bool solve(vector<bool>& assign) {
        seen.assign(2*n, false);
        for (int i = 0; i < 2*n; i++) if (!seen[i]) dfs1(i);
        comp.assign(2*n, -1); int c = 0;
        for (int i = 2*n - 1; i >= 0; i--) if (comp[order[i]] == -1) dfs2(order[i], c++);
        assign.assign(n, false);
        for (int i = 0; i < n; i++) {
            if (comp[2*i] == comp[2*i+1]) return false;
            assign[i] = comp[2*i] > comp[2*i+1];
        }
        return true;
    }
};""",
   python="""import sys
class TwoSAT:
    def __init__(self, vars):
        self.n = vars
        self.adj = [[] for _ in range(2*vars)]
        self.adjT = [[] for _ in range(2*vars)]
    def add_or(self, i, vi, j, vj):       # (xi=vi) OR (xj=vj)
        a = 2*i + (0 if vi else 1)
        b = 2*j + (0 if vj else 1)
        self.adj[a ^ 1].append(b); self.adj[b ^ 1].append(a)
        self.adjT[b].append(a ^ 1); self.adjT[a].append(b ^ 1)
    def solve(self):
        sys.setrecursionlimit(10**6)
        N = 2 * self.n
        seen = [False]*N; order = []
        def dfs1(u):
            seen[u] = True
            for v in self.adj[u]:
                if not seen[v]: dfs1(v)
            order.append(u)
        for i in range(N):
            if not seen[i]: dfs1(i)
        comp = [-1]*N; c = 0
        def dfs2(u, cid):
            comp[u] = cid
            for v in self.adjT[u]:
                if comp[v] == -1: dfs2(v, cid)
        for u in reversed(order):
            if comp[u] == -1:
                dfs2(u, c); c += 1
        assign = [False]*self.n
        for i in range(self.n):
            if comp[2*i] == comp[2*i+1]:
                return None
            assign[i] = comp[2*i] > comp[2*i+1]
        return assign"""),
  "scc4": dict(approach=[
     "A mother vertex can reach every other vertex. The last vertex to finish in a DFS over all components is the only candidate (it lies in a source SCC of the condensation).",
     "Run DFS recording finish order; take the last-finished node and verify it reaches all vertices with one more DFS."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
    vector<vector<int>> adj; vector<bool> seen;
    void dfs(int u){ seen[u]=true; for(int v:adj[u]) if(!seen[v]) dfs(v); }
public:
    int findMotherVertex(int n, vector<vector<int>>& edges) {
        adj.assign(n, {});
        for (auto& e : edges) adj[e[0]].push_back(e[1]);
        seen.assign(n, false); int last = 0;
        for (int i = 0; i < n; i++) if (!seen[i]) { dfs(i); last = i; }
        seen.assign(n, false); dfs(last);
        for (int i = 0; i < n; i++) if (!seen[i]) return -1;
        return last;
    }
};""",
   python="""import sys
class Solution:
    def findMotherVertex(self, n, edges):
        sys.setrecursionlimit(10**6)
        adj = [[] for _ in range(n)]
        for u, v in edges:
            adj[u].append(v)
        seen = [False]*n
        def dfs(u):
            seen[u] = True
            for v in adj[u]:
                if not seen[v]: dfs(v)
        last = 0
        for i in range(n):
            if not seen[i]:
                dfs(i); last = i
        seen = [False]*n
        dfs(last)
        return last if all(seen) else -1"""),
  "scc5": dict(approach=[
     "Condense each SCC into a single super-node; the result is a DAG. Reachability between original nodes reduces to reachability between their components.",
     "Find SCCs (Kosaraju), map each node to its component id, build the condensation DAG, and answer reachability with a DAG traversal or transitive closure."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
public:
    vector<int> componentIds(int n, vector<vector<int>>& edges) {
        vector<vector<int>> g(n), gt(n);
        for (auto& e : edges) { g[e[0]].push_back(e[1]); gt[e[1]].push_back(e[0]); }
        vector<bool> seen(n, false); vector<int> order;
        function<void(int)> dfs1 = [&](int u){ seen[u]=true; for(int v:g[u]) if(!seen[v]) dfs1(v); order.push_back(u); };
        for (int i = 0; i < n; i++) if (!seen[i]) dfs1(i);
        vector<int> comp(n, -1); int c = 0;
        function<void(int)> dfs2 = [&](int u){ comp[u]=c; for(int v:gt[u]) if(comp[v]==-1) dfs2(v); };
        for (int i = n - 1; i >= 0; i--) if (comp[order[i]] == -1) { dfs2(order[i]); c++; }
        return comp;     // nodes with equal id are mutually reachable
    }
};""",
   python="""import sys
class Solution:
    def componentIds(self, n, edges):
        sys.setrecursionlimit(10**6)
        g = [[] for _ in range(n)]; gt = [[] for _ in range(n)]
        for u, v in edges:
            g[u].append(v); gt[v].append(u)
        seen = [False]*n; order = []
        def dfs1(u):
            seen[u] = True
            for v in g[u]:
                if not seen[v]: dfs1(v)
            order.append(u)
        for i in range(n):
            if not seen[i]: dfs1(i)
        comp = [-1]*n; c = 0
        def dfs2(u, cid):
            comp[u] = cid
            for v in gt[u]:
                if comp[v] == -1: dfs2(v, cid)
        for u in reversed(order):
            if comp[u] == -1:
                dfs2(u, c); c += 1
        return comp"""),
 },
 "topological-sort": {
  "ts1": dict(approach=[
     "Kahn's algorithm: compute in-degrees, start a queue with all zero in-degree courses, and repeatedly take a course, appending it to the order and decrementing its successors.",
     "If the produced order has fewer than n courses, a cycle exists → return empty."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
public:
    vector<int> findOrder(int n, vector<vector<int>>& pre) {
        vector<vector<int>> adj(n); vector<int> indeg(n, 0);
        for (auto& p : pre) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }
        queue<int> q;
        for (int i = 0; i < n; i++) if (!indeg[i]) q.push(i);
        vector<int> order;
        while (!q.empty()) {
            int u = q.front(); q.pop(); order.push_back(u);
            for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
        }
        return (int)order.size() == n ? order : vector<int>{};
    }
};""",
   python="""from collections import deque
class Solution:
    def findOrder(self, n, prerequisites):
        adj = [[] for _ in range(n)]
        indeg = [0]*n
        for a, b in prerequisites:
            adj[b].append(a); indeg[a] += 1
        q = deque(i for i in range(n) if indeg[i] == 0)
        order = []
        while q:
            u = q.popleft(); order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0: q.append(v)
        return order if len(order) == n else []"""),
  "ts2": dict(approach=[
     "Derive ordering constraints by comparing adjacent words: the first differing character gives an edge u → v. Watch the invalid prefix case (\"abc\" before \"ab\").",
     "Topologically sort the letters with Kahn's algorithm; a cycle means no valid order."],
   time="O(total chars)", space="O(1)",
   cpp="""class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> adj;
        unordered_map<char,int> indeg;
        for (auto& w : words) for (char c : w) indeg[c] = 0;
        for (int i = 0; i + 1 < (int)words.size(); i++) {
            string& a = words[i]; string& b = words[i + 1];
            int len = min(a.size(), b.size()), j = 0;
            for (; j < len; j++) if (a[j] != b[j]) { if (!adj[a[j]].count(b[j])) { adj[a[j]].insert(b[j]); indeg[b[j]]++; } break; }
            if (j == len && a.size() > b.size()) return "";
        }
        queue<char> q; for (auto& [c, d] : indeg) if (!d) q.push(c);
        string res;
        while (!q.empty()) {
            char c = q.front(); q.pop(); res += c;
            for (char nx : adj[c]) if (--indeg[nx] == 0) q.push(nx);
        }
        return res.size() == indeg.size() ? res : "";
    }
};""",
   python="""from collections import defaultdict, deque
class Solution:
    def alienOrder(self, words):
        adj = defaultdict(set)
        indeg = {c: 0 for w in words for c in w}
        for a, b in zip(words, words[1:]):
            for x, y in zip(a, b):
                if x != y:
                    if y not in adj[x]:
                        adj[x].add(y); indeg[y] += 1
                    break
            else:
                if len(a) > len(b):
                    return ""
        q = deque(c for c in indeg if indeg[c] == 0)
        res = []
        while q:
            c = q.popleft(); res.append(c)
            for nx in adj[c]:
                indeg[nx] -= 1
                if indeg[nx] == 0: q.append(nx)
        return "".join(res) if len(res) == len(indeg) else """""),
  "ts3": dict(approach=[
     "Each Kahn BFS layer is one semester: all currently unblocked courses can be taken together.",
     "Count layers until the queue empties; if some course never reaches in-degree 0, there is a cycle → -1."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
public:
    int minimumSemesters(int n, vector<vector<int>>& relations) {
        vector<vector<int>> adj(n + 1); vector<int> indeg(n + 1, 0);
        for (auto& r : relations) { adj[r[0]].push_back(r[1]); indeg[r[1]]++; }
        queue<int> q;
        for (int i = 1; i <= n; i++) if (!indeg[i]) q.push(i);
        int sem = 0, taken = 0;
        while (!q.empty()) {
            sem++; int sz = q.size();
            while (sz--) {
                int u = q.front(); q.pop(); taken++;
                for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
            }
        }
        return taken == n ? sem : -1;
    }
};""",
   python="""from collections import deque
class Solution:
    def minimumSemesters(self, n, relations):
        adj = [[] for _ in range(n + 1)]
        indeg = [0]*(n + 1)
        for a, b in relations:
            adj[a].append(b); indeg[b] += 1
        q = deque(i for i in range(1, n + 1) if indeg[i] == 0)
        sem = taken = 0
        while q:
            sem += 1
            for _ in range(len(q)):
                u = q.popleft(); taken += 1
                for v in adj[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0: q.append(v)
        return sem if taken == n else -1"""),
  "ts4": dict(approach=[
     "Two-level topological sort: order items within each group, and order the groups among themselves, then concatenate.",
     "Give every group-less item its own group. Build item-edges and group-edges from the before-lists, topo-sort both, then emit each group's items in their internal topo order following the group order."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
    vector<int> topo(vector<vector<int>>& adj, vector<int>& indeg) {
        queue<int> q; for (int i = 0; i < (int)indeg.size(); i++) if (!indeg[i]) q.push(i);
        vector<int> order;
        while (!q.empty()) { int u = q.front(); q.pop(); order.push_back(u); for (int v : adj[u]) if (--indeg[v] == 0) q.push(v); }
        return (int)order.size() == (int)indeg.size() ? order : vector<int>{};
    }
public:
    vector<int> sortItems(int n, int m, vector<int>& group, vector<vector<int>>& beforeItems) {
        for (int i = 0; i < n; i++) if (group[i] == -1) group[i] = m++;
        vector<vector<int>> itemAdj(n), groupAdj(m);
        vector<int> itemIn(n, 0), groupIn(m, 0);
        for (int i = 0; i < n; i++)
            for (int b : beforeItems[i]) {
                itemAdj[b].push_back(i); itemIn[i]++;
                if (group[b] != group[i]) { groupAdj[group[b]].push_back(group[i]); groupIn[group[i]]++; }
            }
        vector<int> itemOrder = topo(itemAdj, itemIn), groupOrder = topo(groupAdj, groupIn);
        if (itemOrder.empty() || groupOrder.empty()) return {};
        vector<vector<int>> byGroup(m);
        for (int it : itemOrder) byGroup[group[it]].push_back(it);
        vector<int> res;
        for (int g : groupOrder) for (int it : byGroup[g]) res.push_back(it);
        return res;
    }
};""",
   python="""from collections import deque
class Solution:
    def sortItems(self, n, m, group, beforeItems):
        for i in range(n):
            if group[i] == -1:
                group[i] = m; m += 1
        item_adj = [[] for _ in range(n)]; item_in = [0]*n
        group_adj = [[] for _ in range(m)]; group_in = [0]*m
        for i in range(n):
            for b in beforeItems[i]:
                item_adj[b].append(i); item_in[i] += 1
                if group[b] != group[i]:
                    group_adj[group[b]].append(group[i]); group_in[group[i]] += 1
        def topo(adj, indeg):
            q = deque(i for i in range(len(indeg)) if indeg[i] == 0)
            order = []
            while q:
                u = q.popleft(); order.append(u)
                for v in adj[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0: q.append(v)
            return order if len(order) == len(indeg) else []
        item_order = topo(item_adj, item_in)
        group_order = topo(group_adj, group_in)
        if not item_order or not group_order:
            return []
        by_group = [[] for _ in range(m)]
        for it in item_order:
            by_group[group[it]].append(it)
        res = []
        for g in group_order:
            res.extend(by_group[g])
        return res"""),
  "ts5": dict(approach=[
     "On a DAG the longest path is found by relaxing edges in topological order: process nodes so all predecessors are done first.",
     "dp[v] = max over incoming edges (dp[u] + w). Track the global maximum; topological order guarantees each dp is final when used."],
   time="O(V + E)", space="O(V + E)",
   cpp="""class Solution {
public:
    int longestPath(int n, vector<vector<int>>& edges) {
        vector<vector<pair<int,int>>> adj(n); vector<int> indeg(n, 0);
        for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); indeg[e[1]]++; }
        queue<int> q; for (int i = 0; i < n; i++) if (!indeg[i]) q.push(i);
        vector<int> dp(n, 0); int best = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (auto& [v, w] : adj[u]) {
                dp[v] = max(dp[v], dp[u] + w); best = max(best, dp[v]);
                if (--indeg[v] == 0) q.push(v);
            }
        }
        return best;
    }
};""",
   python="""from collections import deque
class Solution:
    def longestPath(self, n, edges):
        adj = [[] for _ in range(n)]; indeg = [0]*n
        for u, v, w in edges:
            adj[u].append((v, w)); indeg[v] += 1
        q = deque(i for i in range(n) if indeg[i] == 0)
        dp = [0]*n; best = 0
        while q:
            u = q.popleft()
            for v, w in adj[u]:
                if dp[u] + w > dp[v]:
                    dp[v] = dp[u] + w; best = max(best, dp[v])
                indeg[v] -= 1
                if indeg[v] == 0: q.append(v)
        return best"""),
 },
 "union-find": {
  "uf1": dict(approach=[
     "Provinces are connected components. Union every pair of directly-connected cities, then count distinct roots.",
     "Path compression and union by rank keep each operation near O(1)."],
   time="O(n^2 α)", space="O(n)",
   cpp="""class Solution {
    vector<int> p;
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
public:
    int findCircleNum(vector<vector<int>>& M) {
        int n = M.size(); p.resize(n); iota(p.begin(), p.end(), 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (M[i][j]) p[find(i)] = find(j);
        int count = 0;
        for (int i = 0; i < n; i++) if (find(i) == i) count++;
        return count;
    }
};""",
   python="""class Solution:
    def findCircleNum(self, M):
        n = len(M)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for i in range(n):
            for j in range(i + 1, n):
                if M[i][j]:
                    parent[find(i)] = find(j)
        return sum(1 for i in range(n) if find(i) == i)"""),
  "uf2": dict(approach=[
     "Add edges one by one with union-find. The first edge whose endpoints already share a root closes a cycle — that edge is redundant.",
     "Since exactly one extra edge exists, this single detection gives the answer."],
   time="O(n α)", space="O(n)",
   cpp="""class Solution {
    vector<int> p;
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size(); p.resize(n + 1); iota(p.begin(), p.end(), 0);
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return e;
            p[a] = b;
        }
        return {};
    }
};""",
   python="""class Solution:
    def findRedundantConnection(self, edges):
        parent = list(range(len(edges) + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for u, v in edges:
            ru, rv = find(u), find(v)
            if ru == rv:
                return [u, v]
            parent[ru] = rv
        return []"""),
  "uf3": dict(approach=[
     "Two accounts belong to the same person if they share any email. Union all emails within each account, then group emails by their root.",
     "Map each email to an owner name, collect emails per component, sort them, and prepend the name."],
   time="O(N·K log K)", space="O(N·K)",
   cpp="""class Solution {
    vector<int> p;
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
public:
    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
        unordered_map<string,int> emailId; unordered_map<string,string> owner;
        int id = 0;
        for (auto& a : accounts) for (int j = 1; j < (int)a.size(); j++)
            if (!emailId.count(a[j])) { emailId[a[j]] = id++; owner[a[j]] = a[0]; }
        p.resize(id); iota(p.begin(), p.end(), 0);
        for (auto& a : accounts)
            for (int j = 2; j < (int)a.size(); j++)
                p[find(emailId[a[j]])] = find(emailId[a[1]]);
        unordered_map<int, vector<string>> groups;
        for (auto& [email, eid] : emailId) groups[find(eid)].push_back(email);
        vector<vector<string>> res;
        for (auto& [root, emails] : groups) {
            sort(emails.begin(), emails.end());
            vector<string> acc = {owner[emails[0]]};
            acc.insert(acc.end(), emails.begin(), emails.end());
            res.push_back(acc);
        }
        return res;
    }
};""",
   python="""class Solution:
    def accountsMerge(self, accounts):
        parent = {}
        owner = {}
        def find(x):
            parent.setdefault(x, x)
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for acc in accounts:
            name = acc[0]
            for email in acc[1:]:
                owner[email] = name
                parent.setdefault(email, email)
                parent[find(email)] = find(acc[1])
        from collections import defaultdict
        groups = defaultdict(list)
        for email in owner:
            groups[find(email)].append(email)
        return [[owner[g[0]]] + sorted(g) for g in groups.values()]"""),
  "uf4": dict(approach=[
     "To connect c components you need at least c-1 extra cables. Count components and the number of spare (redundant) cables.",
     "If spare cables >= components - 1 the answer is components - 1, otherwise it is impossible (-1)."],
   time="O(n + E α)", space="O(n)",
   cpp="""class Solution {
    vector<int> p;
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
public:
    int makeConnected(int n, vector<vector<int>>& connections) {
        if ((int)connections.size() < n - 1) return -1;
        p.resize(n); iota(p.begin(), p.end(), 0);
        for (auto& c : connections) p[find(c[0])] = find(c[1]);
        int comps = 0;
        for (int i = 0; i < n; i++) if (find(i) == i) comps++;
        return comps - 1;
    }
};""",
   python="""class Solution:
    def makeConnected(self, n, connections):
        if len(connections) < n - 1:
            return -1
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for u, v in connections:
            parent[find(u)] = find(v)
        comps = sum(1 for i in range(n) if find(i) == i)
        return comps - 1"""),
  "uf5": dict(approach=[
     "Swaps are transitive: any indices linked by a chain of allowed swaps can be permuted freely. Union all swap pairs into components.",
     "Within each component, sort both the indices and their characters, then place the smallest characters at the smallest indices."],
   time="O(n log n)", space="O(n)",
   cpp="""class Solution {
    vector<int> p;
    int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
public:
    string smallestStringWithSwaps(string s, vector<vector<int>>& pairs) {
        int n = s.size(); p.resize(n); iota(p.begin(), p.end(), 0);
        for (auto& pr : pairs) p[find(pr[0])] = find(pr[1]);
        unordered_map<int, vector<int>> groups;
        for (int i = 0; i < n; i++) groups[find(i)].push_back(i);
        string res = s;
        for (auto& [root, idx] : groups) {
            string chars;
            for (int i : idx) chars += s[i];
            sort(chars.begin(), chars.end());
            for (int k = 0; k < (int)idx.size(); k++) res[idx[k]] = chars[k];
        }
        return res;
    }
};""",
   python="""class Solution:
    def smallestStringWithSwaps(self, s, pairs):
        n = len(s)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]; x = parent[x]
            return x
        for a, b in pairs:
            parent[find(a)] = find(b)
        from collections import defaultdict
        groups = defaultdict(list)
        for i in range(n):
            groups[find(i)].append(i)
        res = list(s)
        for idx in groups.values():
            chars = sorted(res[i] for i in idx)
            for k, i in enumerate(sorted(idx)):
                res[i] = chars[k]
        return "".join(res)"""),
 },
}
