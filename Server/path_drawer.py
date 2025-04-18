import cv2
class PathDrawer:
    def draw_path(self, directions, start_cell, vertical_lines, horizontal_lines, img):
        path_img = img
        i, j = start_cell
        for d in directions:
            x1 = (vertical_lines[j] + vertical_lines[j + 1]) // 2
            y1 = (horizontal_lines[i] + horizontal_lines[i + 1]) // 2

            if d == 'L':
                j -= 1
            elif d == 'R':
                j += 1
            elif d == 'U':
                i -= 1
            elif d == 'D':
                i += 1

            x2 = (vertical_lines[j] + vertical_lines[j + 1]) // 2
            y2 = (horizontal_lines[i] + horizontal_lines[i + 1]) // 2

            cv2.line(path_img, (x1, y1), (x2, y2), (0, 255, 255), 3)

        return path_img