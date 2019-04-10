import * as VoyageurModuleType from './renderers/voyageur';

export async function makeVoyageur(opts: any): Promise<VoyageurModuleType.Voyageur> {
  let mod = await new Promise<typeof VoyageurModuleType>((resolve, reject) => {
    require.ensure(
      ['./renderers/voyageur'],
      (require) =>
        resolve(require('./renderers/voyageur') as typeof VoyageurModuleType),
      (error: any) => [console.error(error), reject()],
      '@deathbeds/jupyterlab-graphql-voyageur'
    );
  });

  return new mod.Voyageur(opts);
}
