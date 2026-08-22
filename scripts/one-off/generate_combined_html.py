import re

with open('/Users/cwb/Downloads/Gemini32c7f.txt', 'r') as f:
    raw_text = f.read()

v1_end = raw_text.find(">>>>>>>>>>>>>>>>>>>>>>")
if v1_end == -1:
    v1_end = raw_text.find(">>>>>>>>>>>>>>")
v1_code = raw_text[:v1_end]

# Extract everything from the start of the V2 code block
v2_start_idx = raw_text.find("import React", v1_end)
if v2_start_idx == -1: # fallback
    v2_start_idx = raw_text.find("const COLORS", v1_end)

v2_code_full = raw_text[v2_start_idx:]
v2_end = v2_code_full.find(">>>>>>>>>>>>>>")
if v2_end == -1:
    v2_end = len(v2_code_full)
v2_code = v2_code_full[:v2_end]

# Regex pattern for multiline imports
import_pattern = r'import\s+.*?\s+from\s+[\'"][^\'"]+[\'"];?'

# Clean v1
v1_clean = re.sub(import_pattern, '', v1_code, flags=re.DOTALL)
v1_clean = re.sub(r'https://gemini\.google\.com/app/.*', '', v1_clean)
v1_clean = v1_clean.replace("export default function", "function")

# Clean v2
# We remove imports
v2_clean = re.sub(import_pattern, '', v2_code, flags=re.DOTALL)
# We remove the definition of COLORS as it's already in v1
v2_clean = re.sub(r'const\s+COLORS\s*=\s*\{[\s\S]*?\};', '', v2_clean)
v2_clean = v2_clean.replace("export default function", "function")

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate Creator Widgets</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        body {{ margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #e5e5e5; }}
        .custom-scrollbar::-webkit-scrollbar {{ width: 6px; }}
        .custom-scrollbar::-webkit-scrollbar-track {{ background: transparent; }}
        .custom-scrollbar::-webkit-scrollbar-thumb {{ background: #000; border-radius: 10px; }}
        .inset-shadow {{ box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.1); }}
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel" data-type="module">
        // --- React Hooks ---
        const {{ useState, useEffect, useRef }} = React;

        // --- Mock Lucide Icons ---
        const createIcon = (name) => {{
            return ({{ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }}) => {{
                if (!lucide.icons[name]) return null;
                const iconHtml = lucide.icons[name].toSvg({{ width: size, height: size, color, 'stroke-width': strokeWidth, class: className }});
                return <span dangerouslySetInnerHTML={{{{ __html: iconHtml }}}} className={{className}} />;
            }};
        }};

        const Activity = createIcon('activity');
        const TrendingDown = createIcon('trending-down');
        const Users = createIcon('users');
        const DollarSign = createIcon('dollar-sign');
        const ArrowUpRight = createIcon('arrow-up-right');
        const Target = createIcon('target');
        const Sparkles = createIcon('sparkles');
        const Crosshair = createIcon('crosshair');
        const BarChart2 = createIcon('bar-chart-2');
        const MessageCircle = createIcon('message-circle');
        const CalendarDays = createIcon('calendar-days');
        const AlignLeft = createIcon('align-left');
        const CheckSquare = createIcon('check-square');
        const ImageIcon = createIcon('image');
        const MessageSquareHeart = createIcon('message-square-heart');
        const Trophy = createIcon('trophy');
        const Link = createIcon('link');
        const ShoppingBag = createIcon('shopping-bag');
        const Share2 = createIcon('share-2');
        const Clock = createIcon('clock');
        const Mic2 = createIcon('mic-2');
        const Star = createIcon('star');
        const Zap = createIcon('zap');
        const SplitSquareHorizontal = createIcon('split-square-horizontal');
        const Leaf = createIcon('leaf');
        const FileText = createIcon('file-text');
        const Megaphone = createIcon('megaphone');
        const Volume2 = createIcon('volume-2');
        const Briefcase = createIcon('briefcase');
        const Rocket = createIcon('rocket');
        const Plus = createIcon('plus');
        const Check = createIcon('check');
        const X = createIcon('x');
        const Play = createIcon('play');
        const BarChart = createIcon('bar-chart');
        const Layers = createIcon('layers');
        const Type = createIcon('type');
        const Palette = createIcon('palette');
        const Ghost = createIcon('ghost');
        const Eye = createIcon('eye');
        const Maximize = createIcon('maximize');
        const MousePointer2 = createIcon('mouse-pointer-2');
        const Youtube = createIcon('youtube');
        const Heart = createIcon('heart');

        {v1_clean}

        {v2_clean}

        const App = () => (
            <div className="flex flex-col gap-8 pb-20">
                <CreatorToolbox />
                <AdvancedCreatorTools />
            </div>
        );

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
"""

with open('/Users/cwb/Downloads/ultimate-widgets-combined.html', 'w') as f:
    f.write(html_template)
print("done")
