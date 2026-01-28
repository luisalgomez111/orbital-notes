export interface ElectronAPI {
    getNotes: () => Promise<any[]>
    saveNote: (note: any) => Promise<boolean>
    deleteNote: (title: string) => Promise<boolean>
}

declare global {
    interface Window {
        electron: ElectronAPI
    }
}
