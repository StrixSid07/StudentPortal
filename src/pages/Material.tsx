import React, { useState, useEffect } from "react";
import { Card, Spinner, Alert, Badge } from "flowbite-react";
import { ChevronDown, ChevronRight, Book, FileText, Play } from "lucide-react";
import { useAuth } from "../Services/Auth/AuthContext";
import { executeRawQuery } from "../Services/api";
import Sidebar from "../components/Sidebar";

// Interfaces for the GraphQL response
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

const Material: React.FC = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(),
  );
  const [expandedMainTopics, setExpandedMainTopics] = useState<Set<string>>(
    new Set(),
  );
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
    type: "subject" | "mainTopic" | "subTopic";
  } | null>(null);

  useEffect(() => {
    if (user && user.class) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    if (!user || !user.class) return;

    setLoading(true);
    setError(null);

    try {
      const grade = parseInt(user.class, 10);
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
              Grade {user.class} - Explore your subjects and topics
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

          {!loading && !error && subjects.length === 0 && (
            <Alert color="info" className="mb-6 lg:mb-8">
              No learning materials available for your grade yet.
            </Alert>
          )}

          {!loading && !error && subjects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-4">
              {/* Left Sidebar - Topics Navigation */}
              <div className="xl:col-span-1">
                <Card className="sticky top-4 shadow-lg lg:top-6">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-800 lg:mb-6 lg:text-xl">
                    <Book className="mr-2 text-blue-600 lg:mr-3" size={20} />
                    Subjects & Topics
                  </h3>
                  <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[70vh] lg:space-y-3 lg:pr-2">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* Subject Header */}
                        <div
                          className="flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors hover:bg-blue-50"
                          onClick={() => {
                            toggleSubjectExpansion(subject.id);
                            handleContentSelect(
                              subject.title,
                              subject.description,
                              "subject",
                            );
                          }}
                        >
                          <div className="flex flex-1 items-center">
                            <div className="mr-3 flex items-center">
                              {expandedSubjects.has(subject.id) ? (
                                <ChevronDown
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <ChevronRight
                                  size={18}
                                  className="text-gray-500"
                                />
                              )}
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-gray-800">
                                {subject.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                {subject.mainTopics.length} topics
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Topics */}
                        {expandedSubjects.has(subject.id) && (
                          <div className="rounded-b-xl border-t bg-gray-50">
                            {subject.mainTopics.map((mainTopic) => (
                              <div key={mainTopic.id}>
                                {/* Main Topic Header */}
                                <div
                                  className="flex cursor-pointer items-center justify-between p-3 pl-10 transition-colors hover:bg-gray-100"
                                  onClick={() => {
                                    toggleMainTopicExpansion(mainTopic.id);
                                    handleContentSelect(
                                      mainTopic.title,
                                      mainTopic.content,
                                      "mainTopic",
                                    );
                                  }}
                                >
                                  <div className="flex flex-1 items-center">
                                    <div className="mr-3 flex items-center">
                                      {expandedMainTopics.has(mainTopic.id) ? (
                                        <ChevronDown
                                          size={16}
                                          className="text-green-600"
                                        />
                                      ) : (
                                        <ChevronRight
                                          size={16}
                                          className="text-gray-500"
                                        />
                                      )}
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700">
                                        {mainTopic.title}
                                      </h5>
                                      <p className="mt-1 text-xs text-gray-500">
                                        {mainTopic.subTopics.length} subtopics
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Sub Topics */}
                                {expandedMainTopics.has(mainTopic.id) && (
                                  <div className="bg-gray-100">
                                    {mainTopic.subTopics.map((subTopic) => (
                                      <div
                                        key={subTopic.id}
                                        className="cursor-pointer border-l-3 border-purple-200 p-3 pl-16 transition-colors hover:border-purple-400 hover:bg-gray-200"
                                        onClick={() =>
                                          handleContentSelect(
                                            subTopic.title,
                                            subTopic.content,
                                            "subTopic",
                                          )
                                        }
                                      >
                                        <div className="flex items-center">
                                          <FileText
                                            size={14}
                                            className="mr-3 text-purple-600"
                                          />
                                          <span className="text-sm font-medium text-gray-700">
                                            {subTopic.title}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Content Area */}
              <div className="xl:col-span-3">
                <Card className="min-h-[70vh] shadow-lg">
                  {selectedContent ? (
                    <div className="p-6">
                      <div className="mb-8 border-b border-gray-200 pb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="text-3xl leading-tight font-bold text-gray-900">
                            {selectedContent.title}
                          </h2>
                          <Badge
                            color={
                              selectedContent.type === "subject"
                                ? "blue"
                                : selectedContent.type === "mainTopic"
                                  ? "green"
                                  : "purple"
                            }
                            size="lg"
                            className="w-fit"
                          >
                            {selectedContent.type === "subject"
                              ? "Subject"
                              : selectedContent.type === "mainTopic"
                                ? "Main Topic"
                                : "Sub Topic"}
                          </Badge>
                        </div>
                      </div>

                      <div className="prose prose-lg max-w-none">
                        <div
                          className="space-y-4 text-base leading-relaxed text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: selectedContent.content,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-6 rounded-full bg-blue-50 p-6">
                        <Play size={48} className="text-blue-600" />
                      </div>
                      <h3 className="mb-4 text-2xl font-semibold text-gray-700">
                        Select a Topic to Start Learning
                      </h3>
                      <p className="max-w-md text-lg text-gray-500">
                        Choose a subject, main topic, or subtopic from the left
                        sidebar to view its content and start your learning
                        journey.
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
