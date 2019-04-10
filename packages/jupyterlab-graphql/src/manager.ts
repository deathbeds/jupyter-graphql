import * as C from '.';

export class GraphQLManager implements C.IGraphQLManager {
  private _toolbar = {} as {[key: string]: string};

  registerToolbarItem(item: string, command: string) {
    this._toolbar[item] = command;
  }
  docToolbarItems() {
    return {...this._toolbar};
  };
}
