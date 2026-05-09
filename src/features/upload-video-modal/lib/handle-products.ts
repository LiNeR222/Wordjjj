import { Dispatch, SetStateAction } from 'react';
import { IProductResult } from '../upload-video-modal';

export const handleSelectProduct = (
  product: IProductResult,
  setProductId: Dispatch<SetStateAction<number | null>>,
  setQuery: Dispatch<SetStateAction<string>>,
  setResults: Dispatch<SetStateAction<IProductResult[]>>
) => {
  setProductId(product.id);
  setQuery(product.name);
  setResults([]);
};

export const fetchData = async (setResults: Dispatch<SetStateAction<IProductResult[]>>) => {
  try {
    const response = await fetch(
      `https://app.tablecrm.com/api/v1/nomenclature/?token=af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77&offset=0&limit=5&`
    );
    const data = await response.json();
    setResults(data.result || []);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
};
