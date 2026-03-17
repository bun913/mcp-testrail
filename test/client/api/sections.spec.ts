import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMocks, createTestClient } from './testHelper';

describe('Sections API', () => {
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

  it('retrieves a specific section', async () => {
    // Mock response
    const mockSection = { 
      id: 1, 
      name: 'Test Section', 
      description: 'This is a test section',
      suite_id: 1,
      parent_id: null,
      depth: 0,
      display_order: 1
    };
    mockAxiosInstance.get.mockResolvedValue({ data: mockSection });
    
    // Test method
    const result = await client.sections.getSection(1);
    
    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_section/1');
    
    // Verify result
    expect(result).toEqual(mockSection);
  });
  
  it('retrieves all sections for a project', async () => {
    // Mock response with paginated format
    const mockSections = [
      {
        id: 1,
        name: 'Test Section 1',
        description: 'This is test section 1',
        suite_id: 1,
        parent_id: null,
        depth: 0,
        display_order: 1
      },
      {
        id: 2,
        name: 'Test Section 2',
        description: 'This is test section 2',
        suite_id: 1,
        parent_id: 1,
        depth: 1,
        display_order: 2
      }
    ];
    mockAxiosInstance.get.mockResolvedValue({
      data: {
        offset: 0,
        limit: 250,
        size: 2,
        _links: { next: null, prev: null },
        sections: mockSections,
      },
    });

    // Test method
    const result = await client.sections.getSections(1, 1);

    // Verify axios get was called correctly
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/get_sections/1', { params: { suite_id: 1, limit: 250, offset: 0 } });

    // Verify result
    expect(result).toEqual(mockSections);
  });

  it('auto-paginates when there are more sections than the page limit', async () => {
    // Mock first page
    const page1Sections = Array.from({ length: 250 }, (_, i) => ({
      id: i + 1,
      name: `Section ${i + 1}`,
      description: null,
      suite_id: 1,
      parent_id: null,
      depth: 0,
      display_order: i + 1,
    }));
    // Mock second page
    const page2Sections = Array.from({ length: 50 }, (_, i) => ({
      id: 251 + i,
      name: `Section ${251 + i}`,
      description: null,
      suite_id: 1,
      parent_id: null,
      depth: 0,
      display_order: 251 + i,
    }));

    mockAxiosInstance.get
      .mockResolvedValueOnce({
        data: {
          offset: 0,
          limit: 250,
          size: 250,
          _links: { next: '/api/v2/get_sections/1&limit=250&offset=250', prev: null },
          sections: page1Sections,
        },
      })
      .mockResolvedValueOnce({
        data: {
          offset: 250,
          limit: 250,
          size: 50,
          _links: { next: null, prev: '/api/v2/get_sections/1&limit=250&offset=0' },
          sections: page2Sections,
        },
      });

    const result = await client.sections.getSections(1, 1);

    // Verify two API calls were made with correct offsets
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(1, '/api/v2/get_sections/1', { params: { suite_id: 1, limit: 250, offset: 0 } });
    expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(2, '/api/v2/get_sections/1', { params: { suite_id: 1, limit: 250, offset: 250 } });

    // Verify all sections are returned
    expect(result).toHaveLength(300);
    expect(result[0].id).toBe(1);
    expect(result[249].id).toBe(250);
    expect(result[250].id).toBe(251);
    expect(result[299].id).toBe(300);
  });
  
  it('creates a new section', async () => {
    // Mock response
    const mockSection = { 
      id: 1, 
      name: 'New Section', 
      description: 'This is a new section',
      suite_id: 1,
      parent_id: null,
      depth: 0,
      display_order: 1
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockSection });
    
    // Test data
    const sectionData = {
      name: 'New Section',
      description: 'This is a new section',
      suite_id: 1
    };
    
    // Test method
    const result = await client.sections.addSection(1, sectionData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/add_section/1', sectionData);
    
    // Verify result
    expect(result).toEqual(mockSection);
  });
  
  it('moves a section to a different parent', async () => {
    // Mock response
    const mockSection = { 
      id: 2, 
      name: 'Test Section 2', 
      description: 'This is test section 2',
      suite_id: 1,
      parent_id: 3, // Changed parent
      depth: 1,
      display_order: 2
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockSection });
    
    // Test data
    const moveData = {
      parent_id: 3
    };
    
    // Test method
    const result = await client.sections.moveSection(2, moveData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/move_section/2', moveData);
    
    // Verify result
    expect(result).toEqual(mockSection);
  });
  
  it('updates an existing section', async () => {
    // Mock response
    const mockSection = { 
      id: 1, 
      name: 'Updated Section', 
      description: 'This section has been updated',
      suite_id: 1,
      parent_id: null,
      depth: 0,
      display_order: 1
    };
    mockAxiosInstance.post.mockResolvedValue({ data: mockSection });
    
    // Test data
    const sectionData = {
      name: 'Updated Section',
      description: 'This section has been updated'
    };
    
    // Test method
    const result = await client.sections.updateSection(1, sectionData);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/update_section/1', sectionData);
    
    // Verify result
    expect(result).toEqual(mockSection);
  });
  
  it('deletes a section', async () => {
    // Mock successful deletion (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test method
    await client.sections.deleteSection(1);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/delete_section/1', {});
  });
  
  it('deletes a section with soft parameter', async () => {
    // Mock successful deletion (no response data)
    mockAxiosInstance.post.mockResolvedValue({ data: {} });
    
    // Test method
    await client.sections.deleteSection(1, true);
    
    // Verify axios post was called correctly
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v2/delete_section/1?soft=1', {});
  });
}); 