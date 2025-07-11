
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

const CorsDiagnosticTool = () => {
  const [functionUrl, setFunctionUrl] = useState(`${SUPABASE_URL}/functions/v1/get-user-progress`);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
    error?: any;
    headers?: Record<string, string>;
  } | null>(null);

  const testDirectFetch = async () => {
    setIsTesting(true);
    setResult(null);
    
    try {
      console.log(`Testing direct fetch to: ${functionUrl}`);
      
      // First attempt with credentials: 'omit' and mode: 'cors'
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      // Get all headers as an object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: `✅ Success! Status: ${response.status}`,
          data,
          headers,
        });
      } else {
        const errorText = await response.text();
        setResult({
          success: false,
          message: `❌ Error: ${response.status} ${response.statusText}`,
          error: errorText,
          headers,
        });
      }
    } catch (error) {
      console.error("CORS diagnostic test failed:", error);
      setResult({
        success: false,
        message: `❌ CORS Error: ${error instanceof Error ? error.message : String(error)}`,
        error,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const renderHeadersInfo = () => {
    if (!result?.headers) return null;
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials',
      'access-control-max-age',
    ];
    
    const corsHeadersFound = corsHeaders.filter(header => 
      Object.keys(result.headers!).some(h => h.toLowerCase() === header)
    );
    
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h4 className="text-sm font-semibold mb-2">CORS Headers Analysis:</h4>
        {corsHeadersFound.length > 0 ? (
          <div>
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">{corsHeadersFound.length} CORS headers found</span>
            </div>
            <ul className="space-y-1">
              {corsHeaders.map(header => {
                const foundHeader = Object.entries(result.headers!).find(
                  ([key]) => key.toLowerCase() === header
                );
                
                return (
                  <li key={header} className="text-xs font-mono flex">
                    <span className="w-40 font-semibold">{header}:</span>
                    <span className={foundHeader ? "text-green-700" : "text-red-500"}>
                      {foundHeader ? foundHeader[1] : "Not present"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="text-red-500 flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            <span className="text-sm">No CORS headers found in response!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Supabase Function URL to Test</label>
        <div className="flex space-x-2">
          <Input
            value={functionUrl}
            onChange={(e) => setFunctionUrl(e.target.value)}
            className="flex-1"
            placeholder="Enter Supabase function URL"
          />
          <Button 
            onClick={testDirectFetch}
            disabled={isTesting || !functionUrl}
            className="whitespace-nowrap"
          >
            {isTesting ? "Testing..." : "Test CORS"}
          </Button>
        </div>
      </div>
      
      {result && (
        <div className={`mt-4 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          <div className="font-semibold">{result.message}</div>
          
          {renderHeadersInfo()}
          
          {result.success ? (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Response Data:</h4>
              <pre className="bg-gray-50 p-3 rounded border border-gray-200 max-h-[300px] overflow-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Error Details:</h4>
              <pre className="bg-gray-50 p-3 rounded border border-gray-200 max-h-[300px] overflow-auto text-sm">
                {typeof result.error === 'object' 
                  ? JSON.stringify(result.error, null, 2) 
                  : String(result.error)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>How to fix CORS issues in Supabase Edge Functions</AlertTitle>
        <AlertDescription className="text-sm">
          <p className="mb-2">Add these CORS headers to your function:</p>
          <pre className="bg-gray-50 p-2 rounded text-xs mb-2">
{`const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Handle OPTIONS request
if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders, status: 200 });
}

// Add headers to your normal response
return new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
);`}
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CorsDiagnosticTool;
