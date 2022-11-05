import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { db } from '~/utils/db.server';

export const loader = async ({ params, request }: LoaderArgs) => {
	const url = new URL(request.url);
	const edit = url.searchParams.get('edit'); // Open the note in edit mode or not
	const note = await db.note.findUnique({ where: { id: params.id } });
	return json({ note, editMode: edit === 'true' });
};

export const action = async ({ request, params }: ActionArgs) => {
	const form = await request.formData();
	const noteId = params.id;
	const title = form.get('title');
	const content = form.get('content');
	// Do this type check to be extra sure and to make TypeScript happy
	if (typeof title !== 'string' || typeof content !== 'string') {
		throw new Error(`Form not submitted correctly.`);
	}
	const updatedNote = await db.note.update({
		where: { id: noteId },
		data: {
			title: title,
			content: content,
			updatedAt: new Date().toISOString(),
		},
	});
	return json({ updatedNote: updatedNote });
};

interface NoteProps {
	prop?: string;
}

const Note: React.FC<NoteProps> = () => {
	const { note, editMode } = useLoaderData<typeof loader>();
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [isEditing, setIsEditting] = useState(editMode);
	const submit = useSubmit();

	useEffect(() => {
		// reset initial states when route changes
		setTitle(note?.title || '');
		setContent(note?.content || '');
	}, [note?.title, note?.content]);

	useEffect(() => {
		textAreaRef.current?.focus();
	}, [isEditing]);

	const handleSaveNote = (e: FormEvent<HTMLFormElement>) => {
		setIsEditting(false);
		submit(e.currentTarget);
	};

	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	if (!isEditing) {
		return (
			<div className="relative" key={note?.id}>
				<p className="mb-4">Last updated {note ? new Date(note.createdAt).toDateString() : Date()}</p>
				<h1 className="mb-12 text-5xl font-bold">{note?.title || ''}</h1>
				<button
					type="button"
					onClick={() => setIsEditting(true)}
					className="absolute right-0 top-0 rounded-3xl bg-blue-500 px-6 py-2 text-xl font-bold uppercase tracking-wide text-white"
				>
					Edit
				</button>
				<div id="note-content">
					<ReactMarkdown>{note?.content || ''}</ReactMarkdown>
				</div>
			</div>
		);
	}

	// Edit mode
	return (
		<div className="grid h-full grid-cols-2 gap-24" key={note?.id}>
			<form id="markdown-form" className="flex flex-col gap-3" method="post" onSubmit={handleSaveNote}>
				<div>
					<label htmlFor="markdown-title" className="sr-only">
						Title:
					</label>
					<input
						type="text"
						id="markdown-title"
						name="title"
						className="border-2 px-2 py-1"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
				<textarea
					id="markdown-content"
					name="content"
					className="h-full w-full rounded-sm border-2 px-2 py-1 font-mono"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					ref={textAreaRef}
				></textarea>
			</form>
			<div className="relative">
				<p className="mb-4">Last updated {note ? new Date(note.createdAt).toDateString() : Date()}</p>
				<h1 className="mb-12 text-5xl font-bold">{title}</h1>
				<div id="note-content">
					<button
						type="submit"
						form="markdown-form"
						className="absolute top-0 right-0 rounded-3xl bg-blue-500 px-6 py-2 text-white"
					>
						&#10003; Done
					</button>
					<ReactMarkdown>{content}</ReactMarkdown>
				</div>
			</div>
		</div>
	);
};

export default Note;
