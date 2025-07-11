
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page since payment is now handled via modals
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Payment is now handled through our secure modal system.</p>
      </div>
    </div>
  );
};

export default Payment;
