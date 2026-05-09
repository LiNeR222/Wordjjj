'use client';

import { videoApi } from '@/entities/video/api';
import { baseUrl } from '@/shared/config';
import axios from 'axios';

const CONTENT_TYPE_JSON = 'application/json';

const api = axios.create({
  baseURL: baseUrl,
  allowAbsoluteUrls: true,
});

api.interceptors.request.use(
  config => {
    config.headers = config.headers || {};
    config.headers['Content-Type'] ??= CONTENT_TYPE_JSON;
    config.withCredentials = false;

    fetch('http://192.168.0.21:3001/log', {
      method: 'POST',
      body: JSON.stringify({ config: JSON.stringify(config), baseUrl: baseUrl }),
    });

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default function PlayerPage() {
  const handleClick = async () => {
    try {
      /*const response = await api.get('http://192.168.0.21:3000/api/v1/videos/video/2', {
        params: { detail: true },
      });*/
      //console.log(response.data);
      const response = await videoApi.getDetailedVideo(2);
      // const response = await videoApi.getVideoWithProxy()
      alert(JSON.stringify(response) || response);
    } catch (error) {
      console.error(error);
      alert(JSON.stringify(error) || error);
    }
  };

  return (
    <div>
      <button onClick={handleClick} className='mt-2 text-sm text-white bg-black rounded-md px-3 py-1 hover:opacity-90'>
        Play
      </button>
    </div>
  );
}
