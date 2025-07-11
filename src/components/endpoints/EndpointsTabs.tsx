
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllEndpointsFetcher from "./AllEndpointsFetcher";
import LocalDataManager from "./LocalDataManager";
import CorsDiagnosticTool from "./CorsDiagnosticTool";
import EndpointsIntro from "./EndpointsIntro";
import IndexedDbExplorer from "./IndexedDbExplorer";
import EdgeFunctionStore from "./EdgeFunctionStore";
import CryptoPayment from "./CryptoPayment";

export default function EndpointsTabs() {
  return (
    <Tabs defaultValue="intro">
      <TabsList className="mb-4 w-full overflow-x-auto">
        <TabsTrigger value="intro">Introduction</TabsTrigger>
        <TabsTrigger value="endpoints">Edge Functions</TabsTrigger>
        <TabsTrigger value="storage">LocalStorage</TabsTrigger>
        <TabsTrigger value="indexeddb">IndexedDB</TabsTrigger>
        <TabsTrigger value="cors">CORS Diagnostics</TabsTrigger>
        <TabsTrigger value="edge-function-store">Encrypted Store</TabsTrigger>
        <TabsTrigger value="crypto-payment">Crypto Payment</TabsTrigger>
      </TabsList>
      
      <TabsContent value="intro" className="border rounded-md p-4 md:p-6">
        <EndpointsIntro />
      </TabsContent>
      
      <TabsContent value="endpoints" className="border rounded-md p-4 md:p-6">
        <AllEndpointsFetcher />
      </TabsContent>
      
      <TabsContent value="storage" className="border rounded-md p-4 md:p-6">
        <LocalDataManager />
      </TabsContent>
      
      <TabsContent value="indexeddb" className="border rounded-md p-4 md:p-6">
        <IndexedDbExplorer />
      </TabsContent>
      
      <TabsContent value="cors" className="border rounded-md p-4 md:p-6">
        <CorsDiagnosticTool />
      </TabsContent>
      
      <TabsContent value="edge-function-store" className="border rounded-md p-4 md:p-6">
        <EdgeFunctionStore />
      </TabsContent>
      
      <TabsContent value="crypto-payment" className="border rounded-md p-4 md:p-6">
        <CryptoPayment />
      </TabsContent>
    </Tabs>
  );
}
