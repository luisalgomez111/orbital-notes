import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Settings } from './components/Settings'
import { TabBar } from './components/TabBar'
import type { Note } from './types'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'

// IPC Communication
const { electron } = window as any

function AppContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('orbital-sidebar-collapsed') === 'true')
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem('orbital-app-icon') || 'rocket')
  const { t } = useLanguage()

  // Init Theme on Load
  useEffect(() => {
    const theme = localStorage.getItem('orbital-theme') || 'dark'
    const accent = localStorage.getItem('orbital-accent') || '#a855f7'
    const root = document.documentElement

    root.classList.add(theme)
    root.style.setProperty('--accent-primary', accent)
  }, [])

  useEffect(() => {
    localStorage.setItem('orbital-sidebar-collapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('orbital-app-icon', appIcon)
  }, [appIcon])

  useEffect(() => {
    if (electron) {
      electron.getNotes().then((loadedNotes: Note[]) => {
        setNotes(loadedNotes)
        // Do not auto-open notes on load, specific behavior change for tabs.
        // Or maybe open the most recent one? For now, start empty or Sidebar visible.
      })
    }
  }, [])

  const createNewNote = useCallback(async () => {
    if (!electron) return

    const baseTitle = t('newNoteDefault')
    let newTitle = baseTitle
    let counter = 1

    const existingTitles = new Set(notes.map(n => n.title.toLowerCase()))

    if (existingTitles.has(newTitle.toLowerCase())) {
      newTitle = `${baseTitle} ${counter}`
      while (existingTitles.has(newTitle.toLowerCase())) {
        counter++
        newTitle = `${baseTitle} ${counter}`
      }
    }

    const newNote: Note = {
      id: newTitle,
      title: newTitle,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      icon: ''
    }

    await electron.saveNote(newNote)
    setNotes(prev => [newNote, ...prev])

    // Auto open new note
    setOpenNoteIds(prev => [...prev, newNote.id])
    setActiveNoteId(newNote.id)
    setShowSettings(false)
  }, [notes, t])

  const updateNote = async (updatedNote: Note) => {
    const oldId = updatedNote.id
    const newId = updatedNote.title

    if (oldId !== newId) {
      // Renaming logic
      const noteWithNewId = { ...updatedNote, id: newId, updatedAt: Date.now() }

      setNotes(prev => prev.map(n => n.id === oldId ? noteWithNewId : n))

      // Update Tab references
      setOpenNoteIds(prev => prev.map(id => id === oldId ? newId : id))
      setActiveNoteId(newId)

      if (electron) {
        await electron.saveNote({ ...noteWithNewId, id: oldId })
      }
    } else {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: Date.now() } : n))
      if (electron) {
        await electron.saveNote({ ...updatedNote, updatedAt: Date.now() })
      }
    }
  }

  const deleteNote = async (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (!noteToDelete) return;

    if (confirm(t('deleteNote') + '?')) {
      if (electron) {
        await electron.deleteNote(noteToDelete.title)
      }
      const newNotes = notes.filter(n => n.id !== noteId)
      setNotes(newNotes)

      // Close tab if open
      if (openNoteIds.includes(noteId)) {
        handleCloseTab(noteId)
      }
    }
  }

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true)
    // setActiveNoteId(undefined) // Settings overlays content now? Or separate view?
    // Reuse logic: settings hides editor.
  }, [])

  const handleSelectNote = (id: string) => {
    if (!openNoteIds.includes(id)) {
      setOpenNoteIds([...openNoteIds, id])
    }
    setActiveNoteId(id)
    setShowSettings(false)
  }

  const handleCloseTab = (id: string) => {
    const newOpenIds = openNoteIds.filter(tabId => tabId !== id)
    setOpenNoteIds(newOpenIds)

    if (activeNoteId === id) {
      // Switched to last opened or undefined
      setActiveNoteId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : undefined)
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: New Note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNewNote()
      }

      // Ctrl+W: Close Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        if (activeNoteId) {
          handleCloseTab(activeNoteId)
        }
      }

      // Ctrl+P or Ctrl+K: Focus Search (Not easy to focus Sidebar input directly without ref, skipping for MVP or just open settings?)
      // Let's assume Ctrl+, opens Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        handleOpenSettings()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [createNewNote, activeNoteId, handleOpenSettings])

  const activeNote = notes.find(n => n.id === activeNoteId)
  const openNotes = openNoteIds.map(id => notes.find(n => n.id === id)).filter(Boolean) as Note[]

  return (
    <div className="flex h-screen w-full bg-background text-foreground antialiased selection:bg-primary selection:text-white transition-colors duration-300">
      <Sidebar
        notes={notes}
        activeNoteId={showSettings ? undefined : activeNoteId}
        setActiveNoteId={handleSelectNote}
        createNewNote={createNewNote}
        deleteNote={deleteNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSettings={handleOpenSettings}
        showSettings={showSettings}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        appIcon={appIcon}
      />

      <main className="flex-1 h-full overflow-hidden bg-background relative flex flex-col">
        {showSettings ? (
          <Settings
            onClose={() => setShowSettings(false)}
            appIcon={appIcon}
            setAppIcon={setAppIcon}
          />
        ) : (
          <>
            <TabBar
              openNotes={openNotes}
              activeNoteId={activeNoteId}
              onSelectTab={handleSelectNote}
              onCloseTab={handleCloseTab}
            />
            <div className="flex-1 overflow-hidden relative">
              <Editor
                activeNote={activeNote}
                onUpdateNote={updateNote}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
