import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { callEdgeFunction } from '@/services/edgeFunctionService';
import { useTheme } from "@/contexts/ThemeContext";

interface TestMockData {
  id: string;
  name: string;
  status: 'completed' | 'incomplete' | 'in-progress' | 'unattempted';
  score?: number;
}

const defaultTests: TestMockData[] = [
  {
    id: '1',
    name: 'Mock Test 1',
    status: 'completed',
    score: 85
  },
  {
    id: '2',
    name: 'Mock Test 2',
    status: 'in-progress'
  },
  // Add more dummy entries as needed
];

export const TestMocksList = ({ tests: propTests }: { tests?: TestMockData[] }) => {
  const { isDarkMode } = useTheme();
  const [tests, setTests] = useState<TestMockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If tests were passed as props, use those instead of fetching
    if (propTests && propTests.length > 0) {
      setTests(propTests);
      setLoading(false);
      return;
    }
    
    const fetchTests = async () => {
      try {
        console.log('⭐ Attempting to fetch mock tests from edge function...');
        
        const { data, error } = await callEdgeFunction<TestMockData[]>('mock');
        
        if (error) {
          throw error;
        }
        
        console.log('⭐ Mock tests data received:', data);
        
        if (data && Array.isArray(data)) {
          setTests(data);
        } else {
          console.error('Received non-array data:', data);
          throw new Error('Received invalid data format');
        }
      } catch (err) {
        console.error('⭐ Error fetching tests:', err);
        setError('Failed to load test data');
        setTests(defaultTests);
        toast.error("Could not load mock tests. Using sample data.");
      } finally {
        setLoading(false);
      }
    };

    console.log('⭐ Starting fetch tests effect...');
    fetchTests();
  }, [propTests]);

  const getStatusStyles = (status: string, score?: number) => {
    if (status === 'completed' && score) {
      return isDarkMode ? 'text-green-400 font-medium' : 'text-green-600 font-medium';
    }
    switch(status) {
      case 'in-progress': 
        return isDarkMode ? 'text-yellow-400' : 'text-orange-500';
      case 'incomplete': 
        return isDarkMode ? 'text-red-400' : 'text-red-500';
      case 'unattempted': 
        return isDarkMode ? 'text-green-400/50' : 'text-gray-400';
      default: 
        return '';
    }
  };

  const getStatusText = (status: string, score?: number) => {
    if (status === 'completed' && score) {
      return `Score: ${score}%`;
    }
    switch(status) {
      case 'in-progress': 
        return 'In Progress';
      case 'incomplete': 
        return 'Incomplete';
      case 'unattempted': 
        return 'Not Attempted';
      default: 
        return status;
    }
  };

  // Combine fetched tests with fallback data and limit to 100 entries
  const fullTestList = tests.length > 0 ? [...tests.slice(0, 100)] : [...defaultTests];
  while (fullTestList.length < 10) { // Reduced to 10 entries for better performance
    fullTestList.push({
      id: `empty-${fullTestList.length}`,
      name: `Mock Test ${fullTestList.length + 1}`,
      status: 'unattempted'
    });
  }

  if (loading) {
    return (
      <div className={`h-[480px] flex items-center justify-center ${
        isDarkMode ? 'text-green-400' : ''
      }`}>Loading mock tests...</div>
    );
  }

  if (error) {
    return (
      <div className={`h-[480px] flex items-center justify-center ${
        isDarkMode ? 'text-red-400' : 'text-red-500'
      }`}>{error}</div>
    );
  }

  return (
    <div className={`rounded-lg p-6 border h-[480px] ${
      isDarkMode 
        ? 'bg-transparent border-green-500/30 text-green-400' 
        : 'bg-white border-gray-100'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-green-400' : ''
      }`}>Mock Exams</h3>
      <div className="overflow-auto" style={{ height: 'calc(100% - 48px)' }}>
        <Table>
          <TableHeader className={`sticky top-0 z-10 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white shadow-sm'
          }`}>
            <TableRow className={isDarkMode ? 'border-green-500/30' : ''}>
              <TableHead className={isDarkMode ? 'text-green-400' : ''}>Test Name</TableHead>
              <TableHead className={isDarkMode ? 'text-green-400' : ''}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fullTestList.map((test) => (
              <TableRow key={test.id} className={isDarkMode ? 'border-green-500/30 hover:bg-gray-800/50' : ''}>
                <TableCell className={`font-medium ${
                  isDarkMode ? 'text-green-400' : ''
                }`}>{test.name}</TableCell>
                <TableCell className={cn(getStatusStyles(test.status, test.score))}>
                  {getStatusText(test.status, test.score)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
