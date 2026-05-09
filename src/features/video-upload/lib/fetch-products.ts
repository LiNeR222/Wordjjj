export const fetchProducts = async (query: string) => {

  //TODO: move to env
  const API_TOKEN = 'af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77'; 

  try {
    
    const url = new URL('https://app.tablecrm.com/api/v1/nomenclature/');
    
    url.searchParams.append('token', API_TOKEN);
    url.searchParams.append('offset', '0');
    url.searchParams.append('limit', '5');
    if (query) {
      url.searchParams.append('name', query);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result || [];


  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
