/// <reference path='../Tarh.Tools.d.ts' />

module Tarh.Tools {
  'use strict';

  export interface Screen {
    route: string;
    comp: Woc.Component;
    /**
     * A string or a callback(query: RouteProperties) that returns a string or a Promise&lt;string&gt;
     */
    title: any;
    activate?: (query: EasyRouter.Query, comp: Woc.Component) => void;
  }

  interface ScreenProp {
    el: HTMLElement;
    comp: Woc.Component;
  }

  export class ScreenSwitcher implements Woc.Component {
    private router: WocGeneric.WocEasyRouter;
    private wrapper: HTMLElement;
    private propMap = {};
    private el404: HTMLElement;

    constructor(private cc: Woc.HBComponentContext, private screens: Screen[]) {
      this.router = this.cc.getService('WocGeneric.WocEasyRouter');
    }

    public attachTo(el: HTMLElement): void {
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'ScreenSwitcher';
      el.appendChild(this.wrapper);
      for (var i = 0, len = this.screens.length; i < len; ++i)
        this.addScreen(this.screens[i]);
      this.add404Screen();
      this.router.start({
        hashBangMode: true
      });
    }

    private addScreen(screen: Screen): ScreenProp {
      var route = screen.route,
        comp = screen.comp,
        title = screen.title,
        activate = screen.activate;
      this.router.map([{
        route: route,
        activate: (query: EasyRouter.Query) => {
          if (activate)
            activate(query, comp);
          this.activateScreen(route);
        },
        title: title
      }]);
      var el = document.createElement('div');
      el.className = 'ScreenSwitcher-screen';
      el.style.display = 'none';
      this.wrapper.appendChild(el);
      comp.attachTo(el);
      return this.propMap[route] = {
        el: el,
        comp: comp
      };
    }

    private add404Screen() {
      this.router.mapUnknownRoutes({
        useQueryString: '404',
        activate: (query: EasyRouter.Query) => { this.activate404(query); },
        title: '404 Not Found'
      });
      this.el404 = document.createElement('div');
      this.el404.className = 'ScreenSwitcher-screen';
      this.el404.style.display = 'none';
      this.wrapper.appendChild(this.el404);
    }

    private activateScreen(route: string): void {
      var screen: ScreenProp = this.propMap[route],
        child: HTMLElement;
      for (var i = 0, len = this.wrapper.children.length; i < len; ++i) {
        child = <HTMLElement>this.wrapper.children[i];
        child.style.display = screen.el === child ? 'block' : 'none';
      }
    }

    private activate404(query: EasyRouter.Query): void {
      var child: HTMLElement;
      for (var i = 0, len = this.wrapper.children.length; i < len; ++i) {
        child = <HTMLElement>this.wrapper.children[i];
        child.style.display = this.el404 === child ? 'block' : 'none';
      }
      this.el404.textContent = 'Unknown page: ' + query.queryString;
    }
  }
}
