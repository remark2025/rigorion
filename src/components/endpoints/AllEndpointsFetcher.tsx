
import { useState, useEffect } from "react";
import UniversalFetcher from "./UniversalFetcher";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableDataFetcher from "./TableDataFetcher";

interface Endpoint {
  url: string;
  title: string;
  method: "GET" | "POST";
  payload?: any;
}

const AllEndpointsFetcher = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [postEndpoints, setPostEndpoints] = useState<Endpoint[]>([]);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
  const [useAuth, setUseAuth] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Define base GET endpoints
    const baseEndpoints: Endpoint[] = [{
      url: `${SUPABASE_URL}/functions/v1/log-interaction`,
      title: "user_question_interactions (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/get-sat-math-questions`,
      title: "model_test_question (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/get-user-progress`,
      title: "sat_math_progress (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/get-apijson`,
      title: "sat_math_leaders_board (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/my-function`,
      title: "model_sat_math_question (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/encrypted-data`,
      title: "encrypted-data (AES-GCM)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/mock`,
      title: "mock tests (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/get-leaderboard`,
      title: "leaderboard (GET)",
      method: "GET"
    }, {
      url: `${SUPABASE_URL}/functions/v1/get-performance`,
      title: "performance (GET)",
      method: "GET"
    }, {
      url: "https://mmxqzcztduhtrlptzsrp.supabase.co/functions/v1/cors-pong-function",
      title: "CORS Pong Test (GET)",
      method: "GET"
    }];

    // Define POST endpoints
    const postEndpointsList: Endpoint[] = [{
      url: `${SUPABASE_URL}/functions/v1/log-interaction`,
      title: "Log Interaction (POST)",
      method: "POST",
      payload: {
        question_id: 123,
        user_id: "user-123",
        interaction_type: "answer",
        interaction_data: {
          selected_option: "A",
          time_spent: 45
        }
      }
    }, {
      url: `${SUPABASE_URL}/functions/v1/update-user-progress`,
      title: "Update User Progress (POST)",
      method: "POST",
      payload: {
        user_id: "user-123",
        test_id: 456,
        completed: true,
        score: 85
      }
    }];

    // Set the endpoints
    setEndpoints(baseEndpoints);
    setPostEndpoints(postEndpointsList);

    // Get authentication token if user is logged in
    const checkAuth = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAuthHeaders({
          Authorization: `Bearer ${data.session.access_token}`
        });
        setIsAuthenticated(true);
        console.log("User is authenticated, token available if needed");
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);
  
  const toggleAuth = () => {
    setUseAuth(!useAuth);
  };
  
  // Return JSX content instead of void
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={toggleAuth}
          variant={useAuth ? "default" : "outline"}
          className="text-xs"
        >
          {useAuth ? "Using Auth Headers" : "Not Using Auth"}
        </Button>
        {!isAuthenticated && useAuth && (
          <span className="text-xs text-yellow-600">
            Not logged in! No auth token available.
          </span>
        )}
      </div>

      <Tabs defaultValue="get" className="w-full">
        <TabsList>
          <TabsTrigger value="get">GET Endpoints</TabsTrigger>
          <TabsTrigger value="post">POST Endpoints</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="get" className="space-y-4 pt-4">
          {endpoints.map((endpoint, index) => (
            <UniversalFetcher
              key={index}
              url={endpoint.url}
              title={endpoint.title}
              method={endpoint.method}
              useAuthHeaders={useAuth}
              authHeaders={authHeaders}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="post" className="space-y-4 pt-4">
          {postEndpoints.map((endpoint, index) => (
            <UniversalFetcher
              key={index}
              url={endpoint.url}
              title={endpoint.title}
              method={endpoint.method}
              payload={endpoint.payload}
              useAuthHeaders={useAuth}
              authHeaders={authHeaders}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="tables" className="pt-4">
          <TableDataFetcher />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllEndpointsFetcher;
