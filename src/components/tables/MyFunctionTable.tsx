
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from "@/services/edgeFunctionService";
import { storeFunctionData, getLatestFunctionData } from "@/services/dexieService";
import { Loader2, RefreshCw, Database } from "lucide-react";

export default function MyFunctionTable() {
  const [data, setData] = useState<any>(null);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [usingLocalData, setUsingLocalData] = useState(false);

  const fetchData = async (useCache = true) => {
    setLoading(true);
    setError("");
    
    try {
      // Check for cached data first if useCache is true
      if (useCache) {
        const cachedData = await getLatestFunctionData("my-function");
        if (cachedData) {
          processData(cachedData.data);
          setUsingLocalData(true);
          setLastFetched(new Date(cachedData.timestamp));
          console.log("Using cached data from IndexedDB");
          toast({
            title: "Using Cached Data",
            description: "Loaded from local IndexedDB storage",
          });
          setLoading(false);
          return;
        }
      }
      
      // No cached data or forced refresh, fetch from API
      setUsingLocalData(false);
      
      // Get auth headers
      const authHeaders = await getAuthHeaders();
      console.log('Auth headers for my-function:', authHeaders);
      
      const response = await fetch('https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/my-function', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Store the fetched data in IndexedDB
      await storeFunctionData("my-function", result);
      console.log("Data stored in IndexedDB");
      
      processData(result);
      setLastFetched(new Date());
      
      toast({
        title: "Data Fetched Successfully",
        description: "Fresh data loaded from edge function and stored locally",
      });
    } catch (err: any) {
      console.error("Error fetching from my-function:", err);
      setError(err.message);
      
      toast({
        title: "Error Fetching Data",
        description: err.message,
        variant: "destructive",
      });
      
      // Try to load from cache as fallback if fetch fails
      if (!useCache) {
        try {
          const cachedData = await getLatestFunctionData("my-function");
          if (cachedData) {
            processData(cachedData.data);
            setUsingLocalData(true);
            setLastFetched(new Date(cachedData.timestamp));
            
            toast({
              title: "Using Cached Data",
              description: "Failed to fetch fresh data, using cached data instead",
            });
          }
        } catch (cacheErr) {
          console.error("Error loading from cache:", cacheErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  const processData = (result: any) => {
    setData(result);
    
    // Dynamically determine column names from the first item if it's an array
    if (Array.isArray(result) && result.length > 0) {
      setColumnNames(Object.keys(result[0]));
    } 
    // If it's a single object, use its keys as column names
    else if (result && typeof result === 'object') {
      setColumnNames(Object.keys(result));
    }
  };

  // Function to render a data cell based on its value
  const renderCell = (value: any) => {
    if (value === null || value === undefined) {
      return "";
    } else if (typeof value === "object") {
      return (
        <pre className="text-xs overflow-auto whitespace-pre-wrap m-0">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else {
      return String(value);
    }
  };
  
  // Load data when the component mounts
  useEffect(() => {
    fetchData(true);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" /> 
            MyFunction Data
          </CardTitle>
          <Button 
            onClick={() => fetchData(false)} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {lastFetched && (
          <div className="flex items-center mb-4 text-sm text-gray-500">
            <span className={usingLocalData ? "text-amber-600" : "text-green-600"}>
              {usingLocalData ? "Using data from local storage" : "Fresh data from edge function"}
            </span>
            <span className="mx-2">•</span> 
            Last updated: {lastFetched.toLocaleTimeString()}
          </div>
        )}
        
        {loading && <p className="text-center py-4">Loading data...</p>}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ Error: {error}
          </div>
        )}
        
        {!loading && !error && !data && (
          <p className="text-center py-4 text-gray-500">No data found.</p>
        )}
        
        {!loading && !error && data && columnNames.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnNames.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(data) ? (
                  // Handle array of objects
                  data.map((row, i) => (
                    <TableRow key={i}>
                      {columnNames.map((col) => (
                        <TableCell key={col} className="max-w-[220px] overflow-auto">
                          {renderCell(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  // Handle a single object
                  <TableRow>
                    {columnNames.map((col) => (
                      <TableCell key={col} className="max-w-[220px] overflow-auto">
                        {renderCell(data[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
