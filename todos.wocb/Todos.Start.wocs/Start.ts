/// <reference path='../Todos.d.ts' />

module Todos {
  'use strict';

  export class Start implements Woc.StartingPoint {

    constructor(private sc: Woc.ServiceContext) {
    }

    public start(el: HTMLElement) {
      el.classList.add('AppWrapper');
      var model: Todos.Model = this.sc.getService('Todos.Model');
      this.sc.createComponent('Tarh.Tools.ScreenSwitcher', [
        {
          route: '',
          comp: this.sc.createComponent('Todos.List'),
          title: 'List of tasks',
          activate: (query: EasyRouter.Query, comp: Todos.List) => {
            comp.refresh();
          }
        },
        {
          route: 'todos/:taskId',
          comp: this.sc.createComponent('Todos.EditPanel'),
          title: (query: EasyRouter.Query) => {
            var id = parseInt(query.routeParams['taskId'], 10);
            return model.getTask(id).title + ' | Edition';
          },
          activate: (query: EasyRouter.Query, comp: Todos.EditPanel) => {
            var id = parseInt(query.routeParams['taskId'], 10);
            comp.setTask(id);
          }
        }
      ]).attachTo(el);
    }
  }
}
