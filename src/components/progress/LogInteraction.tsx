
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LogInteraction = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(JSON.stringify({
    user_id: "example-user-123",
    action: "view",
    content_id: "math-question-456",
    timestamp: new Date().toISOString(),
    details: {
      duration: 120,
      score: 85
    }
  }, null, 2));

  const postData = async () => {
    setLoading(true);
    setError(null);

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (parseError) {
        throw new Error("Invalid JSON payload: " + parseError.message);
      }
      
      const response = await fetch('https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/log-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload),
        mode: 'cors', // Explicitly set CORS mode
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Interaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="payload" className="block text-sm font-medium mb-2">
            JSON Payload:
          </label>
          <textarea
            id="payload"
            className="w-full h-64 font-mono text-sm p-3 border rounded-md"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>

        <Button 
          onClick={postData} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? "Sending..." : "Send Request"}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
            <p className="font-semibold">Error:</p>
            <p>{error.message}</p>
          </div>
        )}

        {data && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Response:</h3>
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px]">
              <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogInteraction;
