import { FormEvent, useState } from 'react';
import { type Element } from 'rehype-highlight/lib';
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
			<textarea
				name="quiz-answer"
				rows={5}
				className={cn('bg-slate-200 rounded-lg p-4 w-full border-2', {
					'border-green-600': answerStatus === 'correct',
					'border-red-500': answerStatus === 'wrong',
				})}
				value={answer}
				onChange={(e) => {
					setAnswer(e.target.value);
					setAnswerStatus('idle');
				}}
			/>
			<button type="submit" className="absolute right-[7%] top-2 bg-purple-300 py-1 px-3 rounded-lg font-sans">
				Check
			</button>
		</form>
	);
};

export default CodeQuiz;
