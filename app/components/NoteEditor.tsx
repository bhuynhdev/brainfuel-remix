import { SubmitFunction } from '@remix-run/react';
import { useState, useEffect, FormEvent, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { LoadedNote } from '~/routes/notes/$id';

interface NoteEditorProps {
	note: LoadedNote;
	isEditMode: boolean;
	submitNoteFn: SubmitFunction;
	setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, isEditMode, submitNoteFn, setEditMode }) => {
	const [title, setTitle] = useState(note?.title || '');
	const [content, setContent] = useState(note?.content || '');

	useEffect(() => {
		textAreaRef.current?.focus();
	}, [isEditMode]);

	const handleSaveNote = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEditMode(false);
		submitNoteFn(e.currentTarget);
	};

	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	if (!isEditMode) {
		return (
			<div className="relative" key={note?.id}>
				<NoteHeader title={note?.title} createdAt={note?.createdAt} />
				<button
					type="button"
					onClick={() => setEditMode(true)}
					className="absolute -top-5 right-0 rounded-3xl bg-blue-500 px-6 py-2 text-xl font-bold uppercase tracking-wide text-white"
				>
					Edit
				</button>
				<div className="rendered-md">
					<ReactMarkdown>{note?.content || ''}</ReactMarkdown>
				</div>
			</div>
		);
	}

	// Edit mode
	return (
		<div className="relative grid h-full grid-cols-[45%,minmax(0,55%)] gap-10" key={note?.id}>
			<div>
				<NoteHeader title={note?.title} createdAt={note?.createdAt} />
				<div className="rendered-md">
					<ReactMarkdown>{content}</ReactMarkdown>
				</div>
			</div>

			<form id="note-form" className="flex w-full flex-col gap-3" method="post" onSubmit={handleSaveNote}>
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
					id="note-content-input"
					name="content"
					className="h-full w-full rounded-sm border-2 px-2 py-1 font-mono"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					ref={textAreaRef}
				></textarea>
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
		</div>
	);
};

const NoteHeader: React.FC<{ createdAt?: string; title?: string }> = ({ createdAt, title }) => {
	return (
		<>
			<p className="mb-4">Last updated {createdAt ? new Date(createdAt).toLocaleString() : Date()}</p>
			<h1 className="mb-12 text-5xl font-bold">{title || ''}</h1>
		</>
	);
};
