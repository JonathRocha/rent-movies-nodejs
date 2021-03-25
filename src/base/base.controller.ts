import { Router } from 'express';

export default class BaseController {
    public path!: string;
    public router!: Router;
}
