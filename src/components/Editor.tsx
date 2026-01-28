import type { Note } from '../types'
import { useState, useEffect, useRef } from 'react'
import {
    Maximize2, Minimize2, Type,
    Table as TableIcon, CheckSquare, Layout,
    Bold, Italic, List, Undo, Redo,
    Trash2, ArrowDown, ArrowRight, ArrowLeft, ArrowUp,
    Code, Smile, X, Tag
} from 'lucide-react'
import { clsx } from 'clsx'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Markdown } from 'tiptap-markdown'
import { useLanguage } from '../contexts/LanguageContext'
import { common, createLowlight } from 'lowlight'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'

// Basic syntax highlighting setup
const lowlight = createLowlight(common)

interface EditorProps {
    activeNote: Note | undefined
    onUpdateNote: (note: Note) => void
}

export function Editor({ activeNote, onUpdateNote }: EditorProps) {
    const [isWide, setIsWide] = useState(() => localStorage.getItem('orbital-editor-wide') === 'true')
    const [titleSize, setTitleSize] = useState(() => parseInt(localStorage.getItem('orbital-title-size') || '1'))
    const { t } = useLanguage()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    // Local state for title to prevent rapid file renaming on every keystroke
    const [localTitle, setLocalTitle] = useState(activeNote?.title || '')

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default codeBlock to use lowlight
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: t('editorPlaceholder'),
            }),
            BubbleMenuExtension,
            CharacterCount,
            Markdown.configure({
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content: activeNote?.content || '',
        onUpdate: ({ editor }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const storage = editor.storage as any
            const markdown = storage.markdown.getMarkdown()

            if (activeNote && markdown !== activeNote.content) {
                onUpdateNote({ ...activeNote, content: markdown })
            }
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] outline-none pb-20 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-code:text-primary prose-pre:bg-surface prose-pre:border prose-pre:border-border',
            },
        },
    })

    // Handle outside click for emoji picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Sync activeNote with editor content when switching notes
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const storage = editor?.storage as any
        if (activeNote?.id && editor && storage?.markdown?.getMarkdown() !== activeNote.content) {
            editor.commands.setContent(activeNote.content)
        }
        setLocalTitle(activeNote?.title || '')
    }, [activeNote?.id, editor, activeNote?.content])

    useEffect(() => {
        localStorage.setItem('orbital-editor-wide', String(isWide))
    }, [isWide])

    useEffect(() => {
        localStorage.setItem('orbital-title-size', String(titleSize))
    }, [titleSize])

    const handleTitleBlur = () => {
        if (localTitle !== activeNote?.title) {
            onEditField('title', localTitle)
        }
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleTitleBlur()
            editor?.commands.focus()
        }
    }

    if (!activeNote) {
        return <div className="flex-1 h-full flex items-center justify-center text-foreground-muted">{t('noNotes')}</div>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onEditField = (key: keyof Note, value: any) => {
        onUpdateNote({
            ...activeNote,
            [key]: value,
        })
    }

    const onEmojiClick = (emojiData: EmojiClickData) => {
        onEditField('icon', emojiData.emoji)
        setShowEmojiPicker(false)
    }

    const removeIcon = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditField('icon', undefined)
    }

    const toggleTitleSize = () => {
        setTitleSize((prev) => (prev + 1) % 3)
    }

    const getTitleClass = () => {
        switch (titleSize) {
            case 0: return "text-3xl"
            case 1: return "text-4xl"
            case 2: return "text-5xl"
            default: return "text-4xl"
        }
    }

    // Toolbar Actions
    const toggleBold = () => editor?.chain().focus().toggleBold().run()
    const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
    const toggleList = () => editor?.chain().focus().toggleBulletList().run()
    const toggleTask = () => editor?.chain().focus().toggleTaskList().run()
    const addTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    const addBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
    const addCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()

    // Word Count
    const wordCount = editor?.storage.characterCount.words() || 0
    const charCount = editor?.storage.characterCount.characters() || 0

    return (
        <div className="flex-1 h-full flex flex-col relative transition-all duration-300">
            {/* Top Config Bar */}
            <div className="absolute top-4 right-8 z-10 flex gap-2">
                <button onClick={toggleTitleSize} className="p-2 bg-surface hover:bg-surface-hover rounded-md transition-colors text-foreground-muted hover:text-foreground" title={t('appearance')}>
                    <Type size={18} />
                </button>
                <button onClick={() => setIsWide(!isWide)} className="p-2 bg-surface hover:bg-surface-hover rounded-md transition-colors text-foreground-muted hover:text-foreground" title={isWide ? "Ancho Estándar" : "Modo Ancho"}>
                    {isWide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>

            {/* Bubble Menu for Tables */}
            {editor && (
                <BubbleMenu editor={editor} shouldShow={({ editor }: any) => editor.isActive('table')}>
                    <div className="bg-surface border border-border rounded-lg shadow-xl p-1 flex gap-1 items-center">
                        <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1 hover:bg-surface-hover rounded text-foreground-muted hover:text-foreground" title="Column <"><ArrowLeft size={14} /></button>
                        <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 hover:bg-surface-hover rounded text-foreground-muted hover:text-foreground" title="Column >"><ArrowRight size={14} /></button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => editor.chain().focus().addRowBefore().run()} className="p-1 hover:bg-surface-hover rounded text-foreground-muted hover:text-foreground" title="Row ^"><ArrowUp size={14} /></button>
                        <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 hover:bg-surface-hover rounded text-foreground-muted hover:text-foreground" title="Row v"><ArrowDown size={14} /></button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 hover:bg-red-500/20 rounded text-foreground-muted hover:text-red-400" title="Delete Column"><Layout size={14} className="rotate-90" /><span className="text-[10px] absolute -top-1 -right-1">x</span></button>
                        <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 hover:bg-red-500/20 rounded text-foreground-muted hover:text-red-400" title="Delete Row"><Layout size={14} /><span className="text-[10px] absolute -top-1 -right-1">x</span></button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 hover:bg-red-500/20 rounded text-red-500 hover:text-red-400" title={t('deleteNote')}><Trash2 size={14} /></button>
                    </div>
                </BubbleMenu>
            )}

            {/* Content Container */}
            <div className={clsx(
                "h-full flex flex-col transition-all duration-300 w-full relative",
                isWide ? "px-8 py-8" : "max-w-3xl mx-auto p-8"
            )}>

                {/* Title and Icon Area */}
                <div className="group/icon mb-4 flex items-center gap-3 relative">
                    {/* Note Icon (Notion Style) - Inline */}
                    <div className="relative shrink-0">
                        {!activeNote.icon && (
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm hover:bg-surface-hover px-2 py-1 rounded transition-all opacity-0 group-hover/icon:opacity-100"
                            >
                                <Smile size={24} />
                            </button>
                        )}

                        {activeNote.icon && (
                            <div className="relative group/emoji">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-4xl hover:bg-surface-hover rounded-md p-1 transition-colors cursor-pointer block leading-none"
                                >
                                    {activeNote.icon}
                                </button>
                                <button
                                    onClick={removeIcon}
                                    className="absolute -top-1 -right-1 bg-surface border border-border rounded-full p-0.5 text-foreground-muted hover:text-red-500 opacity-0 group-hover/emoji:opacity-100 transition-opacity shadow-sm scale-75"
                                    title="Remove Icon"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {showEmojiPicker && (
                            <div className="absolute top-full left-0 z-50 mt-2 shadow-2xl" ref={emojiPickerRef}>
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={Theme.AUTO}
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        placeholder={t('untitled')}
                        className={clsx(
                            "w-full bg-transparent font-bold focus:outline-none placeholder:text-foreground-faint text-foreground border-none transition-all p-0 h-auto",
                            getTitleClass()
                        )}
                    />
                </div>

                {/* Tags Section */}
                <div className="flex flex-wrap items-center gap-2 mb-6 px-1">
                    <Tag size={16} className="text-foreground-muted shrink-0" />
                    {activeNote.tags?.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 group/tag">
                            #{tag}
                            <button
                                onClick={() => {
                                    const newTags = activeNote.tags?.filter(t => t !== tag)
                                    onEditField('tags', newTags)
                                }}
                                className="hover:text-red-500 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder={activeNote.tags?.length ? "Add tag..." : "Add tags (press Enter)..."}
                        className="bg-transparent text-sm text-foreground focus:outline-none placeholder:text-foreground-faint min-w-[100px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                const val = e.currentTarget.value.trim()
                                if (val) {
                                    const currentTags = activeNote.tags || []
                                    if (!currentTags.includes(val)) {
                                        onEditField('tags', [...currentTags, val])
                                    }
                                    e.currentTarget.value = ''
                                }
                            }
                        }}
                    />
                </div>

                {/* Notion-like Toolbar */}
                <div className="flex gap-1 mb-6 border-b border-border pb-2 overflow-x-auto no-scrollbar">
                    <button onClick={toggleBold} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('bold') && "text-primary bg-primary-surface")} title={t('bold')}><Bold size={16} /></button>
                    <button onClick={toggleItalic} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('italic') && "text-primary bg-primary-surface")} title={t('italic')}><Italic size={16} /></button>
                    <div className="w-px h-6 bg-border mx-1 self-center" />
                    <button onClick={toggleList} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('bulletList') && "text-primary bg-primary-surface")} title={t('list')}><List size={16} /></button>
                    <button onClick={toggleTask} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('taskList') && "text-primary bg-primary-surface")} title={t('taskList')}><CheckSquare size={16} /></button>
                    <button onClick={addTable} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('table') && "text-primary bg-primary-surface")} title={t('table')}><TableIcon size={16} /></button>
                    <button onClick={addBlockquote} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('blockquote') && "text-primary bg-primary-surface")} title={t('card')}><Layout size={16} /></button>
                    <button onClick={addCodeBlock} className={clsx("p-2 rounded hover:bg-surface-hover text-foreground-muted", editor?.isActive('codeBlock') && "text-primary bg-primary-surface")} title="Code Block"><Code size={16} /></button>
                    <div className="w-px h-6 bg-border mx-1 self-center" />
                    <button onClick={() => editor?.chain().focus().undo().run()} className="p-2 rounded hover:bg-surface-hover text-foreground-muted" title={t('undo')}><Undo size={16} /></button>
                    <button onClick={() => editor?.chain().focus().redo().run()} className="p-2 rounded hover:bg-surface-hover text-foreground-muted" title={t('redo')}><Redo size={16} /></button>
                </div>

                {/* Editor Surface */}
                <div className="flex-1 w-full overflow-y-auto pb-10" onClick={() => editor?.commands.focus()}>
                    <EditorContent editor={editor} className="h-full" />
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-4 right-8 opacity-50 hover:opacity-100 transition-opacity text-xs text-foreground-muted bg-surface/80 backdrop-blur px-2 py-1 rounded-md border border-border flex gap-3 pointer-events-none select-none">
                    <span>{t('wordCount').replace('{words}', String(wordCount))}</span>
                    <span className="w-px h-3 bg-foreground-muted/30 self-center"></span>
                    <span>{t('charCount').replace('{chars}', String(charCount))}</span>
                </div>
            </div>
        </div>
    )
}
