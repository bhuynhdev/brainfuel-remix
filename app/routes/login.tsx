import type { ActionArgs, LinksFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useSearchParams } from '@remix-run/react';
import { z } from 'zod';
import styles from '~/styles/login-register.css';
import { validateAppUrl } from '~/utils/misc';
import { createUserSession, login } from '~/utils/session.server';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
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

const LoginValidator = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

type LoginForm = z.infer<typeof LoginValidator>;

type ActionData = {
	formError?: string;
	fields?: {
		[K in keyof LoginForm]?: string;
	};
	fieldErrors?: {
		[K in keyof LoginForm]?: string;
	};
};

export const action = async ({ request }: ActionArgs) => {
	const badRequest = (data: ActionData) => json<ActionData>(data, { status: 400 });

	const form = Object.fromEntries(await request.formData());
	const { username, password, redirectTo } = form;
	if (typeof username !== 'string' || typeof password !== 'string' || typeof redirectTo !== 'string') {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}

	const fields = { username, password };
	const validationResult = LoginValidator.safeParse(fields);
	if (!validationResult.success) {
		const validationErrors = validationResult.error.format();
		const fieldErrors = {
			username: validationErrors.username?._errors[0],
			password: validationErrors.password?._errors[0],
		};
		return badRequest({ fieldErrors, fields });
	}

	const user = await login({ username, password });
	if (!user) {
		return badRequest({ fields, formError: 'Invalid username and password' });
	}
	// if there is a user, create their session and then redirect
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
export default function Login() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	return (
		<div className="mt-20 flex h-full flex-col items-center">
			<h1>Login</h1>
			<form method="post" className="flex w-4/5 max-w-sm flex-col gap-3">
				<input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? undefined} />
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
