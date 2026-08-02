#!/usr/bin/env python3
"""Inline every local asset into one shareable file. Re-run after any edit."""
import re, os
h = open("index.html", encoding="utf-8").read()

def css(m):
    p = m.group(1)
    return "<style>\n"+open(p,encoding="utf-8").read()+"\n</style>" if os.path.exists(p) else m.group(0)
def js(m):
    p = m.group(1)
    return "<script>\n"+open(p,encoding="utf-8").read()+"\n</script>" if os.path.exists(p) else m.group(0)

h = re.sub(r'<link[^>]+href="(assets/[^"]+\.css)"[^>]*>', css, h)
h = re.sub(r'<script src="(assets/[^"]+\.js)"></script>', js, h)

open("WePayForJunk-preview.html","w",encoding="utf-8").write(h)
left = re.findall(r'(?:href|src)="assets/[^"]*"', h)
print(f"preview: {len(h)/1024:.1f} KB · not inlined: {left or 'none'}")
