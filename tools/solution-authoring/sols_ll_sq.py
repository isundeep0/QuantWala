# -*- coding: utf-8 -*-
SOLS = {
 "fast-slow-pointers": {
  "fs1": dict(approach=[
     "Floyd's tortoise and hare: a slow pointer moves one step, a fast pointer two. If there is a cycle the fast pointer eventually laps the slow one and they meet.",
     "If fast reaches null, the list is acyclic. O(1) extra space, unlike a hash-set approach."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next; fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};""",
   python="""class Solution:
    def hasCycle(self, head) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False"""),
  "fs2": dict(approach=[
     "First detect a meeting point with Floyd's algorithm. Then reset one pointer to the head and advance both one step at a time.",
     "By the cycle-length math, the distance from head to the cycle entry equals the distance from the meeting point to the entry, so they meet exactly at the cycle start."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next; fast = fast->next->next;
            if (slow == fast) {
                ListNode* p = head;
                while (p != slow) { p = p->next; slow = slow->next; }
                return p;
            }
        }
        return nullptr;
    }
};""",
   python="""class Solution:
    def detectCycle(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                p = head
                while p is not slow:
                    p = p.next
                    slow = slow.next
                return p
        return None"""),
  "fs3": dict(approach=[
     "Advance slow by one and fast by two. When fast falls off the end, slow sits at the middle.",
     "For even length this returns the second of the two middle nodes, matching the problem's requirement."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        return slow;
    }
};""",
   python="""class Solution:
    def middleNode(self, head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow"""),
  "fs4": dict(approach=[
     "Repeatedly replacing n by the sum of squares of its digits either reaches 1 (happy) or loops forever. The sequence behaves like a linked list, so cycle detection applies.",
     "Use slow/fast on the digit-square function; if they meet at 1 it is happy, otherwise they meet inside a cycle."],
   time="O(log n) per step", space="O(1)",
   cpp="""class Solution {
    int sq(int n) { int s = 0; while (n) { int d = n % 10; s += d * d; n /= 10; } return s; }
public:
    bool isHappy(int n) {
        int slow = n, fast = n;
        do { slow = sq(slow); fast = sq(sq(fast)); } while (slow != fast);
        return slow == 1;
    }
};""",
   python="""class Solution:
    def isHappy(self, n: int) -> bool:
        def sq(x):
            return sum(int(c) ** 2 for c in str(x))
        slow, fast = n, sq(n)
        while slow != fast:
            slow = sq(slow)
            fast = sq(sq(fast))
        return slow == 1"""),
  "fs5": dict(approach=[
     "Treat the array as a function i -> nums[i]. Because values are in [1, n] and one is duplicated, this functional graph contains a cycle whose entry is the duplicate.",
     "Apply Floyd's cycle detection on the index sequence, then find the entry point — that index value is the repeated number. O(1) space, no array modification."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
};""",
   python="""class Solution:
    def findDuplicate(self, nums: list[int]) -> int:
        slow = fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        return slow"""),
 },
 "merge-linked-lists": {
  "ml1": dict(approach=[
     "Use a dummy head and a tail pointer. Repeatedly attach the smaller of the two current nodes and advance that list.",
     "When one list runs out, attach the remainder of the other. O(n+m), O(1) extra."],
   time="O(n + m)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* mergeTwoLists(ListNode* a, ListNode* b) {
        ListNode dummy, *t = &dummy;
        while (a && b) {
            if (a->val <= b->val) { t->next = a; a = a->next; }
            else { t->next = b; b = b->next; }
            t = t->next;
        }
        t->next = a ? a : b;
        return dummy.next;
    }
};""",
   python="""class Solution:
    def mergeTwoLists(self, a, b):
        dummy = tail = ListNode()
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next"""),
  "ml2": dict(approach=[
     "Keep a min-heap of the current head of each list. Pop the smallest, append it, and push its successor.",
     "Each of the n nodes is pushed/popped once at O(log k), giving O(n log k)."],
   time="O(n log k)", space="O(k)",
   cpp="""class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b){ return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (auto* l : lists) if (l) pq.push(l);
        ListNode dummy, *t = &dummy;
        while (!pq.empty()) {
            ListNode* n = pq.top(); pq.pop();
            t->next = n; t = n;
            if (n->next) pq.push(n->next);
        }
        return dummy.next;
    }
};""",
   python="""import heapq
class Solution:
    def mergeKLists(self, lists):
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))
        dummy = tail = ListNode()
        while heap:
            _, i, node = heapq.heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next"""),
  "ml3": dict(approach=[
     "Top-down merge sort on the list: split at the middle (slow/fast), sort both halves, and merge.",
     "Pointer rewiring keeps space at O(log n) recursion only; guaranteed O(n log n)."],
   time="O(n log n)", space="O(log n)",
   cpp="""class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode d, *t = &d;
        while (a && b) { if (a->val <= b->val) { t->next = a; a = a->next; } else { t->next = b; b = b->next; } t = t->next; }
        t->next = a ? a : b; return d.next;
    }
public:
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode *slow = head, *fast = head->next;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        ListNode* mid = slow->next; slow->next = nullptr;
        return merge(sortList(head), sortList(mid));
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
  "ml4": dict(approach=[
     "Merge in place from the back so we never overwrite unmerged values of nums1. Three pointers: ends of the real data in nums1, nums2, and the write position.",
     "Place the larger of the two tails at the write pointer and step backward. O(m+n)."],
   time="O(m + n)", space="O(1)",
   cpp="""class Solution {
public:
    void merge(vector<int>& a, int m, vector<int>& b, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && a[i] > b[j]) a[k--] = a[i--];
            else a[k--] = b[j--];
        }
    }
};""",
   python="""class Solution:
    def merge(self, a: list[int], m: int, b: list[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and a[i] > b[j]:
                a[k] = a[i]; i -= 1
            else:
                a[k] = b[j]; j -= 1
            k -= 1"""),
  "ml5": dict(approach=[
     "Digits are stored in reverse, so we can add front-to-back like grade-school addition, carrying as we go.",
     "Use a dummy head; at each step sum the two current digits plus carry, create a node with sum%10, carry sum/10. Continue while either list or carry remains."],
   time="O(max(n, m))", space="O(max(n, m))",
   cpp="""class Solution {
public:
    ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
        ListNode dummy, *t = &dummy; int carry = 0;
        while (a || b || carry) {
            int s = carry + (a ? a->val : 0) + (b ? b->val : 0);
            carry = s / 10;
            t->next = new ListNode(s % 10); t = t->next;
            if (a) a = a->next;
            if (b) b = b->next;
        }
        return dummy.next;
    }
};""",
   python="""class Solution:
    def addTwoNumbers(self, a, b):
        dummy = tail = ListNode()
        carry = 0
        while a or b or carry:
            s = carry + (a.val if a else 0) + (b.val if b else 0)
            carry = s // 10
            tail.next = ListNode(s % 10)
            tail = tail.next
            a = a.next if a else None
            b = b.next if b else None
        return dummy.next"""),
 },
 "reverse-linked-list": {
  "rl1": dict(approach=[
     "Walk the list once, flipping each node's next pointer to its predecessor. Keep prev, cur, and a saved next.",
     "When cur becomes null, prev is the new head. O(1) space."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) { ListNode* nxt = head->next; head->next = prev; prev = head; head = nxt; }
        return prev;
    }
};""",
   python="""class Solution:
    def reverseList(self, head):
        prev = None
        while head:
            nxt = head.next
            head.next = prev
            prev = head
            head = nxt
        return prev"""),
  "rl2": dict(approach=[
     "Use a dummy node and advance to the node just before position left. From there, repeatedly pull the node after the cursor to the front of the sublist (head-insertion).",
     "This reverses positions left..right in one pass without recursion."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        ListNode dummy(0, head), *prev = &dummy;
        for (int i = 1; i < left; i++) prev = prev->next;
        ListNode* cur = prev->next;
        for (int i = 0; i < right - left; i++) {
            ListNode* mv = cur->next;
            cur->next = mv->next;
            mv->next = prev->next;
            prev->next = mv;
        }
        return dummy.next;
    }
};""",
   python="""class Solution:
    def reverseBetween(self, head, left, right):
        dummy = ListNode(0, head)
        prev = dummy
        for _ in range(left - 1):
            prev = prev.next
        cur = prev.next
        for _ in range(right - left):
            mv = cur.next
            cur.next = mv.next
            mv.next = prev.next
            prev.next = mv
        return dummy.next"""),
  "rl3": dict(approach=[
     "Find the middle with slow/fast, reverse the second half in place, then compare it node-by-node against the first half.",
     "This achieves O(1) space (vs copying values to an array). Restoring the list afterward is optional."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    bool isPalindrome(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        ListNode* prev = nullptr;
        while (slow) { ListNode* nxt = slow->next; slow->next = prev; prev = slow; slow = nxt; }
        while (prev) { if (prev->val != head->val) return false; prev = prev->next; head = head->next; }
        return true;
    }
};""",
   python="""class Solution:
    def isPalindrome(self, head) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        prev = None
        while slow:
            nxt = slow.next
            slow.next = prev
            prev = slow
            slow = nxt
        while prev:
            if prev.val != head.val:
                return False
            prev = prev.next
            head = head.next
        return True"""),
  "rl4": dict(approach=[
     "Process the list in blocks of k. For each block first check that k nodes remain; if not, leave the tail as-is.",
     "Reverse each full block with the standard three-pointer reversal and stitch the reversed blocks together with a dummy node."],
   time="O(n)", space="O(1)",
   cpp="""class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0, head), *groupPrev = &dummy;
        while (true) {
            ListNode* kth = groupPrev;
            for (int i = 0; i < k && kth; i++) kth = kth->next;
            if (!kth) break;
            ListNode* groupNext = kth->next;
            ListNode *prev = groupNext, *cur = groupPrev->next;
            while (cur != groupNext) { ListNode* nxt = cur->next; cur->next = prev; prev = cur; cur = nxt; }
            ListNode* tmp = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = tmp;
        }
        return dummy.next;
    }
};""",
   python="""class Solution:
    def reverseKGroup(self, head, k):
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next
            group_next = kth.next
            prev, cur = group_next, group_prev.next
            while cur is not group_next:
                nxt = cur.next
                cur.next = prev
                prev = cur
                cur = nxt
            tmp = group_prev.next
            group_prev.next = kth
            group_prev = tmp"""),
  "rl5": dict(approach=[
     "Digits are stored most-significant first, so we cannot add front-to-back directly. Push both lists onto stacks (or reverse them) to access least-significant digits first.",
     "Pop in tandem, summing with carry, and build the result by head-insertion so the output stays most-significant first."],
   time="O(n + m)", space="O(n + m)",
   cpp="""class Solution {
public:
    ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
        stack<int> s1, s2;
        for (; a; a = a->next) s1.push(a->val);
        for (; b; b = b->next) s2.push(b->val);
        ListNode* head = nullptr; int carry = 0;
        while (!s1.empty() || !s2.empty() || carry) {
            int s = carry;
            if (!s1.empty()) { s += s1.top(); s1.pop(); }
            if (!s2.empty()) { s += s2.top(); s2.pop(); }
            carry = s / 10;
            head = new ListNode(s % 10, head);
        }
        return head;
    }
};""",
   python="""class Solution:
    def addTwoNumbers(self, a, b):
        s1, s2 = [], []
        while a: s1.append(a.val); a = a.next
        while b: s2.append(b.val); b = b.next
        head, carry = None, 0
        while s1 or s2 or carry:
            s = carry + (s1.pop() if s1 else 0) + (s2.pop() if s2 else 0)
            carry = s // 10
            head = ListNode(s % 10, head)
        return head"""),
 },
 "deque-tricks": {
  "dq1": dict(approach=[
     "Maintain a deque of indices whose values are strictly decreasing. The front is always the current window's maximum.",
     "Before recording, pop indices that slid out of the window (front) and pop smaller values from the back when a new element arrives. Each index enters/leaves once → O(n)."],
   time="O(n)", space="O(k)",
   cpp="""class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& a, int k) {
        deque<int> dq; vector<int> res;
        for (int i = 0; i < (int)a.size(); i++) {
            if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
            while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
            dq.push_back(i);
            if (i >= k - 1) res.push_back(a[dq.front()]);
        }
        return res;
    }
};""",
   python="""from collections import deque
class Solution:
    def maxSlidingWindow(self, a: list[int], k: int) -> list[int]:
        dq, res = deque(), []
        for i, x in enumerate(a):
            if dq and dq[0] <= i - k:
                dq.popleft()
            while dq and a[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if i >= k - 1:
                res.append(a[dq[0]])
        return res"""),
  "dq2": dict(approach=[
     "Work on prefix sums P. A subarray [l+1, r] has sum P[r] - P[l] >= K. For each r we want the largest l (< r) with P[l] <= P[r] - K.",
     "Keep a deque of candidate indices with increasing prefix sums. Pop the front while it satisfies the condition (recording length), and pop the back while it is not smaller than the current prefix (it can never be a better left end)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int shortestSubarray(vector<int>& a, int K) {
        int n = a.size();
        vector<long long> P(n + 1, 0);
        for (int i = 0; i < n; i++) P[i + 1] = P[i] + a[i];
        deque<int> dq; int best = n + 1;
        for (int r = 0; r <= n; r++) {
            while (!dq.empty() && P[r] - P[dq.front()] >= K) { best = min(best, r - dq.front()); dq.pop_front(); }
            while (!dq.empty() && P[dq.back()] >= P[r]) dq.pop_back();
            dq.push_back(r);
        }
        return best == n + 1 ? -1 : best;
    }
};""",
   python="""from collections import deque
class Solution:
    def shortestSubarray(self, a: list[int], K: int) -> int:
        n = len(a)
        P = [0] * (n + 1)
        for i in range(n):
            P[i + 1] = P[i] + a[i]
        dq, best = deque(), n + 1
        for r in range(n + 1):
            while dq and P[r] - P[dq[0]] >= K:
                best = min(best, r - dq.popleft())
            while dq and P[dq[-1]] >= P[r]:
                dq.pop()
            dq.append(r)
        return best if best <= n else -1"""),
  "dq3": dict(approach=[
     "Let dp[i] be the best subsequence sum ending at i. Then dp[i] = a[i] + max(0, best dp in the window [i-k, i-1]).",
     "A monotonic deque maintains the maximum dp over the sliding window of size k, giving O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int constrainedSubsetSum(vector<int>& a, int k) {
        int n = a.size(); vector<long long> dp(n);
        deque<int> dq; long long best = LLONG_MIN;
        for (int i = 0; i < n; i++) {
            if (!dq.empty() && dq.front() < i - k) dq.pop_front();
            long long take = dq.empty() ? 0 : max(0LL, dp[dq.front()]);
            dp[i] = a[i] + take;
            best = max(best, dp[i]);
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
        }
        return (int)best;
    }
};""",
   python="""from collections import deque
class Solution:
    def constrainedSubsetSum(self, a: list[int], k: int) -> int:
        n = len(a)
        dp = [0] * n
        dq = deque()
        best = float('-inf')
        for i in range(n):
            if dq and dq[0] < i - k:
                dq.popleft()
            take = max(0, dp[dq[0]]) if dq else 0
            dp[i] = a[i] + take
            best = max(best, dp[i])
            while dq and dp[dq[-1]] <= dp[i]:
                dq.pop()
            dq.append(i)
        return best"""),
  "dq4": dict(approach=[
     "dp[i] = a[i] + max(dp[i-k .. i-1]) — the best score to reach index i jumping at most k.",
     "Slide a monotonic-decreasing deque of dp values over the window so each transition is O(1)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int maxResult(vector<int>& a, int k) {
        int n = a.size(); vector<long long> dp(n);
        deque<int> dq; dp[0] = a[0]; dq.push_back(0);
        for (int i = 1; i < n; i++) {
            if (dq.front() < i - k) dq.pop_front();
            dp[i] = a[i] + dp[dq.front()];
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
        }
        return (int)dp[n - 1];
    }
};""",
   python="""from collections import deque
class Solution:
    def maxResult(self, a: list[int], k: int) -> int:
        n = len(a)
        dp = [0] * n
        dp[0] = a[0]
        dq = deque([0])
        for i in range(1, n):
            if dq[0] < i - k:
                dq.popleft()
            dp[i] = a[i] + dp[dq[0]]
            while dq and dp[dq[-1]] <= dp[i]:
                dq.pop()
            dq.append(i)
        return dp[-1]"""),
  "dq5": dict(approach=[
     "Maintain the window as an ordered multiset so the median is read from the middle position(s).",
     "Each slide inserts the entering value and removes the leaving one in O(log k). In C++ a multiset with a mid iterator works; in Python a SortedList gives O(log k) indexing."],
   time="O(n log k)", space="O(k)",
   cpp="""class Solution {
public:
    vector<double> medianSlidingWindow(vector<int>& a, int k) {
        multiset<int> win(a.begin(), a.begin() + k);
        auto mid = next(win.begin(), (k - 1) / 2);
        vector<double> res;
        for (int i = k; ; i++) {
            res.push_back(((double)*mid + *next(mid, (k + 1) % 2)) * 0.5);
            if (i == (int)a.size()) return res;
            win.insert(a[i]);
            if (a[i] < *mid) mid--;
            if (a[i - k] <= *mid) mid++;
            win.erase(win.lower_bound(a[i - k]));
        }
    }
};""",
   python="""from sortedcontainers import SortedList
class Solution:
    def medianSlidingWindow(self, a: list[int], k: int) -> list[float]:
        sl = SortedList(a[:k])
        res = []
        for i in range(k, len(a) + 1):
            if k % 2:
                res.append(float(sl[k // 2]))
            else:
                res.append((sl[k // 2 - 1] + sl[k // 2]) / 2)
            if i == len(a):
                break
            sl.remove(a[i - k])
            sl.add(a[i])
        return res"""),
 },
 "monotonic-stack": {
  "mst1": dict(approach=[
     "Precompute the next greater element for every value in nums2 using a decreasing monotonic stack: when a bigger number arrives, it resolves all smaller ones on the stack.",
     "Store results in a hash map, then answer each query from nums1 in O(1)."],
   time="O(n + m)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& q, vector<int>& nums) {
        unordered_map<int,int> nge; stack<int> st;
        for (int x : nums) {
            while (!st.empty() && st.top() < x) { nge[st.top()] = x; st.pop(); }
            st.push(x);
        }
        vector<int> res;
        for (int x : q) res.push_back(nge.count(x) ? nge[x] : -1);
        return res;
    }
};""",
   python="""class Solution:
    def nextGreaterElement(self, q: list[int], nums: list[int]) -> list[int]:
        nge, st = {}, []
        for x in nums:
            while st and st[-1] < x:
                nge[st.pop()] = x
            st.append(x)
        return [nge.get(x, -1) for x in q]"""),
  "mst2": dict(approach=[
     "Keep a stack of indices with decreasing temperatures. When a warmer day arrives, it answers every colder day still on the stack.",
     "Pop and record the gap (current index - stored index) for each resolved day. O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& t) {
        int n = t.size(); vector<int> res(n, 0); stack<int> st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && t[st.top()] < t[i]) { res[st.top()] = i - st.top(); st.pop(); }
            st.push(i);
        }
        return res;
    }
};""",
   python="""class Solution:
    def dailyTemperatures(self, t: list[int]) -> list[int]:
        res, st = [0] * len(t), []
        for i, temp in enumerate(t):
            while st and t[st[-1]] < temp:
                j = st.pop()
                res[j] = i - j
            st.append(i)
        return res"""),
  "mst3": dict(approach=[
     "For each bar, the largest rectangle using it as the height extends until a shorter bar on each side. A monotonic-increasing stack of indices finds those boundaries in one pass.",
     "When a bar shorter than the stack top arrives, pop it and compute its area using the new top as the left boundary. A sentinel 0 at the end flushes the stack."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int largestRectangleArea(vector<int>& h) {
        h.push_back(0); stack<int> st; int best = 0;
        for (int i = 0; i < (int)h.size(); i++) {
            while (!st.empty() && h[st.top()] > h[i]) {
                int height = h[st.top()]; st.pop();
                int width = st.empty() ? i : i - st.top() - 1;
                best = max(best, height * width);
            }
            st.push(i);
        }
        return best;
    }
};""",
   python="""class Solution:
    def largestRectangleArea(self, h: list[int]) -> int:
        h = h + [0]
        st, best = [], 0
        for i, height in enumerate(h):
            while st and h[st[-1]] > height:
                top = st.pop()
                width = i if not st else i - st[-1] - 1
                best = max(best, h[top] * width)
            st.append(i)
        return best"""),
  "mst4": dict(approach=[
     "A monotonic-decreasing stack of indices captures left walls. When a taller bar arrives it forms a basin with the bar below the popped one.",
     "Trapped water for each popped layer is width × (min(left, right) - bottom). O(n)."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    int trap(vector<int>& h) {
        stack<int> st; int water = 0;
        for (int i = 0; i < (int)h.size(); i++) {
            while (!st.empty() && h[i] > h[st.top()]) {
                int bottom = st.top(); st.pop();
                if (st.empty()) break;
                int width = i - st.top() - 1;
                int bounded = min(h[i], h[st.top()]) - h[bottom];
                water += width * bounded;
            }
            st.push(i);
        }
        return water;
    }
};""",
   python="""class Solution:
    def trap(self, h: list[int]) -> int:
        st, water = [], 0
        for i, x in enumerate(h):
            while st and x > h[st[-1]]:
                bottom = st.pop()
                if not st:
                    break
                width = i - st[-1] - 1
                bounded = min(x, h[st[-1]]) - h[bottom]
                water += width * bounded
            st.append(i)
        return water"""),
  "mst5": dict(approach=[
     "To make the smallest number, greedily remove a digit whenever it is larger than the next one — that earlier bigger digit hurts most. A monotonic-increasing stack does exactly this.",
     "Pop while the top exceeds the current digit and budget k remains. Trim leftover k from the end, strip leading zeros."],
   time="O(n)", space="O(n)",
   cpp="""class Solution {
public:
    string removeKdigits(string num, int k) {
        string st;
        for (char c : num) {
            while (!st.empty() && k > 0 && st.back() > c) { st.pop_back(); k--; }
            st.push_back(c);
        }
        st.resize(st.size() - k);
        int i = 0; while (i < (int)st.size() && st[i] == '0') i++;
        string res = st.substr(i);
        return res.empty() ? "0" : res;
    }
};""",
   python="""class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        st = []
        for c in num:
            while st and k > 0 and st[-1] > c:
                st.pop(); k -= 1
            st.append(c)
        st = st[:len(st) - k] if k else st
        res = ''.join(st).lstrip('0')
        return res or '0'"""),
 },
}
