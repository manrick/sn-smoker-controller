import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-list';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';
const TABLE = 'x_tsigh_smkrctrl_device_alert';
const COLUMNS = 'opened_at,smoker_device,alert_type,severity,state';
@customElement('x-tsigh-smkrctrl-alerts-page')
export default class AlertsPage extends AIUXElement {
  static styles = css`:host { display: contents; }`;
  static async loader(ctx) { const query = ctx.query?.sysparm_query || 'ORDERBYDESCopened_at'; return {data: await ListDataManager.fetch({table: TABLE, query, view: ''}).catch(() => null), query}; }
  _open(e) { const id = e.detail?.referenceSysId || e.detail?.listSysId; if (id) navigate(`/alerts/${id}`); }
  render() { const {data, query} = this.loaderData || {}; return html`<main class="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8"><header class="border-b border-base-300 pb-5"><p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Operations')}</p><h1 class="text-3xl font-bold">${i18n.getMessage('Device Alerts')}</h1></header><section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><aiux-list-connected table=${TABLE} columns=${COLUMNS} .query=${query} .data=${data} .pageSize=${20} .listOptions=${{heading: i18n.getMessage('Device Alerts'), selectionEnabled: false, cellEditingEnabled: false, listEditType: 'disabled', showRefreshButton: true, showZingSearch: true, showCount: true, showEditColumnsButton: false, wrapLineCount: 1}} @aiux-list-connected:reference-link-clicked=${this._open}></aiux-list-connected></div></section></main>`; }
}
