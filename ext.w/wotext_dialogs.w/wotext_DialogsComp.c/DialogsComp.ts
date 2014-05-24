/// <reference path='../../../wot.d.ts' />
/// <reference path='../jquery.d.ts' />
/// <reference path='../../wotext_helpers.l/helpers.ts' />
/// <reference path='../../wotsingle_Button.c/Button.ts' />

module wotext {
	'use strict';

	export class DialogsComp implements wot.Component {

		// --
		// -- Fields
		// --

		private stConfirm = new wotext.helpers.GenericLiveState(false);
		private $areas;
		private $mainDialogArea: JQuery;
		private dialogs = [];
		private openedDialogs = [];

		private $shortDialogArea: JQuery;
		private briefMsgQueue = [];
		private isBriefBoxProcessing = false;

		// --
		// -- Component
		// --

		constructor(private cc: wot.ComponentContext) {
			this.$areas = $(this.cc.getTemplate('.dialog-areas'));
			this.$mainDialogArea = this.$areas.find('.main-dialog-area');
			this.$shortDialogArea = this.$areas.find('.short-dialog-area');
		}

		// --
		// -- Component
		// --

		public getElement(): HTMLElement {
			return this.$areas[0];
		}

		public destruct() {
			this.briefMsgQueue = [];
			this.stConfirm.reset();
		}

		// --
		// -- Public
		// --

		/**
		 * @param dialog wot.Dialog
		 * @param forcedOpen boolean
		 * @param hideBelow boolean
		 * @returns {number} The dialog ID
		 */
		public addDialog(dialog: wot.Dialog, forcedOpen = false, hideBelow = false): number {
			var id = this.dialogs.length;
			this.dialogs[id] = {
				'$elem': null,
				'openedId': null,
				'showed': false,
				'forcedOpen': forcedOpen,
				'hideBelow': hideBelow,
				'reusable': true,
				'dialog': dialog
			};
			return id;
		}

		public openDialog(dialogId: number) {
			var props = this.dialogs[dialogId];
			if (!props)
				throw new Error('Unknown dialog "' + dialogId + '"');
//console.log('open dialog ' + dialogId);
//console.log(prop);
			if (props['openedId'] !== null)
				return;
			if (props['hideBelow'])
				this.hideOpenedDialogs();
			props['openedId'] = this.openedDialogs.length;
			this.openedDialogs[props['openedId']] = props;
			props['showed'] = true;
			if (!props['$elem']) {
				props['$elem'] = $(props['dialog'].getDialogElement());
				this.$mainDialogArea.append(props['$elem']);
			}
			props['dialog'].setDialogOpened();
			props['$elem'].show();
			this.$mainDialogArea.show();
		}

		public closeDialog(dialogId: number): boolean {
			var props = this.dialogs[dialogId];
			if (!props)
				throw new Error('Unknown dialog "' + dialogId + '"');
			if (props['openedId'] === null)
				return true;
			return this.closeDialogsUntil(props['openedId'], true);
		}

		public removeDialog(dialogId: number) {
			var props = this.dialogs[dialogId];
			if (!props)
				throw new Error('Unknown dialog "' + dialogId + '"');
			if (props['$elem'])
				props['$elem'].remove();
			delete this.dialogs[dialogId];
		}

		/**
		 *
		 * @param dialogElem
		 * @param setClosedCallback
		 * @param forcedOpen boolean
		 * @param hideBelow boolean
		 * @returns Function A callback for closing the dialog (the callback returns TRUE when dialog is closed, FALSE when the dialog remains)
		 */
		public openDisposableDialog(dialogElem, setClosedCallback: Function = null, forcedOpen = false, hideBelow = false): Function {
			if (hideBelow)
				this.hideOpenedDialogs();
			var openedId = this.openedDialogs.length;
			var that = this;
			var closeCallback = function () {
				return that.closeDialogsUntil(openedId, true);
			};
			this.openedDialogs[openedId] = {
				'$elem': $(dialogElem),
				'openedId': openedId,
				'showed': true,
				'forcedOpen': forcedOpen,
				'hideBelow': hideBelow,
				'reusable': false,
				'setClosedCallback': setClosedCallback
			};
			this.$mainDialogArea.append(dialogElem).show();
			return closeCallback;
		}

		public clearDialogs(): boolean {
			if (this.openedDialogs.length > 0)
				return this.closeDialogsUntil(0, false);
			return true;
		}

		public showInfo(msgHtml: string) {
			this.briefMsgQueue.push({'message': msgHtml, 'type': 'info'});
			this.pleaseProcessShortDialogs();
		}

		public showWarning(msgHtml: string) {
			this.briefMsgQueue.push({'message': msgHtml, 'type': 'warn'});
			this.pleaseProcessShortDialogs();
		}

		public reportError(e) {
			if (typeof console !== 'undefined')
				console.log(e);
			if (typeof e === 'string') {
				this.briefMsgQueue.push({'message': e, 'type': 'err'});
				this.pleaseProcessShortDialogs();
			}
		}

		/**
		 * @param msgHtml
		 * @param buttonList [{'label': string, 'callback': Function, 'ajax'?: boolean}]
		 */
		public showConfirm(msgHtml: string, buttonList: any[]) {
			this.briefMsgQueue.push({
				'message': msgHtml,
				'type': 'confirm',
				'buttonList': buttonList
			});
			this.pleaseProcessShortDialogs();
		}

		// --
		// -- Private - Main dialogs
		// --

		private hideOpenedDialogs() {
			var props;
			for (var i = this.openedDialogs.length; i >= 0; --i) {
				props = this.openedDialogs[i];
				if (props['showed']) {
					props['showed'] = false;
					props['$elem'].hide();
				}
			}
		}

		private closeDialogsUntil(untilOpenedId: number, isItself: boolean): boolean {
			var curOpenedId = this.openedDialogs.length - 1;
			if (untilOpenedId > curOpenedId)
				throw new Error('Unknown opened ID "' + untilOpenedId + '"');
			// - Close until
			var props;
			while (curOpenedId >= untilOpenedId) {
				props = this.openedDialogs.pop();
				if (props === undefined)
					throw new Error('Missing opened dialog when closing until "' + untilOpenedId + '"');
				if (props['openedId'] !== curOpenedId)
					throw new Error('Inconsistent opened ID: prop "' + props['openedId'] + '" should be equals to cur "' + curOpenedId + '"');
				if (props['forcedOpen'] && (curOpenedId !== untilOpenedId || !isItself))
					return false;
				props['openedId'] = null;
				if (props['reusable']) {
					props['dialog'].setDialogClosed();
					props['$elem'].hide();
					props['showed'] = false;
				} else if (props['setClosedCallback']) {
					props['setClosedCallback']();
					props['$elem'].remove();
				}
				--curOpenedId;
			}
			// - Show below
			while (curOpenedId >= 0) {
				props = this.openedDialogs[curOpenedId];
				if (props['showed'])
					break;
				props['$elem'].show();
				if (props['hideBelow'])
					break;
				--curOpenedId;
			}
			if (curOpenedId < 0)
				this.$mainDialogArea.hide();
			return true;
		}

		// --
		// -- Private - Short dialogs
		// --

		private pleaseProcessShortDialogs() {
			if (this.isBriefBoxProcessing)
				return;
			var props = this.briefMsgQueue.shift();
			if (props === undefined)
				return;
			// - Show the dialog
			this.isBriefBoxProcessing = true;
			var that = this;
			var $dialog: JQuery;
			var delayInMs: number;
			switch (props['type']) {
				case 'info':
					$dialog = $(this.cc.getTemplate('.info-dialog'));
					delayInMs = 1600;
					break;
				case 'warn':
					$dialog = $(this.cc.getTemplate('.warn-dialog'));
					delayInMs = 2000;
					break;
				case 'confirm':
					$dialog = $(this.cc.getTemplate('.confirm-dialog'));
					this.appendConfirmButtons($dialog, $dialog.find('.action-bar'), props['buttonList']);
					break;
				default:
					$dialog = $(this.cc.getTemplate('.err-dialog'));
					$dialog.find('.close-btn').click(function (e) {
						e.preventDefault();
						that.$shortDialogArea.hide();
						$dialog.remove();
						that.isBriefBoxProcessing = false;
						that.pleaseProcessShortDialogs();
					});
			}
			$dialog.find('.message').html(props['message']);
			this.$shortDialogArea.empty();
			$dialog.appendTo(this.$shortDialogArea);
			this.$shortDialogArea.show();
			if (props['type'] === 'confirm')
				this.stConfirm.setLive(true);
			if (delayInMs !== undefined) {
				window.setTimeout(function () {
					that.$shortDialogArea.fadeOut(200, function () {
						$dialog.remove();
						that.isBriefBoxProcessing = false;
						if (props['type'] === 'confirm') {
							that.stConfirm.setLive(false);
							that.stConfirm.reset();
						}
						that.pleaseProcessShortDialogs();
					});
				}, delayInMs);
			}
		}

		private appendConfirmButtons($dialog, $actionBar: JQuery, btnList: any[]) {
			var that = this;
			var closeDialog = function (cb: Function) {
				that.$shortDialogArea.fadeOut(200, function () {
					$dialog.remove();
					that.isBriefBoxProcessing = false;
					if (cb)
						cb();
					that.pleaseProcessShortDialogs();
				});
			};
			var clickAjaxMaker = function (cb: Function) {
				return function (e) {
					e.preventDefault();
					if (cb) {
						cb(function () {
							btn.reset();
							closeDialog(null);
						});
					} else {
						btn.reset();
						closeDialog(null);
					}
				};
			};
			var clickNormalMaker = function (cb: Function) {
				return function (e) {
					e.preventDefault();
					closeDialog(cb);
				};
			};
			var props, withAjax;
			for (var i = 0, len = btnList.length; i < len; ++i) {
				props = btnList[i];
				withAjax = props['ajax'] ? true : false;
				var btn = <wotsingle.Button>this.cc.createComponent('wotsingle.Button', {'ajax': withAjax, 'label': props['label']}, this.stConfirm);
				btn.click(withAjax ? clickAjaxMaker(props['callback']) : clickNormalMaker(props['callback']));
				$actionBar.append(btn.getElement());
			}
		}
	}
}
