/// <reference path='../../../wot.d.ts' />
/// <reference path='../../wotext_helpers.l/helpers.ts' />
/// <reference path='../wotext_DialogsComp.c/DialogsComp.ts' />

module wotext {
	'use strict';

	export class Dialogs implements wot.Dialogs {

		// --
		// -- Fields
		// --

		private comp: wotext.DialogsComp;

		// --
		// -- Initialisation
		// --

		constructor(sc: wot.ServiceContext) {
			this.comp = <wotext.DialogsComp>sc.createComponent('wotext.DialogsComp', null, new wotext.helpers.GenericLiveState(true));
			$('body').append(this.comp.getElement());
			var router = <wot.Router>sc.getService('wot.Router');
			var that = this;
			router.addChangeListener(function () {
				that.clearDialogs();
			});
		}

		// --
		// -- Public - Dialogs
		// --

		/**
		 * @param dialog wot.Dialog
		 * @param forcedOpen boolean
		 * @param hideBelow boolean
		 * @returns {number} The dialog ID
		 */
		public addDialog(dialog: wot.Dialog, forcedOpen = false, hideBelow = false): number {
			return this.comp.addDialog(dialog, forcedOpen, hideBelow);
		}

		public openDialog(dialogId: number) {
			this.comp.openDialog(dialogId);
		}

		public closeDialog(dialogId: number): boolean {
			return this.comp.closeDialog(dialogId);
		}

		public removeDialog(dialogId: number) {
			this.comp.removeDialog(dialogId);
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
			return this.comp.openDisposableDialog(dialogElem, setClosedCallback, forcedOpen, hideBelow);
		}

		public clearDialogs(): boolean {
			return this.comp.clearDialogs();
		}

		public showInfo(msgHtml: string) {
			this.comp.showInfo(msgHtml);
		}

		public showWarning(msgHtml: string) {
			this.comp.showWarning(msgHtml);
		}

		public reportError(e) {
			this.comp.reportError(e);
		}

		/**
		 * @param msgHtml
		 * @param buttonList [{'label': string, 'callback': Function}]
		 */
		public showConfirm(msgHtml: string, buttonList: any[]) {
			this.comp.showConfirm(msgHtml, buttonList);
		}
	}
}
