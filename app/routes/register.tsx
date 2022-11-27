import { ActionArgs, json, LinksFunction } from '@remix-run/node';
import { useSearchParams } from '@remix-run/react';
import styles from '~/styles/login-register.css';

export const links: LinksFunction = () => {
	return [{ href: styles, rel: 'stylesheet' }];
};

function validateUsername(username: unknown) {
	if (typeof username !== 'string' || username.length < 3) {
		return `Usernames must be at least 3 characters long`;
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== 'string' || password.length < 6) {
		return `Passwords must be at least 6 characters long`;
	}
}

const badRequest = (data: any) => json<any>(data, { status: 400 });

export const action = async ({ request }: ActionArgs) => {
	const form = await request.formData();
	const username = form.get('username');
	const password = form.get('password');
	const passwordConfirm = form.get('password-confirm');
	const redirectTo = form.get('redirectTo');
	if (
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		typeof passwordConfirm !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}
	const fields = { username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}
	return json({});
};

export default function Register(): JSX.Element {
	const [searchParams] = useSearchParams();
	return (
		<div className="mt-20 flex h-full flex-col items-center">
			<h1>Register</h1>
			<form method="post" className="flex flex-col gap-3">
				<input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
				<div className="form-field">
					<label htmlFor="register-username">Username</label>
					<input type="text" id="register-username" name="username" required />
				</div>
				<div className="form-field">
					<label htmlFor="register-username">Password</label>
					<input type="password" id="register-password" name="password" required autoComplete="new-password" />
				</div>
				<div className="form-field">
					<label htmlFor="register-username">Confirm your password</label>
					<input
						type="password"
						id="register-password-confirm"
						name="password-confirm"
						required
						autoComplete="new-password"
					/>
				</div>
				<button type="submit" className="rounded-lg bg-blue-400 px-4 py-2">
					Register
				</button>
			</form>
		</div>
	);
}
