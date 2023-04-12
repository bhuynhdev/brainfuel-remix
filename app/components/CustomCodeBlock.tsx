import React, { FormEvent, MouseEventHandler, useRef, useState } from 'react';
import cn from 'classnames';
import FlashcardViewer from './FlashcardViewer';
import CodeQuiz from './CodeQuiz';
import { AugmentedCodeProps } from './MarkdownRenderer';
import { type NodeViewContext, useNodeViewContext } from '@prosemirror-adapter/react';
import { codeBlockSchema } from '@milkdown/preset-commonmark';
import { expectDomTypeError } from '@milkdown/exception';
import { $nodeAttr } from '@milkdown/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { getPrismLanguage } from '~/utils/misc';
import { FlashcardCodeBlock } from './Flashcard';

// Extend CodeBlockSchema to support meta string
/// HTML attributes for code block node.
export const codeBlockAttr = $nodeAttr('codeBlock', () => ({
	pre: {},
	code: {},
}));

interface CustomCodeBlockProps extends AugmentedCodeProps {}

// List of special codeblock languages used for special blocks
const SPECIAL_LANGUAGE_LIST = ['cw', 'qa'];

export const CustomCodeBlock = () => {
	const nodeViewContext = useNodeViewContext();
	console.log(nodeViewContext.node);
	const language = nodeViewContext.node.attrs.language || 'text';
	if (language === 'qa') {
		return <FlashcardCodeBlock nodeViewContext={nodeViewContext} />;
	}
	return <CodeBlockWithQuiz nodeViewContext={nodeViewContext} />;
};

const langs = ['text', 'typescript', 'javascript', 'html', 'css', 'json', 'markdown', 'python'];

const CodeBlockWithQuiz = ({ nodeViewContext }: { nodeViewContext: NodeViewContext }) => {
	const { contentRef, selected, node, setAttrs } = nodeViewContext;
	const [isQuiz, setIsQuiz] = useState((node.attrs.meta as string)?.includes('quiz'));
	const [quizAnswer, setQuizAnswer] = useState(''); // State to track what the user is typing in the quiz box
	const quizTextareaRef = useRef<HTMLTextAreaElement>(null);
	const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

	const codeBlockValue = node.attrs.value;

	const checkQuizAnswer: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		if (!quizTextareaRef.current) {
			return;
		}
		const answer = quizTextareaRef.current.value.trim();
		const isAnswerCorrect = answer === codeBlockValue;
		console.log('isAnswerCorrect', isAnswerCorrect);
		setAnswerStatus(!answer ? 'idle' : isAnswerCorrect ? 'correct' : 'wrong');
	};

	const ControlBar = () => {
		return (
			<div contentEditable="false" suppressContentEditableWarning className="mb-2 flex justify-between">
				<select
					className="focus:ring-offset-2s cursor-pointer rounded !border-0 bg-white shadow-sm focus:ring-2"
					value={node.attrs.language || 'text'}
					disabled={isQuiz}
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
				<div className="control-buttons flex w-40 justify-end">
					{isQuiz && (
						<button
							type="button"
							onClick={checkQuizAnswer}
							className="font-sm rounded border border-gray-200 bg-purple-400 px-4 py-2 shadow-sm focus:ring-2 focus:ring-offset-2"
						>
							Check Answer
						</button>
					)}

					{!isQuiz && (
						<button
							type="submit"
							form=""
							className="rounded border border-gray-200 bg-white px-4 py-2 font-medium shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
							onClick={(e) => {
								e.preventDefault();
								navigator.clipboard.writeText(codeBlockValue);
							}}
						>
							Copy
						</button>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className={cn(selected ? 'ProseMirror-selectednode' : '', 'not-prose shado my-4 rounded bg-gray-200 p-5')}>
			<ControlBar />
			{!isQuiz ? (
				<div className="relative flex rounded-md bg-[#282a36]">
					<code
						spellCheck="false"
						className="absolute inset-0 flex resize-none whitespace-pre bg-transparent p-5 font-mono text-transparent caret-white outline-none"
						ref={contentRef}
					/>
					<SyntaxHighlighter
						language={getPrismLanguage(node.attrs.language)}
						style={atomDark}
						className="!m-0 !flex-1 !rounded-xl !bg-transparent !p-5 !leading-7"
						key="no-quiz"
					>
						{codeBlockValue + '\n'}
					</SyntaxHighlighter>
				</div>
			) : (
				<div
					className={cn('relative flex min-h-[150px] rounded-md bg-[#282a36]', {
						'border-[6px]': answerStatus !== 'idle',
						'border-green-600': answerStatus === 'correct',
						'border-red-600': answerStatus === 'wrong',
					})}
					tabIndex={0}
					onKeyDown={() => quizTextareaRef.current?.focus()}
					onClick={() => quizTextareaRef.current?.focus()}
				>
					<textarea
						spellCheck="false"
						className="absolute inset-0 resize-none bg-transparent p-5 font-mono text-transparent caret-white outline-none"
						ref={quizTextareaRef}
						value={quizAnswer}
						onChange={(e) => {
							setQuizAnswer(e.target.value);
							setAnswerStatus('idle');
						}}
					/>
					<SyntaxHighlighter
						language={node.attrs.language}
						style={atomDark}
						className="!m-0 !flex-1 !overflow-y-auto !bg-transparent !p-5 !leading-7"
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

export default CodeBlockWithQuiz;
