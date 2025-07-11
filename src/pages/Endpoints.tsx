
import { Layout } from "@/components/layout/Layout";
import EndpointsTabs from "@/components/endpoints/EndpointsTabs";

export default function Endpoints() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">API & Database Explorer</h1>
        <p className="mb-4 text-gray-600">
          This interactive page demonstrates using Edge Functions with local IndexedDB storage via Dexie.
          Data is fetched from edge functions and stored locally for offline access.
        </p>
        
        <EndpointsTabs />
      </div>
    </Layout>
  );
}
