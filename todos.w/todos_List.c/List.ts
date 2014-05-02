/// <reference path='../../wot.d.ts' />
/// <reference path='../jquery.d.ts' />
/// <reference path='../../ext.w/wotsingle_Button.c/Button.ts' />
/// <reference path="../todos_Item.c/Item.ts" />

module todos {
	'use strict';

	export class List implements wot.Component {
		private $bloc: JQuery;
		private $ul: JQuery;
		private items: {}[] = null;
		private btn: wotsingle.Button;

		constructor(private cc: wot.ComponentContext, props: {}) {
			this.btn = cc.createComponent('wotsingle.Button', {'label': '+'});
			this.$bloc = $(cc.getTemplate('.todos-list', {
				'addBtn': this.btn.getElement()
			}));
			this.$ul = this.$bloc.find('ul');
			var that = this;
			this.btn.click(function (e) {
				e.preventDefault();
				that.createItem();
			});
			this.$bloc.find('h1').text(props['title']);
			this.items = [];
			for (var i = 0; i < props['count']; ++i)
				this.createItem();
		}

		public destroy() {
			this.clear();
			this.btn.destroy();
		}

		public getElement(): HTMLElement {
			return this.$bloc[0];
		}

		public removeItem(itemId: number) {
			var prop = this.items[itemId];
			prop['item'].destroy();
			prop['$li'].remove();
			delete this.items[itemId];
		}

		private createItem() {
			var id = this.items.length;
			var item = <todos.Item>this.cc.createComponent('todos.Item', {
				'list': this,
				'itemId': id,
				'label': 'TODO ' + (id + 1)
			});
			var $li = $('<li></li>').append(item.getElement()).appendTo(this.$ul);
			this.items[id] = {
				'item': item,
				'$li': $li
			};
		}

		private clear() {
			if (!this.items)
				return;
			this.$ul.empty();
			for (var k in this.items) {
				if (this.items.hasOwnProperty(k))
					this.items[k]['item'].destroy();
			}
			this.items = null;
		}
	}
}