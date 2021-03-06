import Component from '@ember/component';
import { assert } from '@ember/debug';
import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

import { layout } from 'ember-osf-web/decorators/component';
import formattedTimeSince from 'ember-osf-web/utils/formatted-time-since';

import template from './template';

const interval = 30000; // every 30 seconds

@layout(template)
export default class TimeSince extends Component.extend({
    calculateRelativeTime: task(function *(this: TimeSince) {
        assert('RelativeTime @date is required', Boolean(this.date));
        if (Ember.testing) {
            return;
        }
        while (true) {
            this.set('displayTime', formattedTimeSince(this.date));
            yield timeout(interval);
        }
    }).on('didReceiveAttrs').restartable(),
}) {
    // required arguments
    date!: Date;

    // Private properties
    displayTime?: string;
}
