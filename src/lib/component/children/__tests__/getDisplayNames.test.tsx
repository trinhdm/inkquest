import { Fragment } from 'react'
import { getDisplayNames } from '../getDisplayNames'
import { Anonymous, Named, OtherNamed } from './utils'

describe('getDisplayNames', () => {
	it('returns an empty list for no children', () => {
		expect(getDisplayNames(undefined)).toEqual([])
		expect(getDisplayNames(null)).toEqual([])
		expect(getDisplayNames([])).toEqual([])
	})

	it('reads the displayName of each component child, in order', () => {
		expect(getDisplayNames([<Named key="a" />, <OtherNamed key="b" />]))
			.toEqual(['Named', 'OtherNamed'])
	})

	it('reads a single child that is not wrapped in an array', () => {
		expect(getDisplayNames(<Named />)).toEqual(['Named'])
	})

	it('yields undefined for a component with no displayName', () => {
		expect(getDisplayNames(<Anonymous />)).toEqual([undefined])
	})

	it('yields undefined for a host element, which has no displayName', () => {
		expect(getDisplayNames(<div />)).toEqual([undefined])
	})

	it('yields undefined for text and numbers while keeping their slot', () => {
		expect(getDisplayNames(['loose', 42, <Named key="n" />]))
			.toEqual([undefined, undefined, 'Named'])
	})

	it('skips what renders nothing, so booleans and null do not take a slot', () => {
		expect(getDisplayNames([null, false, true, undefined, <Named key="n" />]))
			.toEqual(['Named'])
	})

	it('yields undefined for a Fragment instead of looking inside it', () => {
		expect(getDisplayNames(<Fragment><Named /></Fragment>)).toEqual([undefined])
	})

	it('flattens nested arrays', () => {
		expect(getDisplayNames([[<Named key="a" />], [[<OtherNamed key="b" />]]]))
			.toEqual(['Named', 'OtherNamed'])
	})
})
