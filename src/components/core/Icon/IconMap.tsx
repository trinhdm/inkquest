import {
	ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
	ArrowUpRight, MoveDown, MoveLeft, MoveRight, MoveUp,
	AtSign, Eye, EyeOff, User, UserPlus, UserRound,
	Badge, BadgeCheck, Check, Minus, Plus, X,
	Ban, Globe, LoaderCircle, RotateCw,
	Bell, Bookmark, Calendar, Camera, Clock, MapPin,
	CircleAlert, MessageCircle, MessageCircleQuestionMark, TriangleAlert,
	ClipboardList, Copy, Funnel, Search, Trash,
	Cog, Lock, Ruler, Settings, Wrench,
	Download, Image, Link, Share, Tag,
	Ellipse, GripVertical, LayoutGrid, List, Rows3, StretchHorizontal,
	Flag, Mail, MailPlus, Paperclip, Pen, Phone, Send,
	Heart, Moon, Star, Sun,
} from 'lucide-react'

const ARROW_ICON_MAP = {
	'down-arrow': MoveDown,
	'down-caret': ChevronDown,
	'left-arrow': MoveLeft,
	'left-caret': ChevronLeft,
	'right-arrow': MoveRight,
	'right-caret': ChevronRight,
	'up-arrow': MoveUp,
	'up-caret': ChevronUp,
}

const NAVIGATION_ICON_MAP = {
	...ARROW_ICON_MAP,
	add: Plus,
	close: X,
	confirm: Check,
	remove: Minus,

	'alert-tooltip': CircleAlert,
	'info-tooltip': MessageCircleQuestionMark,
	'warn-tooltip': TriangleAlert,
}

const USER_SETTING_MAP = {
	group: UserRound,
	you: User,
	follow: UserPlus,
	handle: AtSign,
	'link-internal': Link,
	'link-external': ArrowUpRight,
	settings: Cog,		// Settings
	'dark-theme': Moon,
	'light-theme': Sun,
	menu: Ellipse,
	unverified: Badge,
	verified: BadgeCheck,
	website: Globe,
}

const ACTION_MAP = {
	attach: Paperclip,
	block: Ban,
	call: Phone,
	comment: MessageCircle,
	copy: Copy,
	delete: Trash,
	download: Download,
	drag: GripVertical,
	edit: Pen,
	email: Mail,
	invite: MailPlus,
	like: Heart,
	notify: Bell,
	paste: ClipboardList,
	refresh: RotateCw,
	report: Flag,
	save: Bookmark,
	send: Send,
	share: Share,
}

const CONTROL_ICON_MAP = {
	calendar: Calendar,
	filter: Funnel,
	grid: LayoutGrid,
	hidden: EyeOff,
	list: List,
	price: Tag,
	row: StretchHorizontal,
	search: Search,
	sort: ArrowDownUp,
	visible: Eye,
}

export const ICON_MAP = {
	...NAVIGATION_ICON_MAP,
	...ACTION_MAP,
	...CONTROL_ICON_MAP,
	...USER_SETTING_MAP,
	camera: Camera,
	media: Image,
	load: LoaderCircle,
	location: MapPin,
	private: Lock,
	rating: Star,
	ruler: Ruler,
	time: Clock,
	wrench: Wrench,
}

export type IconType = keyof typeof ICON_MAP
