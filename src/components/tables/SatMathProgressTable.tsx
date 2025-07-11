
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const columnNames = [
  "user_id", "speed", "streak_days", "avg_score", "rank", "projected_score",
  "total_attempted", "total_questions", "correct_count", "incorrect_count", "unattempted_count",
  "easy", "medium", "hard", "avg_time_per_question", "avg_time_correct", "avg_time_incorrect",
  "longest_time", "chapter_stats", "goals", "performance_graph", "last_question_id", "active_objective_id"
];

export default function SatMathProgressTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch('https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/get-user-progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setRows(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        console.error("Error fetching SAT Math Progress:", err);
        setError(err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProgress();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📊 SAT Math Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center py-4">Loading progress data...</p>}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ Error: {error}
          </div>
        )}
        
        {!loading && !error && rows.length === 0 && (
          <p className="text-center py-4 text-gray-500">No data found.</p>
        )}
        
        {!loading && !error && rows.length > 0 && (
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
                {rows.map((row, i) => (
                  <TableRow key={row.user_id || i}>
                    {columnNames.map((col) => (
                      <TableCell key={col} className="max-w-[220px] overflow-auto">
                        {typeof row[col] === "object" && row[col] !== null ? (
                          <pre className="text-xs overflow-auto whitespace-pre-wrap m-0">
                            {JSON.stringify(row[col], null, 2)}
                          </pre>
                        ) : row[col] !== null && row[col] !== undefined ? (
                          String(row[col])
                        ) : (
                          ""
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
