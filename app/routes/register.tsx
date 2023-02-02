import { ActionArgs, json, LinksFunction } from '@remix-run/node';
import { Form, useActionData, useFetcher, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import SmallSpinner from '~/components/SmallSpinner';
import { db } from '~/utils/db.server';
import { useDebouncedState } from '~/utils/hooks';
import { createUserSession, register } from '~/utils/session.server';
import styles from '~/styles/login-register.css';
import { validateAppUrl } from '~/utils/misc';

export const links: LinksFunction = () => {
	return [{ href: styles, rel: 'stylesheet' }];
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

const RegisterValidator = z
	.object({
		username: z
			.string()
			.min(3, { message: 'Username must be 3 characters or longer' })
			.max(24, { message: 'Username must be less than 25 characters' }),
		password: z.string().min(8, { message: 'Password must be 8 characters or longer' }),
		passwordConfirm: z.string(),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		message: 'Passwords must match',
	});

type RegisterForm = z.infer<typeof RegisterValidator>;

type ActionData = {
	formError?: string;
	fields?: {
		[K in keyof RegisterForm]?: string;
	};
	fieldErrors?: {
		[K in keyof RegisterForm]?: string;
	};
};

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

/**
 * Check if a username exists yet in the datbase
 * @param usernameToCheck string
 * @returns True if username existed, else False
 */
const checkIfUsernameExists = async (usernameToCheck: string) => {
	const existedUser = await db.user.findFirst({ where: { username: usernameToCheck } });
	return !!existedUser;
};

export const action = async ({ request }: ActionArgs) => {
	const badRequest = (data: ActionData) => json<ActionData>(data, { status: 400 });

	const form = Object.fromEntries(await request.formData());
	const { username, password, passwordConfirm, redirectTo } = form;
	if (
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		typeof passwordConfirm !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}

	// Validate form fields with Zod
	const fields = { username, password, passwordConfirm };
	const validationResult = await RegisterValidator.safeParse(fields);

	if (!validationResult.success) {
		const validationErrors = validationResult.error.format();
		const fieldErrors = {
			username: validationErrors.username?._errors[0],
			password: validationErrors.password?._errors[0],
			passwordConfirm: validationErrors.passwordConfirm?._errors[0],
		};
		return badRequest({ fieldErrors, fields });
	}
	// If validation passes then first check if crendentials exist yet
	const isUsernameExist = await checkIfUsernameExists(username);
	if (isUsernameExist) {
		return badRequest({ fieldErrors: { username: 'Username already exists' }, fields });
	}
	// Create User and redirect
	const user = await register({ username, password });
	if (!user) {
		return badRequest({
			fields,
			formError: `Something went wrong trying to create a new user.`,
		});
	}
	return createUserSession(user.id, validateAppUrl(redirectTo));
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
	const actionData = useActionData<ActionData>();
	const [debouncedUsername, isDebouncing, username, setUsername] = useDebouncedState('', 700);
	const [fieldErrors, setFieldErrors] = useState(actionData?.fieldErrors);
	const [searchParams] = useSearchParams();
	const usernameCheckFetcher = useFetcher();

	useEffect(() => {
		// Synchronize with actionData from server
		if (!actionData?.fieldErrors) return;
		setFieldErrors(actionData.fieldErrors);
	}, [actionData]);

	useEffect(() => {
		let usernameSearchParams = new URLSearchParams(location.search);
		if (debouncedUsername.length >= 3) {
			usernameSearchParams.set('q', debouncedUsername);
			// Check if username is available every time debounced username changes
			usernameCheckFetcher.submit(usernameSearchParams, { action: 'register/username', method: 'get' });
		}
	}, [debouncedUsername]);

	const formOnChange: React.FormEventHandler<HTMLFormElement> = (e) => {
		// Validate form and produce error on change
		const formValues = Object.fromEntries(new FormData(e.currentTarget));
		// Validate using Zod
		const validationResult = RegisterValidator.safeParse(formValues);
		if (!validationResult.success) {
			const validationErrors = validationResult.error.format();
			const fieldErrors = {
				// Only show error if that field is not empty
				username: formValues.username && validationErrors.username?._errors[0],
				password: formValues.password && validationErrors.password?._errors[0],
				passwordConfirm: formValues.passwordConfirm && validationErrors.passwordConfirm?._errors[0],
			};
			return setFieldErrors(fieldErrors);
		}
		return setFieldErrors({});
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
				{!username ? null : fieldErrors?.username ? (
					<p className="form-validation-error" role="alert">
						{fieldErrors.username}
					</p>
				) : usernameCheckFetcher.type !== 'done' || isDebouncing ? (
					<p className="inline-flex">
						<SmallSpinner /> Checking username availability
					</p>
				) : usernameCheckFetcher.data?.isUsernameUnavailable ? (
					<p className="form-validation-error" role="alert">
						Username is already used. Please choose a new username
					</p>
				) : (
					<p>✅Username is good to use</p>
				)}
				<div className="form-field">
					<label htmlFor="register-username">Password</label>
					<input type="password" id="register-password" name="password" required autoComplete="new-password" />
				</div>
				{fieldErrors?.password ? (
					<p className="form-validation-error" role="alert">
						{fieldErrors.password}
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
				{fieldErrors?.passwordConfirm ? (
					<p className="form-validation-error" role="alert">
						{fieldErrors.passwordConfirm}
					</p>
				) : null}
				<button type="submit" className="rounded-lg bg-blue-400 px-4 py-2">
					Register
				</button>
			</Form>
		</div>
	);
}
