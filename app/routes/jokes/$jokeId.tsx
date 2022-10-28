import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Joke } from '@prisma/client';
import { useLoaderData, useParams, useCatch } from '@remix-run/react';
import { db } from '~/utils/db.server';

type LoaderData = { joke: Joke };

export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke) {
    throw new Response('What a joke! Not found.', { status: 404 });
  }

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

export function CatchBoundary() {
  const caught = useCatch();
  const { jokeId } = useParams();

  if (caught.status === 404) {
    return <div className='error-container'>What the heck is "{jokeId}"?</div>;
  }

  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className='error-container'>{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
