# jupyter-graphql

A very experimental Jupyter notebook server extension for exposing things in
GraphQL. Heavily copied from https://github.com/dronedeploy/graphene-tornado

- [ ] ContentsManager
  - [x] get (mostly focused on Notebook)

## Try it out
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
