import { LinksFunction, json } from '@remix-run/node';
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

export default function Index() {
	const { notes } = useLoaderData<typeof loader>();
	return (
		<>
			<main className="main-grid">
				<div>
					<ul>
						{notes.map((note) => (
							<li key={note.id}>
								<Link to={note.id}>{note.title}</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<Outlet />
				</div>
			</main>
		</>
	);
}
