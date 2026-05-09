import { tokenErrors } from '@/shared/api/constants';
import { handleAuthError } from '@/shared/api/errors/handle-auth-error';
import Hls, { Fragment, Loader, LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from 'hls.js';
import { playerStore } from '../model/player-store';
import { parseError } from './helpers';
import { setHeaders } from './set-headers';

export class CustomLoader implements Loader<LoaderContext> {
  private loader: Loader<LoaderContext>;
  createLoader(config: LoaderConfiguration) {
    const DefaultLoader = Hls.DefaultConfig.loader as unknown as new (
      config: LoaderConfiguration
    ) => Loader<LoaderContext>;
    return new DefaultLoader({ ...config });
  }
  constructor(config: LoaderConfiguration) {
    this.loader = this.createLoader(config);
  }
  load = async (context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>) => {
    await setHeaders(context);

    this.loader.load(context, config, {
      ...callbacks,
      onError: async (response, context, networkDetails, stats) => {
        const error = parseError(networkDetails);
        //если ошибку выдает самый первый сегмент playlist0.ts, Vime не вызывает onVmError
        //const isFirstFragment = 'frag' in context && (context.frag as Fragment).sn === 0;
        //если ошибка связана с авторизацией, пытаемся решить проблему
        if ([401, 402, 403].includes(Number(error.status))) {
          if ('frag' in context && error.message !== tokenErrors.expired) {
            if ((context.frag as Fragment).sn === 0) {
            }
            //если ошибка связана с запросом фрагмента, то добавляем его в хранилище плеера
            //чтобы обработать его ошибку в момент, когда время проигрывания видео дойдет до фрагмента
            //this.loader.abort();
            this.loader = this.createLoader(config);
            const load = async () => {
              await setHeaders(context);
              this.loader.load(context, config, callbacks);
            };
            const fragmentSN = (context.frag as Fragment).sn;
            playerStore.addFragmentWithError(fragmentSN, { error, fragment: context.frag as Fragment, load });
          } else {
            //иначе пытаемся решить проблему авторизации
            const result = await handleAuthError(error);
            if (result) {
              //обновляем заголовки token и sessionId
              await setHeaders(context);
              this.loader = this.createLoader(config);
              this.loader.load(context, config, callbacks);
            } else {
              console.log('не смогли решить проблему с авторизацией');
              this.loader.abort();
            }
          }
        } else {
          callbacks.onError(response, context, networkDetails, stats);
        }
      },
    });
  };

  abort(): void {
    this.loader.abort();
  }

  destroy(): void {
    this.loader.destroy();
  }

  get stats(): LoaderStats {
    return this.loader.stats;
  }

  get context(): LoaderContext | null {
    return this.loader.context;
  }
}
