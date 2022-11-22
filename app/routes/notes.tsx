import { ActionArgs, json, LinksFunction, LoaderArgs, redirect } from '@remix-run/node';
import { Link, Outlet, RouteMatch, useFetcher, useLoaderData, useMatches } from '@remix-run/react';
import styles from '~/styles/notes.css';
import { db } from '~/utils/db.server';
import { getUser, requireUser } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
	// Can't use "requireUser" here because "/notes/$id" route may be public
	const user = await getUser(request);
	if (!user) {
		return json({ notes: [] });
	}
	return json({ notes: await db.note.findMany({ where: { userId: user.id } }) });
};

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const createdNote = await db.note.create({
		data: { title: 'Untitled', content: '', userId: user.id },
		select: { id: true },
	});
	return redirect(`notes/${createdNote.id}?edit=true`);
};

/**
 * Get the loader data from "$id" route
 * @param matches The matches array from useMatches
 * @returns Object containing the id of the active note and its data (if any)
 */
function extractActiveRouteData(matches: RouteMatch[]) {
	// Filter to only get match info from the relevant "$id" route
	const filteredMatches = matches.filter((match) => match.id.includes('$id'));
	const currentNote = filteredMatches.length === 0 ? null : filteredMatches[0].params.id;
	if (currentNote) {
		return { currentNote, noteData: filteredMatches[0].data };
	}
	return { currentNote: null, noteData: {} };
}

export default function Notes() {
	const fetcher = useFetcher();
	const matches = useMatches();
	const { currentNote, noteData } = extractActiveRouteData(matches);
	// Should also show sidebar in case "$id" route is not matched - no activeNote, i.e in the root "/notes" route
	const sideBarShouldShow = !currentNote || noteData.showSidebar;
	const { notes } = useLoaderData<typeof loader>();
	return (
		<>
			<main className={sideBarShouldShow ? 'main-grid' : 'grid'}>
				{sideBarShouldShow && (
					<aside
						id="note-list"
						className="h-[min(max-content, 90vh)] sticky top-0 flex flex-col self-start rounded-md bg-white p-3 shadow-md"
					>
						<div className="mb-4 flex flex-row items-center justify-between">
							<h1 className="text-2xl font-bold">Your Notes</h1>
							<form method="POST" action="/notes">
								<button
									type="submit"
									className="rounded-3xl bg-blue-500 px-4 py-2 font-bold uppercase tracking-wider text-white"
								>
									New
								</button>
							</form>
						</div>
						<ul className="flex flex-col gap-4 overflow-y-auto">
							{notes.map((note) => (
								<li key={note.id} className="relative">
									<Link to={note.id}>
										<div className="rounded-md bg-gray-200 p-4">
											<p className="text-lg font-bold">{note.title}</p>
											<p>{new Date(note.createdAt).toLocaleString()}</p>
										</div>
									</Link>
									<fetcher.Form method="post" action={`/notes/${note.id}`} className="absolute top-4 right-3">
										<button type="submit" className="rounded-2xl bg-red-600 px-2 py-1 text-xs text-white">
											Delete
										</button>
										<input type="hidden" name="_action" value="delete" />
										{/* Needs to redirect back to "/notes" if current active note is also note to delete */}
										<input type="hidden" name="redirectTo" value={`${currentNote === note.id ? '/notes' : ''}`} />
									</fetcher.Form>
								</li>
							))}
						</ul>
					</aside>
				)}
				<div className="rounded-md bg-white p-14">
					<Outlet />
				</div>
			</main>
		</>
	);
}
