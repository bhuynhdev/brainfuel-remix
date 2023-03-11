import { ActionArgs, json, LinksFunction, LoaderArgs, redirect, Response } from '@remix-run/node';
import { Link, useLoaderData, useSubmit } from '@remix-run/react';
import React, { useState } from 'react';
import { NoteEditor, NoteViewer } from '~/components/NoteEditor';
import markdownStyles from '~/styles/markdown.css';
import flashCardStyles from '~/styles/flashcard.css';
import { db } from '~/utils/db.server';
import { getUser, getUserId, requireUser } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			// Github Markdown: https://github.com/sindresorhus/github-markdown-css
			href: 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.css',
		},
		{
			rel: 'stylesheet',
			// Highlight.js CSS to be used with "rehype-highlight"
			href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-light.min.css',
		},
		{ rel: 'stylesheet', href: flashCardStyles },
	];
};

export const loader = async ({ params, request }: LoaderArgs) => {
	const user = await getUser(request);
	const url = new URL(request.url);
	const edit = url.searchParams.get('edit'); // Open the note in edit mode or not
	const note = await db.note.findUnique({ where: { id: params.id } });
	const noteAuthor = await db.user.findUnique({ where: { id: note?.userId }, select: { id: true, username: true } });
	const userId = await getUserId(request);
	// Show sidebar when the note owner is the current user
	// Else (if the current viewer is not the owner, or user not logged in) should not show sidebar
	// This info is to be used on "notes" parent route with "useMatches"
	const showSidebar = userId && userId === note?.userId;
	return json({ user, note, author: noteAuthor, editMode: edit === 'true', showSidebar });
};

export const action = async ({ request, params }: ActionArgs) => {
	const user = await requireUser(request);
	const form = await request.formData();
	const noteId = params.id;
	// Check that the user is same as note's author
	const note = await db.note.findUnique({ where: { id: noteId } });
	if (!note) {
		return json({});
	}
	if (note.userId !== user.id) {
		throw new Response('Permission denied', { status: 403 });
	}
	const _action = form.get('_action');
	switch (_action) {
		case 'update': {
			const title = form.get('title');
			const content = form.get('content');
			// Do this type check to be extra sure and to make TypeScript happy
			if (typeof title !== 'string' || typeof content !== 'string') {
				throw new Response(`Form not submitted correctly.`, { status: 400 });
			}
			await db.note.update({
				where: { id: noteId },
				data: {
					title: title,
					content: content,
					updatedAt: new Date().toISOString(),
				},
			});
			return json({});
		}
		case 'delete': {
			await db.note.delete({ where: { id: noteId } });
			const redirectTo = form.get('redirectTo');
			// Redirect back if current active note is also note to delete
			if (typeof redirectTo === 'string' && redirectTo !== '') {
				return redirect(redirectTo);
			}
			return json({});
		}
		default: {
			throw new Response(`Unexpected action ${_action}`, { status: 400 });
		}
	}
};

export type LoadedNote = Awaited<ReturnType<typeof useLoaderData<typeof loader>>>['note'];

const Note: React.FC = () => {
	const { user, note, author, editMode } = useLoaderData<typeof loader>();
	// const [isEditing, setIsEditting] = useState(editMode);
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

	// If user is not logged in, or user is not note's author, then View only
	if (!user || note.userId !== user.id) {
		return <NoteViewer note={note} author={{ name: author?.username || 'Unknown' }} showAuthor />;
	}

	return (
		<NoteEditor
			note={note}
			author={{ name: user.username }}
			isEditModeInitial={editMode}
			submitNoteFn={submit}
			key={note?.id || 'undefined'}
		/>
	);
};

export default Note;
