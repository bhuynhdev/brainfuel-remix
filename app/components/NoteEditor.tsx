import { SubmitFunction } from '@remix-run/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { LoadedNote } from '~/routes/notes/$id';
import MarkdownRenderer from './MarkdownRenderer';
import cn from 'classnames';

type NoteViewerProps = {
	note: LoadedNote;
	author: { name: string };
	showAuthor?: boolean;
	onChange: (newMarkdown: string) => void;
};

type NoteEditorProps = {
	note: LoadedNote;
	author: { name: string };
	showAuthor?: boolean;
	isEditModeInitial: boolean;
	submitNoteFn: SubmitFunction;
};

export function NoteViewer({ note, author, showAuthor = false, onChange }: NoteViewerProps) {
	if (!note) {
		return <div></div>;
	}
	const { title, createdAt, content } = note;
	return (
		<div>
			{showAuthor && <p>Author: {author.name}</p>}
			<p className="mb-4">Last updated {createdAt ? new Date(createdAt).toLocaleString() : Date()}</p>
			<h1 className="mb-12 text-5xl font-bold">{title || ''}</h1>
			<MarkdownRenderer content={content} onMarkdownChange={onChange} />
		</div>
	);
}

export function NoteEditor({ note, author, isEditModeInitial, submitNoteFn }: NoteEditorProps) {
	const [title, setTitle] = useState(note?.title || '');
	const [content, setContent] = useState(note?.content || '');
	const [isEditMode, setEditMode] = useState(isEditModeInitial);
	const noteEditFormRef = useRef<HTMLFormElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		// Focus the text area (instead of the title text input) upon entering Edit mode
		textAreaRef.current?.focus();
	}, [isEditMode]);

	// useEffect(() => {
	// 	const keyMapHandler = (e: KeyboardEvent) => {
	// 		// Override Control + S to save note
	// 		if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
	// 			e.preventDefault();
	// 			return submitNoteFn(noteEditFormRef.current, { preventScrollReset: true });
	// 		}
	// 		// Override Control + Q to Toggle edit mode (and save note)
	// 		if (e.key === 'q' && (e.metaKey || e.ctrlKey)) {
	// 			e.preventDefault();
	// 			if (!isEditMode) {
	// 				return setEditMode(true);
	// 			}
	// 		}
	// 	};
	// 	document.addEventListener('keydown', keyMapHandler);
	// 	return () => {
	// 		document.removeEventListener('keydown', keyMapHandler);
	// 	};
	// }, []);

	if (!note) {
		return <div>Cannot find note</div>;
	}

	const handleSaveNote = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEditMode(false);
		submitNoteFn(e.currentTarget);
	};

	// Edit mode
	return (
		<div className={`relative ${isEditMode && 'grid h-full grid-cols-[45%,minmax(0,55%)] gap-10'}`}>
			{!isEditMode && (
				<button
					type="button"
					onClick={() => setEditMode(true)}
					className="absolute -top-5 right-0 rounded-3xl bg-blue-500 px-6 py-2 text-xl font-bold uppercase tracking-wide text-white"
				>
					Edit
				</button>
			)}
			<NoteViewer note={note} author={author} onChange={(newMarkdown) => setContent(newMarkdown)} key={note.id} />

			{isEditMode && (
				<>
					<form
						id="note-form"
						className="flex w-full flex-col gap-3"
						method="post"
						onSubmit={handleSaveNote}
						ref={noteEditFormRef}
					>
						<div>
							<label htmlFor="note-title-input" className="sr-only">
								Title:
							</label>
							<input
								type="text"
								id="note-title-input"
								name="title"
								className="border-2 px-2 py-1"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<textarea
							key="text-content-input"
							id="note-content-input"
							name="content"
							className="h-full w-full rounded-sm border-2 px-2 py-1 font-mono"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							ref={textAreaRef}
						></textarea>
						<input type="hidden" name="_action" value="update" />
					</form>

					<div id="note-editmode-buttons" className="absolute -top-5 right-0 flex flex-row gap-3">
						<button
							className="rounded-3xl border-2 border-blue-500 px-6 py-2 text-blue-500"
							onClick={() => {
								setEditMode(false);
								// Reset any changes
								setContent(note?.content || '');
								setTitle(note?.title || '');
							}}
						>
							Cancel
						</button>
						<button className="rounded-3xl bg-blue-500 px-6 py-2 text-white" type="submit" form="note-form">
							&#10003; Done
						</button>
					</div>
				</>
			)}
		</div>
	);
}
