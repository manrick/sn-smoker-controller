import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-list';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';

const SESSION_TABLE = 'x_tsigh_smkrctrl_cooking_session';
const SESSION_COLUMNS = 'name,status,sys_created_on,sys_updated_on';

@customElement('x-tsigh-smkrctrl-sessions-page')
export default class SessionsPage extends AIUXElement {
  static styles = css`
    :host { display: contents; }
  `;

  static async loader(ctx) {
    const query = ctx.query?.sysparm_query || 'ORDERBYDESCsys_created_on';
    const data = await ListDataManager.fetch({table: SESSION_TABLE, query, columns: SESSION_COLUMNS, view: ''}).catch(() => null);
    return {data, query};
  }

  _openRecord(event) {
    const {referenceSysId, listSysId} = event.detail || {};
    const sysId = referenceSysId || listSysId;
    if (sysId) navigate(`/sessions/${sysId}`);
  }

  render() {
    const {data, query} = this.loaderData || {};
    return html`
      <main class="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
        <header class="flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Cooking')}</p>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">${i18n.getMessage('Cooking Sessions')}</h1>
            <p class="mt-1 max-w-2xl text-sm text-base-content">${i18n.getMessage('Define and track meat cooking objectives without enabling automatic control.')}</p>
          </div>
          <button class="aiux-btn aiux-btn-primary" type="button" @click=${() => navigate('/sessions/-1')}>
            ${i18n.getMessage('New cooking session')}
          </button>
        </header>
        <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
          <div class="aiux-card-body p-5">
            <aiux-list-connected
              table=${SESSION_TABLE}
              columns=${SESSION_COLUMNS}
              .query=${query}
              .data=${data}
              .pageSize=${10}
              .listOptions=${{
                heading: i18n.getMessage('Cooking sessions'),
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