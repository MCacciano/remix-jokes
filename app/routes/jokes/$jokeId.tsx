import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Joke } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

type LoaderData = { joke: Joke };

export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke) throw new Error('Joke not found');

  const data: LoaderData = { joke };

  return json(data);
};

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke?.content || ''}</p>
    </div>
  );
}
