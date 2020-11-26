# graphql-s3-file-upload

To start project:
```bash
yarn install
yarn start
```
or
```bash
npm install
npm run start
```

```bash
cp .env.example .env.local
```

Since this test application doesn't have Auth flow, generate a valid `JWT` using AWS cognito UI or Postman and add it as an environment variable `REACT_APP_JWT=<your-cognito-jwt>` to `.env`

---

Note: This test app assumes your GraphQL service sir running on `http://localhost:3000/graphql/ref-svc`



```JavaScript
// index.js
...
const client = new ApolloClient({
  uri: "http://localhost:3000/graphql/ref-svc",
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
  },
});
...
```