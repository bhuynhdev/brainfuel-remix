import React from 'react';
import cn from 'classnames';
import FlashCards from './FlashCards';
import CodeQuiz from './CodeQuiz';
import { AugmentedCodeProps } from './MarkdownRenderer';
import { useNodeViewContext } from '@prosemirror-adapter/react';
import { codeBlockSchema } from '@milkdown/preset-commonmark';

const hello = codeBlockSchema.extendSchema((prev) => {
	return (ctx) => {
		const schema = prev(ctx);
		schema.attrs = Object.assign({}, schema.attrs);
		schema.attrs.quiz = { default: false };
		return schema;
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

const langs = ['text', 'typescript', 'javascript', 'html', 'css', 'json', 'markdown'];

const CustomCodeBlock = () => {
	const { contentRef, selected, node, setAttrs } = useNodeViewContext();
	return (
		<div
			className={cn(
				selected ? 'ProseMirror-selectednode' : '',
				'not-prose my-4 rounded bg-gray-200 p-5 shadow dark:bg-gray-800'
			)}
		>
			<div contentEditable="false" suppressContentEditableWarning className="mb-2 flex justify-between">
				<select
					className="!focus:shadow-none cursor-pointer rounded !border-0 bg-white shadow-sm focus:ring-2 focus:ring-offset-2 dark:bg-black"
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

export default CustomCodeBlock;
