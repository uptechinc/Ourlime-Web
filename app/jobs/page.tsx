'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { db } from '@/lib/firebaseConfig';
import {
    Search,
    Clock, Sliders, Code, Palette, LineChart, Star,
    Building2, BookOpen, Wrench, Landmark, ShoppingBag, Utensils, Stethoscope, LucideIcon, Briefcase, Menu
} from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { getDoc, collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { doc as firestoreDoc } from 'firebase/firestore';
import { ProfessionalJobsList } from '@/components/jobs/ProfessionalJobsList';
import { QuickTasksList } from '@/components/jobs/QuickTasksList';
import { FreelanceProjectsList } from '@/components/jobs/FreelanceProjectsList';
import JobCreationModal from '@/components/jobs/createJobsModel/jobCreationModal';
import { ProfessionalJob, QuickTask, FreelanceProject } from '@/types/jobTypes';

export type JobTypeItem = {
    id: 'professional' | 'quicktasks' | 'freelance';
    label: string;
    icon: LucideIcon;
}

export default function JobsPage() {
    const [activeJobType, setActiveJobType] = useState<JobTypeItem['id']>('professional');
    const [professionalJobs, setProfessionalJobs] = useState<ProfessionalJob[]>([]);
    const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
    const [freelanceProjects, setFreelanceProjects] = useState<FreelanceProject[]>([]);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);

    
    const jobTypes: Array<{ id: 'professional' | 'quicktasks' | 'freelance', label: string, icon: LucideIcon }> = [
        { id: 'professional', label: 'Professional Jobs', icon: Briefcase },
        { id: 'quicktasks', label: 'Quick Tasks', icon: Clock },
        { id: 'freelance', label: 'Freelance', icon: Code }
    ];

    // First, add the job categories array at the top level of your component
    const jobCategories = [
        { icon: Code, name: 'Development', count: 420 },
        { icon: Palette, name: 'Design', count: 233 },
        { icon: LineChart, name: 'Marketing', count: 156 },
        { icon: Building2, name: 'Business', count: 89 },
        { icon: BookOpen, name: 'Teaching', count: 167 },
        { icon: Wrench, name: 'Plumbing', count: 92 },
        { icon: Landmark, name: 'Banking', count: 145 },
        { icon: ShoppingBag, name: 'Retail', count: 234 },
        { icon: Utensils, name: 'Food Service', count: 189 },
        { icon: Stethoscope, name: 'Healthcare', count: 278 }
    ];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const [jobTypesSnapshot, jobsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'jobs')),
                    getDocs(query(
                        collection(db, 'jobsVariant'),
                        orderBy('createdAt', 'desc')
                    ))
                ]);

                const jobTypesMap = new Map(
                    jobTypesSnapshot.docs.map(doc => [doc.id, doc.data().jobCategory])
                );

                const professionalJobs: ProfessionalJob[] = [];
                const quickTasks: QuickTask[] = [];
                const freelanceProjects: FreelanceProject[] = [];

                await Promise.all(jobsSnapshot.docs.map(async (doc) => {
                    const baseData = doc.data();
                    const jobCategory = jobTypesMap.get(baseData.jobId);

                    if (!jobCategory || !baseData.jobId) return;

                    const [
                        userDoc,
                        profileSetAsSnapshot,
                        requirementsSnapshot,
                        skillsSnapshot,
                        qualificationsSnapshot,
                        questionsSnapshot
                    ] = await Promise.all([
                        getDoc(firestoreDoc(db, 'users', baseData.userId)),
                        getDocs(query(
                            collection(db, 'profileImageSetAs'),
                            where('userId', '==', baseData.userId),
                            where('setAs', '==', 'jobProfile')
                        )),
                        getDocs(query(collection(db, 'jobRequirements'), where('jobProfessionalId', '==', doc.id))),
                        getDocs(query(collection(db, 'jobSkills'), where('jobProfessionalId', '==', doc.id))),
                        getDocs(query(collection(db, 'jobQualifications'), where('jobProfessionalId', '==', doc.id))),
                        getDocs(query(collection(db, 'jobQuestions'), where('jobProfessionalId', '==', doc.id)))
                    ]);

                    const userData = userDoc.data();
                    const creatorName = userData ? `${userData.firstName} ${userData.lastName}` : '';

                    let profileImageUrl = null;
                    if (profileSetAsSnapshot.empty) {
                        const regularProfileSnapshot = await getDocs(query(
                            collection(db, 'profileImageSetAs'),
                            where('userId', '==', baseData.userId),
                            where('setAs', '==', 'profile')
                        ));

                        if (!regularProfileSnapshot.empty) {
                            const imageId = regularProfileSnapshot.docs[0].data().profileImageId;
                            const imageDoc = await getDoc(firestoreDoc(db, 'profileImages', imageId));
                            profileImageUrl = imageDoc.data()?.imageURL;
                        }
                    } else {
                        const imageId = profileSetAsSnapshot.docs[0].data().profileImageId;
                        const imageDoc = await getDoc(firestoreDoc(db, 'profileImages', imageId));
                        profileImageUrl = imageDoc.data()?.imageURL;
                    }

                    const questions = await Promise.all(
                        questionsSnapshot.docs.map(async (questionDoc) => {
                            const optionsSnapshot = await getDocs(
                                query(collection(db, 'jobAnswerOptions'),
                                    where('jobProfessionalQuestionsId', '==', questionDoc.id))
                            );
                            return {
                                id: questionDoc.id,
                                question: questionDoc.data().question,
                                answerType: questionDoc.data().answerType as 'text' | 'multiple' | 'single',
                                answerOptions: optionsSnapshot.docs.map(opt => opt.data().optionText)
                            };
                        })
                    );

                    const commonData = {
                        id: doc.id,
                        jobTitle: baseData.jobTitle,
                        jobDescription: baseData.jobDescription,
                        userId: baseData.userId,
                        jobId: baseData.jobId,
                        createdAt: baseData.createdAt,
                        userName: creatorName,
                        userImage: profileImageUrl,
                        requirements: {
                            id: requirementsSnapshot.docs[0]?.id || '',
                            description: requirementsSnapshot.docs[0]?.data()?.description || []
                        },
                        skills: {
                            id: skillsSnapshot.docs[0]?.id || '',
                            skillsNeeded: skillsSnapshot.docs[0]?.data()?.skillsNeeded || []
                        }
                    };

                    switch (jobCategory) {
                        case 'professional':
                            professionalJobs.push({
                                ...commonData,
                                company: {
                                    name: baseData.company?.name || '',
                                    logo: baseData.company?.logo || ''
                                },
                                location: baseData.location || '',
                                priceRange: baseData.priceRange || { from: '', to: '' },
                                type: baseData.type || 'Full-time',
                                qualifications: {
                                    id: qualificationsSnapshot.docs[0]?.id || '',
                                    qualificationsNeeded: qualificationsSnapshot.docs[0]?.data()?.qualificationsNeeded || []
                                },
                                questions
                            } as ProfessionalJob);
                            break;

                        case 'quicktasks':
                            quickTasks.push({
                                ...commonData,
                                budget: baseData.budget || '',
                                duration: baseData.duration || '',
                                location: baseData.location || '',
                                priceRange: baseData.priceRange || { from: '', to: '' },
                                taskProvider: {
                                    name: creatorName,
                                    avatar: profileImageUrl,
                                    rating: 0,
                                    tasksCompleted: 0
                                }
                            } as QuickTask);
                            break;

                        case 'freelance':
                            freelanceProjects.push({
                                ...commonData,
                                budget: baseData.budget || { range: '', type: 'Fixed' },
                                duration: baseData.duration || '',
                                priceRange: baseData.priceRange || { from: '', to: '' },
                                clientInfo: {
                                    name: creatorName,
                                    avatar: profileImageUrl,
                                    rating: 0,
                                    projectsPosted: 0,
                                    successRate: 0
                                },
                                proposalCount: baseData.proposalCount || 0,
                                deadline: baseData.deadline || '',
                                qualifications: {
                                    id: qualificationsSnapshot.docs[0]?.id || '',
                                    qualificationsNeeded: qualificationsSnapshot.docs[0]?.data()?.qualificationsNeeded || []
                                }
                            } as FreelanceProject);
                            break;
                    }
                }));

                setProfessionalJobs(professionalJobs);
                setQuickTasks(quickTasks);
                setFreelanceProjects(freelanceProjects);

            } catch (error) {
                console.error('Error fetching jobs:', error);
            }
        };

        fetchJobs();
    }, []);

    // Render Function
    const renderJobContent = () => {
        switch (activeJobType) {
            case 'professional':
                return <ProfessionalJobsList jobs={professionalJobs} />;
            case 'quicktasks':
                return <QuickTasksList tasks={quickTasks} />;
            case 'freelance':
                return <FreelanceProjectsList projects={freelanceProjects} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <main className="container mx-auto px-4 pt-36">
                {/* Hero Section */}
                <div className="mb-8 lg:mb-12 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Find Your Next Career Opportunity
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600">
                        Discover <span className="text-greenTheme font-semibold">2,148</span> job opportunities waiting for you
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="relative mb-8 lg:mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-8">
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Job title, keywords, or company"
                                    className="w-full h-12 lg:h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-greenTheme/20"
                                />
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                            </div>
                            <Button className="h-12 lg:h-14 px-8 bg-greenTheme text-white rounded-xl text-base lg:text-lg font-semibold hover:bg-greenTheme/90">
                                Search Jobs
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {['Remote', 'Full-time', 'Tech', 'Marketing', 'Design'].map((filter) => (
                                    <button
                                        key={filter}
                                        className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-greenTheme hover:text-greenTheme transition-colors text-sm"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                            <button className="flex items-center gap-2 text-greenTheme hover:text-greenTheme/80 ml-auto">
                                <Sliders size={20} />
                                <span className="text-sm">Advanced Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Job Categories */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Popular Categories</h2>
                        <Button className="text-greenTheme bg-transparent hover:bg-greenTheme/10 text-sm">
                            View All Categories
                        </Button>
                    </div>

                    <Swiper
                        slidesPerView={1}
                        spaceBetween={16}
                        pagination={{
                            clickable: true,
                            bulletClass: 'swiper-pagination-bullet !bg-gray-300 !opacity-100',
                            bulletActiveClass: 'swiper-pagination-bullet-active !bg-greenTheme'
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 }
                        }}
                        modules={[Pagination]}
                        className="!pb-12"
                    >
                        {jobCategories.map((category) => (
                            <SwiperSlide key={category.name}>
                                <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-greenTheme/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                                    <category.icon size={32} className="text-greenTheme mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                                    <p className="text-gray-500">{category.count} jobs</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>


                <Button
                    onClick={() => {
                        setIsJobModalOpen(true);
                    }}
                    className="bg-greenTheme text-white rounded-full px-6 py-2"
                >
                    Create Job
                </Button>

                {isJobModalOpen && (
                    <JobCreationModal
                        isOpen={isJobModalOpen}
                        onClose={() => setIsJobModalOpen(false)}
                    />
                )}


                {/* Job Listings Section */}
                <div className="mb-8 lg:mb-12">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                        {jobTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveJobType(type.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeJobType === type.id
                                    ? 'bg-greenTheme text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <type.icon size={20} />
                                <span className="whitespace-nowrap">{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    {renderJobContent()}
                </div>
            </main>
        </div>
    );

}
