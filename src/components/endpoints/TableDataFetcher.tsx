
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, RefreshCw, Loader2 } from "lucide-react";

const TableDataFetcher = () => {
  const [data, setData] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      // Call our custom Edge Function instead of RPC
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-tables`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }
      
      const tableNames = await response.json();
      
      if (Array.isArray(tableNames) && tableNames.length > 0) {
        setTables(tableNames);
        toast({
          title: "Tables Fetched",
          description: `Found ${tableNames.length} tables in your database`,
        });
      } else {
        // If Edge Function fails or returns empty, fallback to predefined tables
        const fallbackTables = [
          'profiles',
          'payments',
          'questions',
          'user_profiles',
          'user_question_interactions',
          'sat_math_questions',
          'model_test_question'
        ];
        
        setTables(fallbackTables);
        toast({
          title: "Tables Fetched",
          description: `Using ${fallbackTables.length} predefined tables`,
        });
      }
    } catch (error: any) {
      console.error("Error fetching tables:", error);
      // Fallback to predefined tables
      const fallbackTables = ['profiles', 'payments', 'questions'];
      setTables(fallbackTables);
      toast({
        title: "Error",
        description: "Failed to fetch tables, using default tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    if (!tableName) return;
    
    setLoading(true);
    setSelectedTable(tableName);
    
    try {
      // Use type assertion to allow dynamic table name
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(50);

      if (error) throw error;
      
      if (data) {
        setData(data);
        toast({
          title: "Data Fetched",
          description: `Loaded ${data.length} rows from ${tableName}`,
        });
      }
    } catch (error: any) {
      console.error(`Error fetching data from ${tableName}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to fetch data from ${tableName}`,
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" /> Database Tables Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={fetchTables} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Load Tables
            </Button>
            
            {tables.length > 0 && (
              <div className="flex-1">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedTable}
                  onChange={(e) => fetchTableData(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a table...</option>
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading && <div className="text-center py-8">Loading data...</div>}
          
          {!loading && data.length > 0 && (
            <div className="border rounded overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && selectedTable && data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data found in table {selectedTable}
            </div>
          )}
          
          {!loading && !selectedTable && tables.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              Select a table to view its data
            </div>
          )}
          
          {!loading && tables.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tables found or not yet loaded
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableDataFetcher;
