import '../styles/base.scss';

import { LoginForm } from './login/login-form';

import config from '@appEnvironment';

const bootup = () => {
  const login: LoginForm = new LoginForm();
  console.log('Target endpoint', config.centralEndpoint);
  login.render(document.getElementById('login-area'));
};
if (window.cordova) {
  document.addEventListener('deviceready', bootup, false);
} else {
  document.addEventListener('DOMContentLoaded', bootup);
}
