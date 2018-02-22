import "reflect-metadata";

import '../styles/base.scss';

import config from '@appEnvironment';
import { LoginForm } from './login/login-form';

import { Container } from 'typedi';

const bootup = () => {
  const login: LoginForm = Container.get(LoginForm);
  console.log('Target endpoint', config.centralEndpoint);
  login.render(document.getElementById('login-area'));
};
if (window.cordova) {
  document.addEventListener('deviceready', bootup, false);
} else {
  document.addEventListener('DOMContentLoaded', bootup);
}
