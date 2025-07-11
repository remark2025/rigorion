
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const EndpointsIntro = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>How to Use This Explorer</CardTitle>
        <CardDescription>Compare direct table access vs Edge Functions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Direct Table Access</strong>: Uses the Supabase client to query tables directly from the browser (avoids CORS issues)</li>
          <li><strong>Edge Functions</strong>: Makes HTTP requests to serverless functions (may encounter CORS issues)</li>
          <li>Switch between tabs to compare different data access methods</li>
          <li>Use the authentication toggle if accessing protected resources</li>
          <li>For POST requests, you can edit the JSON payload before sending</li>
          <li>Response data will appear below each endpoint after fetching</li>
          <li>The CORS Pong Test endpoint can be used to verify CORS configuration</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default EndpointsIntro;
