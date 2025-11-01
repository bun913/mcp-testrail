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
    const mockCasesArray = [
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
    
    const mockCasesResponse = {
      cases: mockCasesArray,
      offset: 0,
      limit: 50,
      size: 2,
      _links: {
        next: null,
        prev: null
      }
    };
    
    mockAxiosInstance.get.mockResolvedValue({ data: mockCasesResponse });
    
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
    expect(result).toEqual(mockCasesResponse);
  });

  it('retrieves test cases with all optional parameters', async () => {
    // Mock response
    mockAxiosInstance.get.mockResolvedValue({ data: {} });

    // Test method with all optional parameters
    const params = {
      limit: 25,
      offset: 0,
      created_by: '1,2,3', // Array converted to comma-separated string
      filter: 'Login Test',
      milestone_id: '5,6', // Array converted to comma-separated string
      priority_id: '2,3', // Array converted to comma-separated string
      refs: 'TR-123',
      section_id: 1,
      template_id: '1,2', // Array converted to comma-separated string
      type_id: '1,2', // Array converted to comma-separated string
      updated_by: '4,5', // Array converted to comma-separated string
      label_id: '7,8' // Array converted to comma-separated string
    };

    await client.cases.getCases(1, 1, params);

    // Verify axios get was called correctly with all parameters
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_cases/1', {
      params: {
        suite_id: 1,
        limit: 25,
        offset: 0,
        created_by: '1,2,3',
        filter: 'Login Test',
        milestone_id: '5,6',
        priority_id: '2,3',
        refs: 'TR-123',
        section_id: 1,
        template_id: '1,2',
        type_id: '1,2',
        updated_by: '4,5',
        label_id: '7,8'
      }
    });
  });

  it('retrieves test cases with filter and refs parameters', async () => {
    // Mock response
    mockAxiosInstance.get.mockResolvedValue({ data: {} });

    // Test method with filter and refs parameters
    const params = {
      filter: 'Registration',
      refs: 'TR-456'
    };

    await client.cases.getCases(1, 1, params);

    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_cases/1', {
      params: {
        suite_id: 1,
        filter: 'Registration',
        refs: 'TR-456',
        limit: 50,
        offset: 0
      }
    });
  });

  it('retrieves test cases with section_id parameter', async () => {
    // Mock response
    mockAxiosInstance.get.mockResolvedValue({ data: {} });

    // Test method with section_id parameter
    const params = {
      section_id: 5
    };

    await client.cases.getCases(1, 1, params);

    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_cases/1', {
      params: {
        suite_id: 1,
        section_id: 5,
        limit: 50,
        offset: 0
      }
    });
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

  it('creates a test case with template_id and custom_steps_separated', async () => {
    // Mock response
    const mockCase = { 
      id: 1, 
      title: 'Test Case with Custom Steps', 
      section_id: 1,
      template_id: 2,
      type_id: 1,
      priority_id: 2,
      created_by: 1,
      created_on: 1609459200,
      updated_by: 1,
      updated_on: 1609459300,
      suite_id: 1,
      custom_steps_separated: [
        { content: 'Step 1', expected: 'Expected 1' },
        { content: 'Step 2', expected: 'Expected 2' }
      ]
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockCase });
    
    // Test data with template_id and custom_steps_separated (typed)
    const caseData = {
      title: 'Test Case with Custom Steps',
      template_id: 2,
      type_id: 1,
      priority_id: 2,
      custom_steps_separated: [
        { content: 'Step 1', expected: 'Expected 1' },
        { content: 'Step 2', expected: 'Expected 2' }
      ]
    };
    
    // Test method
    const result = await client.cases.addCase(1, caseData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/add_case/1', caseData);
    
    // Verify result
    expect(result).toEqual(mockCase);
    expect(result.template_id).toBe(2);
    expect(result.custom_steps_separated).toEqual([
      { content: 'Step 1', expected: 'Expected 1' },
      { content: 'Step 2', expected: 'Expected 2' }
    ]);
  });

  it('rejects invalid data when creating a test case', async () => {
    // Test data with invalid types
    const invalidCaseData = {
      title: 123, // should be string
      type_id: 'invalid', // should be number
      custom_steps_separated: [
        { content: 'Step 1' } // missing 'expected' field
      ]
    } as any;
    
    // Test method should throw validation error
    await expect(client.cases.addCase(1, invalidCaseData)).rejects.toThrow();
    
    // Verify axios post was not called
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  it('updates a test case with template_id and custom_steps_separated', async () => {
    // Mock response
    const mockCase = { 
      id: 1, 
      title: 'Updated Test Case with Custom Steps', 
      section_id: 1,
      template_id: 2,
      type_id: 1,
      priority_id: 2,
      created_by: 1,
      created_on: 1609459200,
      updated_by: 1,
      updated_on: 1609459400,
      suite_id: 1,
      custom_steps_separated: [
        { content: 'Updated Step 1', expected: 'Updated Expected 1' },
        { content: 'Updated Step 2', expected: 'Updated Expected 2' }
      ]
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockCase });
    
    // Test data with template_id and custom_steps_separated (typed)
    const caseData = {
      title: 'Updated Test Case with Custom Steps',
      template_id: 2,
      custom_steps_separated: [
        { content: 'Updated Step 1', expected: 'Updated Expected 1' },
        { content: 'Updated Step 2', expected: 'Updated Expected 2' }
      ]
    };
    
    // Test method
    const result = await client.cases.updateCase(1, caseData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/update_case/1', caseData);
    
    // Verify result
    expect(result).toEqual(mockCase);
    expect(result.template_id).toBe(2);
    expect(result.custom_steps_separated).toEqual([
      { content: 'Updated Step 1', expected: 'Updated Expected 1' },
      { content: 'Updated Step 2', expected: 'Updated Expected 2' }
    ]);
  });

  it('rejects invalid data when updating a test case', async () => {
    // Test data with invalid types
    const invalidCaseData = {
      title: null, // should be string or undefined
      priority_id: 'high', // should be number
      custom_steps_separated: 'invalid' // should be array
    } as any;
    
    // Test method should throw validation error
    await expect(client.cases.updateCase(1, invalidCaseData)).rejects.toThrow();
    
    // Verify axios post was not called
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  it('updates multiple test cases with template_id and custom_steps_separated', async () => {
    // Mock successful update (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test data with template_id and custom_steps_separated (typed)
    const caseData = {
      template_id: 2,
      custom_steps_separated: [
        { content: 'Bulk Step 1', expected: 'Bulk Expected 1' },
        { content: 'Bulk Step 2', expected: 'Bulk Expected 2' }
      ]
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

  it('rejects invalid data when updating multiple test cases', async () => {
    // Test data with invalid types
    const invalidCaseData = {
      template_id: 'two', // should be number
      custom_steps_separated: [
        { content: 123, expected: 'Expected 1' } // content should be string
      ]
    } as any;
    const caseIds = [1, 2, 3];
    
    // Test method should throw validation error
    await expect(client.cases.updateCases(1, 1, invalidCaseData, caseIds)).rejects.toThrow();
    
    // Verify axios post was not called
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });
}); 