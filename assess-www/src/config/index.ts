import { IEnvironment } from '@assess/config-type';
import beta1 from './beta1';
import dev from './dev';
import Int from './int';
import localdev from './localdev';
import ppe from './ppe';
import prod from './prod';
import qa from './qa';
import test from './test';

const ENVS: IEnvironment = {
    beta1, dev, 'int': Int, localdev, ppe, prod, qa, test
};

export default ENVS;