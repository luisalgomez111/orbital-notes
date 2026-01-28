export interface Note {
    id: string
    title: string
    content: string
    createdAt: number
    updatedAt: number
    icon?: string
    tags?: string[]
}
