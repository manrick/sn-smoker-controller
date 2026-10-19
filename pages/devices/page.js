import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-list';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';

const DEVICE_TABLE = 'x_tsigh_smkrctrl_smoker_device';
const DEVICE_COLUMNS = 'name,active,connection_status,sys_updated_on';

@customElement('x-tsigh-smkrctrl-devices-page')
export default class DevicesPage extends AIUXElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  static async loader(ctx) {
    const query = ctx.query?.sysparm_query || '';
    const data = await ListDataManager.fetch({table: DEVICE_TABLE, query, columns: DEVICE_COLUMNS, view: ''}).catch(() => null);
    return {data, query};
  }

  _openRecord(event) {
    const {referenceSysId, listSysId} = event.detail || {};
    const sysId = referenceSysId || listSysId;
    if (sysId) navigate(`/devices/${sysId}`);
  }

  render() {
    const {data, query} = this.loaderData || {};
    return html`
      <main class="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
        <header class="flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Configuration')}</p>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">${i18n.getMessage('Smoker Devices')}</h1>
            <p class="mt-1 max-w-2xl text-sm text-base-content">${i18n.getMessage('Create and maintain the devices used by the smoker control room.')}</p>
          </div>
          <button class="aiux-btn aiux-btn-primary" type="button" @click=${() => navigate('/devices/-1')}>
            ${i18n.getMessage('New smoker device')}
          </button>
        </header>
        <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
          <div class="aiux-card-body p-5">
            <aiux-list-connected
              table=${DEVICE_TABLE}
              columns=${DEVICE_COLUMNS}
              .query=${query || ''}
              .data=${data}
              .pageSize=${10}
              .listOptions=${{
                heading: i18n.getMessage('Configured smoker devices'),
                selectionEnabled: false,
                selectAllEnabled: false,
                showRefreshButton: true,
                showZingSearch: true,
                showConditionBuilderButton: true,
                showEditColumnsButton: false,
                showCopyURLButton: false,
                showCount: true,
                showReadableFixedQuery: true,
                wrapLineCount: 1
              }}
              @aiux-list-connected:reference-link-clicked=${this._openRecord}
            ></aiux-list-connected>
          </div>
        </section>
      </main>
    `;
  }
}