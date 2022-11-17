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
