import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-record';
import {RecordDataManager, RecordAPIKey} from '@servicenow/aiux/aiux-components-record';
const TABLE = 'x_tsigh_smkrctrl_device_alert';
@customElement('x-tsigh-smkrctrl-alert-record-page')
export default class AlertRecordPage extends AIUXElement {
  static styles = css`:host { display: block; height: 100%; }`;
  static async loader(ctx) { const id = ctx.params?.id || '-1'; return {id, data: id === '-1' ? null : await RecordDataManager.fetchRecord({table: TABLE, sysId: id}, [RecordAPIKey.Form]).catch(() => null)}; }
  render() { const {id, data} = this.loaderData || {}; return html`<main class="mx-auto flex max-w-5xl flex-col gap-6 p-4 lg:p-8"><header class="flex items-center justify-between border-b border-base-300 pb-5"><h1 class="text-3xl font-bold">${i18n.getMessage('Device Alert')}</h1><button class="aiux-btn aiux-btn-ghost" @click=${() => navigate('/alerts')}>${i18n.getMessage('Back')}</button></header><section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><aiux-record-provider .data=${data} table=${TABLE} sysId=${id || '-1'} show-error-details="true"><aiux-record-form edit-mode="display-only"></aiux-record-form></aiux-record-provider></div></section></main>`; }
}
