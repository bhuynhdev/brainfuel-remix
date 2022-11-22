import { ActionArgs, json, LinksFunction, LoaderArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData, useSubmit } from '@remix-run/react';
import React, { useState } from 'react';
import { NoteEditor } from '~/components/NoteEditor';
import markdownStyles from '~/styles/markdown.css';
import { db } from '~/utils/db.server';
import { getUserId, requireUser } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: markdownStyles }];
};

export const loader = async ({ params, request }: LoaderArgs) => {
	const url = new URL(request.url);
	const edit = url.searchParams.get('edit'); // Open the note in edit mode or not
	const note = await db.note.findUnique({ where: { id: params.id } });
	const userId = await getUserId(request);
	// Show sidebar when the note owner is the current user
	// Else (if the current viewer is not the owner, or user not logged in) should not show sidebar
	// This info is to be used on "notes" parent route with "useMatches"
	const showSidebar = userId && userId === note?.userId;
	return json({ note, editMode: edit === 'true', showSidebar });
};

export const action = async ({ request, params }: ActionArgs) => {
	const user = await requireUser(request);
	const form = await request.formData();
	const noteId = params.id;
	const _action = form.get('_action');
	switch (_action) {
		case 'update': {
			const title = form.get('title');
			const content = form.get('content');
			// Do this type check to be extra sure and to make TypeScript happy
			if (typeof title !== 'string' || typeof content !== 'string') {
				throw new Error(`Form not submitted correctly.`);
			}
			await db.note.updateMany({
				where: { id: noteId, userId: user.id },
				data: {
					title: title,
					content: content,
					updatedAt: new Date().toISOString(),
				},
			});
			return json({});
		}
		case 'delete': {
			// do your delete
			await db.note.delete({ where: { id: noteId } });
			const redirectTo = form.get('redirectTo');
			// Redirect back if current active note is also note to delete
			if (typeof redirectTo === 'string' && redirectTo !== '') {
				return redirect(redirectTo);
			}
			return json({});
		}
		default: {
			throw new Error(`Unexpected action ${_action}`);
		}
	}
};

export type LoadedNote = Awaited<ReturnType<typeof useLoaderData<typeof loader>>>['note'];

const Note: React.FC = () => {
	const { note, editMode } = useLoaderData<typeof loader>();
	const [isEditing, setIsEditting] = useState(editMode);
	const submit = useSubmit();

	if (!note) {
		return (
			<div>
				<h1>404 Error: Resource not found</h1>
				<p>
					Click{' '}
					<Link to="/" className="text-blue-600 underline">
						here
					</Link>{' '}
					to go back to our home page
				</p>
			</div>
		);
	}

	return (
		<>
			<NoteEditor
				note={note}
				isEditMode={isEditing}
				submitNoteFn={submit}
				setEditMode={setIsEditting}
				key={note?.id || 'undefined'}
			/>
		</>
	);
};

export default Note;
