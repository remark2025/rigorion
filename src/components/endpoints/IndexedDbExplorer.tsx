
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllFunctionData, clearAllData, FunctionData } from "@/services/dexieService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Database, Trash2, RefreshCw } from "lucide-react";

const IndexedDbExplorer = () => {
  const [endpoint, setEndpoint] = useState<string>("my-function");
  const [storedData, setStoredData] = useState<FunctionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchStoredData = async () => {
    setLoading(true);
    try {
      const data = await getAllFunctionData(endpoint);
      setStoredData(data);
      toast({
        title: "Data Loaded",
        description: `Found ${data.length} records for ${endpoint}`,
      });
    } catch (error) {
      console.error("Error fetching stored data:", error);
      toast({
        title: "Error Loading Data",
        description: `Failed to load data: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      setStoredData([]);
      toast({
        title: "Data Cleared",
        description: "All stored data has been removed from IndexedDB",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to clear data: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStoredData();
  }, [endpoint]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" /> IndexedDB Explorer
        </CardTitle>
        <CardDescription>View and manage locally stored data from edge functions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Select Endpoint</label>
              <Select value={endpoint} onValueChange={setEndpoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="my-function">my-function</SelectItem>
                  <SelectItem value="encrypted-data">encrypted-data</SelectItem>
                  <SelectItem value="log-interaction">log-interaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={fetchStoredData} 
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
          </div>
          
          {storedData.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Encrypted</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{item.encrypted ? "Yes" : "No"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {typeof item.data === "object" 
                          ? JSON.stringify(item.data).substring(0, 100) + "..." 
                          : String(item.data).substring(0, 100) + "..."}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {loading ? "Loading data..." : "No data stored for this endpoint"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexedDbExplorer;
