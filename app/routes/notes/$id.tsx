import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { db } from '~/utils/db.server';

export const loader = async ({ params }: LoaderArgs) => {
	const note = await db.note.findUnique({ where: { id: params.id } });
	return json({ note });
};

interface NoteProps {
	prop?: string;
}

const Note: React.FC<NoteProps> = () => {
	const { note } = useLoaderData<typeof loader>();
	return (
		<div>
			<ReactMarkdown>{note?.content || ''}</ReactMarkdown>
		</div>
	);
};

export default Note;
