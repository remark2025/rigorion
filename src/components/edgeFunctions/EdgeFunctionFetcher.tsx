
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface EdgeFunctionFetcherProps {
  url?: string;
  title?: string;
  token?: string;
  refreshInterval?: number; // In milliseconds
  autoRefresh?: boolean;
}

const EdgeFunctionFetcher = ({ 
  url = "https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/get-user-progress",
  title = "User Progress Data",
  token,
  refreshInterval = 60000, // Default 1 minute
  autoRefresh = false
}: EdgeFunctionFetcherProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Log request details for debugging
      console.log(`Fetching from ${url} with headers:`, headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      
      toast({
        title: "Data fetched successfully",
        description: "Edge function data has been updated.",
      });
    } catch (err: any) {
      console.error("Error fetching from Edge Function:", err);
      setError(err);
      
      toast({
        title: "Error",
        description: err.message || "Failed to fetch data from edge function",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh if enabled
    let intervalId: number | undefined;
    if (autoRefresh && refreshInterval > 0) {
      intervalId = window.setInterval(fetchData, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [url, token, autoRefresh, refreshInterval]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            size="sm"
            onClick={fetchData} 
            disabled={loading}
            variant="outline"
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && <div className="text-center py-4">Loading data...</div>}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
            <p className="font-medium">Error fetching data</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}
        
        {data && (
          <div className="overflow-auto">
            <pre className="bg-gray-50 p-4 rounded text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        
        {!loading && !error && !data && (
          <div className="text-center py-4 text-gray-500">No data received from edge function.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionFetcher;
