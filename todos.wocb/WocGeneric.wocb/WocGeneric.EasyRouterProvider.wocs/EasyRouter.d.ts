/// <reference path='../d.ts/woc.d.ts' />

declare module EasyRouter {

  interface RouteQuery {
    parent?: any;
    redirectedFrom?: string;
    queryString: string;
    queryHash: string;
    queryParams: { [index: string]: string; };
    route?: string;
    routeParams?: { [index: string]: string; };
    processedQueryString?: string;
    remainingQueryString?: string;
    title?: string;
  }

  interface RouteActivator {
    /**
     * Required if canActivate is not defined
     */
    route?: string;
    useQueryString?: string;
    /**
     * @return any a boolean or a Promise&lt;boolean&gt;
     */
    canActivate?(query: RouteQuery): any;
    redirectTo?: string;
    /**
     * This callback is required except if a child router is defined
     * @return any void (undefined) or a Promise&lt;void&gt;
     */
    activate?(query: RouteQuery): any;
    /**
     * @return any a boolean or a Promise&lt;boolean&gt;
     */
    deactivate?(query: RouteQuery): any;
    /**
     * A string or a callback(query: RouteProperties) that returns a string or a Promise&lt;string&gt;
     */
    title?: any;
    child?: ChildRouter;
  }

  interface MinimalRouter {
    navigate(queryString: string): Promise<boolean>;
    navigateToUnknown(): Promise<boolean>;
    navigateBack(level?: number): Promise<boolean>;
    /**
     * @param cb returns a boolean or a Promise&lt;boolean&gt;
     * @param onNavRm default value is FALSE
     */
    addCanLeaveListener(cb: () => any, onNavRm?: boolean): number;
    removeCanLeaveListener(handle: number): void;
    /**
     * @param onNavRm default value is FALSE
     */
    addLeaveListener(cb: () => void, onNavRm?: boolean): number;
    removeLeaveListener(handle: number): void;
  }

  interface ChildRouter {
    startAsChild(parent: MinimalRouter, withHistory: boolean);
    childNavigate(queryString: string, changeHist: boolean, parentUrl: string, parentQuery: any): Promise<boolean>;
    leave(): Promise<boolean>;
  }

  interface RootOptions {
    baseUrl: string;
    hashBangMode: boolean;
    noHistory?: boolean;
    firstQueryString?: string;
  }

  class Router implements ChildRouter, MinimalRouter {

    constructor(onErrCb: (err: any) => void);

    startRoot(opt: RootOptions): Promise<void>;
    map(activators: RouteActivator[]): Router;
    mapUnknownRoutes(activator: RouteActivator): Router;

    // - Child router
    startAsChild(parent: MinimalRouter, withHistory: boolean);
    childNavigate(queryString: string, changeHist: boolean, parentUrl: string, parentQuery: any): Promise<boolean>;
    leave(): Promise<boolean>;

    // - Minimal router
    navigate(queryString: string): Promise<boolean>;
    navigateToUnknown(): Promise<boolean>;
    navigateBack(level?: number): Promise<boolean>;
    /**
     * @param cb returns a boolean or a Promise&lt;boolean&gt;
     * @param onNavRm default value is FALSE
     */
    addCanLeaveListener(cb: () => any, onNavRm?: boolean): number;
    removeCanLeaveListener(handle: number): void;
    /**
     * @param onNavRm default value is FALSE
     */
    addLeaveListener(cb: () => void, onNavRm?: boolean): number;
    removeLeaveListener(handle: number): void;

    // - Router listeners
    addCanNavigateListener(cb: (query: RouteQuery) => any, onNavRm?: boolean): number;
    removeCanNavigateListener(handle: number): void;
    addNavigateListener(cb: (query: RouteQuery) => void, onNavRm?: boolean): number;
    removeNavigateListener(handle: number): void;
  }
}
