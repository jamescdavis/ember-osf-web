import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class GuidRegistrationController extends Controller {
    @computed('model.taskInstance.value')
    get projectId(this: GuidRegistrationController): string {
        const registration = this.model.taskInstance.value;
        return registration ? registration.belongsTo('registeredFrom').id() : '';
    }
}
