import { authStore } from '@/entities/auth/model/authStore';
import { tokenErrors } from '@/shared/api/constants';
import Hls, { Fragment, Loader, LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from 'hls.js';
import { fragmentsStore } from '../model/fragments';
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
  reload = async (context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>) => {
    //обновляем заголовки token и sessionId
    await setHeaders(context);
    this.loader = this.createLoader(config);
    this.loader.load(context, config, callbacks);
  };
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
          const videoId = context.url.match(/\/video\/(\d+)\//)?.[1];

          if (videoId && 'frag' in context && error.message !== tokenErrors.expired) {
            //если ошибка связана с запросом фрагмента, то добавляем его в хранилище
            //чтобы обработать его ошибку в момент, когда время проигрывания видео дойдет до фрагмента
            fragmentsStore.createFragment(
              Number(videoId),
              Number((context.frag as Fragment).sn),
              async () => {
                await this.reload(context, config, callbacks);
              },
              error
            );
          } else {
            //иначе пытаемся решить проблему авторизации
            const result = await authStore.handleAuthError(error);
            if (result) {
              await this.reload(context, config, callbacks);
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
