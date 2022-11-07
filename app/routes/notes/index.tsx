import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import { requireUser } from '~/utils/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	return json({ user });
};

const NotesIndex: React.FC = () => {
	const { user } = useLoaderData<typeof loader>();
	return (
		<div>
			<p>
				Hi, {user.username}{' '}
				<span role="img" aria-label="hand waving">
					👋
				</span>
			</p>
			<p>Click on a note on the left side bar to see its content, or create a new note</p>
		</div>
	);
};

export default NotesIndex;
