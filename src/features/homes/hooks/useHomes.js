import { useEffect, useState } from 'react';
import homesService from '../services/homesService';

function useHomes(filters = {}) {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadHomes = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await homesService.getHomes(filters);

        if (isMounted) {
          setHomes(data);
        }
      } catch (err) {
        console.error('Failed to load homes:', err);

        if (isMounted) {
          setError(
            'Unable to load homes. Please try again later.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomes();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  return {
    homes,
    loading,
    error,
  };
}

export default useHomes;
