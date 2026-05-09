import { PrivateApi } from '@/shared/api/private.api';
import { PublicApi } from '@/shared/api/public.api';

export abstract class BaseApi {
  privateApi: PrivateApi;
  publicApi: PublicApi;
  constructor() {
    this.privateApi = PrivateApi.getInstance();
    this.publicApi = PublicApi.getInstance();
  }
}
