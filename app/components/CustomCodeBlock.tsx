import React, { MouseEventHandler, useState } from 'react';
import cn from 'classnames';
import FlashCards from './FlashCards';
import CodeQuiz from './CodeQuiz';
import { AugmentedCodeProps } from './MarkdownRenderer';
import { useNodeViewContext } from '@prosemirror-adapter/react';
import { codeBlockSchema } from '@milkdown/preset-commonmark';
import { expectDomTypeError } from '@milkdown/exception';
import { $nodeAttr } from '@milkdown/utils';

// Extend CodeBlockSchema to support meta string
/// HTML attributes for code block node.
export const codeBlockAttr = $nodeAttr('codeBlock', () => ({
	pre: {},
	code: {},
}));

export const codeBlockWithMeta = codeBlockSchema.extendSchema((prev) => {
	return (ctx) => {
		const baseSchema = prev(ctx);
		return {
			...baseSchema,
			attrs: {
				...baseSchema.attrs,
				meta: { default: '' },
			},
			parseMarkdown: {
				match: ({ type }) => type === 'code',
				runner: (state, node, type) => {
					const language = node.lang as string;
					const meta = node.meta as string;
					const value = node.value as string;
					state.openNode(type, { language, meta });
					if (value) state.addText(value);
					state.closeNode();
				},
			},
			toMarkdown: {
				match: (node) => node.type.name === 'code_block',
				runner: (state, node) => {
					state.addNode('code', undefined, node.content.firstChild?.text || '', {
						lang: node.attrs.language,
						meta: node.attrs.meta,
					});
				},
			},
			parseDOM: [
				{
					tag: 'pre',
					preserveWhitespace: 'full',
					getAttrs: (dom) => {
						if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom);
						return { language: dom.dataset.language, meta: dom.dataset.meta };
					},
				},
			],
			toDOM: (node) => {
				const attr = ctx.get(codeBlockAttr.key)(node);
				return [
					'pre',
					{
						...attr.pre,
						'data-language': node.attrs.language,
						'data-meta': node.attrs.meta,
					},
					['code', attr.code, 0],
				];
			},
		};
	};
});

interface CustomCodeBlockProps extends AugmentedCodeProps {}

const CustomCodeBlockOld: React.FC<CustomCodeBlockProps> = ({ node, inline, children, className, ...props }) => {
	const language = node.data?.lang || 'plaintext';
	if (language === 'qa') {
		return <FlashCards node={node} />;
	}
	if (node.data?.meta?.includes('quiz')) {
		return <CodeQuiz node={node} />;
	}
	// Normal code block
	return (
		<code {...props} className={cn(className, 'relative')}>
			{!inline && <span className="absolute left-3 top-0 text-[10px] uppercase">{node.properties?.dataLang}</span>}
			{children}
		</code>
	);
};

const langs = ['text', 'typescript', 'javascript', 'html', 'css', 'json', 'markdown', 'python'];

const CustomCodeBlock = () => {
	const { contentRef, selected, node, setAttrs } = useNodeViewContext();
	const [isToggleButtonPressed, setIsToggleButtonPressed] = useState((node.attrs.meta as string)?.includes('quiz'));
	return (
		<div className={cn(selected ? 'ProseMirror-selectednode' : '', 'not-prose shado my-4 rounded bg-gray-200 p-5')}>
			<div contentEditable="false" suppressContentEditableWarning className="mb-2 flex justify-between">
				<select
					className="focus:ring-offset-2s cursor-pointer rounded !border-0 bg-white shadow-sm focus:ring-2"
					value={node.attrs.language || 'text'}
					onChange={(e) => {
						setAttrs({ language: e.target.value });
					}}
				>
					{langs.map((lang) => (
						<option value={lang} key={lang}>
							{lang}
						</option>
					))}
				</select>

				<ToggleButton
					text="Quiz"
					isPressed={isToggleButtonPressed}
					clickHandler={() => {
						setIsToggleButtonPressed((prev) => !prev);
						setAttrs({ meta: 'quiz' });
					}}
				/>

				<button
					className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 dark:bg-black"
					onClick={(e) => {
						e.preventDefault();
						navigator.clipboard.writeText(node.textContent);
					}}
				>
					Copy
				</button>
			</div>
			<pre spellCheck={false} className="!m-0 !mb-4">
				<code ref={contentRef} />
			</pre>
		</div>
	);
};

function ToggleButton({
	text,
	isPressed,
	clickHandler,
}: {
	text: string;
	isPressed: boolean;
	clickHandler: MouseEventHandler<HTMLButtonElement>;
}) {
	return (
		<button
			className="group flex cursor-pointer flex-row items-center gap-1 border-0 bg-transparent"
			aria-pressed={isPressed}
			onClick={clickHandler}
		>
			<span
				aria-hidden="true"
				className="toggle-slider relative h-8 w-14 rounded-2xl bg-gray-500 align-middle transition-colors
				before:absolute	before:top-1 before:left-1 before:aspect-square before:h-6 before:rounded-full before:bg-white before:transition-transform
				group-aria-pressed:bg-sky-500 group-aria-pressed:before:translate-x-full
				"
			></span>
			<span>{text}</span>
		</button>
	);
}

export default CustomCodeBlock;
