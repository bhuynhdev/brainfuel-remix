import { json, LoaderArgs } from '@remix-run/node';
import { db } from '~/utils/db.server';

export async function loader({ request }: LoaderArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get('q');
	if (!query) {
		return json({ isGoodUsername: true });
	}
	const isUsernameAvailable = (await db.user.count({ where: { username: query } })) === 0;
	return json({ isUsernameUnavailable: !isUsernameAvailable });
}
