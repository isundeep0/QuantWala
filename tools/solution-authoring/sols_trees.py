# -*- coding: utf-8 -*-
SOLS = {
 "lca": {
  "lca1": dict(approach=[
     "Recurse from the root. If the current node is null or equals p or q, return it.",
     "Recurse left and right: if both sides return non-null, the current node is the split point (the LCA); otherwise propagate the single non-null side upward."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* L = lowestCommonAncestor(root->left, p, q);
        TreeNode* R = lowestCommonAncestor(root->right, p, q);
        if (L && R) return root;
        return L ? L : R;
    }
};""",
   python="""class Solution:
    def lowestCommonAncestor(self, root, p, q):
        if not root or root == p or root == q:
            return root
        L = self.lowestCommonAncestor(root.left, p, q)
        R = self.lowestCommonAncestor(root.right, p, q)
        if L and R:
            return root
        return L or R"""),
  "lca2": dict(approach=[
     "In a BST the LCA is the first node where p and q split. Walk down from the root.",
     "If both values are smaller go left, if both larger go right; otherwise the current node sits between them and is the LCA."],
   time="O(h)", space="O(1)",
   cpp="""class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        while (root) {
            if (p->val < root->val && q->val < root->val) root = root->left;
            else if (p->val > root->val && q->val > root->val) root = root->right;
            else return root;
        }
        return nullptr;
    }
};""",
   python="""class Solution:
    def lowestCommonAncestor(self, root, p, q):
        while root:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif p.val > root.val and q.val > root.val:
                root = root.right
            else:
                return root
        return None"""),
  "lca3": dict(approach=[
     "With parent pointers, the LCA is the first common node on the two upward chains — exactly the linked-list intersection trick.",
     "Two pointers walk up; when one hits the root, redirect it to the other node. They meet at the LCA after at most depth(p)+depth(q) steps."],
   time="O(h)", space="O(1)",
   cpp="""class Solution {
public:
    Node* lowestCommonAncestor(Node* p, Node* q) {
        Node *a = p, *b = q;
        while (a != b) {
            a = a ? a->parent : q;
            b = b ? b->parent : p;
        }
        return a;
    }
};""",
   python="""class Solution:
    def lowestCommonAncestor(self, p, q):
        a, b = p, q
        while a is not b:
            a = a.parent if a else q
            b = b.parent if b else p
        return a"""),
  "lca4": dict(approach=[
     "Distance(p, q) = depth(p) + depth(q) - 2·depth(lca), measuring edges through their lowest common ancestor.",
     "Find the LCA, then the distance from it to each node by a short search. Equivalent to summing the two downward path lengths."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    TreeNode* lca(TreeNode* r, int p, int q) {
        if (!r || r->val == p || r->val == q) return r;
        TreeNode* L = lca(r->left, p, q); TreeNode* R = lca(r->right, p, q);
        if (L && R) return r; return L ? L : R;
    }
    int depth(TreeNode* r, int target, int d) {
        if (!r) return -1;
        if (r->val == target) return d;
        int l = depth(r->left, target, d + 1); if (l != -1) return l;
        return depth(r->right, target, d + 1);
    }
public:
    int distanceBetween(TreeNode* root, int p, int q) {
        TreeNode* a = lca(root, p, q);
        return depth(a, p, 0) + depth(a, q, 0);
    }
};""",
   python="""class Solution:
    def distanceBetween(self, root, p, q):
        def lca(r):
            if not r or r.val in (p, q):
                return r
            L, R = lca(r.left), lca(r.right)
            if L and R:
                return r
            return L or R
        def depth(r, target, d):
            if not r:
                return -1
            if r.val == target:
                return d
            left = depth(r.left, target, d + 1)
            return left if left != -1 else depth(r.right, target, d + 1)
        a = lca(root)
        return depth(a, p, 0) + depth(a, q, 0)"""),
  "lca5": dict(approach=[
     "Binary lifting precomputes up[j][v] = the 2^j-th ancestor of v. Any kth ancestor is reached by jumping the set bits of k.",
     "Building the table is O(n log n); each query decomposes k into powers of two for O(log k)."],
   time="O(n log n) build, O(log k) query", space="O(n log n)",
   cpp="""class TreeAncestor {
    vector<vector<int>> up; int LOG;
public:
    TreeAncestor(int n, vector<int>& parent) {
        LOG = 1; while ((1 << LOG) < n) LOG++;
        up.assign(LOG, vector<int>(n, -1));
        for (int v = 0; v < n; v++) up[0][v] = parent[v];
        for (int j = 1; j < LOG; j++)
            for (int v = 0; v < n; v++)
                up[j][v] = up[j-1][v] == -1 ? -1 : up[j-1][up[j-1][v]];
    }
    int getKthAncestor(int node, int k) {
        for (int j = 0; j < LOG && node != -1; j++)
            if (k & (1 << j)) node = up[j][node];
        return node;
    }
};""",
   python="""class TreeAncestor:
    def __init__(self, n: int, parent: list[int]):
        self.LOG = max(1, (n).bit_length())
        self.up = [[-1] * n for _ in range(self.LOG)]
        self.up[0] = parent[:]
        for j in range(1, self.LOG):
            for v in range(n):
                p = self.up[j - 1][v]
                self.up[j][v] = -1 if p == -1 else self.up[j - 1][p]
    def getKthAncestor(self, node: int, k: int) -> int:
        j = 0
        while k and node != -1:
            if k & 1:
                node = self.up[j][node]
            k >>= 1
            j += 1
        return node"""),
 },
 "tree-diameter": {
  "td1": dict(approach=[
     "The diameter through a node equals leftHeight + rightHeight. Run a post-order that returns each subtree's height while updating a global best.",
     "Height = 1 + max(childHeights); diameter is measured in edges, so the answer is the largest left+right height seen."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int best = 0;
    int height(TreeNode* r) {
        if (!r) return 0;
        int L = height(r->left), R = height(r->right);
        best = max(best, L + R);
        return 1 + max(L, R);
    }
public:
    int diameterOfBinaryTree(TreeNode* root) { height(root); return best; }
};""",
   python="""class Solution:
    def diameterOfBinaryTree(self, root) -> int:
        self.best = 0
        def height(r):
            if not r:
                return 0
            L, R = height(r.left), height(r.right)
            self.best = max(self.best, L + R)
            return 1 + max(L, R)
        height(root)
        return self.best"""),
  "td2": dict(approach=[
     "Like diameter, but with values: the best path through a node is node.val + max(0,left gain) + max(0,right gain).",
     "Each call returns the best downward gain a parent can extend (node.val + max child gain, clamped at 0). Track the global maximum path."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int best = INT_MIN;
    int gain(TreeNode* r) {
        if (!r) return 0;
        int L = max(0, gain(r->left)), R = max(0, gain(r->right));
        best = max(best, r->val + L + R);
        return r->val + max(L, R);
    }
public:
    int maxPathSum(TreeNode* root) { gain(root); return best; }
};""",
   python="""class Solution:
    def maxPathSum(self, root) -> int:
        self.best = float('-inf')
        def gain(r):
            if not r:
                return 0
            L = max(0, gain(r.left))
            R = max(0, gain(r.right))
            self.best = max(self.best, r.val + L + R)
            return r.val + max(L, R)
        gain(root)
        return self.best"""),
  "td3": dict(approach=[
     "Same shape as diameter, but a child only contributes if its value equals the current node's value.",
     "Each call returns the longest same-value arm downward; the answer is the largest left arm + right arm in edges."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int best = 0;
    int arm(TreeNode* r) {
        if (!r) return 0;
        int L = arm(r->left), R = arm(r->right);
        int la = (r->left && r->left->val == r->val) ? L + 1 : 0;
        int ra = (r->right && r->right->val == r->val) ? R + 1 : 0;
        best = max(best, la + ra);
        return max(la, ra);
    }
public:
    int longestUnivaluePath(TreeNode* root) { arm(root); return best; }
};""",
   python="""class Solution:
    def longestUnivaluePath(self, root) -> int:
        self.best = 0
        def arm(r):
            if not r:
                return 0
            L, R = arm(r.left), arm(r.right)
            la = L + 1 if r.left and r.left.val == r.val else 0
            ra = R + 1 if r.right and r.right.val == r.val else 0
            self.best = max(self.best, la + ra)
            return max(la, ra)
        arm(root)
        return self.best"""),
  "td4": dict(approach=[
     "For a general (unrooted) tree, the diameter is found with two BFS/DFS sweeps: from any node find the farthest node u, then from u find the farthest node v.",
     "The distance u→v is the diameter. Correctness follows because the farthest node from anywhere is always an endpoint of some longest path."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
    pair<int,int> bfs(int src, vector<vector<int>>& adj) {
        int n = adj.size(); vector<int> dist(n, -1); queue<int> q;
        dist[src] = 0; q.push(src); int far = src;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            if (dist[u] > dist[far]) far = u;
            for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
        }
        return {far, dist[far]};
    }
public:
    int treeDiameter(vector<vector<int>>& edges) {
        int n = edges.size() + 1;
        vector<vector<int>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        auto [u, _] = bfs(0, adj);
        auto [v, d] = bfs(u, adj);
        return d;
    }
};""",
   python="""from collections import deque
class Solution:
    def treeDiameter(self, edges: list[list[int]]) -> int:
        n = len(edges) + 1
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b); adj[b].append(a)
        def bfs(src):
            dist = [-1] * n
            dist[src] = 0
            q = deque([src]); far = src
            while q:
                u = q.popleft()
                if dist[u] > dist[far]:
                    far = u
                for v in adj[u]:
                    if dist[v] == -1:
                        dist[v] = dist[u] + 1; q.append(v)
            return far, dist[far]
        u, _ = bfs(0)
        v, d = bfs(u)
        return d"""),
  "td5": dict(approach=[
     "The roots that minimise height are the 1 or 2 centroids of the tree. Peel leaves layer by layer (topological trimming).",
     "Repeatedly remove all current leaves; the last 1–2 nodes remaining are the answer."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> findMinHeightTrees(int n, vector<vector<int>>& edges) {
        if (n == 1) return {0};
        vector<vector<int>> adj(n); vector<int> deg(n, 0);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); deg[e[0]]++; deg[e[1]]++; }
        queue<int> q;
        for (int i = 0; i < n; i++) if (deg[i] == 1) q.push(i);
        int remaining = n;
        while (remaining > 2) {
            int sz = q.size(); remaining -= sz;
            while (sz--) {
                int u = q.front(); q.pop();
                for (int v : adj[u]) if (--deg[v] == 1) q.push(v);
            }
        }
        vector<int> res;
        while (!q.empty()) { res.push_back(q.front()); q.pop(); }
        return res;
    }
};""",
   python="""from collections import deque
class Solution:
    def findMinHeightTrees(self, n: int, edges: list[list[int]]) -> list[int]:
        if n == 1:
            return [0]
        adj = [[] for _ in range(n)]
        deg = [0] * n
        for a, b in edges:
            adj[a].append(b); adj[b].append(a); deg[a] += 1; deg[b] += 1
        q = deque(i for i in range(n) if deg[i] == 1)
        remaining = n
        while remaining > 2:
            for _ in range(len(q)):
                u = q.popleft()
                remaining -= 1
                for v in adj[u]:
                    deg[v] -= 1
                    if deg[v] == 1:
                        q.append(v)
        return list(q)"""),
 },
 "tree-dp": {
  "tdp1": dict(approach=[
     "Each node returns two values: the best total if we rob it (val + skip children) and the best if we skip it (max of child's rob/skip).",
     "The answer at the root is max(rob, skip). Classic tree DP with a pair return."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    pair<int,int> dfs(TreeNode* r) {     // {rob, skip}
        if (!r) return {0, 0};
        auto [lr, ls] = dfs(r->left);
        auto [rr, rs] = dfs(r->right);
        int rob = r->val + ls + rs;
        int skip = max(lr, ls) + max(rr, rs);
        return {rob, skip};
    }
public:
    int rob(TreeNode* root) { auto [a, b] = dfs(root); return max(a, b); }
};""",
   python="""class Solution:
    def rob(self, root) -> int:
        def dfs(r):
            if not r:
                return (0, 0)
            lr, ls = dfs(r.left)
            rr, rs = dfs(r.right)
            rob = r.val + ls + rs
            skip = max(lr, ls) + max(rr, rs)
            return (rob, skip)
        return max(dfs(root))"""),
  "tdp2": dict(approach=[
     "Post-order with three states per node: 0 = needs coverage, 1 = covered without a camera, 2 = has a camera.",
     "If any child needs coverage, place a camera here (state 2). If any child has a camera, this node is covered (state 1). Otherwise it needs coverage (state 0). Count cameras; cover the root if it ends in state 0."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int cameras = 0;
    int dfs(TreeNode* r) {                 // 0 need, 1 covered, 2 camera
        if (!r) return 1;
        int L = dfs(r->left), R = dfs(r->right);
        if (L == 0 || R == 0) { cameras++; return 2; }
        if (L == 2 || R == 2) return 1;
        return 0;
    }
public:
    int minCameraCover(TreeNode* root) {
        if (dfs(root) == 0) cameras++;
        return cameras;
    }
};""",
   python="""class Solution:
    def minCameraCover(self, root) -> int:
        self.cameras = 0
        def dfs(r):
            if not r:
                return 1
            L, R = dfs(r.left), dfs(r.right)
            if L == 0 or R == 0:
                self.cameras += 1
                return 2
            if L == 2 or R == 2:
                return 1
            return 0
        if dfs(root) == 0:
            self.cameras += 1
        return self.cameras"""),
  "tdp3": dict(approach=[
     "A node is good if no node on the path from the root to it has a greater value. Carry the running maximum down the recursion.",
     "Increment the count when the current value is >= the path maximum, then recurse with an updated maximum."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int dfs(TreeNode* r, int mx) {
        if (!r) return 0;
        int good = r->val >= mx ? 1 : 0;
        int nm = max(mx, r->val);
        return good + dfs(r->left, nm) + dfs(r->right, nm);
    }
public:
    int goodNodes(TreeNode* root) { return dfs(root, INT_MIN); }
};""",
   python="""class Solution:
    def goodNodes(self, root) -> int:
        def dfs(r, mx):
            if not r:
                return 0
            good = 1 if r.val >= mx else 0
            nm = max(mx, r.val)
            return good + dfs(r.left, nm) + dfs(r.right, nm)
        return dfs(root, float('-inf'))"""),
  "tdp4": dict(approach=[
     "Each node must end with exactly one coin. A subtree's 'balance' = total coins - node count; coins equal to that balance must flow across the edge to the parent.",
     "Sum the absolute balances of all edges — each unit is one move. Post-order returns the running balance."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    int moves = 0;
    int dfs(TreeNode* r) {
        if (!r) return 0;
        int L = dfs(r->left), R = dfs(r->right);
        moves += abs(L) + abs(R);
        return r->val - 1 + L + R;
    }
public:
    int distributeCoins(TreeNode* root) { dfs(root); return moves; }
};""",
   python="""class Solution:
    def distributeCoins(self, root) -> int:
        self.moves = 0
        def dfs(r):
            if not r:
                return 0
            L, R = dfs(r.left), dfs(r.right)
            self.moves += abs(L) + abs(R)
            return r.val - 1 + L + R
        dfs(root)
        return self.moves"""),
  "tdp5": dict(approach=[
     "Rerooting in two DFS passes. First pass (post-order) computes subtree sizes and the answer for the root: sum of depths.",
     "Second pass (pre-order) shifts the root along each edge: moving from parent u to child v adds (n - size[v]) nodes one step farther and brings size[v] nodes one step closer, so ans[v] = ans[u] + n - 2·size[v]."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
    vector<vector<int>> adj; vector<int> sz, ans;
    void dfs1(int u, int p, int depth, long long& rootSum) {
        sz[u] = 1; rootSum += depth;
        for (int v : adj[u]) if (v != p) { dfs1(v, u, depth + 1, rootSum); sz[u] += sz[v]; }
    }
    void dfs2(int u, int p, int n) {
        for (int v : adj[u]) if (v != p) { ans[v] = ans[u] + n - 2 * sz[v]; dfs2(v, u, n); }
    }
public:
    vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
        adj.assign(n, {}); sz.assign(n, 0); ans.assign(n, 0);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        long long rootSum = 0; dfs1(0, -1, 0, rootSum); ans[0] = (int)rootSum;
        dfs2(0, -1, n);
        return ans;
    }
};""",
   python="""import sys
class Solution:
    def sumOfDistancesInTree(self, n: int, edges: list[list[int]]) -> list[int]:
        sys.setrecursionlimit(10**6)
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b); adj[b].append(a)
        sz = [1] * n
        ans = [0] * n
        def dfs1(u, p, depth):
            ans[0] += depth
            for v in adj[u]:
                if v != p:
                    dfs1(v, u, depth + 1)
                    sz[u] += sz[v]
        def dfs2(u, p):
            for v in adj[u]:
                if v != p:
                    ans[v] = ans[u] + n - 2 * sz[v]
                    dfs2(v, u)
        dfs1(0, -1, 0)
        dfs2(0, -1)
        return ans"""),
 },
 "tree-traversals": {
  "tt1": dict(approach=[
     "Inorder = left, node, right. Iteratively push all left descendants, then pop to visit and move to the right child.",
     "A stack replaces recursion; each node is pushed and popped once."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res; stack<TreeNode*> st; TreeNode* cur = root;
        while (cur || !st.empty()) {
            while (cur) { st.push(cur); cur = cur->left; }
            cur = st.top(); st.pop();
            res.push_back(cur->val);
            cur = cur->right;
        }
        return res;
    }
};""",
   python="""class Solution:
    def inorderTraversal(self, root) -> list[int]:
        res, st, cur = [], [], root
        while cur or st:
            while cur:
                st.append(cur)
                cur = cur.left
            cur = st.pop()
            res.append(cur.val)
            cur = cur.right
        return res"""),
  "tt2": dict(approach=[
     "Breadth-first with a queue. Process one full level at a time by capturing the queue's size before the loop.",
     "Append each level's values as a sub-list."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res; if (!root) return res;
        queue<TreeNode*> q; q.push(root);
        while (!q.empty()) {
            int sz = q.size(); vector<int> level;
            while (sz--) {
                TreeNode* n = q.front(); q.pop();
                level.push_back(n->val);
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
            res.push_back(level);
        }
        return res;
    }
};""",
   python="""from collections import deque
class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                n = q.popleft()
                level.append(n.val)
                if n.left: q.append(n.left)
                if n.right: q.append(n.right)
            res.append(level)
        return res"""),
  "tt3": dict(approach=[
     "A BST is valid iff an inorder traversal is strictly increasing, or equivalently every node lies within a (low, high) bound inherited from ancestors.",
     "Recurse passing tightened bounds: left child must be < node, right child > node."],
   time="O(n)", space="O(h)",
   cpp="""class Solution {
    bool valid(TreeNode* r, long long lo, long long hi) {
        if (!r) return true;
        if (r->val <= lo || r->val >= hi) return false;
        return valid(r->left, lo, r->val) && valid(r->right, r->val, hi);
    }
public:
    bool isValidBST(TreeNode* root) { return valid(root, LLONG_MIN, LLONG_MAX); }
};""",
   python="""class Solution:
    def isValidBST(self, root) -> bool:
        def valid(r, lo, hi):
            if not r:
                return True
            if not (lo < r.val < hi):
                return False
            return valid(r.left, lo, r.val) and valid(r.right, r.val, hi)
        return valid(root, float('-inf'), float('inf'))"""),
  "tt4": dict(approach=[
     "The first preorder element is the root; its position in inorder splits left and right subtrees.",
     "Use a hash map of value→inorder index and a moving preorder pointer to build the tree recursively in O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
    unordered_map<int,int> pos; int idx = 0; vector<int> pre;
    TreeNode* build(vector<int>& in, int lo, int hi) {
        if (lo > hi) return nullptr;
        int rootVal = pre[idx++];
        TreeNode* root = new TreeNode(rootVal);
        int mid = pos[rootVal];
        root->left = build(in, lo, mid - 1);
        root->right = build(in, mid + 1, hi);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        pre = preorder;
        for (int i = 0; i < (int)inorder.size(); i++) pos[inorder[i]] = i;
        return build(inorder, 0, inorder.size() - 1);
    }
};""",
   python="""class Solution:
    def buildTree(self, preorder, inorder):
        pos = {v: i for i, v in enumerate(inorder)}
        self.idx = 0
        def build(lo, hi):
            if lo > hi:
                return None
            val = preorder[self.idx]
            self.idx += 1
            root = TreeNode(val)
            mid = pos[val]
            root.left = build(lo, mid - 1)
            root.right = build(mid + 1, hi)
            return root
        return build(0, len(inorder) - 1)"""),
  "tt5": dict(approach=[
     "The right side view is the last node seen at each level in a BFS.",
     "Do level-order traversal and record the final node of every level. (A right-first DFS tracking depth also works.)"],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> res; if (!root) return res;
        queue<TreeNode*> q; q.push(root);
        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                TreeNode* n = q.front(); q.pop();
                if (i == sz - 1) res.push_back(n->val);
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
        }
        return res;
    }
};""",
   python="""from collections import deque
class Solution:
    def rightSideView(self, root) -> list[int]:
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            sz = len(q)
            for i in range(sz):
                n = q.popleft()
                if i == sz - 1:
                    res.append(n.val)
                if n.left: q.append(n.left)
                if n.right: q.append(n.right)
        return res"""),
 },
}
