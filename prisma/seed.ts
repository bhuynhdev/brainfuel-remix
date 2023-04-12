import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const db = new PrismaClient();

async function seed() {
	const passwordHash = await bcrypt.hash('password', 10);
	const devUser = await db.user.upsert({
		where: { username: 'demo' },
		update: {
			username: 'demo',
			passwordHash,
		},
		create: {
			username: 'demo',
			passwordHash,
		},
	});
	await Promise.all(
		getNotes().map((note) => {
			return db.note.create({ data: { ...note, authorId: devUser.id } });
		})
	);
}

seed()
	.then(async () => {
		await db.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await db.$disconnect();
		process.exit(1);
	});

function getNotes() {
	return [{ title: 'Using BrainFuel🧠', content: NOTE_SEED_CONTENT }];
}

const NOTE_SEED_CONTENT = `# This is markdown

## Quickly create heading 2

Bold text with **double asterisks**; italic with *single asterisk*

> Beautiful quote with ">"  
People who are crazy enough to think they can change the world, are the ones who do. - Steve Jobs

Create a fenced code block

\`\`\`python
a = 3
print("Hello")
\`\`\`

Make it a quiz by just adding \`quiz\`
\`\`\`python quiz
a = 3
print("Hello")
\`\`\`

For even more fun, add some flashcards to make learning more interactive ([higher-order learning](https://www.proquest.com/docview/2512912872/fulltextPDF/95CC14651BC14204PQ/1?accountid=2909))

Start a question with \`?>\` mark, and designate answers with \`>\`

\`\`\`qa
?? What is circumference of a circle?
?> 2*pi*R

?? What is area of a circle?
?> pi*R^2
\`\`\`
`;
