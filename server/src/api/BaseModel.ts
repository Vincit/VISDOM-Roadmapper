import { Model, AjvValidator } from 'objection';
import addFormats from 'ajv-formats';

/**
 * Extends `Objection.Model` providing format validation for the json schema
 */
export default class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (ajv) => {
        addFormats(ajv, ['date-time', 'email', 'hostname', 'uri', 'uuid']);
      },
    });
  }
}
