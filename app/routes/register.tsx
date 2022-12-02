import { ActionArgs, json, LinksFunction } from '@remix-run/node';
import { useFetcher, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import styles from '~/styles/login-register.css';
import { useDebounce } from '~/utils/hooks';

export const links: LinksFunction = () => {
	return [{ href: styles, rel: 'stylesheet' }];
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		username?: string;
		password?: string;
		passwordConfirm?: string;
	};
	fields?: {
		username: string;
		password: string;
		passwordConfirm: string;
	};
};

const RegisterValidator = z
	.object({
		username: z.string().min(3, { message: 'Username must be 3 characters or longer' }),
		password: z.string().min(10, { message: 'Password must be 10 characters or longer' }),
		passwordConfirm: z.string(),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'Passwords must match',
	});

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

export const action = async ({ request }: ActionArgs) => {
	const badRequest = (data: ActionData) => json<ActionData>(data, { status: 400 });

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
	const fields = { username, password, passwordConfirm };
	const validationResult = RegisterValidator.safeParse(fields);
	if (!validationResult.success) {
		const validationErrors = validationResult.error.format();
		const fieldErrors = {
			username: validationErrors.username?._errors[0],
			password: validationErrors.password?._errors[0],
			passwordConfirm: validationErrors.passwordConfirm?._errors[0],
		};
		return badRequest({ fieldErrors, fields });
	}
	return json<ActionData>({});
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

export default function Register(): JSX.Element {
	let [username, setUsername] = useState('');
	const [searchParams] = useSearchParams();
	const registerFetcher = useFetcher<ActionData>();
	const usernameCheckFetcher = useFetcher();
	const [debouncedUsername] = useDebounce(username, 700);

	useEffect(() => {
		let searchParams = new URLSearchParams(location.search);
		if (debouncedUsername !== '') {
			searchParams.set('q', debouncedUsername);
		} else {
			searchParams.delete('q');
		}
		// Check if username is available every time debounced username changes
		usernameCheckFetcher.submit(searchParams, { action: 'register/username', method: 'get' });
	}, [debouncedUsername]);

	return (
		<div className="mt-20 flex h-full flex-col items-center">
			<h1>Register</h1>
			<pre>{JSON.stringify(usernameCheckFetcher.data, null, 2)}</pre>
			<registerFetcher.Form method="post" className="flex w-4/5 max-w-sm flex-col gap-3">
				<input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
				<div className="form-field">
					<label htmlFor="register-username">Username</label>
					<input
						type="text"
						id="register-username"
						name="username"
						required
						value={username}
						onChange={(e) => {
							setUsername(e.target.value);
						}}
					/>
				</div>
				{registerFetcher.data?.fieldErrors?.username ? (
					<p className="form-validation-error" role="alert" id="username-error">
						{registerFetcher.data.fieldErrors.username}
					</p>
				) : usernameCheckFetcher.data?.isUsernameUnavailable ? (
					<p className="form-validation-error" role="alert" id="password-error">
						Username is already used. Please choose a new username
					</p>
				) : null}
				<div className="form-field">
					<label htmlFor="register-username">Password</label>
					<input type="password" id="register-password" name="password" required autoComplete="new-password" />
				</div>
				{registerFetcher.data?.fieldErrors?.password ? (
					<p className="form-validation-error" role="alert" id="password-error">
						{registerFetcher.data?.fieldErrors?.password}
					</p>
				) : null}
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
				{registerFetcher.data?.fieldErrors?.passwordConfirm ? (
					<p className="form-validation-error" role="alert" id="password-error">
						{registerFetcher.data?.fieldErrors?.passwordConfirm}
					</p>
				) : null}
				<button type="submit" className="rounded-lg bg-blue-400 px-4 py-2">
					Register
				</button>
			</registerFetcher.Form>
		</div>
	);
}
