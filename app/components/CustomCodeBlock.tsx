import React, { MouseEventHandler, useRef, useState } from 'react';
import cn from 'classnames';
import FlashCards from './FlashCards';
import CodeQuiz from './CodeQuiz';
import { AugmentedCodeProps } from './MarkdownRenderer';
import { useNodeViewContext } from '@prosemirror-adapter/react';
import { codeBlockSchema } from '@milkdown/preset-commonmark';
import { expectDomTypeError } from '@milkdown/exception';
import { $nodeAttr } from '@milkdown/utils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

// Extend CodeBlockSchema to support meta string
/// HTML attributes for code block node.
export const codeBlockAttr = $nodeAttr('codeBlock', () => ({
	pre: {},
	code: {},
}));

interface CustomCodeBlockProps extends AugmentedCodeProps {}

// const CustomCodeBlockOld: React.FC<CustomCodeBlockProps> = ({ node, inline, children, className, ...props }) => {
// 	const language = node.data?.lang || 'plaintext';
// 	if (language === 'qa') {
// 		return <FlashCards node={node} />;
// 	}
// 	if (node.data?.meta?.includes('quiz')) {
// 		return <CodeQuiz node={node} />;
// 	}
// 	// Normal code block
// 	return (
// 		<code {...props} className={cn(className, 'relative')}>
// 			{!inline && <span className="absolute left-3 top-0 text-[10px] uppercase">{node.properties?.dataLang}</span>}
// 			{children}
// 		</code>
// 	);
// };

const langs = ['text', 'typescript', 'javascript', 'html', 'css', 'json', 'markdown', 'python'];

const CustomCodeBlock = () => {
	const { contentRef, selected, node, setAttrs } = useNodeViewContext();
	const [isQuiz, setIsQuiz] = useState((node.attrs.meta as string)?.includes('quiz'));
	const [quizAnswer, setQuizAnswer] = useState(''); // State to track what the user is typing in the quiz box
	const quizTextareaRef = useRef<HTMLTextAreaElement>(null);

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
					isPressed={isQuiz}
					clickHandler={() => {
						setIsQuiz((prev) => !prev);
						setAttrs({ meta: isQuiz ? '' : 'quiz' });
					}}
				/>

				<button
					className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
					onClick={(e) => {
						e.preventDefault();
						navigator.clipboard.writeText(node.textContent);
					}}
				>
					Copy
				</button>
			</div>
			{!isQuiz ? (
				<div className="relative flex rounded-md bg-[#282a36]">
					<code
						spellCheck="false"
						className="absolute inset-0 flex resize-none whitespace-pre bg-transparent p-5 font-mono text-transparent caret-white outline-none"
						ref={contentRef}
					/>
					<SyntaxHighlighter
						language={node.attrs.language}
						style={atomOneDark}
						className="!flex-1 !rounded-xl !bg-transparent !p-5"
						key="no-quiz"
					>
						{node.textContent + '\n'}
					</SyntaxHighlighter>
				</div>
			) : (
				<div
					className="relative flex min-h-[150px] rounded-md bg-[#282a36]"
					tabIndex={0}
					onKeyDown={() => quizTextareaRef.current?.focus()}
					onClick={() => quizTextareaRef.current?.focus()}
				>
					<textarea
						spellCheck="false"
						className="absolute inset-0 resize-none bg-transparent p-5 font-mono text-transparent caret-white outline-none"
						ref={quizTextareaRef}
						value={quizAnswer}
						onChange={(e) => setQuizAnswer(e.target.value)}
					/>
					<SyntaxHighlighter
						language={node.attrs.language}
						style={atomOneDark}
						className="!flex-1 !overflow-y-auto !bg-transparent !p-5"
						key="yes-quiz"
					>
						{quizAnswer + '\n'}
					</SyntaxHighlighter>
				</div>
			)}
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
