import { tagName } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import Component from '@ember/component';

import { layout, requiredAction } from 'ember-osf-web/decorators/component';

import styles from './styles';
import template from './template';

@layout(template, styles)
@tagName('')
export default class CarouselItem extends Component {
    // Required parameters
    allItems!: CarouselItem[];
    @requiredAction register!: (item: CarouselItem) => void;

    // Private properties
    index: number = 0;
    slideIndex: number = 0;

    didInsertElement(...args: any[]) {
        this._super(...args);
        this.register(this);
        this.set('index', this.allItems.indexOf(this));
        this.set('slideIndex', this.allItems.indexOf(this) + 1);
    }

    @computed('allItems.@each')
    get isActive() {
        return this === this.allItems[0];
    }

    @computed('isActive')
    get tabIndex() {
        return this.isActive ? 0 : -1;
    }
}
