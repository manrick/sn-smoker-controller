import {navLayoutContext} from '@servicenow/aiux/aiux-components-nav';
import {i18n} from '@servicenow/aiux/aiux-services';
import {AppTheme} from './theme.js';

export default {
  appTheme: AppTheme,
  applicationLayout: 'aiux-nav-layout',

  setup(ctx) {
    const items = [
      {
        icon: 'home',
        title: i18n.getMessage('Smoker control room'),
        action: {type: 'navigate', path: '/smokercontrolroom'}
      },
      {
        icon: 'database',
        title: i18n.getMessage('Smoker Devices'),
        action: {type: 'navigate', path: '/devices'}
      },
      {
        icon: 'calendar',
        title: i18n.getMessage('Cooking Sessions'),
        action: {type: 'navigate', path: '/sessions'}
      },
      {
        icon: 'list',
        title: i18n.getMessage('Temperature Readings'),
        action: {type: 'navigate', path: '/readings'}
      },
      {
        icon: 'activity',
        title: i18n.getMessage('Control Actions'),
        action: {type: 'navigate', path: '/actions'}
      },
      {
        icon: 'lightbulb',
        title: i18n.getMessage('Cooking Knowledge'),
        action: {type: 'navigate', path: '/cooking-knowledge'}
      },
      {
        icon: 'bell',
        title: i18n.getMessage('Device Alerts'),
        action: {type: 'navigate', path: '/alerts'}
      },
      {
        icon: 'gear',
        title: i18n.getMessage('AI Configuration'),
        action: {type: 'navigate', path: '/ai-configuration'}
      }
    ];

    const activeRoute = ctx.app?.routes?.find(r => r.active);
    const itemsWithActive = items.map(item => ({
      ...item,
      ...(item.action?.path === activeRoute?.route && {active: true})
    }));

    const current = navLayoutContext.get();
    navLayoutContext.set({
      ...current,
      appTitle: i18n.getMessage('SmokerController'),
      features: {
        menus: false,
        logo: true,
        userSession: false,
        notifications: false,
        themeToggle: false,
        densityPicker: false,
        unifiedExperience: false,
        profile: true,
        helpPanel: true
      },
      items: itemsWithActive,
      defaultLogoFull: 'servicenow',
      defaultLogoIcon: 'servicenow'
    });
  },

  teardown() {
    navLayoutContext.set({
      items: [],
      defaultLogoFull: null,
      defaultLogoIcon: null
    });
  }
};
