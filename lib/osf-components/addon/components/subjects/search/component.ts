import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

import { layout } from 'ember-osf-web/decorators/component';
import SubjectModel from 'ember-osf-web/models/subject';
import { SubjectManager } from 'osf-components/components/subjects/manager/component';

import styles from './styles';
import template from './template';

@layout(template, styles)
export default class SearchSubjects extends Component.extend({
    doSearch: task(function *(this: SearchSubjects) {
        yield timeout(500); // debounce

        const provider = yield this.subjectsManager.provider;

        const { userQuery } = this;
        if (!userQuery) {
            return undefined;
        }
        return yield provider.queryHasMany('subjects', {
            filter: {
                text: userQuery,
            },
            page: {
                size: 150,
            },
            related_counts: 'children',
            embed: 'parent',
        });
    }).restartable(),
}) {
    // required
    subjectsManager!: SubjectManager;

    // private
    userQuery?: string;

    @alias('doSearch.isRunning')
    isLoading!: boolean;

    @alias('doSearch.lastSuccessful.value')
    searchResults?: SubjectModel[];

    @computed('searchResults.[]')
    get resultCount() {
        const { searchResults } = this;
        return typeof searchResults === 'undefined' ? 10 : searchResults.length;
    }
}
