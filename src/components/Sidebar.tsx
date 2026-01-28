import { Plus, Search, FileText, Settings as _SettingsIcon, Trash2, Rocket, Star, Zap, Heart, Globe, Moon, Sun, Monitor, Cpu, Disc, Cloud, Umbrella, Anchor, Award, Briefcase, Camera, Cast, Coffee, Compass, Droplet, Eye, Feather, Film, Flag, Flame, Gift, Hash, Headphones, Image, Key, Layers, Layout, LifeBuoy, Link, Lock, Map, Mic, Music, Package, Pen, Phone, Play, Printer, Radio, Save, Send, Server, Shield, ShoppingBag, Smartphone, Speaker, Tag, Terminal, Wrench, Truck, Tv, User, Video, Voicemail, Wifi, Watch, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Note } from '../types'
import { clsx } from 'clsx'
import { useLanguage } from '../contexts/LanguageContext'

// Icon Map helper to render the string as a component
// Replaced Tool with Wrench to avoid import errors if Tool is missing/renamed
const IconMap: Record<string, any> = {
    rocket: Rocket,
    star: Star,
    zap: Zap,
    heart: Heart,
    globe: Globe,
    moon: Moon,
    sun: Sun,
    monitor: Monitor,
    cpu: Cpu,
    disc: Disc,
    cloud: Cloud,
    umbrella: Umbrella,
    anchor: Anchor,
    award: Award,
    briefcase: Briefcase,
    camera: Camera,
    cast: Cast,
    coffee: Coffee,
    compass: Compass,
    droplet: Droplet,
    eye: Eye,
    feather: Feather,
    film: Film,
    flag: Flag,
    flame: Flame,
    gift: Gift,
    hash: Hash,
    headphones: Headphones,
    image: Image,
    key: Key,
    layers: Layers,
    layout: Layout,
    lifebuoy: LifeBuoy,
    link: Link,
    lock: Lock,
    map: Map,
    mic: Mic,
    music: Music,
    package: Package,
    pen: Pen,
    phone: Phone,
    play: Play,
    printer: Printer,
    radio: Radio,
    save: Save,
    send: Send,
    server: Server,
    shield: Shield,
    shoppingbag: ShoppingBag,
    smartphone: Smartphone,
    speaker: Speaker,
    tag: Tag,
    terminal: Terminal,
    tool: Wrench,
    truck: Truck,
    tv: Tv,
    user: User,
    video: Video,
    voicemail: Voicemail,
    wifi: Wifi,
    watch: Watch
}

interface SidebarProps {
    notes: Note[]
    activeNoteId: string | undefined
    setActiveNoteId: (id: string) => void
    createNewNote: () => void
    deleteNote: (id: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    onOpenSettings: () => void
    showSettings: boolean
    isCollapsed: boolean
    toggleSidebar: () => void
    appIcon: string
}

export function Sidebar({
    notes,
    activeNoteId,
    setActiveNoteId,
    createNewNote,
    deleteNote,
    searchQuery,
    setSearchQuery,
    onOpenSettings,
    showSettings,
    isCollapsed,
    toggleSidebar,
    appIcon
}: SidebarProps) {
    const { t } = useLanguage()

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Fallback if icon not found
    const ActiveIcon = IconMap[appIcon] || Rocket

    return (
        <div className={clsx(
            "h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out relative group/sidebar",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-6 z-50 bg-surface border border-border rounded-full p-1 text-foreground-muted hover:text-foreground shadow-sm opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
                title={isCollapsed ? "Expandir" : "Contraer"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Header branding */}
            <div className={clsx(
                "border-b border-border flex items-center transition-all",
                isCollapsed ? "justify-center p-4" : "gap-3 p-6"
            )}>
                <ActiveIcon className="text-primary shrink-0 transition-all duration-500" size={24} />
                {!isCollapsed && <span className="font-bold text-xl tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300">Orbital</span>}
            </div>

            {/* Search */}
            <div className={clsx("transition-all", isCollapsed ? "p-4 flex justify-center" : "px-4 py-3")}>
                {isCollapsed ? (
                    <div className="relative group cursor-pointer" title={t('searchPlaceholder')} onClick={toggleSidebar}>
                        <Search className="text-foreground-muted hover:text-primary transition-colors" size={20} />
                    </div>
                ) : (
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background text-foreground placeholder:text-foreground-faint pl-9 pr-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-border focus:border-primary"
                        />
                    </div>
                )}
            </div>

            {/* Note List (Hidden in Collapsed Mode) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {!isCollapsed ? (
                    filteredNotes.length === 0 ? (
                        <div className="p-4 text-center text-sm text-foreground-faint">
                            {searchQuery ? t('noNotesFound') : t('noNotes')}
                        </div>
                    ) : (
                        <div className="space-y-0.5 px-2">
                            {filteredNotes.map(note => (
                                <button
                                    key={note.id}
                                    onClick={() => setActiveNoteId(note.id)}
                                    className={clsx(
                                        "w-full text-left p-3 rounded-md transition-all group border border-transparent relative pr-8",
                                        activeNoteId === note.id
                                            ? "bg-primary-surface text-primary border-primary/20"
                                            : "text-foreground-muted hover:bg-background hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-2 font-medium mb-0.5 truncate">
                                        <span className="shrink-0 text-lg leading-none">{note.icon ? note.icon : <FileText size={14} className={clsx("shrink-0", activeNoteId === note.id ? "text-primary" : "text-foreground-faint")} />}</span>
                                        <span className="truncate">{note.title.trim() || t('untitled')}</span>
                                    </div>
                                    <div className="text-xs text-foreground-faint truncate pl-6 opacity-70">
                                        {new Date(note.updatedAt).toLocaleDateString(t('dateFormat'))}
                                    </div>

                                    <div
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNote(note.id)
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-red-500/10 text-foreground-faint hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        title={t('deleteNote')}
                                    >
                                        <Trash2 size={14} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="h-full w-full flex flex-col items-center pt-4 opacity-50">
                        <div className="w-1 h-1 rounded-full bg-border mb-2" />
                        <div className="w-1 h-1 rounded-full bg-border mb-2" />
                        <div className="w-1 h-1 rounded-full bg-border" />
                    </div>
                )}
            </div>

            {/* Footer with Actions */}
            <div className={clsx("border-t border-border flex flex-col gap-2 transition-all", isCollapsed ? "p-2 items-center" : "p-3")}>
                <button
                    onClick={createNewNote}
                    className={clsx(
                        "flex items-center justify-center gap-2 bg-primary text-white hover:bg-background hover:text-primary border-2 border-transparent hover:border-primary rounded-md transition-all font-medium shadow-lg shadow-primary/20 mb-2",
                        isCollapsed ? "p-3 aspect-square rounded-full" : "w-full py-2 px-4"
                    )}
                    title={t('newNote')}
                >
                    <Plus size={isCollapsed ? 20 : 18} />
                    {!isCollapsed && <span>{t('newNote')}</span>}
                </button>

                <button
                    onClick={onOpenSettings}
                    className={clsx(
                        "flex items-center gap-2 rounded-md transition-colors text-sm font-medium",
                        showSettings ? "bg-primary-surface text-primary" : "text-foreground-muted hover:bg-background hover:text-foreground",
                        isCollapsed ? "p-3 aspect-square justify-center" : "w-full px-3 py-2"
                    )}
                    title={t('settings')}
                >
                    <_SettingsIcon size={20} />
                    {!isCollapsed && <span>{t('settings')}</span>}
                </button>
            </div>
        </div>
    )
}
