import { ActionArgs, json, LinksFunction } from '@remix-run/node';
import { Form, useActionData, useFetcher, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import styles from '~/styles/login-register.css';
import { db } from '~/utils/db.server';
import { useDebounce } from '~/utils/hooks';

export const links: LinksFunction = () => {
	return [{ href: styles, rel: 'stylesheet' }];
};

/**
 * 	Check that app links, i.e redirect url, does not lead to unauthorized path
 * @param url
 * @returns The url if valid, else change to "/notes"
 */
const validateAppUrl = (url: string) => {
	let urls = ['/notes', '/'];
	if (urls.includes(url)) {
		return url;
	}
	return '/notes';
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

/*

888     888         888 d8b      888          888                             
888     888         888 Y8P      888          888                             
888     888         888          888          888                             
Y88b   d88P 8888b.  888 888  .d88888  8888b.  888888 .d88b.  888d888 .d8888b  
 Y88b d88P     "88b 888 888 d88" 888     "88b 888   d88""88b 888P"   88K      
  Y88o88P  .d888888 888 888 888  888 .d888888 888   888  888 888     "Y8888b. 
   Y888P   888  888 888 888 Y88b 888 888  888 Y88b. Y88..88P 888          X88 
    Y8P    "Y888888 888 888  "Y88888 "Y888888  "Y888 "Y88P"  888      88888P' 
                                                                              
*/

const ClientRegisterValidator = z
	.object({
		username: z.string().min(3, { message: 'Username must be 3 characters or longer' }),
		password: z.string().min(10, { message: 'Password must be 10 characters or longer' }),
		passwordConfirm: z.string(),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'Passwords must match',
	});

// Add extra check that username has not existed yet when server validate
const ServerRegisterValidator = ClientRegisterValidator.refine(
	async (data) => {
		const existedUser = await db.user.findFirst({ where: { username: data.username } });
		return !existedUser;
	},
	{
		path: ['username'],
		message: 'Username already existed',
	}
);

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
	const passwordConfirm = form.get('passwordConfirm');
	let redirectTo = form.get('redirectTo');
	if (
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		typeof passwordConfirm !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}
	// Validate redirectUrl
	redirectTo = validateAppUrl(redirectTo);

	// Validate other fields with Zod
	const fields = { username, password, passwordConfirm };
	const validationResult = await ServerRegisterValidator.safeParseAsync(fields);

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
	const [username, setUsername] = useState('');
	const actionData = useActionData<ActionData>();
	const [registerErrors, setRegisterErrors] = useState(actionData?.fieldErrors);
	const [searchParams] = useSearchParams();
	const usernameCheckFetcher = useFetcher();
	const [debouncedUsername] = useDebounce(username, 700);

	useEffect(() => {
		// Synchronize with actionData from server
		setRegisterErrors(actionData?.fieldErrors);
	}, [actionData]);

	useEffect(() => {
		let usernameSearchParams = new URLSearchParams(location.search);
		if (debouncedUsername !== '') {
			usernameSearchParams.set('q', debouncedUsername);
		} else {
			usernameSearchParams.delete('q');
		}
		// Check if username is available every time debounced username changes
		usernameCheckFetcher.submit(usernameSearchParams, { action: 'register/username', method: 'get' });
	}, [debouncedUsername]);

	const formOnChange: React.FormEventHandler<HTMLFormElement> = (e) => {
		// Validate form and produce error on change
		const formValues = Object.fromEntries(new FormData(e.currentTarget));
		// Validate using Zod
		const validationResult = ClientRegisterValidator.safeParse(formValues);
		if (!validationResult.success) {
			const validationErrors = validationResult.error.format();
			const fieldErrors = {
				// Only show error if that field is not empty
				username: formValues.username && validationErrors.username?._errors[0],
				password: formValues.password && validationErrors.password?._errors[0],
				passwordConfirm: formValues.passwordConfirm && validationErrors.passwordConfirm?._errors[0],
			};
			return setRegisterErrors(fieldErrors);
		}
	};

	return (
		<div className="mt-20 flex h-full flex-col items-center">
			<h1>Register</h1>
			<Form className="flex w-4/5 max-w-sm flex-col gap-3" method="post" onChange={formOnChange}>
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
				{registerErrors?.username ? (
					<p className="form-validation-error" role="alert" id="username-error">
						{registerErrors.username}
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
				{registerErrors?.password ? (
					<p className="form-validation-error" role="alert" id="password-error">
						{registerErrors.password}
					</p>
				) : null}
				<div className="form-field">
					<label htmlFor="register-username">Confirm your password</label>
					<input
						type="password"
						id="register-password-confirm"
						name="passwordConfirm"
						required
						autoComplete="new-password"
					/>
				</div>
				{registerErrors?.passwordConfirm ? (
					<p className="form-validation-error" role="alert" id="password-error">
						{registerErrors.passwordConfirm}
					</p>
				) : null}
				<button type="submit" className="rounded-lg bg-blue-400 px-4 py-2">
					Register
				</button>
			</Form>
		</div>
	);
}
