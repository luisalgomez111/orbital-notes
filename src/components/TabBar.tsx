import { X, FileText } from 'lucide-react'
import type { Note } from '../types'
import { clsx } from 'clsx'
import { useLanguage } from '../contexts/LanguageContext'

interface TabBarProps {
    openNotes: Note[]
    activeNoteId: string | undefined
    onSelectTab: (id: string) => void
    onCloseTab: (id: string) => void
}

export function TabBar({ openNotes, activeNoteId, onSelectTab, onCloseTab }: TabBarProps) {
    const { t } = useLanguage()

    if (openNotes.length === 0) return null

    return (
        <div className="flex bg-surface border-b border-border overflow-x-auto no-scrollbar">
            {openNotes.map(note => (
                <div
                    key={note.id}
                    className={clsx(
                        "group flex items-center gap-2 px-4 py-2 min-w-[150px] max-w-[200px] border-r border-border cursor-pointer select-none transition-colors",
                        activeNoteId === note.id
                            ? "bg-background text-primary border-t-2 border-t-primary"
                            : "hover:bg-surface-hover text-foreground-muted hover:text-foreground border-t-2 border-t-transparent"
                    )}
                    onClick={() => onSelectTab(note.id)}
                >
                    {note.icon ? <span className="shrink-0 text-lg leading-none">{note.icon}</span> : <FileText size={14} className={clsx("shrink-0", activeNoteId === note.id ? "text-primary" : "text-foreground-faint")} />}
                    <span className="truncate text-sm font-medium flex-1">{note.title.trim() || t('untitled')}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onCloseTab(note.id)
                        }}
                        className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all text-foreground-faint shrink-0"
                        title={t('closeTab')}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}
