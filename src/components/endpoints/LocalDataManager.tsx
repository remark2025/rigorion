
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from "@/services/edgeFunctionService";
import { storeFunctionData, getLatestFunctionData } from "@/services/dexieService";
import { Loader2, Save, Download } from "lucide-react";

const LocalDataManager = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [endpointUrl, setEndpointUrl] = useState<string>("https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/my-function");
  const [responsePreview, setResponsePreview] = useState<any>(null);
  const { toast } = useToast();

  const fetchAndStore = async () => {
    setLoading(true);
    try {
      console.log('Fetching data from edge function...');
      
      // Get authentication headers
      const authHeaders = await getAuthHeaders();
      console.log('Auth headers:', authHeaders);
      
      // Extract endpoint name from URL
      const urlParts = endpointUrl.split('/');
      const endpointName = urlParts[urlParts.length - 1];
      
      // Fetch from edge function
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Store in IndexedDB
      await storeFunctionData(endpointName, result);
      
      setResponsePreview(result);
      toast({
        title: "Data Stored Successfully",
        description: `Data from ${endpointName} stored in IndexedDB with encryption`,
      });
    } catch (error) {
      console.error('Error fetching or storing data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch or store data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLatestData = async () => {
    setLoading(true);
    try {
      // Extract endpoint name from URL
      const urlParts = endpointUrl.split('/');
      const endpointName = urlParts[urlParts.length - 1];
      
      // Get latest data
      const latestData = await getLatestFunctionData(endpointName);
      
      if (latestData) {
        setResponsePreview(latestData.data);
        toast({
          title: "Data Loaded",
          description: `Latest data from ${endpointName} loaded from IndexedDB`,
        });
      } else {
        setResponsePreview(null);
        toast({
          title: "No Data Found",
          description: `No data found for ${endpointName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Local Data Manager</CardTitle>
        <CardDescription>Fetch from edge functions and store encrypted data in IndexedDB</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={fetchAndStore}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Fetch & Store Data
            </Button>
            
            <Button 
              onClick={loadLatestData}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Load Latest Data
            </Button>
          </div>
          
          {responsePreview && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Data Preview:</h3>
              <pre className="bg-gray-50 p-3 rounded border text-xs overflow-auto max-h-64">
                {JSON.stringify(responsePreview, null, 2)}
              </pre>
            </div>
          )}
          
          {!responsePreview && !loading && (
            <div className="text-center py-8 text-gray-400">
              No data to display. Fetch from an endpoint or load from storage.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalDataManager;
