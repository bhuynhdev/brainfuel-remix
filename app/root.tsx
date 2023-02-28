import { json, LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import globalStyles from './styles/global.css';
import tailwindStyles from './styles/tailwind.css';
import { getUser } from './utils/session.server';

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'New Remix App',
	viewport: 'width=device-width,initial-scale=1',
});

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: globalStyles },
		{ rel: 'stylesheet', href: tailwindStyles },
	];
};

export const loader = async ({ request }: LoaderArgs) => {
	const user = await getUser(request);
	return json({ user });
};

export default function App() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="flex h-full flex-col bg-gray-200 px-4 text-base">
				<Header user={user} />
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

function Header({ user }: { user: null | Awaited<ReturnType<typeof getUser>> }) {
	const navItemsWhenLoggedOut = (
		<>
			<li>
				<Link to="login">Login</Link>
			</li>
			<li>
				<Link to="register">Register</Link>
			</li>
		</>
	);

	const navItemsWhenLoggedIn = (
		<>
			<li>
				<Link to="notes">Notes</Link>
			</li>
			<li>
				<form action="/logout" method="post">
					<button type="submit" className="button">
						Logout
					</button>
				</form>
			</li>
		</>
	);

	return (
		<header className="flex flex-row items-center justify-between py-4">
			<div>Logo</div>
			<nav>
				<ul className="flex flex-row gap-12">
					<li>
						<Link to="/">Home</Link>
					</li>
					{user && navItemsWhenLoggedIn}
					{!user && navItemsWhenLoggedOut}
				</ul>
			</nav>
		</header>
	);
}
