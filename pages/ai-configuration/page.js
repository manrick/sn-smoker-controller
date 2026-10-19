import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import '@servicenow/aiux/aiux-components-record';
import '@servicenow/aiux/aiux-components-list';
import {RecordDataManager, RecordAPIKey} from '@servicenow/aiux/aiux-components-record';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';

const CONFIGURATION_TABLE = 'x_tsigh_smkrctrl_ai_configuration';

@customElement('x-tsigh-smkrctrl-ai-configuration-page')
export default class AiConfigurationPage extends AIUXElement {
  static styles = css`
    :host { display: block; height: 100%; }
  `;

  static async loader() {
    const records = await ListDataManager.fetch({table: CONFIGURATION_TABLE, query: 'active=true^ORDERBYname', view: ''}).catch(() => null);
    const rows = records?.data?.GlideNowListLayoutComposite_Query?.getNowListLayoutComposite?.nowListLayout?.rowDefinitions?.rows || [];
    const id = rows.find(row => row.type === 'default')?.key || '-1';
    const data = id === '-1' ? null : await RecordDataManager.fetchRecord({table: CONFIGURATION_TABLE, sysId: id}, [RecordAPIKey.Form, RecordAPIKey.Actions]).catch(() => null);
    return {data, id};
  }

  _openRecord() {}

  render() {
    const {data, id = '-1'} = this.loaderData || {};
    return html`
      <main class="mx-auto flex max-w-5xl flex-col gap-6 p-4 lg:p-8">
        <header class="flex flex-wrap items-end justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Configuration')}</p>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">${i18n.getMessage('AI Configuration')}</h1>
            <p class="mt-1 max-w-2xl text-sm text-base-content">${i18n.getMessage('Manage the AI provider, model, Flow action, and cooking safety limits.')}</p>
            <p class="mt-2 text-sm text-base-content">${i18n.getMessage('Name is the label for this configuration record. Use Default AI Configuration unless you maintain more than one configuration.')}</p>
          </div>
        </header>
        <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
          <div class="aiux-card-body p-5">
              <aiux-alert-message class="mb-4" type="info" alert-title=${i18n.getMessage('AI configuration help')} message=${i18n.getMessage('The Flow action generates a draft plan only. The application validates safety limits and requires user approval before AI control can start.')} autofocus-controls="false"></aiux-alert-message>
            <aiux-record-provider
              .data=${data}
              table=${CONFIGURATION_TABLE}
              sysId=${id}
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