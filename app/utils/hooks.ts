import React, { useEffect, useState } from 'react';

// Credit: https://gist.github.com/tomslutsky/f87a253a1dc43a1797306a79243a25ed#file-debounced-search-tsx
export function useDebouncedState<T = any>(
	initialValue: T,
	delay: number
): [T, boolean, T, React.Dispatch<React.SetStateAction<T>>] {
	// State and setters for debounced value
	const [value, setValue] = useState(initialValue);
	const [debouncedValue, setDebouncedValue] = useState(value);
	let [isDebouncing, setDebouncing] = useState(false);
	useEffect(
		() => {
			// Update debounced value after delay
			setDebouncing(true);
			const handler = setTimeout(() => {
				setDebouncing(false);
				setDebouncedValue(value);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay] // Only re-call effect if value or delay changes
	);
	return [debouncedValue, isDebouncing, value, setValue];
}
