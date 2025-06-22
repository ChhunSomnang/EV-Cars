import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
    const swaggerApiUrl = 'https://inventory-api-v1-367404119922.asia-southeast1.run.app/AnonymousUser/Login';
  
    return (
      <div style={{ height: '100vh' }}>
        {swaggerApiUrl ? (
          <SwaggerUI url={swaggerApiUrl} />
        ) : (
          <p>Unable to load API documentation. Please try again later.</p>
        )}
      </div>
    );
  }
  
