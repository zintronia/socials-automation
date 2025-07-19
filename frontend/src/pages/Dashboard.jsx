import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiLinkedin, FiUpload, FiBarChart2 } from 'react-icons/fi';
import { documents, twitter } from '../services';

export default function Dashboard() {
  const [stats, setStats] = useState({
    documents: 0,
    tweets: 0,
    linkedinPosts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, twts] = await Promise.all([
          documents.list().catch(() => []),
          twitter.listTweets().catch(() => []),
        ]);
        
        setStats({
          documents: docs.length || 0,
          tweets: twts.length || 0,
          linkedinPosts: 0, // LinkedIn posts count would be added here when implemented
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your social media automation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={stats.documents}
          icon={<FiUpload className="w-6 h-6 text-indigo-600" />}
          link="/documents"
        />
        <StatCard
          title="Twitter Posts"
          value={stats.tweets}
          icon={<FiTwitter className="w-6 h-6 text-blue-400" />}
          link="/twitter"
        />
        <StatCard
          title="LinkedIn Posts"
          value={stats.linkedinPosts}
          icon={<FiLinkedin className="w-6 h-6 text-blue-700" />}
          link="/linkedin"
        />
        <StatCard
          title="Engagement Rate"
          value="N/A"
          icon={<FiBarChart2 className="w-6 h-6 text-green-500" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Upload Document"
            description="Upload a document to generate social media content"
            icon={<FiUpload className="w-6 h-6" />}
            link="/documents"
            buttonText="Upload Now"
          />
          <ActionCard
            title="Create Twitter Post"
            description="Generate and schedule tweets"
            icon={<FiTwitter className="w-6 h-6 text-blue-400" />}
            link="/twitter"
            buttonText="Create Tweet"
          />
          <ActionCard
            title="Create LinkedIn Post"
            description="Generate professional LinkedIn content"
            icon={<FiLinkedin className="w-6 h-6 text-blue-700" />}
            link="/linkedin"
            buttonText="Create Post"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, link }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link
              to={link}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ title, description, icon, link, buttonText }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3 text-indigo-600">
            {icon}
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="mt-5">
          <Link
            to={link}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
