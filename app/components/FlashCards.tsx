import React, { useRef, useState } from 'react';
import { type Element } from 'hast';
import cn from 'classnames';

interface FlashCardProps {
	node: Element;
}

/**
 * Parse the flashcard block content using regular expression
 * The flashcard content should follow these rules
 * ?> To start a question
 * > Answer to question
 */
// Match everything between ?> and (> or end-of-text)
// Since Js does not support the End of text \Z, we emulate \Z with $(?![\r\n]) https://stackoverflow.com/a/73843315/14426823
const QUESTION_REGEX = /^\?>(?<=\?>)(.*?)(?=(?:\n>|$(?![\r\n])))/gms;
// Match everything between > and (?> or end-of-text)
const ANSWER_REGEX = /^>(?<=>)(.*?)(?=(?:\n\?>|$(?![\r\n])))/gms;

/**
 * Zip to string array together, so their values are interleaving
 * @param arr1
 * @param arr2
 */
function zip(arr1: string[], arr2: string[]) {
	const len1 = arr1.length;
	const len2 = arr2.length;
	const diff = Math.abs(len1 - len2);
	if (len1 > len2) {
		// Padd arr2 with empty string to be equal to arr1
		for (let i = 0; i < diff; i++) arr2.push('');
	}
	if (len2 > len1) {
		// Padd arr1 with empty string to be equal to arr1
		for (let i = 0; i < diff; i++) arr1.push('');
	}
	// Zip array together, now that they are equal length
	const result: Array<Array<string>> = [];
	for (const [index, val1] of arr1.entries()) {
		result.push([val1, arr2[index]]);
	}
	return result;
}

const FlashCards: React.FC<FlashCardProps> = ({ node }) => {
	const modalRef = useRef<HTMLDialogElement>(null);
	const [isCardFront, setIsCardFront] = useState(true);
	const content = (node.data?.value as string) || '';
	// Each entry in questions can be deemed as an array, where the 2nd item (and above) are the captured group
	// Since we only have 1 capture group, the data we want is in the 2nd item
	const questions = Array.from(content.matchAll(QUESTION_REGEX)).map((result) => result[1]);
	const answers = Array.from(content.matchAll(ANSWER_REGEX)).map((result) => result[1]);
	const qaPairs = zip(questions, answers);
	// TODO: Create a flash card for each question and answer pairs

	const showModal = () => {
		modalRef.current?.showModal();
	};

	const flipCard = () => {
		setIsCardFront((prev) => !prev);
	};

	return (
		<>
			<div className="relative font-sans">
				{/* <button
					type="button"
					className="absolute right-[7%] top-2 bg-purple-300 py-1 px-3 rounded-lg font-sans"
					onClick={showModal}
				>
					Show
				</button> */}
				<div className="flashcard-container">
					<button onClick={flipCard} className="flashcard__flipbtn absolute text-2xl right-2 top-2 z-10">
						<span aria-label="flip" role="img">
							🔄
						</span>
					</button>
					{qaPairs.map(([question, answer], index) => (
						<div key={index} className={cn('flashcard bg-slate-200', { flipped: !isCardFront })}>
							<div className="flashcard__skeleton invisible"></div>
							<div className="flashcard__front">
								<p className="font-bold text-lg">Question</p>
								<p>{question}</p>
							</div>
							<div className="flashcard__back">
								<p className="font-bold text-lg">Answer</p>
								<p>{answer}</p>
							</div>
						</div>
					))}
				</div>
			</div>
			<dialog className="flashcard-modal font-sans" ref={modalRef}>
				<button onClick={flipCard}>Flip</button>
				{qaPairs.map(([question, answer], index) => (
					<div key={index} className={cn('flashcard', { flipped: !isCardFront })}>
						<div className="flashcard__front bg-slate-200">{question}</div>
						<div className="flashcard__back bg-slate-200">{answer}</div>
					</div>
				))}
			</dialog>
		</>
	);
};

export default FlashCards;
