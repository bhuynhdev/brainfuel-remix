import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import globalStyles from './styles/global.css';
import tailwindStyles from './styles/app.css';

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

const Header: React.FC = () => {
	return (
		<header className="flex flex-row items-center justify-between py-4">
			<div>Logo</div>
			<nav>
				<ul className="flex flex-row gap-12">
					<li>
						<Link to="#">Home</Link>
					</li>
					<li>
						<Link to="login">Login</Link>
					</li>
					<li>
						<Link to="notes">Notes</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="flex h-screen flex-col bg-gray-200 px-4 text-base">
				<Header />
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
