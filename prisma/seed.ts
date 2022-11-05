import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
	const bao = await db.user.create({
		data: {
			username: 'bao',
			// this is a hashed version of "twixrox"
			passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
		},
	});
	await Promise.all(
		getNotes().map((note) => {
			return db.note.create({ data: { ...note, userId: bao.id } });
		})
	);
}

seed();

function getNotes() {
	return [{ title: 'Hello world', content: '# Hello world' }];
}
