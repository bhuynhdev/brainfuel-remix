import { LinksFunction, json, ActionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { useLoaderData, Link } from '@remix-run/react';
import styles from '~/styles/index.css';
import { db } from '~/utils/db.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export const loader = async () => {
	const data = {
		notes: await db.note.findMany(),
	};
	return json(data);
};

export const action = async () => {
	const createdNote = await db.note.create({ data: { title: 'Untitled', content: '' }, select: { id: true } });
	return redirect(`notes/${createdNote.id}?edit=true`);
};

export default function Index() {
	const { notes } = useLoaderData<typeof loader>();
	return (
		<>
			<main className="main-grid">
				<div id="note-list" className="rounded-md bg-white p-3 shadow-md">
					<div className="mb-4 flex flex-row justify-between">
						<h1 className="text-2xl font-bold">Your Notes</h1>
						<form method="POST" action="/notes">
							<button className="rounded-3xl bg-blue-500 px-4 py-2 font-bold uppercase tracking-wider text-white">
								New
							</button>
						</form>
					</div>
					<ul className="flex flex-col gap-4">
						{notes.map((note) => (
							<li key={note.id}>
								<Link to={note.id}>
									<div className="rounded-md bg-gray-200 p-4">
										<p className="text-lg font-bold">{note.title}</p>
										<p>{note.updatedAt}</p>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-md bg-white p-14">
					<Outlet />
				</div>
			</main>
		</>
	);
}
