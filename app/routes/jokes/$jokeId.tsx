import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Joke } from '@prisma/client';
import { useLoaderData, useParams, useCatch, Link } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { requireUserId } from '~/utils/session.server';

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

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();

  if (form.get('_method') !== 'delete') {
    throw new Response(`the _method ${form.get('_method')} is not supported`, {
      status: 400,
    });
  }

  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke) {
    throw new Response("Can't delete what does not exist", { status: 404 });
  }

  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", {
      status: 401,
    });
  }

  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect('/jokes');
};

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke?.content || ''}</p>
      <Link to='.'>{joke.name} Permalink</Link>
      <form method='post'>
        <input type='hidden' name='_method' value='delete' />
        <button type='submit' className='button'>
          Delete
        </button>
        Œ
      </form>
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
