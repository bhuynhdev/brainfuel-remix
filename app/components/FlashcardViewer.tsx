import React, { useRef, useState } from 'react';
import cn from 'classnames';

/**
 * Parse the flashcard block content using regular expression
 * The flashcard content should follow these rules
 * ?> To start a question
 * > Answer to question
 */
// Match everything between ?? and ?> or end-of-text
// Since Js does not support the End of text \Z, we emulate \Z with $(?![\r\n]) https://stackoverflow.com/a/73843315/14426823
const QUESTION_REGEX = /^\?\?(?<=\?\?)(.*?)(?=(?:\n\?>|$(?![\r\n])))/gms;
// Match everything between ?> and ?? or end-of-text
const ANSWER_REGEX = /^\?>(?<=\?>)(.*?)(?=(?:\n\?\?|$(?![\r\n])))/gms;

/**
 * Zip to string array together, so their values are interleaving
 * @param arr1
 * @param arr2
 * @returns The zipped array, and its length
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
	const result: Array<[string, string]> = [];
	for (const [index, val1] of arr1.entries()) {
		result.push([val1, arr2[index]]);
	}
	return [result, Math.max(len1, len2)] as const;
}

const FlashcardViewer = ({ content }: { content: string }) => {
	const modalRef = useRef<HTMLDialogElement>(null);
	const [isCardFront, setIsCardFront] = useState(true);
	const [cardIndex, setCardIndex] = useState(0);
	// Each entry in questions can be deemed as an array, where the 2nd item (and above) are the captured group
	// Since we only have 1 capture group, the data we want is in the 2nd item
	const questions = Array.from(content.matchAll(QUESTION_REGEX)).map((result) => result[1].trim());
	const answers = Array.from(content.matchAll(ANSWER_REGEX)).map((result) => result[1].trim());
	const [qaPairs, qaPairCount] = zip(questions, answers);
	const [currentQuestion, currentAnswer, index] = qaPairCount > 0 ? qaPairs[cardIndex] : ['', '', 0];

	const showModal = () => {
		modalRef.current?.showModal();
	};

	const flipCard = () => {
		setIsCardFront((prev) => !prev);
	};

	return (
		<>
			<div className="relative min-h-[200px] font-sans">
				{/* <button
					type="button"
					className="absolute right-[7%] top-2 bg-purple-300 py-1 px-3 rounded-lg font-sans"
					onClick={showModal}
				>
					Show
				</button> */}
				<div className="flashcard">
					<button
						onClick={flipCard}
						aria-label="flip"
						className="flashcard__flipbtn absolute right-2 top-2 z-10 text-2xl"
					>
						<span aria-hidden="true">🔄</span>
					</button>
					{/* Show the Next and Previous button only when there's at least 2 cards */}
					{qaPairCount >= 2 && (
						<>
							<button
								aria-label="next"
								className="absolute top-24 right-1 z-10 text-xl"
								onClick={() => {
									setCardIndex((idx) => (idx + 1) % qaPairCount);
									setIsCardFront(true);
								}}
							>
								<span aria-hidden="true">⏭️</span>
							</button>
							<button
								aria-label="previous"
								className="absolute top-24 left-1 z-10 text-xl"
								onClick={() => {
									setCardIndex((idx) => (idx + qaPairCount - 1) % qaPairCount);
									setIsCardFront(true);
								}}
							>
								<span aria-hidden="true">⏮️</span>
							</button>
						</>
					)}
					{qaPairCount > 0 && (
						<div key={index} className={cn('flashcard__content bg-slate-200')}>
							<div className="flashcard__skeleton invisible"></div>
							<div className={cn('flashcard__front', { flipped: !isCardFront })}>
								<p className="text-lg font-bold">Question {cardIndex + 1}</p>
								<p className="ml-4">{currentQuestion}</p>
							</div>
							<div className={cn('flashcard__back', { flipped: !isCardFront })}>
								<p className="text-lg font-bold">Answer {cardIndex + 1}</p>
								<p className="ml-4">{currentAnswer}</p>
							</div>
						</div>
					)}
				</div>
			</div>
			{/* <dialog className="flashcard-modal font-sans" ref={modalRef}>
				<button onClick={flipCard}>Flip</button>
				{qaPairs.map(([question, answer], index) => (
					<div key={index} className={cn('flashcard', { flipped: !isCardFront })}>
						<div className="flashcard__front bg-slate-200">{question}</div>
						<div className="flashcard__back bg-slate-200">{answer}</div>
					</div>
				))}
			</dialog> */}
		</>
	);
};

export default FlashcardViewer;
