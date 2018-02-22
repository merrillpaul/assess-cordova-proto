

import config from '@appEnvironment';
import { Observable, Subject } from 'rxjs';

import { HttpService } from '../shared/http-service';
import { Service, Inject } from 'typedi';

@Service()
export class AuthService {

  @Inject()
  private httpService: HttpService;

  public login(username: string, password: string): Observable<any> {
    const subject = new Subject();
    //http.getCentralRequest().get()
    return subject;
  }
}


