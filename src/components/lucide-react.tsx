import React from 'react';

export type LucideProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
};

export type LucideIcon = React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>;

const createIcon = (label: string): LucideIcon =>
  React.forwardRef<SVGSVGElement, LucideProps>(function SvgIcon({ size = 24, color = "currentColor", strokeWidth = 2, className, ...props }, ref) {
    const text = label.slice(0, 2).toUpperCase();
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <title>{label}</title>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 12h10" />
        <path d="M12 7v10" />
        <text x="12" y="20" textAnchor="middle" fontSize="5" fill={color} stroke="none" fontFamily="monospace">
          {text}
        </text>
      </svg>
    );
  });

export const Activity = createIcon('Activity');
export const AlertCircle = createIcon('AlertCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const AlignCenter = createIcon('AlignCenter');
export const AlignJustify = createIcon('AlignJustify');
export const AlignLeft = createIcon('AlignLeft');
export const AlignRight = createIcon('AlignRight');
export const Apple = createIcon('Apple');
export const ArrowDown = createIcon('ArrowDown');
export const ArrowDownLeft = createIcon('ArrowDownLeft');
export const ArrowDownRight = createIcon('ArrowDownRight');
export const ArrowLeft = createIcon('ArrowLeft');
export const ArrowRight = createIcon('ArrowRight');
export const ArrowUp = createIcon('ArrowUp');
export const ArrowUpLeft = createIcon('ArrowUpLeft');
export const ArrowUpRight = createIcon('ArrowUpRight');
export const AtSign = createIcon('AtSign');
export const BarChart2 = createIcon('BarChart2');
export const BarChart3 = createIcon('BarChart3');
export const Battery = createIcon('Battery');
export const BatteryCharging = createIcon('BatteryCharging');
export const Bell = createIcon('Bell');
export const BlankFile = createIcon('BlankFile');
export const Bluetooth = createIcon('Bluetooth');
export const Bold = createIcon('Bold');
export const BookOpen = createIcon('BookOpen');
export const Box = createIcon('Box');
export const Briefcase = createIcon('Briefcase');
export const Calendar = createIcon('Calendar');
export const Camera = createIcon('Camera');
export const Check = createIcon('Check');
export const CheckCircle = createIcon('CheckCircle');
export const CheckCircle2 = createIcon('CheckCircle2');
export const CheckSquare = createIcon('CheckSquare');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronRight = createIcon('ChevronRight');
export const ChevronUp = createIcon('ChevronUp');
export const Clock = createIcon('Clock');
export const Close = createIcon('Close');
export const Cloud = createIcon('Cloud');
export const Code = createIcon('Code');
export const Command = createIcon('Command');
export const Copy = createIcon('Copy');
export const CornerDownLeft = createIcon('CornerDownLeft');
export const CornerDownRight = createIcon('CornerDownRight');
export const CornerLeftDown = createIcon('CornerLeftDown');
export const CornerLeftUp = createIcon('CornerLeftUp');
export const CornerRightDown = createIcon('CornerRightDown');
export const CornerRightUp = createIcon('CornerRightUp');
export const CornerUpLeft = createIcon('CornerUpLeft');
export const CornerUpRight = createIcon('CornerUpRight');
export const Cpu = createIcon('Cpu');
export const Database = createIcon('Database');
export const Document = createIcon('Document');
export const DollarSign = createIcon('DollarSign');
export const Download = createIcon('Download');
export const Edit = createIcon('Edit');
export const Edit2 = createIcon('Edit2');
export const Edit3 = createIcon('Edit3');
export const ExternalLink = createIcon('ExternalLink');
export const Eye = createIcon('Eye');
export const EyeOff = createIcon('EyeOff');
export const File = createIcon('File');
export const FileAdd = createIcon('FileAdd');
export const FileAlert = createIcon('FileAlert');
export const FileArchive = createIcon('FileArchive');
export const FileAudio = createIcon('FileAudio');
export const FileCheck = createIcon('FileCheck');
export const FileCode = createIcon('FileCode');
export const FileData = createIcon('FileData');
export const FileDigit = createIcon('FileDigit');
export const FileEmpty = createIcon('FileEmpty');
export const FileExcel = createIcon('FileExcel');
export const FileFind = createIcon('FileFind');
export const FileHelp = createIcon('FileHelp');
export const FileHtml = createIcon('FileHtml');
export const FileImage = createIcon('FileImage');
export const FileInvalid = createIcon('FileInvalid');
export const FileJson = createIcon('FileJson');
export const FileKey = createIcon('FileKey');
export const FileLines = createIcon('FileLines');
export const FileLock = createIcon('FileLock');
export const FileMinus = createIcon('FileMinus');
export const FileMovie = createIcon('FileMovie');
export const FileNumber = createIcon('FileNumber');
export const FilePassword = createIcon('FilePassword');
export const FilePicture = createIcon('FilePicture');
export const FilePlus = createIcon('FilePlus');
export const FileQuestion = createIcon('FileQuestion');
export const FileRemove = createIcon('FileRemove');
export const FileSearch = createIcon('FileSearch');
export const FileSecure = createIcon('FileSecure');
export const FileShortcut = createIcon('FileShortcut');
export const FileSound = createIcon('FileSound');
export const FileSpreadsheet = createIcon('FileSpreadsheet');
export const FileSymlink = createIcon('FileSymlink');
export const FileText = createIcon('FileText');
export const FileValid = createIcon('FileValid');
export const FileVideo = createIcon('FileVideo');
export const FileWarning = createIcon('FileWarning');
export const FileX = createIcon('FileX');
export const FileZip = createIcon('FileZip');
export const Filter = createIcon('Filter');
export const Folder = createIcon('Folder');
export const FolderMinus = createIcon('FolderMinus');
export const FolderPlus = createIcon('FolderPlus');
export const Globe = createIcon('Globe');
export const Grid = createIcon('Grid');
export const Hamburger = createIcon('Hamburger');
export const Hash = createIcon('Hash');
export const Heart = createIcon('Heart');
export const Home = createIcon('Home');
export const ImageIcon = createIcon('ImageIcon');
export const Info = createIcon('Info');
export const Italic = createIcon('Italic');
export const Key = createIcon('Key');
export const Laptop = createIcon('Laptop');
export const Layers = createIcon('Layers');
export const Layout = createIcon('Layout');
export const LayoutDashboard = createIcon('LayoutDashboard');
export const LayoutGrid = createIcon('LayoutGrid');
export const LayoutTemplate = createIcon('LayoutTemplate');
export const Link = createIcon('Link');
export const LinkIcon = createIcon('LinkIcon');
export const List = createIcon('List');
export const ListMusic = createIcon('ListMusic');
export const Loader2 = createIcon('Loader2');
export const Lock = createIcon('Lock');
export const LogIn = createIcon('LogIn');
export const LogOut = createIcon('LogOut');
export const Magnet = createIcon('Magnet');
export const MagnifyingGlass = createIcon('MagnifyingGlass');
export const Mail = createIcon('Mail');
export const MapPin = createIcon('MapPin');
export const Maximize = createIcon('Maximize');
export const Maximize2 = createIcon('Maximize2');
export const Menu = createIcon('Menu');
export const MessageCircle = createIcon('MessageCircle');
export const MessageSquare = createIcon('MessageSquare');
export const Mic = createIcon('Mic');
export const Minimize = createIcon('Minimize');
export const Minimize2 = createIcon('Minimize2');
export const Minus = createIcon('Minus');
export const Monitor = createIcon('Monitor');
export const Moon = createIcon('Moon');
export const MoreHorizontal = createIcon('MoreHorizontal');
export const MoreVertical = createIcon('MoreVertical');
export const MousePointer2 = createIcon('MousePointer2');
export const MousePointerClick = createIcon('MousePointerClick');
export const Music = createIcon('Music');
export const Palette = createIcon('Palette');
export const Pause = createIcon('Pause');
export const PenTool = createIcon('PenTool');
export const Percent = createIcon('Percent');
export const Phone = createIcon('Phone');
export const PieChart = createIcon('PieChart');
export const Play = createIcon('Play');
export const Plus = createIcon('Plus');
export const Power = createIcon('Power');
export const RefreshCcw = createIcon('RefreshCcw');
export const RefreshCw = createIcon('RefreshCw');
export const Rocket = createIcon('Rocket');
export const RotateCcw = createIcon('RotateCcw');
export const Save = createIcon('Save');
export const Scissors = createIcon('Scissors');
export const Search = createIcon('Search');
export const Settings = createIcon('Settings');
export const Settings2 = createIcon('Settings2');
export const SettingsIcon = createIcon('SettingsIcon');
export const Share2 = createIcon('Share2');
export const Shield = createIcon('Shield');
export const ShieldCheck = createIcon('ShieldCheck');
export const Sliders = createIcon('Sliders');
export const Smartphone = createIcon('Smartphone');
export const Sparkles = createIcon('Sparkles');
export const Speaker = createIcon('Speaker');
export const Star = createIcon('Star');
export const Strikethrough = createIcon('Strikethrough');
export const Sun = createIcon('Sun');
export const Tablet = createIcon('Tablet');
export const Tag = createIcon('Tag');
export const Target = createIcon('Target');
export const Terminal = createIcon('Terminal');
export const ThumbsUp = createIcon('ThumbsUp');
export const Trash2 = createIcon('Trash2');
export const TrendingDown = createIcon('TrendingDown');
export const TrendingUp = createIcon('TrendingUp');
export const Tv = createIcon('Tv');
export const Type = createIcon('Type');
export const Underline = createIcon('Underline');
export const Unlock = createIcon('Unlock');
export const Upload = createIcon('Upload');
export const UploadCloud = createIcon('UploadCloud');
export const User = createIcon('User');
export const Users = createIcon('Users');
export const Video = createIcon('Video');
export const Wand2 = createIcon('Wand2');
export const Watch = createIcon('Watch');
export const Wifi = createIcon('Wifi');
export const X = createIcon('X');
export const Zap = createIcon('Zap');
export const ZoomIn = createIcon('ZoomIn');
export const ZoomOut = createIcon('ZoomOut');

const Lucide = {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Apple,
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  AtSign,
  BarChart2,
  BarChart3,
  Battery,
  BatteryCharging,
  Bell,
  BlankFile,
  Bluetooth,
  Bold,
  BookOpen,
  Box,
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Close,
  Cloud,
  Code,
  Command,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  Cpu,
  Database,
  Document,
  DollarSign,
  Download,
  Edit,
  Edit2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileAdd,
  FileAlert,
  FileArchive,
  FileAudio,
  FileCheck,
  FileCode,
  FileData,
  FileDigit,
  FileEmpty,
  FileExcel,
  FileFind,
  FileHelp,
  FileHtml,
  FileImage,
  FileInvalid,
  FileJson,
  FileKey,
  FileLines,
  FileLock,
  FileMinus,
  FileMovie,
  FileNumber,
  FilePassword,
  FilePicture,
  FilePlus,
  FileQuestion,
  FileRemove,
  FileSearch,
  FileSecure,
  FileShortcut,
  FileSound,
  FileSpreadsheet,
  FileSymlink,
  FileText,
  FileValid,
  FileVideo,
  FileWarning,
  FileX,
  FileZip,
  Filter,
  Folder,
  FolderMinus,
  FolderPlus,
  Globe,
  Grid,
  Hamburger,
  Hash,
  Heart,
  Home,
  ImageIcon,
  Info,
  Italic,
  Key,
  Laptop,
  Layers,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  Link,
  LinkIcon,
  List,
  ListMusic,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Magnet,
  MagnifyingGlass,
  Mail,
  MapPin,
  Maximize,
  Maximize2,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Minimize,
  Minimize2,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  MousePointer2,
  MousePointerClick,
  Music,
  Palette,
  Pause,
  PenTool,
  Percent,
  Phone,
  PieChart,
  Play,
  Plus,
  Power,
  RefreshCcw,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Scissors,
  Search,
  Settings,
  Settings2,
  SettingsIcon,
  Share2,
  Shield,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Speaker,
  Star,
  Strikethrough,
  Sun,
  Tablet,
  Tag,
  Target,
  Terminal,
  ThumbsUp,
  Trash2,
  TrendingDown,
  TrendingUp,
  Tv,
  Type,
  Underline,
  Unlock,
  Upload,
  UploadCloud,
  User,
  Users,
  Video,
  Wand2,
  Watch,
  Wifi,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
};

export default Lucide;