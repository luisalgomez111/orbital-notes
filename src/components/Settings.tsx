import { X, Sun, Moon, Rocket, Star, Zap, Heart, Globe, Cpu, Cloud, Coffee, Compass, Eye, Feather, Flame, Gift, Headphones, Image, Key, Map, Music, Shield, Tag, Anchor, Award, Briefcase, Camera, Cast, Droplet, Film, Flag, Hash, Layout, LifeBuoy, Link, Lock, Mic, Package, Pen, Phone, Play, Printer, Radio, Save, Send, Server, ShoppingBag, Smartphone, Speaker, Terminal, Truck, Tv, User, Video, Voicemail, Wifi, Watch } from 'lucide-react'
import { clsx } from 'clsx'
import { useLanguage } from '../contexts/LanguageContext'
import { useState } from 'react'

interface SettingsProps {
    onClose: () => void
    appIcon: string
    setAppIcon: (icon: string) => void
}

const COLORS = [
    { name: 'Purple', value: '#d946ef' }, // Fuchsia-500
    { name: 'Violet', value: '#8b5cf6' }, // Violet-500
    { name: 'Indigo', value: '#6366f1' }, // Indigo-500
    { name: 'Royal', value: '#4338ca' }, // Indigo-700
    { name: 'Blue', value: '#3b82f6' }, // Blue-500
    { name: 'Azur', value: '#0066ff' }, // Custom Vibrant Blue
    { name: 'Sky', value: '#0ea5e9' }, // Sky-500
    { name: 'Cyan', value: '#06b6d4' }, // Cyan-500
    { name: 'Mint', value: '#00f2ea' }, // Custom Mint
    { name: 'Teal', value: '#14b8a6' }, // Teal-500
    { name: 'Emerald', value: '#10b981' }, // Emerald-500
    { name: 'Green', value: '#22c55e' }, // Green-500
    { name: 'Neon', value: '#39ff14' }, // Neon Green
    { name: 'Lime', value: '#84cc16' }, // Lime-500
    { name: 'Yellow', value: '#eab308' }, // Yellow-500
    { name: 'Gold', value: '#ffd700' }, // Gold
    { name: 'Amber', value: '#f59e0b' }, // Amber-500
    { name: 'Orange', value: '#f97316' }, // Orange-500
    { name: 'Sunset', value: '#ff4500' }, // OrangeRed
    { name: 'Red', value: '#ef4444' }, // Red-500
    { name: 'Crimson', value: '#dc143c' }, // Crimson
    { name: 'Rose', value: '#f43f5e' }, // Rose-500
    { name: 'Pink', value: '#ec4899' }, // Pink-500
    { name: 'Hot Pink', value: '#ff007f' }, // DeepPink equivalent
    { name: 'Magenta', value: '#ff00ff' }, // Magenta
    { name: 'Orchid', value: '#da70d6' }, // Orchid
    { name: 'Periwinkle', value: '#ccccff' }, // Periwinkle
]

const ICONS = [
    { id: 'rocket', icon: Rocket },
    { id: 'star', icon: Star },
    { id: 'zap', icon: Zap },
    { id: 'heart', icon: Heart },
    { id: 'globe', icon: Globe },
    { id: 'cpu', icon: Cpu },
    { id: 'cloud', icon: Cloud },
    { id: 'coffee', icon: Coffee },
    { id: 'compass', icon: Compass },
    { id: 'eye', icon: Eye },
    { id: 'feather', icon: Feather },
    { id: 'flame', icon: Flame },
    { id: 'gift', icon: Gift },
    { id: 'headphones', icon: Headphones },
    { id: 'image', icon: Image },
    { id: 'key', icon: Key },
    { id: 'map', icon: Map },
    { id: 'music', icon: Music },
    { id: 'shield', icon: Shield },
    { id: 'tag', icon: Tag },
    // New Icons
    { id: 'anchor', icon: Anchor },
    { id: 'award', icon: Award },
    { id: 'briefcase', icon: Briefcase },
    { id: 'camera', icon: Camera },
    { id: 'cast', icon: Cast },
    { id: 'droplet', icon: Droplet },
    { id: 'film', icon: Film },
    { id: 'flag', icon: Flag },
    { id: 'hash', icon: Hash },
    { id: 'layout', icon: Layout },
    { id: 'lifebuoy', icon: LifeBuoy },
    { id: 'link', icon: Link },
    { id: 'lock', icon: Lock },
    { id: 'mic', icon: Mic },
    { id: 'package', icon: Package },
    { id: 'pen', icon: Pen },
    { id: 'phone', icon: Phone },
    { id: 'play', icon: Play },
    { id: 'printer', icon: Printer },
    { id: 'radio', icon: Radio },
    { id: 'save', icon: Save },
    { id: 'send', icon: Send },
    { id: 'server', icon: Server },
    { id: 'shoppingbag', icon: ShoppingBag },
    { id: 'smartphone', icon: Smartphone },
    { id: 'speaker', icon: Speaker },
    { id: 'terminal', icon: Terminal },
    { id: 'truck', icon: Truck },
    { id: 'tv', icon: Tv },
    { id: 'user', icon: User },
    { id: 'video', icon: Video },
    { id: 'voicemail', icon: Voicemail },
    { id: 'wifi', icon: Wifi },
    { id: 'watch', icon: Watch },
]

export function Settings({ onClose, appIcon, setAppIcon }: SettingsProps) {
    const { language, setLanguage, t } = useLanguage()

    // Load Vault Component
    // Using simple DOM manipulation for MVP or we could add state, but Settings is ephemeral
    // Let's add a small effect to load it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadVaultPath = async () => {
        try {
            const path = await (window as any).electron.getVaultPath()
            const el = document.getElementById('vault-path-display')
            if (el && path) el.innerText = path
        } catch (e) { console.error(e) }
    }
    // Call it immediately (React effect would be better but this works for this simple component without adding State overhead)
    setTimeout(loadVaultPath, 100)

    // State for Theme to force re-render on change
    const [currentTheme, setCurrentTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        }
        return 'light'
    })

    const setTheme = (theme: string) => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        localStorage.setItem('orbital-theme', theme)
        window.dispatchEvent(new Event('storage'))
        setCurrentTheme(theme)
    }

    const setAccent = (color: string) => {
        document.documentElement.style.setProperty('--accent-primary', color)

        // Calculate Darker Hover Variant
        // Simple heuristic: reduce L value in HSL? Or just use color-mix if calc is hard.
        // Let's rely on CSS color modification if possible, or use a tiny JS helper.
        // For robustness without a color library, we can set a secondary var that uses filter, 
        // OR simply set the hover to the SAME color but rely on CSS brightness filter in usage.
        // However, user specifically asked for "darker shade of the selected".

        // Let's try to parse Hex to RGB, darken, and set back.
        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)

        // Darken by 15%
        const factor = 0.85;
        const r2 = Math.floor(r * factor);
        const g2 = Math.floor(g * factor);
        const b2 = Math.floor(b * factor);

        const darkenHex = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`

        document.documentElement.style.setProperty('--primary-hover', darkenHex)

        localStorage.setItem('orbital-accent', color)
    }

    // Modal Layout (Restored)
    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface shrink-0">
                    <h2 className="text-2xl font-bold">{t('settings')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">

                    {/* App Icon */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {t('appearance')}
                        </h3>
                        <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                            {ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setAppIcon(item.id)}
                                    className={clsx(
                                        "p-3 rounded-xl flex items-center justify-center transition-all border-2 aspect-square",
                                        appIcon === item.id
                                            ? "border-primary bg-primary-surface text-primary scale-105"
                                            : "border-transparent bg-background hover:bg-surface-hover text-foreground-muted hover:text-foreground hover:border-border"
                                    )}
                                    title={item.id}
                                >
                                    <item.icon size={24} />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Theme */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4">{t('theme')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={clsx(
                                    "p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-colors",
                                    currentTheme === 'light' ? "border-primary bg-primary-surface" : "border-border hover:border-foreground-muted"
                                )}
                            >
                                <Sun size={20} />
                                <span className="font-medium">{t('light')}</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={clsx(
                                    "p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-colors",
                                    currentTheme === 'dark' ? "border-primary bg-primary-surface" : "border-border hover:border-foreground-muted"
                                )}
                            >
                                <Moon size={20} />
                                <span className="font-medium">{t('dark')}</span>
                            </button>
                        </div>
                    </section>

                    {/* Accent Color */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4">{t('accentColor')}</h3>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setAccent(color.value)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative hover:ring-2 ring-primary ring-offset-2 ring-offset-surface"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Vault Location */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4">{t('vaultLocation') || 'Data Location'}</h3>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono truncate text-foreground-muted select-all">
                                {/* We need to fetch this on mount, or pass it as prop. For now, let's use a local state or just show placeholder until implemented fully in parent */}
                                {/* Actually, let's use a simple button to change it, and maybe show current path if we can fetching it async */}
                                <span id="vault-path-display">...</span>
                            </div>
                            <button
                                onClick={async () => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const path = await (window as any).electron.selectDirectory()
                                    if (path) {
                                        // Force reload to apply changes
                                        window.location.reload()
                                    }
                                }}
                                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                                Change
                            </button>
                        </div>
                        <p className="text-xs text-foreground-faint mt-2">
                            Select a folder to store your notes. The app will reload upon change.
                        </p>
                    </section>

                    {/* Language */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4">{t('language')}</h3>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="ru">Русский</option>
                            <option value="cn">中文</option>
                        </select>
                    </section>
                </div>
            </div>
        </div>
    )
}
