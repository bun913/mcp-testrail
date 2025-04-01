import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMocks, createTestClient } from './testHelper';

describe('Cases API', () => {
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

  it('retrieves a test case', async () => {
    // Mock response
    const mockCase = { 
      id: 1, 
      title: 'Test Case', 
      section_id: 1,
      template_id: 1,
      type_id: 1,
      priority_id: 2,
      created_by: 1,
      created_on: 1609459200,
      updated_by: 1,
      updated_on: 1609459300,
      suite_id: 1
    };
    mockAxiosInstance.get.mockResolvedValue({ data: mockCase });
    
    // Test method
    const result = await client.cases.getCase(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_case/1');
    
    // Verify result
    expect(result).toEqual(mockCase);
  });
  
  it('creates a new test case', async () => {
    // Mock response
    const mockCase = { 
      id: 1, 
      title: 'New Test Case', 
      section_id: 1,
      template_id: 1,
      type_id: 1,
      priority_id: 2,
      created_by: 1,
      created_on: 1609459200,
      updated_by: 1,
      updated_on: 1609459300,
      suite_id: 1
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockCase });
    
    // Test data
    const caseData = {
      title: 'New Test Case',
      template_id: 1,
      type_id: 1,
      priority_id: 2
    };
    
    // Test method
    const result = await client.cases.addCase(1, caseData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/add_case/1', caseData);
    
    // Verify result
    expect(result).toEqual(mockCase);
  });
  
  it('handles errors when retrieving a test case', async () => {
    // Mock error response
    const mockError = {
      response: {
        status: 404,
        data: { error: 'Test case not found' }
      }
    };
    mockAxiosInstance.get.mockRejectedValue(mockError);
    
    // Test error handling
    await expect(client.cases.getCase(999)).rejects.toThrow();
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_case/999');
  });

  it('updates an existing test case', async () => {
    // Mock response
    const mockCase = { 
      id: 1, 
      title: 'Updated Test Case', 
      section_id: 1,
      template_id: 1,
      type_id: 2,
      priority_id: 3,
      created_by: 1,
      created_on: 1609459200,
      updated_by: 1,
      updated_on: 1609459400,
      suite_id: 1
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockCase });
    
    // Test data
    const caseData = {
      title: 'Updated Test Case',
      type_id: 2,
      priority_id: 3
    };
    
    // Test method
    const result = await client.cases.updateCase(1, caseData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/update_case/1', caseData);
    
    // Verify result
    expect(result).toEqual(mockCase);
  });

  it('deletes a test case', async () => {
    // Mock successful deletion (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test method
    await client.cases.deleteCase(1);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/delete_case/1', {});
  });

  it('retrieves all test cases for a project', async () => {
    // Mock response
    const mockCases = [
      { 
        id: 1, 
        title: 'Test Case 1', 
        section_id: 1,
        template_id: 1,
        type_id: 1,
        priority_id: 2,
        created_by: 1,
        created_on: 1609459200,
        updated_by: 1,
        updated_on: 1609459300,
        suite_id: 1
      },
      { 
        id: 2, 
        title: 'Test Case 2', 
        section_id: 1,
        template_id: 1,
        type_id: 1,
        priority_id: 3,
        created_by: 1,
        created_on: 1609459200,
        updated_by: 1,
        updated_on: 1609459300,
        suite_id: 1
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({ data: mockCases });
    
    // Test method with pagination parameters
    const result = await client.cases.getCases(1, 1, { limit: 50, offset: 0 });  // projectId: 1, suiteId: 1, pagination
    
    // Verify axios get was called correctly with pagination parameters
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_cases/1', { 
      params: {
        suite_id: 1,
        limit: 50,
        offset: 0
      }
    });
    
    // Verify result
    expect(result).toEqual(mockCases);
  });

  it('retrieves test case history', async () => {
    // Mock response
    const mockHistory = [
      {
        id: 1,
        case_id: 1,
        user_id: 1,
        timestamp: 1609459200,
        changes: [
          {
            field: 'title',
            old_value: 'Old Title',
            new_value: 'New Title'
          }
        ]
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({ data: mockHistory });
    
    // Test method
    const result = await client.cases.getCaseHistory(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_history_for_case/1');
    
    // Verify result
    expect(result).toEqual(mockHistory);
  });

  it('should copy test cases to section', async () => {
    const mockResponse = { status: true };
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await client.cases.copyToSection([1, 2], 2);

    expect(result).toEqual(mockResponse);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/api/v2/copy_cases_to_section/2",
      { case_ids: [1, 2] }
    );
  });

  it('should move test cases to section', async () => {
    const mockResponse = { status: true };
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await client.cases.moveToSection([1, 2], 2);

    expect(result).toEqual(mockResponse);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/api/v2/move_cases_to_section/2",
      { case_ids: [1, 2] }
    );
  });

  it('updates multiple test cases', async () => {
    // Mock successful update (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test data
    const caseData = {
      title: 'Updated Test Case',
      type_id: 2,
      priority_id: 3
    };
    const caseIds = [1, 2, 3];
    
    // Test method
    await client.cases.updateCases(1, 1, caseData, caseIds);  // projectId: 1, suiteId: 1
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/update_cases/1?suite_id=1', {
      ...caseData,
      case_ids: caseIds
    });
  });

  it('deletes multiple test cases', async () => {
    // Mock successful deletion (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test data
    const caseIds = [1, 2, 3];
    
    // Test method
    await client.cases.deleteCases(1, 1, caseIds);  // projectId: 1, suiteId: 1
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/delete_cases/1?suite_id=1', {
      case_ids: caseIds
    });
  });
}); 