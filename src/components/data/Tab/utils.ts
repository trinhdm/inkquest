export interface TabIds {
	control: string
	panel: string
}

export const getTabIds = (uid: string, index: number): TabIds => ({
	control: `${uid}-${index}`,
	panel: `${uid}-${index}-panel`,
})
