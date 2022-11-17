# React SSG example

This example tests the implementation of react ssg with file based routing.

**Instructions**:

- Every route should be a directory inside `/routes` folder.
- Route name to used as directory name.
- Directory can have these files:
    1. `.jsx` for HTML markup generation (mandatatory)
    2. `skeleton.html` (optional) for page specific HTML doc layout. `.jsx` generated markup will be populated inside `skeleton.html`'s body tag.
    3. `style.css` (optional) for defining page specific styling.
- Using the above information, it will be possible to do bare minimum SSG. Just run `npm run build` for markup & styles generation. Output will be stored in `/out/public` folder. All you have to do is copy the `public` folder and host it in your favorite server.
- This is a bonus. You can also call an external API and use the response to generate your HTML at build time. All it needs is a `fetcher` function named export. It should be an async function which returns promise. Data received will be passed as props to your route level JSX component. Check the example below:

  ```jsx
  const React = require('react');
  const fetch = require('isomorphic-fetch');

  function Dir({ users }) {
    return (
      <div>
        <h1>User List</h1>
        <ul>
          {users.map((user) => {
            return (
              <li key={user.id}>
                {user.userId}-{user.title}-{user.completed.toString()}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  async function fetcher() {
    const data = await fetch('https://jsonplaceholder.typicode.com/todos').then(
      (res) => res.json()
    );

    return {
      users: data,
    };
  }

  module.exports = {
    Dir,
    fetcher,
  };

  ```
- Voila, now you can even call APIs now.
- You can also folder in the root level for reusable components. Just import them to your route level `.jsx` file and use.
- Just one more thing, if you don't have `skeleton.html` at the route level. It will automatically fallback to root level `skeleton` file.