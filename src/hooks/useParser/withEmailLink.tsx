
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/

export const withEmailLink = (content: string) =>
	content.split(EMAIL_REGEX).map((text, index) => {
		if (EMAIL_REGEX.test(text))
			return <a key={ index } href={ `mailto:${text}` } data-cta=''>{ text }</a>

		return text
	})
