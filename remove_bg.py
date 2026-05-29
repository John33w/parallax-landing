from PIL import Image

def process():
    in_path = "/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/media__1780058909823.png"
    out_path = "/Users/christ/antigravity projects/parallax-landing/public/portal_bg.png"
    
    img = Image.open(in_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    # BFS queue
    start = (w // 2, h // 2)
    queue = [start]
    visited = set([start])
    
    def is_checkerboard(x, y):
        r, g, b, a = pixels[x, y]
        if a == 0: return True
        return (max(r, g, b) - min(r, g, b)) <= 15 and r > 180 and g > 180 and b > 180

    # Expand flood fill
    while queue:
        cx, cy = queue.pop(0)
        
        # Make transparent
        r, g, b, a = pixels[cx, cy]
        pixels[cx, cy] = (r, g, b, 0)
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h:
                if (nx, ny) not in visited:
                    if is_checkerboard(nx, ny):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    img.save(out_path)
    print("Done")

process()
