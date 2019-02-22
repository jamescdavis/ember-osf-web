import { layout } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { or } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import { set } from '@ember/object';
import { ChangesetDef } from 'ember-changeset/types';
import { task } from 'ember-concurrency';
import DS from 'ember-data';
import ModelRegistry from 'ember-data/types/registries/model';
import Toast from 'ember-toastr/services/toast';

import { requiredAction } from 'ember-osf-web/decorators/component';
import { ValidatedModelName } from 'ember-osf-web/models/osf-model';
import Analytics from 'ember-osf-web/services/analytics';
import buildChangeset from 'ember-osf-web/utils/build-changeset';
import defaultTo from 'ember-osf-web/utils/default-to';

import template from './template';

@layout(template)
export default class ValidatedModelForm<M extends ValidatedModelName> extends Component {
    // Required arguments
    @requiredAction onSave!: (changeset: ChangesetDef) => void;

    // Optional arguments
    onError?: (e: object, changeset: ChangesetDef) => void;
    onWillDestroy?: (model: ModelRegistry[M], changeset?: ChangesetDef) => void;
    model?: ModelRegistry[M];
    modelName?: M; // If provided, new model instance created in constructor
    disabled: boolean = defaultTo(this.disabled, false);
    changeset?: ChangesetDef;
    recreateModel: boolean = defaultTo(this.recreateModel, false);

    // Private properties
    @service store!: DS.Store;
    @service analytics!: Analytics;
    @service toast!: Toast;

    shouldShowMessages: boolean = false;
    modelProperties: object = defaultTo(this.modelProperties, {});

    @or('disabled', 'saveModelTask.isRunning')
    inputsDisabled!: boolean;

    saveModelTask = task(function *(this: ValidatedModelForm<M>) {
        if (!this.changeset) {
            return;
        }

        yield this.changeset.validate();

        if (this.changeset.get('isValid')) {
            try {
                yield this.changeset.save({});
                this.onSave(this.changeset);
                if (this.modelName && this.recreateModel) {
                    set(this, 'model', this.store.createRecord(this.modelName, this.modelProperties));
                    if (this.model !== undefined) {
                        set(this, 'changeset', buildChangeset(this.model));
                    }
                }
                this.set('shouldShowMessages', false);
            } catch (e) {
                if (this.onError) {
                    this.onError(e, this.changeset);
                } else {
                    this.toast.error(e);
                }
                throw e;
            }
        } else {
            this.set('shouldShowMessages', true);
        }
    });

    constructor(...args: any[]) {
        super(...args);

        if (!this.model && this.modelName) {
            this.model = this.store.createRecord(this.modelName, this.modelProperties);
        }
        if (!this.changeset && this.model) {
            set(this, 'changeset', buildChangeset(this.model));
        }
    }

    willDestroy() {
        if (this.onWillDestroy !== undefined && this.model) {
            this.onWillDestroy(this.model, this.changeset);
        } else if (this.changeset) {
            this.changeset.rollback();
        }
    }

    @action
    rollback() {
        this.willDestroy();
    }
}
