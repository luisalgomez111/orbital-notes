"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
(0, electron_context_menu_1.default)({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
});
const DIST = process.env.DIST || path_1.default.join(__dirname, '../dist');
const PUBLIC = process.env.VITE_PUBLIC || electron_1.app.isPackaged ? DIST : path_1.default.join(DIST, '../public');
let win;
const configPath = path_1.default.join(electron_1.app.getPath('userData'), 'config.json');
function getVaultPath() {
    try {
        if (fs_1.default.existsSync(configPath)) {
            const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
            if (config.vaultPath && fs_1.default.existsSync(config.vaultPath)) {
                return config.vaultPath;
            }
        }
    }
    catch (e) {
        console.error("Failed to read config:", e);
    }
    // Default
    return path_1.default.join(electron_1.app.getPath('documents'), 'Orbital');
}
// Initialize
let orbitalPath = getVaultPath();
if (!fs_1.default.existsSync(orbitalPath)) {
    fs_1.default.mkdirSync(orbitalPath, { recursive: true });
}
// Handlers for Vault Management
electron_1.ipcMain.handle('get-vault-path', () => orbitalPath);
electron_1.ipcMain.handle('select-directory', async () => {
    if (!win)
        return null;
    const result = await electron_1.dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const newPath = result.filePaths[0];
        // Save to config
        fs_1.default.writeFileSync(configPath, JSON.stringify({ vaultPath: newPath }));
        // Update runtime var
        orbitalPath = newPath;
        return newPath;
    }
    return null;
});
electron_1.ipcMain.handle('get-notes', async () => {
    try {
        // Re-check path just in case
        if (!fs_1.default.existsSync(orbitalPath)) {
            fs_1.default.mkdirSync(orbitalPath, { recursive: true });
        }
        const files = fs_1.default.readdirSync(orbitalPath).filter(file => file.endsWith('.md'));
        const notes = files.map(file => {
            try {
                const rawContent = fs_1.default.readFileSync(path_1.default.join(orbitalPath, file), 'utf-8');
                const { data, content } = (0, gray_matter_1.default)(rawContent); // Parse Frontmatter
                const stats = fs_1.default.statSync(path_1.default.join(orbitalPath, file));
                return {
                    id: file.replace('.md', ''),
                    title: file.replace('.md', ''),
                    content: content,
                    createdAt: stats.birthtimeMs,
                    updatedAt: stats.mtimeMs,
                    icon: data.icon,
                    tags: data.tags
                };
            }
            catch (err) {
                return null;
            }
        }).filter(n => n !== null);
        return notes;
    }
    catch (error) {
        console.error('Error reading notes:', error);
        return [];
    }
});
electron_1.ipcMain.handle('save-note', async (_, note) => {
    const newPath = path_1.default.join(orbitalPath, `${note.title}.md`);
    // Check if we need to rename (ID exists, ID != Title, and old file exists)
    if (note.id && note.id !== note.title) {
        const oldPath = path_1.default.join(orbitalPath, `${note.id}.md`);
        if (fs_1.default.existsSync(oldPath)) {
            try {
                fs_1.default.renameSync(oldPath, newPath);
            }
            catch (e) {
                console.error("Rename failed, creating new file:", e);
            }
        }
    }
    try {
        // Construct Frontmatter
        const fileContent = gray_matter_1.default.stringify(note.content || '', {
            icon: note.icon || '',
            tags: note.tags || []
        });
        fs_1.default.writeFileSync(newPath, fileContent);
        return true;
    }
    catch (e) {
        console.error("Failed to save note:", e);
        return false;
    }
});
electron_1.ipcMain.handle('delete-note', async (_, title) => {
    const filePath = path_1.default.join(orbitalPath, `${title}.md`);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
        return true;
    }
    return false;
});
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
function createWindow() {
    win = new electron_1.BrowserWindow({
        icon: path_1.default.join(PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.cjs'),
        },
        autoHideMenuBar: true,
    });
    // Open DevTools for debugging
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
        console.log('Loading URL:', VITE_DEV_SERVER_URL);
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        console.log('No VITE_DEV_SERVER_URL found. Falling back to index.html');
        // win.loadFile('dist/index.html')
        win.loadFile(path_1.default.join(DIST, 'index.html'));
    }
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.whenReady().then(createWindow);
//# sourceMappingURL=main.js.map