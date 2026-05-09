import { Dispatch, SetStateAction } from "react";
import { IProductResult } from "../upload-video-modal";

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
