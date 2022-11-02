import { LinksFunction } from '@remix-run/node';
import styles from '~/styles/index.css';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export default function Index() {
	return (
		<>
			<header className="py-4 flex flex-row justify-between items-center">
				<div>Logo</div>
				<nav>
					<ul className="flex flex-row gap-12">
						<li>
							<a href="#">Home</a>
						</li>
						<li>
							<a href="#">Login</a>
						</li>
					</ul>
				</nav>
			</header>
			<main className="main-grid">
				<div>Post list</div>
				<div>Post content</div>
			</main>
		</>
	);
}
