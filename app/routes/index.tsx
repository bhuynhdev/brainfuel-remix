import { LinksFunction, json } from '@remix-run/node';
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
			<header className="py-4 flex flex-row justify-between items-center">
				<div>Logo</div>
				<nav>
					<ul className="flex flex-row gap-12">
						<li>
							<Link to="#">Home</Link>
						</li>
						<li>
							<Link to="#">Login</Link>
						</li>
					</ul>
				</nav>
			</header>
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
				<div>Post content</div>
			</main>
		</>
	);
}
