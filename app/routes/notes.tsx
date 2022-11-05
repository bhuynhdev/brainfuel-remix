import { LinksFunction, json, ActionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { useLoaderData, Link } from '@remix-run/react';
import styles from '~/styles/notes.css';
import { db } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export const loader = async () => {
	const data = {
		notes: await db.note.findMany(),
	};
	return json(data);
};

export const action = async ({ request }: ActionArgs) => {
	const userId = await requireUserId(request);
	const createdNote = await db.note.create({
		data: { title: 'Untitled', content: '', userId: userId },
		select: { id: true },
	});
	return redirect(`notes/${createdNote.id}?edit=true`);
};

export default function Index() {
	const { notes } = useLoaderData<typeof loader>();
	return (
		<>
			<main className="main-grid">
				<aside
					id="note-list"
					className="h-[min(max-content, 90vh)] sticky top-0 flex flex-col self-start rounded-md bg-white p-3 shadow-md"
				>
					<div className="mb-4 flex flex-row items-center justify-between">
						<h1 className="text-2xl font-bold">Your Notes</h1>
						<form method="POST" action="/notes">
							<button className="rounded-3xl bg-blue-500 px-4 py-2 font-bold uppercase tracking-wider text-white">
								New
							</button>
						</form>
					</div>
					<ul className="flex flex-col gap-4 overflow-y-auto">
						{notes.map((note) => (
							<li key={note.id}>
								<Link to={note.id}>
									<div className="rounded-md bg-gray-200 p-4">
										<p className="text-lg font-bold">{note.title}</p>
										<p>{new Date(note.createdAt).toLocaleString()}</p>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</aside>
				<div className="rounded-md bg-white p-14">
					<Outlet />
				</div>
			</main>
		</>
	);
}
