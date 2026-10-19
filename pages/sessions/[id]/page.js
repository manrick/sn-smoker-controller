import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-record';
import {RecordDataManager, RecordAPIKey} from '@servicenow/aiux/aiux-components-record';

const SESSION_TABLE = 'x_tsigh_smkrctrl_cooking_session';

@customElement('x-tsigh-smkrctrl-session-record-page')
export default class SessionRecordPage extends AIUXElement {
  static styles = css`
    :host { display: block; height: 100%; }
  `;

  static async loader(ctx) {
    const id = ctx.params?.id || '-1';
    if (id === '-1') return {id, data: null};
    const data = await RecordDataManager.fetchRecord(
      {table: SESSION_TABLE, sysId: id},
      [RecordAPIKey.Form, RecordAPIKey.Actions]
    ).catch(() => null);
    return {id, data};
  }

  _openRecord(table, sysId) {
    if (table && sysId) navigate(`/sessions/${sysId}`);
  }

  render() {
    const {id, data} = this.loaderData || {};
    const isNew = id === '-1';
    return html`
      <main class="mx-auto flex max-w-5xl flex-col gap-6 p-4 lg:p-8">
        <header class="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Cooking')}</p>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">${isNew ? i18n.getMessage('New cooking session') : i18n.getMessage('Edit cooking session')}</h1>
          </div>
          <button class="aiux-btn aiux-btn-ghost" type="button" @click=${() => navigate('/sessions')}>
            ${i18n.getMessage('Back to sessions')}
          </button>
        </header>
        <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
          <div class="aiux-card-body p-5">
              <aiux-alert-message class="mb-4" type="info" alert-title=${i18n.getMessage('Control settings help')} message=${i18n.getMessage('Choose the Control Mode first. Automatic physical control requires AI Control Enabled, Automatic Control Enabled, an approved plan, polling, and an online device. Dry-run records decisions without switching the relay.')} autofocus-controls="false"></aiux-alert-message>
            <aiux-record-provider
              .data=${data}
              table=${SESSION_TABLE}
              sysId=${id || '-1'}
              show-error-details="true"
              .onOpenRecord=${this._openRecord}
            >
              <aiux-record-form></aiux-record-form>
              <div class="mt-4 px-1">
                <aiux-record-actions></aiux-record-actions>
              </div>
            </aiux-record-provider>
          </div>
        </section>
      </main>
    `;
  }
}