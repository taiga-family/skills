---
type: tool_used
tool: Write
input_match: '(?:color|background|background-color|border|border-color|fill|stroke|box-shadow|outline)\s*:\s*(?![^;\n]*var\()[^;\n]*(?:#[0-9a-fA-F]{3,8}\b|\brgba?\(|\b(?:crimson|red)\b)'  # a literal in a CSS value, skipping var() fallbacks
min: 0
max: 0
arm: both
---
