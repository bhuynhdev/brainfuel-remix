import { ActionArgs, json, LinksFunction, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import React, { useState } from 'react';
import { NoteEditor } from '~/components/NoteEditor';
import markdownStyles from '~/styles/markdown.css';
import { db } from '~/utils/db.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: markdownStyles }];
};

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

export type LoadedNote = Awaited<ReturnType<typeof useLoaderData<typeof loader>>>['note'];

const Note: React.FC = () => {
	const { note, editMode } = useLoaderData<typeof loader>();
	const [isEditing, setIsEditting] = useState(editMode);

	const submit = useSubmit();

	return (
		<NoteEditor
			note={note}
			isEditMode={isEditing}
			submitNoteFn={submit}
			setEditMode={setIsEditting}
			key={note?.id || 'undefined'}
		/>
	);
};

export default Note;
