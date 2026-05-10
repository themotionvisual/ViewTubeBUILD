const fs = require('fs');

const rawText = fs.readFileSync('/Users/cwb/Downloads/Gemini32c7f.txt', 'utf8');

const v1Start = rawText.indexOf("const COLORS = {");
const v1EndMarker = "export default function CreatorToolbox() {";
const v1End = rawText.indexOf(">>>>>>>>>>>>>>>>>>>>>>");

const v1Code = rawText.substring(0, v1End);

const v2StartMarker = "export default function AdvancedCreatorTools() {";
const v2CodeFull = rawText.substring(v1End);
const v2End = v2CodeFull.indexOf(">>>>>>>>>>>>>>");
const v2Code = v2CodeFull.substring(0, v2End);

// For V1, we strip imports
const v1Clean = v1Code.replace(/import .*? from '.*?';/g, '').replace(/https:\/\/gemini\.google\.com\/app\/.*/g, '');

// For V2, we strip imports and the duplicate COLORS definition
let v2Clean = v2Code.replace(/import .*? from '.*?';/g, '');
v2Clean = v2Clean.replace(/const COLORS = \{[\s\S]*?\};/g, '');

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate ViewTube Widgets</title>
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
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f3f4f6; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        
        /* Needed for the Neo-Brutalist styling */
        .inset-shadow { box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        // --- React Hooks ---
        const { useState, useEffect, useRef } = React;

        // --- Mock Lucide Icons ---
        // Since we are in browser without a bundler, we will mock the Lucide React components using the global lucide instance
        const createIcon = (name) => {
            return ({ size = 24, color = 'currentColor', className = '', strokeWidth = 2 }) => {
                const iconHtml = lucide.icons[name]?.toSvg({ width: size, height: size, color, 'stroke-width': strokeWidth, class: className }) || '<svg/>';
                return <span dangerouslySetInnerHTML={{ __html: iconHtml }} className={className} />;
            };
        };

        // Create standard components mapping to lucide.icons dictionary
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

        ${v1Clean}

        ${v2Clean}

        const App = () => {
            return (
                <div>
                    <CreatorToolbox />
                    <AdvancedCreatorTools />
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;

fs.writeFileSync('/Users/cwb/Downloads/ultimate-widgets-combined.html', htmlTemplate);
console.log("Generated /Users/cwb/Downloads/ultimate-widgets-combined.html successfully!");
