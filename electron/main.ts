import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import contextMenu from 'electron-context-menu'

contextMenu({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
})

const DIST = process.env.DIST || path.join(__dirname, '../dist')
const PUBLIC = process.env.VITE_PUBLIC || app.isPackaged ? DIST : path.join(DIST, '../public')

let win: BrowserWindow | null

const configPath = path.join(app.getPath('userData'), 'config.json')

function getVaultPath(): string {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
            if (config.vaultPath && fs.existsSync(config.vaultPath)) {
                return config.vaultPath
            }
        }
    } catch (e) {
        console.error("Failed to read config:", e)
    }
    // Default
    return path.join(app.getPath('documents'), 'Orbital')
}

// Initialize
let orbitalPath = getVaultPath()
if (!fs.existsSync(orbitalPath)) {
    fs.mkdirSync(orbitalPath, { recursive: true })
}

// Handlers for Vault Management
ipcMain.handle('get-vault-path', () => orbitalPath)

ipcMain.handle('select-directory', async () => {
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
        const newPath = result.filePaths[0]
        // Save to config
        fs.writeFileSync(configPath, JSON.stringify({ vaultPath: newPath }))

        // Update runtime var
        orbitalPath = newPath
        return newPath
    }
    return null
})

ipcMain.handle('get-notes', async () => {
    try {
        // Re-check path just in case
        if (!fs.existsSync(orbitalPath)) {
            fs.mkdirSync(orbitalPath, { recursive: true })
        }

        const files = fs.readdirSync(orbitalPath).filter(file => file.endsWith('.md'))
        const notes = files.map(file => {
            try {
                const rawContent = fs.readFileSync(path.join(orbitalPath, file), 'utf-8')
                const { data, content } = matter(rawContent) // Parse Frontmatter

                const stats = fs.statSync(path.join(orbitalPath, file))
                return {
                    id: file.replace('.md', ''),
                    title: file.replace('.md', ''),
                    content: content,
                    createdAt: stats.birthtimeMs,
                    updatedAt: stats.mtimeMs,
                    icon: data.icon,
                    tags: data.tags
                }
            } catch (err) {
                return null
            }
        }).filter(n => n !== null)
        return notes
    } catch (error) {
        console.error('Error reading notes:', error)
        return []
    }
})

ipcMain.handle('save-note', async (_, note) => {
    const newPath = path.join(orbitalPath, `${note.title}.md`)

    // Check if we need to rename (ID exists, ID != Title, and old file exists)
    if (note.id && note.id !== note.title) {
        const oldPath = path.join(orbitalPath, `${note.id}.md`)
        if (fs.existsSync(oldPath)) {
            try {
                fs.renameSync(oldPath, newPath)
            } catch (e) {
                console.error("Rename failed, creating new file:", e)
            }
        }
    }

    try {
        // Construct Frontmatter
        const fileContent = matter.stringify(note.content || '', {
            icon: note.icon || '',
            tags: note.tags || []
        })

        fs.writeFileSync(newPath, fileContent)
        return true
    } catch (e) {
        console.error("Failed to save note:", e)
        return false
    }
})

ipcMain.handle('delete-note', async (_, title) => {
    const filePath = path.join(orbitalPath, `${title}.md`)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
    }
    return false
})

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
        },
        autoHideMenuBar: true,
    })

    // Open DevTools for debugging


    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        console.log('Loading URL:', VITE_DEV_SERVER_URL)
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        console.log('No VITE_DEV_SERVER_URL found. Falling back to index.html')
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)
