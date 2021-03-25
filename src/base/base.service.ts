import { Knex } from 'knex';
import { getDbInstance } from 'utils/database';

export default class BaseService {
    public db: Knex;

    constructor() {
        this.db = getDbInstance();
    }
}
