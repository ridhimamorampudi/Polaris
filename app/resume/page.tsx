'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Define types for resume sections
type Education = {
  id: string
  school: string
  location: string
  degree: string
  startDate: string
  endDate: string
}

type Experience = {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string[]
}

type Project = {
  id: string
  title: string
  technologies: string
  startDate: string
  endDate: string
  description: string[]
}

type Skills = {
  categories: {
    name: string;
    skills: string[];
  }[];
}

type AIPrompt = {
  isLoading: boolean;
  section: 'experience' | 'education' | 'projects' | 'skills' | 'summary';
  context: string;
}

type Resume = {
  name: string
  phone: string
  email: string
  linkedin: string
  github: string
  showProjects: boolean
  summary: string
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skills
}

export default function ResumePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Add Gemini API instance
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
  
  // Add state for AI interaction
  const [aiPrompt, setAiPrompt] = useState<AIPrompt>({
    isLoading: false,
    section: 'summary',
    context: ''
  })
  
  // Modify resume state to include showProjects and summary fields
  const [resume, setResume] = useState<Resume>({
    name: session?.user?.name || 'Your Name',
    phone: '123-456-7890',
    email: session?.user?.email || 'your.email@example.com',
    linkedin: 'linkedin.com/in/yourusername',
    github: 'github.com/yourusername',
    showProjects: true,
    summary: '',
    education: [
      {
        id: '1',
        school: 'University Name',
        location: 'City, State',
        degree: 'Bachelor of Science in Computer Science',
        startDate: 'Aug 2020',
        endDate: 'May 2024'
      }
    ],
    experience: [
      {
        id: '1',
        title: 'Software Engineering Intern',
        company: 'Tech Company',
        location: 'City, State',
        startDate: 'June 2023',
        endDate: 'August 2023',
        description: [
          "Developed new features for company's main product using React and TypeScript",
          'Collaborated with a team of 5 engineers in an agile environment',
          'Improved test coverage by implementing unit tests using Jest'
        ]
      }
    ],
    projects: [
      {
        id: '1',
        title: 'Personal Portfolio',
        technologies: 'React, Next.js, Tailwind CSS',
        startDate: 'Jan 2023',
        endDate: 'Present',
        description: [
          'Designed and developed a personal portfolio website to showcase projects',
          'Implemented responsive design principles for optimal viewing on all devices',
          'Utilized modern web technologies to create a fast, accessible experience'
        ]
      }
    ],
    skills: {
      categories: [
        {
          name: 'Languages',
          skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'HTML/CSS']
        },
        {
          name: 'Frameworks & Libraries',
          skills: ['React', 'Next.js', 'Node.js', 'Express', 'TailwindCSS']
        },
        {
          name: 'Tools',
          skills: ['Git', 'GitHub', 'VS Code', 'Docker', 'Figma']
        },
        {
          name: 'Other',
          skills: ['RESTful APIs', 'GraphQL', 'Agile/Scrum', 'UI/UX Design']
        }
      ]
    }
  })

  // Helper function to handle errors with proper typing
  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Could not download PDF';
    toast.error(`Error: ${errorMessage}`);
  };

  // Function to generate AI content
  const generateAIContent = async () => {
    if (!aiPrompt.context) {
      toast.error('Please provide context for the AI to generate content');
      return;
    }
    
    setAiPrompt(prev => ({ ...prev, isLoading: true }));
    
    try {
      let prompt = '';
      
      switch (aiPrompt.section) {
        case 'summary':
          prompt = `Write a professional resume summary for a ${aiPrompt.context}. Make it concise (2-3 sentences), impactful, and focused on key qualifications and career goals.`;
          break;
        case 'experience':
          prompt = `Write 3 professional bullet points for a resume describing job responsibilities and achievements for a ${aiPrompt.context} position. Make them action-oriented, quantifiable, and concise.`;
          break;
        case 'education':
          prompt = `Write a concise description of educational achievements and relevant coursework for a ${aiPrompt.context} degree. Include key skills gained.`;
          break;
        case 'projects':
          prompt = `Write 3 resume bullet points describing a ${aiPrompt.context} project. Focus on technologies used, your role, challenges overcome, and results achieved.`;
          break;
        case 'skills':
          prompt = `List key technical and soft skills for a ${aiPrompt.context} professional, organized by category.`;
          break;
      }
      
      console.log("Initializing Gemini with API key:", process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 5) + "...");
      
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error("Missing Gemini API key");
      }
      
      // Re-initialize on each call to ensure fresh instance
      const genAI = new GoogleGenerativeAI(API_KEY);
      console.log("Gemini initialized");
      
      // Use a try/catch specifically for the model creation and generation
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        console.log("Model created, generating content...");
        
        const result = await model.generateContent(prompt);
        console.log("Response received");
        
        const text = result.response.text();
        console.log("Got text from response:", text.substring(0, 50) + "...");
        
        // Process the AI response based on section
        if (aiPrompt.section === 'summary') {
          setResume(prev => ({ ...prev, summary: text }));
        } else if (aiPrompt.section === 'experience') {
          // Find the most recently added experience
          const expId = resume.experience[resume.experience.length - 1].id;
          const bullets = text.split('\n').filter(bullet => bullet.trim());
          
          setResume(prev => ({
            ...prev,
            experience: prev.experience.map(exp => 
              exp.id === expId ? { ...exp, description: bullets } : exp
            )
          }));
        } else if (aiPrompt.section === 'projects') {
          // Find the most recently added project
          const projId = resume.projects[resume.projects.length - 1].id;
          const bullets = text.split('\n').filter(bullet => bullet.trim());
          
          setResume(prev => ({
            ...prev,
            projects: prev.projects.map(proj => 
              proj.id === projId ? { ...proj, description: bullets } : proj
            )
          }));
        } else if (aiPrompt.section === 'skills') {
          // Parse skills from AI response
          const skillText = text.replace(/[*•-]/g, '');
          const lines = skillText.split('\n').filter(line => line.trim());
          
          // Initialize with empty array to fix type issue
          const categories: Array<{name: string, skills: string[]}> = [];
          
          let currentCategory: {name: string, skills: string[]} | null = null;
          
          for (const line of lines) {
            if (line.endsWith(':')) {
              // This is a category
              currentCategory = {
                name: line.replace(':', '').trim(),
                skills: []
              };
              categories.push(currentCategory);
            } else if (currentCategory && line.trim()) {
              // This is a skill
              currentCategory.skills = line.split(',').map(skill => skill.trim());
            }
          }
          
          if (categories.length > 0) {
            setResume(prev => ({
              ...prev,
              skills: { categories }
            }));
          }
        }
        
        // Close the modal
        const modalId = `ai${aiPrompt.section.charAt(0).toUpperCase() + aiPrompt.section.slice(1)}Modal`;
        document.getElementById(modalId)?.classList.add('hidden');
        
        toast.success('AI content generated successfully!');
      } catch (modelError: any) {
        console.error("Error with Gemini API:", modelError);
        toast.error(`API error: ${(modelError as Error).message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${(error as Error).message || 'Unknown error'}`);
    }
    
    setAiPrompt(prev => ({ ...prev, isLoading: false, context: '' }));
  };
  
  // Function to add skill category
  const addSkillCategory = () => {
    setResume(prev => ({
      ...prev,
      skills: {
        categories: [
          ...prev.skills.categories,
          {
            name: 'New Category',
            skills: []
          }
        ]
      }
    }))
  }
  
  // Function to update skill category
  const updateSkillCategory = (index: number, name: string) => {
    setResume(prev => ({
      ...prev,
      skills: {
        categories: prev.skills.categories.map((cat, i) => 
          i === index ? { ...cat, name } : cat
        )
      }
    }))
  }
  
  // Function to remove skill category
  const removeSkillCategory = (index: number) => {
    setResume(prev => ({
      ...prev,
      skills: {
        categories: prev.skills.categories.filter((_, i) => i !== index)
      }
    }))
  }
  
  // Function to update skills in a category
  const updateCategorySkills = (categoryIndex: number, skillsString: string) => {
    setResume(prev => ({
      ...prev,
      skills: {
        categories: prev.skills.categories.map((cat, i) => 
          i === categoryIndex 
            ? { ...cat, skills: skillsString.split(',').map(s => s.trim()).filter(Boolean) } 
            : cat
        )
      }
    }))
  }
  
  // Toggle projects section
  const toggleProjectsSection = () => {
    setResume(prev => ({
      ...prev,
      showProjects: !prev.showProjects
    }))
  }

  // Function to add new education entry
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      location: '',
      degree: '',
      startDate: '',
      endDate: ''
    }
    setResume({...resume, education: [...resume.education, newEducation]})
  }

  // Function to update education entry
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResume({
      ...resume,
      education: resume.education.map(edu => 
        edu.id === id ? {...edu, [field]: value} : edu
      )
    })
  }

  // Function to remove education entry
  const removeEducation = (id: string) => {
    setResume({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id)
    })
  }

  // Function to add new experience entry
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ['']
    }
    setResume({...resume, experience: [...resume.experience, newExperience]})
  }

  // Function to update experience entry
  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResume({
      ...resume,
      experience: resume.experience.map(exp => 
        exp.id === id ? {...exp, [field]: value} : exp
      )
    })
  }

  // Function to add bullet point to experience
  const addExperienceBullet = (id: string) => {
    setResume({
      ...resume,
      experience: resume.experience.map(exp => 
        exp.id === id ? {...exp, description: [...exp.description, '']} : exp
      )
    })
  }

  // Function to update experience bullet
  const updateExperienceBullet = (expId: string, index: number, value: string) => {
    setResume({
      ...resume,
      experience: resume.experience.map(exp => 
        exp.id === expId ? {
          ...exp, 
          description: exp.description.map((desc, i) => i === index ? value : desc)
        } : exp
      )
    })
  }

  // Function to remove experience bullet
  const removeExperienceBullet = (expId: string, index: number) => {
    setResume({
      ...resume,
      experience: resume.experience.map(exp => 
        exp.id === expId ? {
          ...exp, 
          description: exp.description.filter((_, i) => i !== index)
        } : exp
      )
    })
  }

  // Function to remove experience entry
  const removeExperience = (id: string) => {
    setResume({
      ...resume,
      experience: resume.experience.filter(exp => exp.id !== id)
    })
  }

  // Function to add new project entry
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      technologies: '',
      startDate: '',
      endDate: '',
      description: ['']
    }
    setResume({...resume, projects: [...resume.projects, newProject]})
  }

  // Function to update project entry
  const updateProject = (id: string, field: keyof Project, value: any) => {
    setResume({
      ...resume,
      projects: resume.projects.map(proj => 
        proj.id === id ? {...proj, [field]: value} : proj
      )
    })
  }

  // Function to add bullet point to project
  const addProjectBullet = (id: string) => {
    setResume({
      ...resume,
      projects: resume.projects.map(proj => 
        proj.id === id ? {...proj, description: [...proj.description, '']} : proj
      )
    })
  }

  // Function to update project bullet
  const updateProjectBullet = (projId: string, index: number, value: string) => {
    setResume({
      ...resume,
      projects: resume.projects.map(proj => 
        proj.id === projId ? {
          ...proj, 
          description: proj.description.map((desc, i) => i === index ? value : desc)
        } : proj
      )
    })
  }

  // Function to remove project bullet
  const removeProjectBullet = (projId: string, index: number) => {
    setResume({
      ...resume,
      projects: resume.projects.map(proj => 
        proj.id === projId ? {
          ...proj, 
          description: proj.description.filter((_, i) => i !== index)
        } : proj
      )
    })
  }

  // Function to remove project entry
  const removeProject = (id: string) => {
    setResume({
      ...resume,
      projects: resume.projects.filter(proj => proj.id !== id)
    })
  }

  // Function to update skills
  const updateSkills = (category: string, value: string) => {
    // This function is now deprecated but kept for compatibility
    // The more specific updateCategorySkills should be used instead
    const categoryIndex = resume.skills.categories.findIndex(c => c.name.toLowerCase() === category.toLowerCase());
    
    if (categoryIndex >= 0) {
      updateCategorySkills(categoryIndex, value);
    }
  }

  // Function to update basic info
  const updateBasicInfo = (field: keyof Resume, value: string) => {
    setResume({
      ...resume,
      [field]: value
    });
  }

  // New function to handle LaTeX PDF download
  const handleLatexDownload = async () => {
    setIsDownloading(true);
    toast.loading('Generating PDF...');
    
    try {
      // Previous server-side approach with fallback mechanism
      if (typeof window === 'undefined') {
        throw new Error('PDF generation requires a browser environment');
      }
      
      // Dynamically import jsPDF only when needed (client-side only)
      const jsPDFModule = await import('jspdf');
      await import('jspdf-autotable');
      
      // Create a new PDF document
      const doc = new jsPDFModule.default({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font size and styles
      doc.setFontSize(18);
      
      // Add name at the top
      doc.text(resume.name, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Add contact info
      doc.setFontSize(10);
      const contactInfo = `${resume.phone} | ${resume.email} | ${resume.linkedin} | ${resume.github}`;
      doc.text(contactInfo, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
      
      let yPos = 40;
      
      // Add summary if it exists
      if (resume.summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text('PROFESSIONAL SUMMARY', 14, yPos);
        yPos += 6;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        
        // Split long summary into multiple lines
        const summaryLines = doc.splitTextToSize(resume.summary, doc.internal.pageSize.getWidth() - 28);
        doc.text(summaryLines, 14, yPos);
        yPos += summaryLines.length * 5 + 10;
      }
      
      // Add education section
      doc.setFontSize(12);
      doc.setFont("helvetica", 'bold');
      doc.text('EDUCATION', 14, yPos);
      yPos += 6;
      
      resume.education.forEach(edu => {
        doc.setFontSize(10);
        doc.setFont("helvetica", 'bold');
        doc.text(edu.school, 14, yPos);
        doc.setFont("helvetica", 'normal');
        doc.text(`${edu.startDate} - ${edu.endDate}`, doc.internal.pageSize.getWidth() - 14, yPos, { align: 'right' });
        yPos += 5;
        
        doc.setFont("helvetica", 'italic');
        doc.text(edu.degree, 14, yPos);
        doc.setFont("helvetica", 'normal');
        doc.text(edu.location, doc.internal.pageSize.getWidth() - 14, yPos, { align: 'right' });
        yPos += 8;
      });
      
      // Add experience section
      doc.setFontSize(12);
      doc.setFont("helvetica", 'bold');
      doc.text('EXPERIENCE', 14, yPos);
      yPos += 6;
      
      resume.experience.forEach(exp => {
        doc.setFontSize(10);
        doc.setFont("helvetica", 'bold');
        doc.text(exp.title, 14, yPos);
        doc.setFont("helvetica", 'normal');
        doc.text(`${exp.startDate} - ${exp.endDate}`, doc.internal.pageSize.getWidth() - 14, yPos, { align: 'right' });
        yPos += 5;
        
        doc.setFont("helvetica", 'italic');
        doc.text(exp.company, 14, yPos);
        doc.setFont("helvetica", 'normal');
        doc.text(exp.location, doc.internal.pageSize.getWidth() - 14, yPos, { align: 'right' });
        yPos += 5;
        
        // Add bullet points for experience
        exp.description.forEach(bullet => {
          const bulletLines = doc.splitTextToSize(`• ${bullet}`, doc.internal.pageSize.getWidth() - 34);
          doc.text(bulletLines, 18, yPos);
          yPos += bulletLines.length * 5 + 2;
        });
        
        yPos += 5;
      });
      
      // Add projects section if enabled
      if (resume.showProjects && resume.projects.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text('PROJECTS', 14, yPos);
        yPos += 6;
        
        resume.projects.forEach(proj => {
          doc.setFontSize(10);
          doc.setFont("helvetica", 'bold');
          doc.text(proj.title, 14, yPos);
          doc.setFont("helvetica", 'normal');
          doc.text(`${proj.startDate} - ${proj.endDate}`, doc.internal.pageSize.getWidth() - 14, yPos, { align: 'right' });
          yPos += 5;
          
          doc.setFont("helvetica", 'italic');
          doc.text(proj.technologies, 14, yPos);
          yPos += 5;
          
          // Add bullet points for projects
          proj.description.forEach(bullet => {
            const bulletLines = doc.splitTextToSize(`• ${bullet}`, doc.internal.pageSize.getWidth() - 34);
            doc.text(bulletLines, 18, yPos);
            yPos += bulletLines.length * 5 + 2;
          });
          
          yPos += 5;
        });
      }
      
      // Add skills section
      doc.setFontSize(12);
      doc.setFont("helvetica", 'bold');
      doc.text('TECHNICAL SKILLS', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(10);
      resume.skills.categories.forEach(category => {
        doc.setFont("helvetica", 'bold');
        const skillText = `${category.name}: `;
        const skillWidth = doc.getTextWidth(skillText);
        doc.text(skillText, 14, yPos);
        
        doc.setFont("helvetica", 'normal');
        const skills = category.skills.join(', ');
        const skillLines = doc.splitTextToSize(skills, doc.internal.pageSize.getWidth() - 28 - skillWidth);
        doc.text(skillLines, 14 + skillWidth, yPos);
        yPos += skillLines.length * 5 + 5;
      });
      
      // Save the PDF
      const filename = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`;
      doc.save(filename);
      
      toast.dismiss(); // Dismiss loading toast
      toast.success('Resume PDF downloaded!');
      
    } catch (fallbackError) {
      toast.dismiss(); // Dismiss loading toast
      console.error('Download Error:', fallbackError);
      
      // If client-side fails, try the server-side as backup
      try {
        const response = await fetch('/api/resume/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resume),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); 
          console.error("API Error Response:", errorData);
          throw new Error(errorData.details || `Failed to generate PDF: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Resume PDF downloaded!');
      } catch (serverError) {
        handleError(serverError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">Resume Builder</h1>
            <p className="mt-2 text-text-secondary">
              Create a professional resume in minutes
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'edit' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'preview' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary hover:text-text-primary'}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>

          {/* Edit Mode */}
          {activeTab === 'edit' && (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resume.name}
                      onChange={(e) => updateBasicInfo('name', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={resume.phone}
                      onChange={(e) => updateBasicInfo('phone', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={resume.email}
                      onChange={(e) => updateBasicInfo('email', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={resume.linkedin}
                      onChange={(e) => updateBasicInfo('linkedin', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      GitHub
                    </label>
                    <input
                      type="text"
                      value={resume.github}
                      onChange={(e) => updateBasicInfo('github', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary - New section */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Professional Summary</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setAiPrompt({
                          isLoading: false,
                          section: 'summary',
                          context: ''
                        });
                        document.getElementById('aiSummaryModal')?.classList.remove('hidden');
                      }}
                      className="btn-secondary text-sm px-3 py-1 flex items-center"
                      type="button"
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                        <path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="currentColor"/>
                        <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 9.55 13.55 10 13 10H12V13H14V12C15.1 12 16 11.1 16 10C16 8.34 14.66 7 13 7C13 7 12.5 7 12 7Z" fill="currentColor"/>
                      </svg>
                      AI Assist
                    </button>
                  </div>
                </div>
                <textarea
                  value={resume.summary}
                  onChange={(e) => updateBasicInfo('summary', e.target.value)}
                  className="input-field w-full resize-none"
                  rows={4}
                  placeholder="Briefly summarize your professional background, key skills, and career goals..."
                />
              </div>

              {/* Education */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Education</h2>
                  <button 
                    onClick={addEducation}
                    className="btn-primary-outline text-sm px-3 py-1"
                  >
                    Add Education
                  </button>
                </div>
                
                {resume.education.map((edu) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Education Entry</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setAiPrompt({
                              isLoading: false,
                              section: 'education',
                              context: edu.degree
                            });
                            document.getElementById('aiEducationModal')?.classList.remove('hidden');
                          }}
                          className="text-primary text-sm hover:text-primary-dark flex items-center"
                          type="button"
                        >
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                            <path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="currentColor"/>
                            <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 9.55 13.55 10 13 10H12V13H14V12C15.1 12 16 11.1 16 10C16 8.34 14.66 7 13 7C13 7 12.5 7 12 7Z" fill="currentColor"/>
                          </svg>
                          AI
                        </button>
                        <button 
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          School
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., Aug 2020"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., May 2024 or Present"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Experience</h2>
                  <button 
                    onClick={addExperience}
                    className="btn-primary-outline text-sm px-3 py-1"
                  >
                    Add Experience
                  </button>
                </div>
                
                {resume.experience.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Experience Entry</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setAiPrompt({
                              isLoading: false,
                              section: 'experience',
                              context: `${exp.title} at ${exp.company}`
                            });
                            document.getElementById('aiExperienceModal')?.classList.remove('hidden');
                          }}
                          className="text-primary text-sm hover:text-primary-dark flex items-center"
                          type="button"
                        >
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                            <path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="currentColor"/>
                            <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 9.55 13.55 10 13 10H12V13H14V12C15.1 12 16 11.1 16 10C16 8.34 14.66 7 13 7C13 7 12.5 7 12 7Z" fill="currentColor"/>
                          </svg>
                          AI Bullet Points
                        </button>
                        <button 
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., June 2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., August 2023 or Present"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text-secondary">
                          Description
                        </label>
                        <button 
                          onClick={() => addExperienceBullet(exp.id)}
                          className="text-primary text-sm hover:text-primary-dark"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      
                      {exp.description.map((bullet, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <span className="text-text-secondary">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateExperienceBullet(exp.id, index, e.target.value)}
                            className="input-field flex-1"
                          />
                          <button 
                            onClick={() => removeExperienceBullet(exp.id, index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={exp.description.length <= 1}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects - Now with toggle */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold">Projects</h2>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="toggle-projects" 
                        className="sr-only"
                        checked={resume.showProjects}
                        onChange={toggleProjectsSection}
                      />
                      <label 
                        htmlFor="toggle-projects" 
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in
                          ${resume.showProjects ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <span 
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in
                            ${resume.showProjects ? 'translate-x-6' : 'translate-x-0'}`} 
                        />
                      </label>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {resume.showProjects ? 'Section enabled' : 'Section disabled'}
                    </span>
                  </div>
                  {resume.showProjects && (
                    <button 
                      onClick={addProject}
                      className="btn-primary-outline text-sm px-3 py-1"
                    >
                      Add Project
                    </button>
                  )}
                </div>
                
                {resume.showProjects && resume.projects.map((proj) => (
                  <div key={proj.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Project Entry</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setAiPrompt({
                              isLoading: false,
                              section: 'projects',
                              context: `${proj.title} using ${proj.technologies}`
                            });
                            document.getElementById('aiProjectModal')?.classList.remove('hidden');
                          }}
                          className="text-primary text-sm hover:text-primary-dark flex items-center"
                          type="button"
                        >
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                            <path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="currentColor"/>
                            <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 9.55 13.55 10 13 10H12V13H14V12C15.1 12 16 11.1 16 10C16 8.34 14.66 7 13 7C13 7 12.5 7 12 7Z" fill="currentColor"/>
                          </svg>
                          AI Bullet Points
                        </button>
                        <button 
                          onClick={() => removeProject(proj.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Technologies
                        </label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                          className="input-field w-full"
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={proj.startDate}
                            onChange={(e) => updateProject(proj.id, 'startDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., Jan 2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            value={proj.endDate}
                            onChange={(e) => updateProject(proj.id, 'endDate', e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g., March 2023 or Present"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text-secondary">
                          Description
                        </label>
                        <button 
                          onClick={() => addProjectBullet(proj.id)}
                          className="text-primary text-sm hover:text-primary-dark"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      
                      {proj.description.map((bullet, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <span className="text-text-secondary">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateProjectBullet(proj.id, index, e.target.value)}
                            className="input-field flex-1"
                          />
                          <button 
                            onClick={() => removeProjectBullet(proj.id, index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={proj.description.length <= 1}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills - Now customizable */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Skills</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setAiPrompt({
                          isLoading: false,
                          section: 'skills',
                          context: ''
                        });
                        document.getElementById('aiSkillsModal')?.classList.remove('hidden');
                      }}
                      className="btn-secondary text-sm px-3 py-1 flex items-center"
                      type="button"
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                        <path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="currentColor"/>
                        <path d="M12 7C10.9 7 10 7.9 10 9H12C12 8.45 12.45 8 13 8C13.55 8 14 8.45 14 9C14 9.55 13.55 10 13 10H12V13H14V12C15.1 12 16 11.1 16 10C16 8.34 14.66 7 13 7C13 7 12.5 7 12 7Z" fill="currentColor"/>
                      </svg>
                      AI Generate Skills
                    </button>
                    <button 
                      onClick={addSkillCategory}
                      className="btn-primary-outline text-sm px-3 py-1"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
                
                {resume.skills.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex-1 mr-2">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateSkillCategory(categoryIndex, e.target.value)}
                          className="input-field w-full font-medium"
                          placeholder="Category Name"
                        />
                      </div>
                      <button 
                        onClick={() => removeSkillCategory(categoryIndex)}
                        className="text-red-500 hover:text-red-700"
                        disabled={resume.skills.categories.length <= 1}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Skills (comma separated)
                      </label>
                      <input
                        type="text"
                        value={category.skills.join(', ')}
                        onChange={(e) => updateCategorySkills(categoryIndex, e.target.value)}
                        className="input-field w-full"
                        placeholder="e.g., JavaScript, Python, React"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {activeTab === 'preview' && (
            <div className="bg-white rounded-lg shadow-lg p-8 mx-auto max-w-3xl">
              <div className="preview-container" ref={resumeRef}>
                {/* Resume Preview - styled similar to the example */}
                <div className="mx-auto" style={{ maxWidth: '8.5in', minHeight: '11in', padding: '0.5in' }}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold">{resume.name}</h1>
                    <div className="flex justify-center text-sm space-x-2 mt-2">
                      <span>{resume.phone}</span>
                      <span>|</span>
                      <span>{resume.email}</span>
                      <span>|</span>
                      <span>{resume.linkedin}</span>
                      <span>|</span>
                      <span>{resume.github}</span>
                    </div>
                  </div>

                  {/* Summary Section - New */}
                  {resume.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-3">
                        Professional Summary
                      </h2>
                      <p className="text-sm">{resume.summary}</p>
                    </div>
                  )}

                  {/* Education Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-3">
                      Education
                    </h2>
                    {resume.education.map((edu) => (
                      <div key={edu.id} className="mb-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">{edu.school}</span>
                          <span>{edu.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="italic">{edu.degree}</span>
                          <span>{edu.startDate} – {edu.endDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-3">
                      Experience
                    </h2>
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="flex justify-between">
                          <span className="font-semibold">{exp.title}</span>
                          <span>{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="italic">{exp.company}</span>
                          <span>{exp.location}</span>
                        </div>
                        <ul className="list-disc ml-5 mt-1 text-sm">
                          {exp.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Projects Section - Only if enabled */}
                  {resume.showProjects && resume.projects.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-3">
                        Projects
                      </h2>
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className="mb-4">
                          <div className="flex justify-between">
                            <span className="font-semibold">{proj.title}</span>
                            <span>{proj.startDate} – {proj.endDate}</span>
                          </div>
                          <div className="text-sm italic mb-1">
                            {proj.technologies}
                          </div>
                          <ul className="list-disc ml-5 mt-1 text-sm">
                            {proj.description.map((desc, index) => (
                              <li key={index}>{desc}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Section - Dynamic categories */}
                  <div>
                    <h2 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-3">
                      Technical Skills
                    </h2>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {resume.skills.categories.map((category, index) => (
                        <div key={index}>
                          <span className="font-semibold">{category.name}:</span>{' '}
                          {category.skills.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleLatexDownload}
                  className="btn-primary"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Download as PDF'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* AI Assistant Modals */}
      {/* Summary AI Modal */}
      <div id="aiSummaryModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">AI Resume Summary Generator</h3>
          <p className="text-sm text-text-secondary mb-4">
            Describe your background and I'll create a professional summary.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              What kind of professional are you? (e.g., "Software Engineer with 3 years experience in React")
            </label>
            <textarea
              value={aiPrompt.context}
              onChange={(e) => setAiPrompt(prev => ({ ...prev, context: e.target.value }))}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="Describe your background, experience level, and key skills..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => document.getElementById('aiSummaryModal')?.classList.add('hidden')}
              className="btn-secondary"
              disabled={aiPrompt.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={generateAIContent}
              className="btn-primary"
              disabled={aiPrompt.isLoading || !aiPrompt.context}
            >
              {aiPrompt.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Summary'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Experience AI Modal */}
      <div id="aiExperienceModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">AI Experience Bullet Points Generator</h3>
          <p className="text-sm text-text-secondary mb-4">
            I'll help you generate professional bullet points for your experience.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tell me more about this role and your achievements:
            </label>
            <textarea
              value={aiPrompt.context}
              onChange={(e) => setAiPrompt(prev => ({ ...prev, context: e.target.value }))}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="e.g., Developed web applications, improved performance by 30%, managed a team of 3 developers..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => document.getElementById('aiExperienceModal')?.classList.add('hidden')}
              className="btn-secondary"
              disabled={aiPrompt.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={generateAIContent}
              className="btn-primary"
              disabled={aiPrompt.isLoading || !aiPrompt.context}
            >
              {aiPrompt.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Bullet Points'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Education AI Modal */}
      <div id="aiEducationModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">AI Education Description Generator</h3>
          <p className="text-sm text-text-secondary mb-4">
            I'll help you create a compelling education section.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tell me about your educational background:
            </label>
            <textarea
              value={aiPrompt.context}
              onChange={(e) => setAiPrompt(prev => ({ ...prev, context: e.target.value }))}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="e.g., Computer Science degree with specialization in AI, relevant coursework, academic achievements..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => document.getElementById('aiEducationModal')?.classList.add('hidden')}
              className="btn-secondary"
              disabled={aiPrompt.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={generateAIContent}
              className="btn-primary"
              disabled={aiPrompt.isLoading || !aiPrompt.context}
            >
              {aiPrompt.isLoading ? 'Generating...' : 'Generate Description'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Project AI Modal */}
      <div id="aiProjectModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">AI Project Description Generator</h3>
          <p className="text-sm text-text-secondary mb-4">
            I'll help you create impressive project descriptions.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tell me more about this project:
            </label>
            <textarea
              value={aiPrompt.context}
              onChange={(e) => setAiPrompt(prev => ({ ...prev, context: e.target.value }))}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="e.g., Built a React e-commerce site with user authentication, payment processing, and product management..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => document.getElementById('aiProjectModal')?.classList.add('hidden')}
              className="btn-secondary"
              disabled={aiPrompt.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={generateAIContent}
              className="btn-primary"
              disabled={aiPrompt.isLoading || !aiPrompt.context}
            >
              {aiPrompt.isLoading ? 'Generating...' : 'Generate Bullet Points'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Skills AI Modal */}
      <div id="aiSkillsModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">AI Skills Generator</h3>
          <p className="text-sm text-text-secondary mb-4">
            I'll help you identify relevant skills for your field.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              What type of role or industry are you targeting?
            </label>
            <textarea
              value={aiPrompt.context}
              onChange={(e) => setAiPrompt(prev => ({ ...prev, context: e.target.value }))}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="e.g., Full-stack web developer, Data scientist, UI/UX designer..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => document.getElementById('aiSkillsModal')?.classList.add('hidden')}
              className="btn-secondary"
              disabled={aiPrompt.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={generateAIContent}
              className="btn-primary"
              disabled={aiPrompt.isLoading || !aiPrompt.context}
            >
              {aiPrompt.isLoading ? 'Generating...' : 'Generate Skills'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 