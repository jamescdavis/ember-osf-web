import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';
import DS from 'ember-data';

function computedDecoratorWithKeyReflectionAndDefaultParams(
    fn: (key: string, params: object) => any,
    defaultParams: object,
) {
    return computedDecoratorWithParams((_: any, keyName: string, __: any, params: any[]) => {
        let key;

        if (typeof params[0] === 'string') {
            key = params.shift();
        } else {
            key = keyName;
        }

        return fn(key, { ...defaultParams, ...params[0] });
    });
}

export const hasMany = computedDecoratorWithKeyReflectionAndDefaultParams(DS.hasMany, { async: false });

export const belongsTo = computedDecoratorWithKeyReflectionAndDefaultParams(DS.belongsTo, { async: false });
