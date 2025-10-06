import React, { useState, useEffect } from "react";
import { Card, Spinner, Alert, Badge, Button } from "flowbite-react";
import { ChevronDown, ChevronRight, Book, FileText, Play, Download } from "lucide-react";
import { useAuth } from "../Services/Auth/AuthContext";
// import { executeRawQuery } from "../Services/api";
import Sidebar from "../components/Sidebar";

// Commented out GraphQL interfaces for learning section
/*
interface SubTopic {
  id: string;
  main_topic_id: number;
  title: string;
  content: string;
  position: number;
  created_at: string;
}

interface MainTopic {
  id: string;
  subject_id: number;
  title: string;
  content: string;
  position: number;
  created_at: string;
  subTopics: SubTopic[];
}

interface Subject {
  id: string;
  title: string;
  description: string;
  created_at: string;
  mainTopics: MainTopic[];
  grade: number;
}

interface GetAllSubjectsResponse {
  getAllSubjects: Subject[];
}

const GET_ALL_SUBJECTS_QUERY = `
  query GetAllSubjects($grade: Int) { 
    getAllSubjects(grade: $grade) { 
      id 
      title 
      description 
      created_at 
      mainTopics { 
        id 
        subject_id 
        title 
        content 
        position 
        created_at 
        subTopics { 
          id 
          main_topic_id 
          title 
          content 
          position 
          created_at 
        } 
      } 
      grade 
    } 
  }
`;
*/

// New interfaces for PDF-based materials
interface PDFMaterial {
  id: string;
  title: string;
  filename: string;
  path: string;
  type: 'index' | 'topic';
}

interface ClassMaterials {
  class: number;
  indexPDF: PDFMaterial | null;
  topics: {
    [topicName: string]: PDFMaterial[];
  };
}

const Material: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Commented out old state for learning section
  /*
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedMainTopics, setExpandedMainTopics] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
    type: "subject" | "mainTopic" | "subTopic";
  } | null>(null);
  */
  
  // New state for PDF materials
  const [materials, setMaterials] = useState<ClassMaterials | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<PDFMaterial | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.class) {
      loadMaterials(Number(user.class));
    }
  }, [user?.class]);

  // New function to load PDF materials based on class
  const loadMaterials = async (userClass: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch materials from backend API
      const materialsResponse = await fetch(`https://api.twilightfinland.eu/api/materials/${userClass}`);
      // const materialsResponse = await fetch(`http://localhost:4000/api/materials/${userClass}`);
      if (!materialsResponse.ok) {
        throw new Error('Failed to fetch materials');
      }
      const materialsData = await materialsResponse.json();
      
      // Fetch index materials
      // const indexResponse = await fetch(`http://localhost:4000/api/index/${userClass}`);
      const indexResponse = await fetch(`https://api.twilightfinland.eu/api/index/${userClass}`);
      let indexPDF: PDFMaterial | null = null;
      
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        if (indexData.indexFiles && indexData.indexFiles.length > 0) {
          const indexFile = indexData.indexFiles[0]; // Take the first index file
          indexPDF = {
            id: `index-${userClass}`,
            title: indexFile.name,
            filename: indexFile.filename,
            // path: `http://localhost:4000${indexFile.url}`,
            path: `https://api.twilightfinland.eu${indexFile.url}`,
            type: 'index'
          };
        }
      }
      
      // Transform API response to our format
      const topics: { [topicName: string]: PDFMaterial[] } = {};
      
      materialsData.materials.forEach((topicData: any) => {
        const topicMaterials = topicData.files.map((file: any) => ({
          id: `${topicData.topic}-${file.filename}`,
          title: file.name,
          filename: file.filename,
          // path: `http://localhost:4000${file.url}`,
          path: `https://api.twilightfinland.eu${file.url}`,
          type: 'topic' as const
        }));
        topics[topicData.topic] = topicMaterials;
      });
      
      const classMaterials: ClassMaterials = {
        class: userClass,
        indexPDF,
        topics
      };
      
      setMaterials(classMaterials);
      
      // Auto-select the index PDF if available, otherwise select the first available material
      if (indexPDF) {
        setSelectedPDF(indexPDF);
      } else {
        const firstTopic = Object.values(topics)[0];
        if (firstTopic && firstTopic.length > 0) {
          setSelectedPDF(firstTopic[0]);
        }
      }
      
    } catch (err) {
      console.error("Load materials error:", err);
      setError("Failed to load learning materials");
    } finally {
      setLoading(false);
    }
  };



  // Commented out old functions for learning section
  /*
  const fetchSubjects = async (grade: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await executeRawQuery<GetAllSubjectsResponse>(
        GET_ALL_SUBJECTS_QUERY,
        { grade },
      );

      if (response?.getAllSubjects && response.getAllSubjects.length > 0) {
        setSubjects(response.getAllSubjects);
      } else {
        setError("No subjects found for your grade");
      }
    } catch (err) {
      console.error("Fetch subjects error:", err);
      setError("Failed to fetch learning materials");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectExpansion = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleMainTopicExpansion = (mainTopicId: string) => {
    const newExpanded = new Set(expandedMainTopics);
    if (newExpanded.has(mainTopicId)) {
      newExpanded.delete(mainTopicId);
    } else {
      newExpanded.add(mainTopicId);
    }
    setExpandedMainTopics(newExpanded);
  };

  const handleContentSelect = (
    title: string,
    content: string,
    type: "subject" | "mainTopic" | "subTopic",
  ) => {
    setSelectedContent({ title, content, type });
  };
  */

  // New functions for PDF materials
  const toggleTopicExpansion = (topicName: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedTopics(newExpanded);
  };

  const handlePDFSelect = (pdf: PDFMaterial) => {
    setSelectedPDF(pdf);
  };

  const handleDownload = (pdf: PDFMaterial) => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = pdf.path;
    link.download = pdf.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert color="failure">
          Please log in to access learning materials
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        userData={{
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          mobile: user.mobile,
          class: user.class,
          country: user.country,
          isPaid: user.isPaid,
          examType: user.examType,
          isOnlineExam: user.isOnlineExam,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-3 pt-20 md:p-4 md:pt-4 lg:p-6">
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
              Learning Materials
            </h1>
            <p className="text-lg text-gray-600">
              Grade {user.class} - Explore your materials and topics
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="xl" />
              <span className="ml-3 text-lg text-gray-600">
                Loading materials...
              </span>
            </div>
          )}

          {error && (
            <Alert color="failure" className="mb-6 lg:mb-8">
              <span className="font-medium">Error:</span> {error}
            </Alert>
          )}

          {!loading && !error && !materials && (
            <Alert color="info" className="mb-6 lg:mb-8">
              No learning materials available for your grade yet.
            </Alert>
          )}

          {!loading && !error && materials && (
            <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-4">
              {/* Left Sidebar - Materials Navigation */}
              <div className="xl:col-span-1">
                <Card className="sticky top-4 shadow-lg lg:top-6">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800 lg:mb-6 lg:text-xl">
                    <Book className="mr-2 text-blue-600 lg:mr-3" size={20} />
                    Materials & Topics
                  </h3>
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[70vh] lg:space-y-3 lg:pr-2">
                    
                    {/* Material Index */}
                    {materials.indexPDF && (
                      <div className="rounded-xl border shadow-sm transition-shadow hover:shadow-md">
                        <div
                          className={`flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors hover:bg-blue-50 ${
                            selectedPDF?.id === materials.indexPDF.id ? 'bg-blue-100 border-blue-300' : ''
                          }`}
                          onClick={() => handlePDFSelect(materials.indexPDF!)}
                        >
                          <div className="flex flex-1 items-center">
                            <div className="mr-3 flex items-center">
                              <FileText size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-gray-800">
                                Material Index
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Grade {materials.class} Overview
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Topics */}
                    {Object.entries(materials.topics).map(([topicName, pdfs]) => (
                      <div
                        key={topicName}
                        className="rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* Topic Header */}
                        <div
                          className="flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors hover:bg-green-50"
                          onClick={() => toggleTopicExpansion(topicName)}
                        >
                          <div className="flex flex-1 items-center">
                            <div className="mr-3 flex items-center">
                              {expandedTopics.has(topicName) ? (
                                <ChevronDown size={18} className="text-green-600" />
                              ) : (
                                <ChevronRight size={18} className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-gray-800">
                                {topicName}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                {pdfs.length} materials
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* PDF Materials */}
                        {expandedTopics.has(topicName) && (
                          <div className="rounded-b-xl border-t bg-gray-50">
                            {pdfs.map((pdf) => (
                              <div
                                key={pdf.id}
                                className={`cursor-pointer border-l-3 border-purple-200 p-3 pl-10 transition-colors hover:border-purple-400 hover:bg-gray-200 ${
                                  selectedPDF?.id === pdf.id ? 'bg-purple-100 border-purple-500' : ''
                                }`}
                                onClick={() => handlePDFSelect(pdf)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FileText size={14} className="mr-3 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {pdf.title}
                                    </span>
                                  </div>
                                  <Button
                                    size="xs"
                                    color="light"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(pdf);
                                    }}
                                    className="ml-2"
                                  >
                                    <Download size={12} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Content Area - PDF Viewer */}
              <div className="xl:col-span-3">
                <Card className="min-h-[70vh] shadow-lg">
                  {selectedPDF ? (
                    <div className="p-6">
                      <div className="mb-8 border-b border-gray-200 pb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="text-3xl leading-tight font-bold text-gray-900">
                            {selectedPDF.title}
                          </h2>
                          <div className="flex items-center gap-3">
                            <Badge
                              color={selectedPDF.type === "index" ? "blue" : "purple"}
                              size="lg"
                              className="w-fit"
                            >
                              {selectedPDF.type === "index" ? "Index" : "Topic Material"}
                            </Badge>
                            <Button
                              color="blue"
                              size="sm"
                              onClick={() => handleDownload(selectedPDF)}
                            >
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* PDF Viewer */}
                      <div className="w-full">
                        <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
                          <iframe
                            src={selectedPDF.path}
                            className="h-[600px] w-full rounded-lg"
                            title={selectedPDF.title}
                            style={{ minHeight: '600px' }}
                          />
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            If the PDF doesn't load properly, you can{' '}
                            <button
                              onClick={() => handleDownload(selectedPDF)}
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              download it here
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-6 rounded-full bg-blue-50 p-6">
                        <Play size={48} className="text-blue-600" />
                      </div>
                      <h3 className="mb-4 text-2xl font-semibold text-gray-700">
                        Select a Material to Start Learning
                      </h3>
                      <p className="max-w-md text-lg text-gray-500">
                        Choose a material index or topic from the left sidebar to view
                        the PDF content and start your learning journey.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Material;
