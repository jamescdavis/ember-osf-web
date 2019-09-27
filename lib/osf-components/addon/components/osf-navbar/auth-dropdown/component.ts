import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service, Registry as Services } from '@ember/service';
import Features from 'ember-feature-flags/services/features';
import config from 'ember-get-config';
import I18N from 'ember-i18n/services/i18n';
import Session from 'ember-simple-auth/services/session';

import { layout } from 'ember-osf-web/decorators/component';
import User from 'ember-osf-web/models/user';
import Analytics from 'ember-osf-web/services/analytics';
import CurrentUser from 'ember-osf-web/services/current-user';
import cleanURL from 'ember-osf-web/utils/clean-url';
import defaultTo from 'ember-osf-web/utils/default-to';
import param from 'ember-osf-web/utils/param';
import pathJoin from 'ember-osf-web/utils/path-join';

import styles from './styles';
import template from './template';

const { OSF: { url: baseUrl } } = config;

export class AuthBase extends Component {
    @service analytics!: Analytics;
    @service currentUser!: CurrentUser;
    @service i18n!: I18N;
    @service session!: Session;
    @service features!: Features;
    @service router!: Services['router'];

    @alias('currentUser.user') user!: User;

    /**
     * Action run when the user clicks "Sign In"
     */
    loginAction?: () => void;

    /**
     * The URL to redirect to after logout
     */
    redirectUrl?: string;

    campaign?: string;

    profileURL: string = defaultTo(this.profileURL, pathJoin(baseUrl, 'profile'));
    settingsURL: string = defaultTo(this.settingsURL, pathJoin(baseUrl, 'settings'));
    signUpURL: string = defaultTo(this.signUpURL, pathJoin(baseUrl, 'register'));
    onLinkClicked?: () => void;

    @computed('router.currentURL')
    get signUpNext() {
        return pathJoin(baseUrl, cleanURL(this.router.currentURL));
    }

    @computed('router.currentRouteName', 'signUpNext')
    get signUpQueryParams() {
        const params: Record<string, string> = {};

        if (this.campaign) {
            params.campaign = this.campaign;
        }

        if (this.router.currentRouteName !== 'register') {
            params.next = this.signUpNext;
        }

        return params;
    }

    @action
    login(this: NavbarAuthDropdown) {
        this.currentUser.login();
    }

    @action
    logout(this: NavbarAuthDropdown) {
        // Assuming `redirectUrl` comes back to this app, the session will be invalidated then.
        const query = this.redirectUrl ? `?${param({ next_url: this.redirectUrl })}` : '';
        window.location.href = `${config.OSF.url}logout/${query}`;
    }
}

/**
 * Display the login dropdown on the navbar
 *
 * @class osf-navbar/auth-dropdown
 */
@layout(template, styles)
@tagName('')
export default class NavbarAuthDropdown extends AuthBase {
}
