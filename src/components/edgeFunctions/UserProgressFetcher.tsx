
import React from 'react';
import EdgeFunctionFetcher from './EdgeFunctionFetcher';

const UserProgressFetcher = () => {
  // Use the specific token and URL for user progress
  const edgeFunctionUrl = "https://eantvimmgdmxzwrjwrop.supabase.co/functions/v1/get-user-progress";
  const authToken = "zeJEETax6LGd7w+oPC2lJMhU+6hJ6e+3Ql2IpqyzEtfT4DmBIxdxgM4Ife6ubzacisGgndj8e/zeGNRPx/MfhA==";

  return (
    <EdgeFunctionFetcher
      url={edgeFunctionUrl}
      title="User Progress Data"
      token={authToken}
      autoRefresh={false}
    />
  );
};

export default UserProgressFetcher;
