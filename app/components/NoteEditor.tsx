import { SubmitFunction } from '@remix-run/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
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
	const formRef = useRef<HTMLFormElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		// Focus the text area on page load
		textAreaRef.current?.focus();
	}, [isEditMode]);

	useEffect(() => {
		// Override Control + S to save note
		const ctrlSHandler = (e: KeyboardEvent) => {
			if (formRef.current && e.key === 's' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				submitNoteFn(formRef.current);
			}
		};
		document.addEventListener('keydown', ctrlSHandler);
		return () => {
			document.removeEventListener('keydown', ctrlSHandler);
		};
	}, []);

	const handleSaveNote = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEditMode(false);
		submitNoteFn(e.currentTarget);
	};

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
				<div className="markdown-body">
					<ReactMarkdown
						remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
						remarkRehypeOptions={{ passThrough: ['quiz'] }}
						rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
					>
						{content}
					</ReactMarkdown>
				</div>
			</div>
		);
	}

	// Edit mode
	return (
		<div className="relative grid h-full grid-cols-[45%,minmax(0,55%)] gap-10" key={note?.id}>
			<div>
				<NoteHeader title={title} createdAt={note?.createdAt} />
				<div className="markdown-body">
					<ReactMarkdown
						remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
						remarkRehypeOptions={{ passThrough: ['quiz'] }}
						rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
					>
						{content}
					</ReactMarkdown>
				</div>
			</div>

			<form id="note-form" className="flex w-full flex-col gap-3" method="post" onSubmit={handleSaveNote} ref={formRef}>
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
