import { Inject, Service } from 'typedi';

import { HttpService } from '@assess/shared/http/http-service';

import SimpleCrypto from 'simple-crypto-js';

const CRYPTO = new SimpleCrypto('Once upon a time in Mexico');

@Service()
export class AuthService {

  @Inject()
  private httpService: HttpService;

  public login(username: string, password: string): Promise<any> {
    return this.httpService.get('/sync/checkAuth', { auth: { password, username }, timeout: 1000 * 30 });
  }

  public encrypt(plainText: string): string {
    return CRYPTO.encrypt(plainText);
  }

  public decrypt(cipher: string): string {
    return CRYPTO.decrypt(cipher);
  }
}


