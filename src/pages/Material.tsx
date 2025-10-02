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
                          className="space-y-4 text-base leading-relaxed text-gray-700 
                            [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:bg-white [&_table]:shadow-sm [&_table]:my-4 [&_table]:min-w-[600px]
                            [&_table]:overflow-x-auto [&_table]:block [&_table]:whitespace-nowrap sm:[&_table]:table sm:[&_table]:whitespace-normal
                            [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:text-xs sm:[&_th]:text-sm [&_th]:min-w-[100px]
                            [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:text-xs sm:[&_td]:text-sm [&_td]:min-w-[100px]
                            [&_tr]:block sm:[&_tr]:table-row
                            [&_thead]:block sm:[&_thead]:table-header-group
                            [&_tbody]:block sm:[&_tbody]:table-row-group
                            [&_tr:nth-child(even)]:bg-gray-50 [&_tr:hover]:bg-gray-100
                            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-4
                            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:my-4
                            [&_li]:text-gray-700 [&_li]:leading-relaxed [&_li]:text-sm sm:[&_li]:text-base
                            [&_ul_ul]:list-[circle] [&_ol_ol]:list-[lower-alpha]
                            [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-6
                            [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 [&_h2]:mt-5
                            [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-3 [&_h3]:mt-4
                            [&_h4]:text-base sm:[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-700 [&_h4]:mb-2 [&_h4]:mt-4
                            [&_h5]:text-sm sm:[&_h5]:text-base [&_h5]:font-semibold [&_h5]:text-gray-700 [&_h5]:mb-2 [&_h5]:mt-3
                            [&_h6]:text-xs sm:[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:text-gray-600 [&_h6]:mb-2 [&_h6]:mt-3
                            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-700 [&_p]:text-sm sm:[&_p]:text-base
                            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                            [&_strong]:font-semibold [&_strong]:text-gray-900
                            [&_em]:italic [&_em]:text-gray-700
                            [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-xs sm:[&_code]:text-sm [&_code]:font-mono [&_code]:text-gray-800
                            [&_pre]:bg-gray-100 [&_pre]:p-3 sm:[&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-xs sm:[&_pre]:text-sm
                            [&_img]:max-w-full [&_img]:w-auto [&_img]:h-auto [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:rounded-lg [&_img]:shadow-lg [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:border [&_img]:border-gray-200 [&_img]:transition-transform [&_img]:hover:scale-105
                            [&_figure]:text-center [&_figure]:my-6 [&_figure]:p-4 [&_figure]:bg-gray-50 [&_figure]:rounded-lg [&_figure]:border [&_figure]:border-gray-200
                            [&_figcaption]:text-sm [&_figcaption]:text-gray-600 [&_figcaption]:mt-3 [&_figcaption]:italic [&_figcaption]:font-medium
                            [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
                          style={{
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch'
                          }}
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
