
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface UniversalFetcherProps {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  payload?: any;
  headers?: Record<string, string>;
  authHeaders?: Record<string, string>;
  useAuthHeaders?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  title?: string;
}

const UniversalFetcher = ({
  url,
  method = "GET",
  payload = null,
  headers = {},
  authHeaders = {},
  useAuthHeaders = false,
  onSuccess = () => {},
  onError = () => {},
  title = "",
}: UniversalFetcherProps) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [payloadInput, setPayloadInput] = useState<string>(
    payload ? JSON.stringify(payload, null, 2) : '{}'
  );
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    setData(null);
    setResponseHeaders(null);
    setResponseStatus(null);

    // Prepare the fetch options
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(useAuthHeaders ? authHeaders : {}),
        ...headers,
      },
      mode: 'cors',
      credentials: 'omit'  // Don't send cookies by default for CORS
    };
    
    // Add payload for POST/PUT methods
    if ((method === "POST" || method === "PUT") && payloadInput) {
      try {
        const parsedPayload = JSON.parse(payloadInput);
        options.body = JSON.stringify(parsedPayload);
      } catch (err) {
        setError("Invalid JSON payload");
        setLoading(false);
        return;
      }
    }

    console.log(`Fetching ${url} with method ${method}`, options);

    fetch(url, options)
      .then(async (res) => {
        // Store response status
        setResponseStatus(res.status);
        
        // Extract and store headers
        const headers: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          headers[key] = value;
        });
        setResponseHeaders(headers);
        
        if (!res.ok) {
          let errMsg = await res.text();
          throw new Error(errMsg || `Network error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
        onSuccess(json);
      })
      .catch((err) => {
        console.error(`Error fetching ${url}:`, err);
        setError(err.message || "Error");
        setLoading(false);
        onError(err);
      });
  };

  const hasCorsHeaders = responseHeaders && (
    responseHeaders['access-control-allow-origin'] ||
    responseHeaders['Access-Control-Allow-Origin']
  );

  return (
    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          <span className={`text-xs px-2 py-1 rounded ${
            method === "GET" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}>{method}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 mb-2 truncate">{url}</p>
      </div>
      
      {/* Auth header indicator */}
      {useAuthHeaders && (
        <div className="mt-2 text-xs">
          <span className={`px-2 py-1 rounded ${authHeaders && Object.keys(authHeaders).length 
            ? "bg-green-50 text-green-700" 
            : "bg-yellow-50 text-yellow-700"}`}>
            {authHeaders && Object.keys(authHeaders).length 
              ? "Using Authentication" 
              : "Auth Enabled (No Token Available)"}
          </span>
        </div>
      )}
      
      {/* Payload input for POST methods */}
      {(method === "POST" || method === "PUT") && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payload JSON:
          </label>
          <textarea 
            className="w-full h-24 p-2 border border-gray-300 rounded text-sm font-mono"
            value={payloadInput}
            onChange={(e) => setPayloadInput(e.target.value)}
          />
        </div>
      )}
      
      {/* Fetch button */}
      <div className="mt-3">
        <Button 
          onClick={fetchData}
          disabled={loading}
          variant="outline"
          size="sm"
          className={`${
            method === "GET" ? "border-blue-500 hover:bg-blue-50" : "border-green-500 hover:bg-green-50"
          }`}
        >
          {loading ? "Fetching..." : `Fetch ${method === "GET" ? "Data" : "Send Request"}`}
        </Button>
      </div>
      
      {/* Status indicators */}
      {loading && <div className="text-blue-600 mt-3">🔄 Loading...</div>}
      {error && (
        <div className="text-red-500 mt-3 p-2 bg-red-50 border border-red-100 rounded">
          <div className="flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            <span>Error: {error}</span>
          </div>
          
          {/* Show CORS information if applicable */}
          {!hasCorsHeaders && responseHeaders && (
            <div className="mt-2 text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
              <span className="font-semibold">Possible CORS issue detected!</span>
              <p className="mt-1">No CORS headers found in response. The server may not be configured to allow cross-origin requests.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Response status */}
      {responseStatus !== null && (
        <div className={`mt-3 text-sm ${responseStatus >= 200 && responseStatus < 300 ? 'text-green-600' : 'text-orange-500'}`}>
          Status: {responseStatus} {responseStatus >= 200 && responseStatus < 300 ? 'OK' : ''}
        </div>
      )}
      
      {/* CORS status */}
      {responseHeaders && (
        <div className="mt-2 text-xs">
          <span className="font-medium">CORS: </span>
          {hasCorsHeaders ? (
            <span className="text-green-600 flex items-center inline-flex">
              <CheckCircle size={14} className="mr-1" /> 
              Enabled
            </span>
          ) : (
            <span className="text-red-500 flex items-center inline-flex">
              <AlertTriangle size={14} className="mr-1" /> 
              Not detected
            </span>
          )}
        </div>
      )}
      
      {/* Response data */}
      {data && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Response:</h4>
          <pre className="bg-gray-50 p-3 rounded border border-gray-200 max-h-[300px] overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UniversalFetcher;
