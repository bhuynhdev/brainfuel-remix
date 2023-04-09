import { FormEvent, useState } from 'react';
import { type Element } from 'hast';
import cn from 'classnames';

interface CodeQuizProps {
	node: Element;
}

const CodeQuiz = ({ node }: CodeQuizProps): JSX.Element => {
	const target = (node.data?.value as string).trim() ?? '';
	const [answer, setAnswer] = useState('');
	const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

	const checkQuizAnswer = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const answer = new FormData(e.currentTarget).get('quiz-answer')?.toString().trim();
		console.log(answer, target, answer?.length, target.length);
		setAnswerStatus(!answer ? 'idle' : answer === target ? 'correct' : 'wrong');
	};

	return (
		<form className="relative" onSubmit={checkQuizAnswer}>
			<span className="absolute left-4 top-2 text-[10px] uppercase">{node.properties?.dataLang}</span>
			<textarea
				name="quiz-answer"
				rows={5}
				spellCheck="false"
				className={cn('w-full rounded-lg border-2 bg-slate-200 px-4 py-5', {
					'border-green-600': answerStatus === 'correct',
					'border-red-500': answerStatus === 'wrong',
				})}
				value={answer}
				onChange={(e) => {
					setAnswer(e.target.value);
					setAnswerStatus('idle');
				}}
			/>
			<button type="submit" className="absolute right-[7%] top-2 rounded-lg bg-purple-300 py-1 px-3 font-sans">
				Check
			</button>
		</form>
	);
};

export default CodeQuiz;
