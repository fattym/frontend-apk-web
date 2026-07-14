import { useState, useEffect } from 'react';
import api from '../services/api';

const useApiList = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(url);
      setData(res.data.results || res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [url]);

  return { data, loading, error, refresh: fetchData };
};

export default useApiList;
