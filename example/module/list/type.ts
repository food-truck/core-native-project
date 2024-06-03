export interface ListState {
    list: Array<{
        id: string;
        name: string;
    }> | null;
}
