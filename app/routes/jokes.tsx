import { json, LinksFunction, LoaderFunction } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';
import stylesUrl from '~/styles/jokes.css';

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  jokes: Array<{ id: string; name: string }>;
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { jokes } = {
    jokes: await db.joke.findMany({
      take: 5,
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
  };

  const user = await getUser(request);

  const data: LoaderData = {
    user,
    jokes,
  };

  return json(data);
};

export default function JokesRoute() {
  const { user, jokes } = useLoaderData<LoaderData>();

  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Remix Jokes' aria-label='Remix Jokes'>
              <span className='logo'>🤪</span>
              <span className='logo-medium'>J🤪KES</span>
            </Link>
          </h1>
          {user ? (
            <div className='user-info'>
              <span>{`Hi ${user.username}`}</span>
              <Form action='/logout' method='post'>
                <button type='submit' className='button'>
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to='/login'>Login</Link>
          )}
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container'>
          <div className='jokes-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {jokes.map(joke => {
                return (
                  <li key={joke.id}>
                    <Link prefetch='intent' to={joke.id}>
                      {joke.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link to='new' className='button'>
              Add your own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
