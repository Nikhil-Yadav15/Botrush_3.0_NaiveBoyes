from itertools import permutations  # For generating all permutations of targets (for TSP)
from collections import deque       # For BFS queue implementation
import sys    
class PathAlgorithm:
    def __init__(self, matrix):
        self.rows = len(matrix)
        self.cols = len(matrix[0])
        self.directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        self.dir_char = ['U', 'D', 'L', 'R']
        self.grid = matrix
        
    def is_valid(self, x, y):
        return 0 <= x < self.rows and 0 <= y < self.cols and self.grid[x][y] != -1

# BFS to compute shortest distance from a single source to all other reachable cells
    def bfs(self, start):
        dist = [[-1] * self.cols for _ in range(self.rows)]  # Initialize distance matrix with -1 (unreachable)
        q = deque()
        x, y = start
        dist[x][y] = 0     # Starting cell has distance 0
        q.append((x, y))   # Begin BFS from start

        while q:
            x, y = q.popleft()
            for dx, dy in self.directions: #dx,dy will be (0,1),(0,-1) etc. to visit all adjacent points
                nx, ny = x + dx, y + dy  # Compute neighbor cell
                if self.is_valid(nx, ny) and dist[nx][ny] == -1:  #valid and unvisited coords
                    dist[nx][ny] = dist[x][y] + 1
                    q.append((nx, ny))
        return dist  # Return distance matrix from start

# BFS to reconstruct the shortest path from start to end as a string of directions
    def bfs_path(self, start, end):
        visited = [[False] * self.cols for _ in range(self.rows)]      # Tracks visited cells
        parent = [[(-1, -1)] * self.cols for _ in range(self.rows)]     # Tracks parent for path reconstruction
        move = [[''] * self.cols for _ in range(self.rows)]             # Stores move direction to reach a cell

        q = deque()
        sx, sy = start
        ex, ey = end
        q.append((sx, sy))
        visited[sx][sy] = True

        # Standard BFS loop to reach the end cell
        while q:
            x, y = q.popleft()
            if (x, y) == (ex, ey):  # Exit early if destination reached
                break
            for i, (dx, dy) in enumerate(self.directions):
                nx, ny = x + dx, y + dy
                if self.is_valid(nx, ny) and not visited[nx][ny]:
                    visited[nx][ny] = True
                    parent[nx][ny] = (x, y)        # Track where we came from
                    move[nx][ny] = self.dir_char[i]     # Record direction taken
                    q.append((nx, ny))

        # Reconstruct the path if reachable
        path = []
        x, y = ex, ey
        if not visited[x][y]:  # If not visited, no path exists
            return ""
        while (x, y) != (sx, sy):
            path.append(move[x][y])       # Append movement character
            x, y = parent[x][y]           # Move to parent cell
        return ''.join(reversed(path))    # Reverse path to get correct order

        
    def main(self):
                # Prompt user to enter grid values
                
        targets = []
        for row in self.grid:
            for i in row:
                if i == 1:
                    tarcords = (self.grid.index(row),row.index(i))
                    targets.append(tarcords)
        # !-------------------- DIRECTION SETTINGS -------------------

        # Directions: up, down, left, right (for BFS movement)
        self.directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        # Corresponding direction characters for movement path
        self.dir_char = ['U', 'D', 'L', 'R']
        
        start = (self.rows - 1, 0)

        # Combine start and all target points
        points = [start] + targets
        n = len(points)  # Total points (start + all targets)

        # Initialize distance and path matrices for every pair of points
        dist_matrix = [[0] * n for _ in range(n)]
        path_matrix = [[""] * n for _ in range(n)]

        # Build both matrices: distance and actual path between every pair of points
        for i in range(n):
            dist = self.bfs(points[i])  # BFS from point i
            for j in range(n):
                dist_matrix[i][j] = dist[points[j][0]][points[j][1]]       # Store distance
                path_matrix[i][j] = self.bfs_path(points[i], points[j])         # Store actual path as string

        # Check if any target is unreachable from any other (distance = -1)
        for i in range(n):
            for j in range(n):
                if i != j and dist_matrix[i][j] == -1:
                    print("Minimum steps: -1")  # No solution possible
                    print("Path: ")             # Empty path
                    exit()

        # !------------------ TSP PERMUTATION LOGIC ------------------

        # Try all permutations of target visit order (excluding start which is fixed)
        perm_indices = list(range(1, n))  # Only target indices
        min_dist = sys.maxsize            # Initialize minimum distance
        best_path = ""                    # Store best (shortest) path as string

        # Evaluate each permutation as a potential path
        for perm in permutations(perm_indices):
            total = dist_matrix[0][perm[0]]               # Distance from start to first target
            path = path_matrix[0][perm[0]]                # Path from start to first target
            for i in range(len(perm) - 1):                # Go through each pair in the permutation
                total += dist_matrix[perm[i]][perm[i + 1]]
                path += path_matrix[perm[i]][perm[i + 1]]
            if total < min_dist:                          # If this permutation is better, update
                min_dist = total
                best_path = path

        # !---------------------- FINAL OUTPUT -----------------------
        return best_path
    