
export const getAuthFormIDs = <T extends string>(
	pageID: string,
	screen: T
) => ({
	field: `${screen}-field`,
	form: `form-${screen}`,
	section: `${pageID}-${screen}`,
	timer: `${screen}-timer`,
})
