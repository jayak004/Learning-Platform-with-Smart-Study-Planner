import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Material from './models/Material.js';
import User from './models/User.js';

dotenv.config();

const coursesData = [
  {
    title: 'Full Stack Web Development',
    color: 'bg-indigo-500',
    materials: [
      { title: 'HTML & CSS Crash Course', type: 'video', content: 'https://www.youtube.com/watch?v=mU6anWqZJcc' },
      { title: 'MDN Web Docs (Official)', type: 'link', content: 'https://developer.mozilla.org/en-US/docs/Web' },
      { title: 'React JS Crash Course', type: 'video', content: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
      { title: 'React Official Documentation', type: 'link', content: 'https://react.dev/learn' }
    ]
  },
  {
    title: 'Python Programming Masterclass',
    color: 'bg-blue-500',
    materials: [
      { title: 'Python for Beginners', type: 'video', content: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
      { title: 'Python Official Documentation', type: 'link', content: 'https://docs.python.org/3/tutorial/index.html' }
    ]
  },
  {
    title: 'Data Structures & Algorithms',
    color: 'bg-emerald-500',
    materials: [
      { title: 'Data Structures Easy to Advanced', type: 'video', content: 'https://www.youtube.com/watch?v=RBSGKlAvoiM' },
      { title: 'GeeksforGeeks DSA', type: 'link', content: 'https://www.geeksforgeeks.org/data-structures/' }
    ]
  },
  {
    title: 'Machine Learning Basics',
    color: 'bg-purple-500',
    materials: [
      { title: 'Machine Learning for Everybody', type: 'video', content: 'https://www.youtube.com/watch?v=i_LwzRmA_08' },
      { title: 'Scikit-Learn Documentation', type: 'link', content: 'https://scikit-learn.org/stable/user_guide.html' }
    ]
  },
  {
    title: 'Docker & Kubernetes',
    color: 'bg-cyan-500',
    materials: [
      { title: 'Docker Tutorial for Beginners', type: 'video', content: 'https://www.youtube.com/watch?v=pTFZFxd4hOI' },
      { title: 'Docker Official Docs', type: 'link', content: 'https://docs.docker.com/get-started/' },
      { title: 'Kubernetes Official Docs', type: 'link', content: 'https://kubernetes.io/docs/home/' }
    ]
  },
  {
    title: 'UI/UX Design Principles',
    color: 'bg-pink-500',
    materials: [
      { title: 'Figma Tutorial', type: 'video', content: 'https://www.youtube.com/watch?v=Gu1so3pz4bA' },
      { title: 'Nielsen Norman Group UX Articles', type: 'link', content: 'https://www.nngroup.com/articles/' }
    ]
  },
  {
    title: 'MongoDB Fundamentals',
    color: 'bg-emerald-500',
    materials: [
      { title: 'MongoDB Crash Course', type: 'video', content: 'https://www.youtube.com/watch?v=ofme2o29ngU' },
      { title: 'MongoDB Official Manual', type: 'link', content: 'https://www.mongodb.com/docs/manual/' }
    ]
  },
  {
    title: 'Git & GitHub Essentials',
    color: 'bg-slate-500',
    materials: [
      { title: 'Git Tutorial for Beginners', type: 'video', content: 'https://www.youtube.com/watch?v=8JJ101D3knE' },
      { title: 'Git Official Documentation', type: 'link', content: 'https://git-scm.com/doc' }
    ]
  },
  {
    title: 'Next.js 14 Complete Guide',
    color: 'bg-indigo-500',
    materials: [
      { title: 'Next.js App Router', type: 'video', content: 'https://www.youtube.com/watch?v=wm5gMKuwSYk' },
      { title: 'Next.js Official Docs', type: 'link', content: 'https://nextjs.org/docs' }
    ]
  },
  {
    title: 'Cybersecurity 101',
    color: 'bg-rose-500',
    materials: [
      { title: 'Cyber Security Full Course', type: 'video', content: 'https://www.youtube.com/watch?v=lpa8uy4Iyvc' },
      { title: 'OWASP Top 10', type: 'link', content: 'https://owasp.org/www-project-top-ten/' }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smartplanner');
    console.log('MongoDB Connected for Seeding');

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found! Please register a user first.');
      process.exit(1);
    }
    
    // Clear existing data to prevent duplicates
    console.log('Clearing existing courses and materials...');
    await Course.deleteMany({});
    await Material.deleteMany({});

    for (const user of users) {
      console.log(`Seeding data for user: ${user.email}`);

      for (const courseData of coursesData) {
        const newCourse = await Course.create({
          title: courseData.title,
          color: courseData.color,
          user: user._id
        });

        for (const materialData of courseData.materials) {
          await Material.create({
            title: materialData.title,
            content: materialData.content,
            type: materialData.type,
            course: newCourse._id,
            user: user._id
          });
        }
      }
    }

    console.log('Successfully seeded 10 courses with materials for ALL users!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
