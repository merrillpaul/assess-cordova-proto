import '../styles/base.scss';

import { LoginForm } from './login/login-form';

document.addEventListener(
  'deviceready',
  () => {
    const login: LoginForm = new LoginForm();
    console.log('Device ready');
    login.render(document.getElementById('login-area'));
  },
  false
);
