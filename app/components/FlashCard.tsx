import { type NodeViewContext } from '@prosemirror-adapter/react';
import * as Tabs from '@radix-ui/react-tabs';
import { useRef, useState } from 'react';
import FlashcardViewer from './FlashcardViewer';

export const FlashcardCodeBlock = ({ nodeViewContext }: { nodeViewContext: NodeViewContext }) => {
	const { node, setAttrs, selected } = nodeViewContext;
	const codeInput = useRef<HTMLTextAreaElement>(null);
	const [currentTab, setCurrentTab] = useState<'preview' | 'source'>('source');
	const codeBlockValue = node.attrs.value;

	// useEffect(() => {
	// 	requestAnimationFrame(() => {
	// 		if (!codePanel.current || currentTab !== 'preview' || loading) return;

	// 		// try {
	// 		// 	katex.render(code, codePanel.current, getEditor().ctx.get(katexOptionsCtx.key));
	// 		// } catch {}
	// 		console.log(code);
	// 	});
	// }, [code, getEditor, loading, currentTab]);

	return (
		<>
			<Tabs.Root
				contentEditable={false}
				className={selected ? 'ring-2 ring-offset-2' : ''}
				value={currentTab}
				onValueChange={(value) => {
					setCurrentTab(value as 'preview' | 'source');
				}}
			>
				<Tabs.List className="text-center text-gray-700">
					<div className="-mb-px flex flex-wrap">
						<Tabs.Trigger
							value="preview"
							className="inline-block p-4 hover:font-medium data-[state=active]:font-bold data-[state=active]:text-sky-700"
						>
							Preview
						</Tabs.Trigger>
						<Tabs.Trigger
							value="source"
							className="inline-block p-4 hover:font-medium data-[state=active]:font-bold data-[state=active]:text-sky-700"
						>
							Source
						</Tabs.Trigger>
					</div>
				</Tabs.List>
				<Tabs.Content value="preview">
					<FlashcardViewer content={codeBlockValue} />
				</Tabs.Content>
				<Tabs.Content value="source" className="relative">
					<textarea
						className="block h-48 w-full rounded-md bg-slate-800 p-5 font-mono text-gray-50 caret-white"
						defaultValue={codeBlockValue}
						ref={codeInput}
					/>
					<button
						className="absolute right-0 bottom-full mb-1 inline-flex items-center justify-center rounded border border-gray-600 bg-gray-600 px-6 py-2 text-base font-medium leading-6 text-gray-50 shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-offset-2"
						onClick={() => {
							setAttrs({ value: codeInput.current?.value || '' });
							setCurrentTab('preview');
						}}
					>
						OK
					</button>
				</Tabs.Content>
			</Tabs.Root>
		</>
	);
};
