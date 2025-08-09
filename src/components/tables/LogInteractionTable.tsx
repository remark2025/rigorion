
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLogInteraction } from "@/services/edgeFunctionService";

export default function LogInteractionTable() {
  const [customPayload, setCustomPayload] = useState({
    questionId: "q_math_789",
    isCorrect: false,
    timeSpentSeconds: 89,
    timestamp: new Date().toISOString(),
    sessionId: "session_" + Date.now(),
    userId: "user_456",
    displayedTargetProgressPercentile: 70 // This matches "Target Progress: 70%" in UI
  });

  // State to manage demo request results
  const [requestResult, setRequestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to send a test interaction
  const sendTestInteraction = async () => {
    setLoading(true);
    setError("");
    
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customPayload)
      };
      
      const response = await fetch('https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/log-interaction', {
        ...options,
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setRequestResult(result);
    } catch (err) {
      console.error("Error sending test interaction:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to render a data cell based on its value
  const renderCell = (value) => {
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

  // Update custom payload
  const updatePayload = (field, value) => {
    setCustomPayload(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📊 Log Interaction Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium mb-3">Test Log Interaction</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Payload (editable):</label>
            <textarea
              className="w-full h-32 font-mono text-sm p-2 border rounded"
              value={JSON.stringify(customPayload, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setCustomPayload(parsed);
                } catch (err) {
                  // If it's not valid JSON, don't update the state
                  console.log("Invalid JSON input");
                }
              }}
            />
          </div>
          
          <Button 
            onClick={sendTestInteraction}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send Test Interaction"}
          </Button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ Error: {error}
          </div>
        )}
        
        {requestResult && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Response:</h3>
            <pre className="bg-gray-50 p-3 rounded border text-sm overflow-auto">
              {JSON.stringify(requestResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mb-4">
          <p>This component allows you to test the log-interaction endpoint with custom data.</p>
          <p>The endpoint is designed to record user interactions with content.</p>
        </div>
      </CardContent>
    </Card>
  );
}
