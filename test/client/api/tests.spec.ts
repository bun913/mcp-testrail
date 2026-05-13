import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMocks, createTestClient } from './testHelper';

describe('Tests API', () => {
  let mockAxiosInstance: ReturnType<typeof setupMocks>;
  let client: ReturnType<typeof createTestClient>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = setupMocks();
    client = createTestClient();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('retrieves a specific test', async () => {
    // Mock response
    const mockTest = {
      id: 1,
      name: 'Test Suite 1',
      description: 'Description for test suite 1',
      project_id: 1,
      url: 'http://example.com/suite/1'
    };
    mockAxiosInstance.get.mockResolvedValue({ data: mockTest });
    
    // Test method
    const result = await client.tests.getTest(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_test/1');
    
    // Verify result
    expect(result).toEqual(mockTest);
  });
  
  it('handles errors when retrieving a specific test', async () => {
    // Mock error response (404 - suite not found)
    const mockError = {
      response: {
        status: 404,
        data: { error: 'Suite not found' }
      }
    };
    mockAxiosInstance.get.mockRejectedValue(mockError);
    
    // Test error handling
    await expect(client.tests.getTest(999)).rejects.toThrow();
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_test/999');
  });
  
  it('retrieves all tests for a run', async () => {
    // Mock response
    const mockTests = [
      {
        assignedto_id: 1,
        case_id: 101,
        estimate: "30s",
        estimate_forecast: "1m",
        id: 1001,
        milestone_id: 5,
        priority_id: 2,
        refs: "REQ-001,REQ-002",
        run_id: 50,
        status_id: 1,
        title: "Test Login Functionality",
        type_id: 1
      },
      {
        assignedto_id: 2,
        case_id: 102,
        estimate: "1m 45s",
        estimate_forecast: "2m",
        id: 1002,
        milestone_id: 5,
        priority_id: 1,
        refs: "REQ-003",
        run_id: 50,
        status_id: 2,
        title: "Verify Payment Process",
        type_id: 2
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({ 
      data: { 
        offset: 0,
        limit: 50,
        size: 2,
        _links: null,
        tests: mockTests 
      } 
    });
    
    // Test method
    const result = await client.tests.getTests(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_tests/1', {
      params: {
        offset: 0,
        limit: 50
      }
    });
    
    // Verify result
    expect(result.tests).toEqual(mockTests);
  });

  it('normalizes legacy flat-array response from get_tests (TestRail < 6.7 or pagination disabled)', async () => {
    // TestRail instances without the paginated envelope return a flat array
    // directly. Before normalization this crashed with
    // "Cannot read properties of undefined" when callers read .tests / ._links.
    const mockTests = [
      {
        assignedto_id: 1,
        case_id: 201,
        estimate: "30s",
        estimate_forecast: "1m",
        id: 2001,
        milestone_id: 5,
        priority_id: 2,
        refs: "REQ-100",
        run_id: 50,
        status_id: 1,
        title: "Legacy Test 1",
        type_id: 1
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({ data: mockTests });

    const result = await client.tests.getTests(50);

    expect(result.tests).toEqual(mockTests);
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(50);
    expect(result.size).toBe(1);
    expect(result._links.next).toBeNull();
    expect(result._links.prev).toBeNull();
  });
});