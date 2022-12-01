import type { ActionArgs, LinksFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useSearchParams } from '@remix-run/react';
import styles from '~/styles/login-register.css';
import { db } from '~/utils/db.server';
import { createUserSession, login, register } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
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

function validateUrl(url: any) {
	let urls = ['/notes', '/'];
	if (urls.includes(url)) {
		return url;
	}
	return '/notes';
}

/*
       d8888          888    d8b                   
      d88888          888    Y8P                   
     d88P888          888                          
    d88P 888  .d8888b 888888 888  .d88b.  88888b.  
   d88P  888 d88P"    888    888 d88""88b 888 "88b 
  d88P   888 888      888    888 888  888 888  888 
 d8888888888 Y88b.    Y88b.  888 Y88..88P 888  888 
d88P     888  "Y8888P  "Y888 888  "Y88P"  888  888 
*/

type ActionData = {
	formError?: string;
	fieldErrors?: {
		username: string | undefined;
		password: string | undefined;
	};
	fields?: {
		loginType: string;
		username: string;
		password: string;
	};
};

const badRequest = (data: ActionData) => json<ActionData>(data, { status: 400 });

export const action = async ({ request }: ActionArgs) => {
	const form = await request.formData();
	const loginType = form.get('loginType');
	const username = form.get('username');
	const password = form.get('password');
	const redirectTo = validateUrl(form.get('redirectTo') || '/notes');
	if (
		typeof loginType !== 'string' ||
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}

	const fields = { loginType, username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	switch (loginType) {
		case 'login': {
			const user = await login({ username, password });
			if (!user) {
				return badRequest({ fields, formError: `Username/Password combination is incorrect` });
			}
			// if there is a user, create their session and then redirect
			return createUserSession(user.id, redirectTo);
		}
		case 'register': {
			const userExists = await db.user.findFirst({
				where: { username },
			});
			if (userExists) {
				return badRequest({ fields, formError: `User with username ${username} already exists` });
			}
			// create the user and their session and then redirect
			const newUser = await register({ username, password });
			return createUserSession(newUser.id, redirectTo);
		}
		default: {
			return badRequest({ fields, formError: `Login type invalid` });
		}
	}
};

/*
 .d8888b.                                                                      888    
d88P  Y88b                                                                     888    
888    888                                                                     888    
888         .d88b.  88888b.d88b.  88888b.   .d88b.  88888b.   .d88b.  88888b.  888888 
888        d88""88b 888 "888 "88b 888 "88b d88""88b 888 "88b d8P  Y8b 888 "88b 888    
888    888 888  888 888  888  888 888  888 888  888 888  888 88888888 888  888 888    
Y88b  d88P Y88..88P 888  888  888 888 d88P Y88..88P 888  888 Y8b.     888  888 Y88b.  
 "Y8888P"   "Y88P"  888  888  888 88888P"   "Y88P"  888  888  "Y8888  888  888  "Y888 
                                  888                                                 
                                  888                                                 
                                  888                                                 

*/
export default function Login() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	return (
		<div className="mt-20 flex h-full flex-col items-center">
			<h1>Login</h1>
			<form method="post" className="flex w-4/5 max-w-sm flex-col gap-3">
				<input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
				<fieldset>
					<legend className="sr-only">Login or Register?</legend>
					<label>
						<input
							type="radio"
							name="loginType"
							value="login"
							defaultChecked={!actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'}
						/>
						Login
					</label>
					<label>
						<input
							type="radio"
							name="loginType"
							value="register"
							defaultChecked={actionData?.fields?.loginType === 'register'}
						/>
						Register
					</label>
				</fieldset>
				<div className="form-field">
					<label htmlFor="username-input">Username</label>
					<input
						type="text"
						id="username-input"
						name="username"
						required
						defaultValue={actionData?.fields?.username}
						aria-invalid={Boolean(actionData?.fieldErrors?.username)}
						aria-errormessage={actionData?.fieldErrors?.username ? 'username-error' : undefined}
					/>
					{actionData?.fieldErrors?.username ? (
						<p className="form-validation-error" role="alert" id="username-error">
							{actionData.fieldErrors.username}
						</p>
					) : null}
				</div>
				<div className="form-field">
					<label htmlFor="password-input">Password</label>
					<input
						id="password-input"
						name="password"
						defaultValue={actionData?.fields?.password}
						type="password"
						required
						aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
						aria-errormessage={actionData?.fieldErrors?.password ? 'password-error' : undefined}
					/>
					{actionData?.fieldErrors?.password ? (
						<p className="form-validation-error" role="alert" id="password-error">
							{actionData.fieldErrors.password}
						</p>
					) : null}
				</div>
				<div id="form-error-message">
					{actionData?.formError ? (
						<p className="form-validation-error" role="alert">
							{actionData.formError}
						</p>
					) : null}
				</div>
				<button type="submit" className="rounded-lg bg-blue-400 px-4 py-2">
					Submit
				</button>
			</form>
		</div>
	);
}
