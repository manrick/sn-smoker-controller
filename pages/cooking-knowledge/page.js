import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import '@servicenow/aiux/aiux-components-list';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';

const TABLE = 'x_tsigh_smkrctrl_cooking_knowledge';
const COLUMNS = 'smoker_device,meat_type,meat_cut,recommended_chamber_temperature_c,successful_cook_count';

@customElement('x-tsigh-smkrctrl-cooking-knowledge-page')
export default class CookingKnowledgePage extends AIUXElement {
  static styles = css`:host { display: contents; }`;

  static async loader(ctx) {
    const query = ctx.query?.sysparm_query || 'ORDERBYDESCsuccessful_cook_count';
    const data = await ListDataManager.fetch({table: TABLE, query, view: ''}).catch(() => null);
    return {data, query};
  }

  render() {
    const {data, query} = this.loaderData || {};
    return html`
      <main class="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-8">
        <header class="border-b border-base-300 pb-5">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">${i18n.getMessage('Learning')}</p>
          <h1 class="text-3xl font-bold">${i18n.getMessage('Cooking Knowledge')}</h1>
          <p class="mt-1 max-w-2xl text-sm text-base-content">${i18n.getMessage('Aggregated cooking profiles provide conservative starting recommendations for similar cooks on this smoker.')}</p>
        </header>
        <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
          <div class="aiux-card-body p-5">
            <aiux-list-connected
              table=${TABLE}
              columns=${COLUMNS}
              .query=${query}
              .data=${data}
              .pageSize=${20}
              .listOptions=${{
                heading: i18n.getMessage('Cooking Knowledge Profiles'),
                selectionEnabled: false,
                cellEditingEnabled: false,
                listEditType: 'disabled',
                showRefreshButton: true,
                showZingSearch: true,
                showCount: true,
                showEditColumnsButton: false,
                wrapLineCount: 1
              }}
            ></aiux-list-connected>
          </div>
        </section>
      </main>
    `;
  }
}
