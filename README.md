# jupyter-graphql

## demos on <img src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0" height="30px"/>
- [GraphQL in the Notebook][]
- [GraphiQL][]

## what the...
A very experimental Jupyter notebook server extension for exposing things in
GraphQL. Heavily copied from https://github.com/dronedeploy/graphene-tornado

- [ ] ContentsManager
  - [x] get (mostly focused on Notebook)

## i can't even...
```bash
git clone https://github.com/deathbeds/jupyter-graphql
cd jupyter-graphql
conda env update
source activate jupyter-graphql-dev
python -m pip install -e . --ignore-installed --no-deps
python -m jupyter_graphql.fetch_static
jupyter lab
```

And navigate to `http://localhost:8888/graphql` to play around.

[GraphQL in the Notebook]: https://mybinder.org/v2/gh/deathbeds/jupyter-graphql/master?urlpath=lab/tree/notebooks/gql.ipynb

[graphiql]: https://mybinder.org/v2/gh/deathbeds/jupyter-graphql/master?urlpath=graphql
