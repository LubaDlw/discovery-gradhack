// src/utils/navigationConstants.js
import { Lightbulb, BookOpen, Briefcase, GraduationCap } from 'lucide-react'; // Example icons

export const NAV_LINKS = [
    {
        name: "Homework Help",
        link: "/homework-help",
        icon: Lightbulb, // Lucide icon component
    },
    {
        name: "Exam Prep",
        link: "/exam-prep",
        icon: BookOpen,
    },
    {
        name: "Career Guidance",
        link: "/career-guidance",
        icon: Briefcase,
    },
    {
        name: "Study Tips",
        link: "/study-tips",
        icon: GraduationCap,
    },
    // Add more navigation items as needed
];